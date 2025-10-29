import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { getAllReceiptsWithItems } from "../../lib/database";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CSV_HEADER = [
  "アップローダー",
  "ファイル名",
  "購入場所",
  "日付",
  "時間",
  "品名",
  "単価",
  "個数",
  "単位",
  "カテゴリ",
  "サブカテゴリ",
  "金額",
  "支払方法",
  "使用モデル",
];

type ExportFormat = "json" | "csv" | "zip";

function escapeCsvValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }
  const str = String(value);
  if (str === "") {
    return "";
  }
  if (str.includes('"') || str.includes(",") || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsv(receipts: Awaited<ReturnType<typeof getAllReceiptsWithItems>>): string {
  const rows: string[] = [];
  rows.push(CSV_HEADER.join(","));

  receipts.forEach((receipt) => {
    const items =
      receipt.items && receipt.items.length > 0
        ? receipt.items
        : [{ name: "", category: "", subcategory: "", quantity: 0, unit_price: 0, total_price: 0 }];

    items.forEach((item) => {
      rows.push(
        [
          escapeCsvValue(receipt.uploader ?? ""),
          escapeCsvValue(receipt.filename ?? ""),
          escapeCsvValue(receipt.store_name ?? ""),
          escapeCsvValue(receipt.transaction_date ?? ""),
          escapeCsvValue(receipt.transaction_time ?? ""),
          escapeCsvValue(item.name ?? ""),
          escapeCsvValue(item.unit_price ?? ""),
          escapeCsvValue(item.quantity ?? ""),
          escapeCsvValue("個"),
          escapeCsvValue(item.category ?? ""),
          escapeCsvValue(item.subcategory ?? ""),
          escapeCsvValue(item.total_price ?? ""),
          escapeCsvValue(receipt.payment_method ?? ""),
          escapeCsvValue(receipt.model_used ?? "gemini/gemini-2.5-flash"),
        ].join(","),
      );
    });
  });

  return `\uFEFF${rows.join("\n")}`;
}

function buildJsonPayload(receipts: Awaited<ReturnType<typeof getAllReceiptsWithItems>>) {
  return {
    exportedAt: new Date().toISOString(),
    receiptCount: receipts.length,
    itemCount: receipts.reduce((acc, receipt) => acc + (receipt.items?.length ?? 0), 0),
    receipts,
  };
}

function buildFilename(base: string, extension: string): string {
  const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  return `${base}_${timestamp}.${extension}`;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const requestedFormat = (url.searchParams.get("format") || "json").toLowerCase() as ExportFormat;

    if (!["json", "csv", "zip"].includes(requestedFormat)) {
      return NextResponse.json(
        { error: "サポートされていない形式です。format=csv|json|zip を指定してください。" },
        { status: 400 },
      );
    }

    const receipts = await getAllReceiptsWithItems();
    const baseFilename = "harina_receipts";

    if (requestedFormat === "csv") {
      const csv = buildCsv(receipts);
      const filename = buildFilename(baseFilename, "csv");
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-store",
        },
      });
    }

    if (requestedFormat === "json") {
      const payload = buildJsonPayload(receipts);
      const filename = buildFilename(baseFilename, "json");
      return NextResponse.json(payload, {
        headers: {
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-store",
        },
      });
    }

    const csv = buildCsv(receipts);
    const jsonPayload = JSON.stringify(buildJsonPayload(receipts), null, 2);
    const metadata = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        formats: ["json", "csv"],
        application: "HARINA v3 Web UI",
        version: "1.0",
      },
      null,
      2,
    );

    const zip = new JSZip();
    zip.file("receipts.json", jsonPayload);
    zip.file("receipts.csv", csv);
    zip.file("metadata.json", metadata);

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
    const filename = buildFilename(baseFilename, "zip");

    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Export route error:", error);
    return NextResponse.json(
      { error: "エクスポート処理中にエラーが発生しました。" },
      { status: 500 },
    );
  }
}
