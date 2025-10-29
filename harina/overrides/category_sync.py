"""Utilities for synchronising product categories with the database."""

from __future__ import annotations

import importlib
import os
from dataclasses import dataclass
from threading import Lock
from typing import Iterable, List, Optional
from xml.etree import ElementTree as ET

from loguru import logger

try:  # psycopg is optional when running without a database
    import psycopg
except ModuleNotFoundError:  # pragma: no cover - runtime guard
    psycopg = None  # type: ignore


@dataclass(frozen=True)
class CategoryDefinition:
    name: str
    subcategories: List[str]


_CATEGORIES_XML_CACHE: Optional[str] = None
_CACHE_LOCK = Lock()
_DEFAULT_SOURCE_PATH = os.environ.get(
    "HARINA_CATEGORY_SOURCE_PATH",
    os.path.join(os.path.dirname(__file__), "product_categories.xml"),
)


def _database_dsn() -> Optional[str]:
    url = os.environ.get("DATABASE_URL")
    if url:
        return url

    host = os.environ.get("POSTGRES_HOST")
    database = os.environ.get("POSTGRES_DB")
    user = os.environ.get("POSTGRES_USER")
    password = os.environ.get("POSTGRES_PASSWORD")
    port = os.environ.get("POSTGRES_PORT", "5432")

    if not all([host, database, user, password]):
        return None

    return f"postgresql://{user}:{password}@{host}:{port}/{database}"


def _ensure_psycopg() -> bool:
    """Ensure psycopg is importable so we can hit Postgres."""

    global psycopg

    if psycopg is not None:
        return True

    try:
        psycopg = importlib.import_module("psycopg")  # type: ignore[assignment]
        return True
    except ModuleNotFoundError:
        logger.error(
            "psycopg is missing; skipping category sync. Install psycopg[binary] in the HARINA service."
        )
        return False


def _ensure_schema(conn: "psycopg.Connection") -> None:
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) UNIQUE NOT NULL,
            display_order INTEGER NOT NULL DEFAULT 0
        );
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS subcategories (
            id SERIAL PRIMARY KEY,
            category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
            name VARCHAR(100) NOT NULL,
            display_order INTEGER NOT NULL DEFAULT 0,
            UNIQUE (category_id, name)
        );
        """
    )
    conn.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_subcategories_category_id
            ON subcategories(category_id);
        """
    )


def _load_source_categories() -> List[CategoryDefinition]:
    path = _DEFAULT_SOURCE_PATH
    if not os.path.exists(path):
        logger.warning("Category source XML not found at {}", path)
        return []

    tree = ET.parse(path)
    root = tree.getroot()
    definitions: List[CategoryDefinition] = []
    for category in root.findall("category"):
        name = category.get("name", "").strip()
        if not name:
            continue
        subcategories = [
            sub.text.strip()
            for sub in category.findall("subcategory")
            if sub.text and sub.text.strip()
        ]
        definitions.append(CategoryDefinition(name=name, subcategories=subcategories))
    return definitions


def _upsert_category(
    conn: "psycopg.Connection", name: str, display_order: int
) -> int:
    query = (
        "INSERT INTO categories (name, display_order) VALUES (%s, %s) "
        "ON CONFLICT (name) DO UPDATE SET display_order = EXCLUDED.display_order "
        "RETURNING id"
    )
    with conn.cursor() as cur:
        cur.execute(query, (name, display_order))
        result = cur.fetchone()
    if not result:
        raise RuntimeError(f"Failed to upsert category '{name}'")
    return result[0]


def _upsert_subcategory(
    conn: "psycopg.Connection",
    category_id: int,
    name: str,
    display_order: int,
) -> None:
    query = (
        "INSERT INTO subcategories (category_id, name, display_order) VALUES (%s, %s, %s) "
        "ON CONFLICT (category_id, name) DO UPDATE SET display_order = EXCLUDED.display_order"
    )
    conn.execute(query, (category_id, name, display_order))


def _fetch_categories_from_db(conn: "psycopg.Connection") -> List[CategoryDefinition]:
    query = (
        "SELECT c.name, c.display_order, s.name, s.display_order "
        "FROM categories c "
        "LEFT JOIN subcategories s ON s.category_id = c.id "
        "ORDER BY c.display_order, c.name, s.display_order, s.name"
    )
    categories: List[CategoryDefinition] = []
    current_name: Optional[str] = None
    current_list: List[str] = []

    with conn.cursor() as cur:
        cur.execute(query)
        for category_name, _cat_order, subcategory_name, _sub_order in cur.fetchall():
            if category_name != current_name:
                if current_name is not None:
                    categories.append(
                        CategoryDefinition(name=current_name, subcategories=current_list)
                    )
                current_name = category_name
                current_list = []
            if subcategory_name:
                current_list.append(subcategory_name)
        if current_name is not None:
            categories.append(
                CategoryDefinition(name=current_name, subcategories=current_list)
            )
    return categories


def _build_categories_xml(definitions: Iterable[CategoryDefinition]) -> str:
    root = ET.Element("product_categories")
    for category in definitions:
        category_el = ET.SubElement(root, "category", name=category.name)
        for sub_name in category.subcategories:
            sub_el = ET.SubElement(category_el, "subcategory")
            sub_el.text = sub_name

    _indent_xml(root)
    return ET.tostring(root, encoding="utf-8").decode("utf-8")


def _indent_xml(elem: ET.Element, level: int = 0) -> None:
    indent = "\n" + level * "    "
    if len(elem):
        if not elem.text or not elem.text.strip():
            elem.text = indent + "    "
        for child in elem:
            _indent_xml(child, level + 1)
            if not child.tail or not child.tail.strip():
                child.tail = indent + "    "
        if not elem[-1].tail or not elem[-1].tail.strip():
            elem[-1].tail = indent
    else:
        if not elem.text or not elem.text.strip():
            elem.text = None
    if level and (not elem.tail or not elem.tail.strip()):
        elem.tail = indent


def sync_categories_with_database() -> Optional[str]:
    """Synchronise categories from the XML source file into the database."""

    global _CATEGORIES_XML_CACHE

    dsn = _database_dsn()
    if not dsn:
        logger.warning("DATABASE_URL or individual Postgres credentials are not set; skipping category sync")
        return None

    if not _ensure_psycopg():
        return None

    source_definitions = _load_source_categories()
    if not source_definitions:
        logger.warning("No source categories loaded; the database will not be updated")

    try:
        with psycopg.connect(dsn, autocommit=True) as conn:
            _ensure_schema(conn)
            for cat_order, category in enumerate(source_definitions):
                category_id = _upsert_category(conn, category.name, cat_order)
                for sub_order, sub_name in enumerate(category.subcategories):
                    _upsert_subcategory(conn, category_id, sub_name, sub_order)

            definitions = _fetch_categories_from_db(conn)
    except Exception as exc:  # pragma: no cover - defensive logging
        logger.exception("Failed to synchronise categories with the database: {}", exc)
        return None

    xml_payload = _build_categories_xml(definitions)
    with _CACHE_LOCK:
        _CATEGORIES_XML_CACHE = xml_payload
    return xml_payload


def get_categories_xml(refresh: bool = False) -> Optional[str]:
    """Return categories XML built from the database, refreshing on demand."""

    global _CATEGORIES_XML_CACHE

    with _CACHE_LOCK:
        cached = _CATEGORIES_XML_CACHE

    if cached is not None and not refresh:
        return cached

    dsn = _database_dsn()
    if not dsn:
        logger.warning("DATABASE_URL or Postgres credentials are not configured; cannot fetch categories")
        return cached

    if not _ensure_psycopg():
        return cached

    try:
        with psycopg.connect(dsn, autocommit=True) as conn:
            _ensure_schema(conn)
            definitions = _fetch_categories_from_db(conn)
    except Exception as exc:  # pragma: no cover
        logger.exception("Failed to fetch categories from the database: {}", exc)
        return cached

    xml_payload = _build_categories_xml(definitions)

    with _CACHE_LOCK:
        _CATEGORIES_XML_CACHE = xml_payload
    return xml_payload
