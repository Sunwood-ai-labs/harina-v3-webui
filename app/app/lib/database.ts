import { Pool } from "pg";
import { ReceiptData, ReceiptItem } from "../types";

// データベースから取得するレシートの型定義
interface DbReceiptRow {
  id: number;
  filename: string;
  store_name: string;
  store_address: string;
  store_phone: string;
  transaction_date: string;
  transaction_time: string;
  receipt_number: string;
  subtotal: string;
  tax: string;
  total_amount: string;
  payment_method: string;
  processed_at: string;
  image_path: string;
  uploader: string; // 👈 この行を追加
}

// データベースから取得するアイテムの型定義
interface DbReceiptItemRow {
  id: number;
  receipt_id: number;
  name: string;
  category: string;
  subcategory: string;
  quantity: number;
  unit_price: string;
  total_price: string;
}

// 統計情報クエリの結果型定義
interface DbCountRow {
  count: string;
}

interface DbSumRow {
  total: string | null;
}

// ユーザー統計情報クエリの結果型定義
interface DbUserStatRow {
  uploader: string;
  total_amount: string;
  receipt_count: string;
}

// PostgreSQL接続プール
const pool = new Pool({
  host: process.env.POSTGRES_HOST || "postgres",
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  database: process.env.POSTGRES_DB || "receipt_db",
  user: process.env.POSTGRES_USER || "receipt_user",
  password: process.env.POSTGRES_PASSWORD || "receipt_password",
  ssl: false, // Docker環境ではSSLを無効化
  max: 20, // 最大接続数
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// レシートをデータベースに保存
export async function saveReceiptToDatabase(
  receipt: ReceiptData
): Promise<number> {
  // ビルド時はダミーIDを返す
  if (isBuildTime) {
    return 1;
  }

  const client = await connectWithRetry();

  try {
    await client.query("BEGIN");

    // レシート基本情報を保存
    const receiptResult = await client.query(
      `INSERT INTO receipts (
        filename, store_name, store_address, store_phone,
        transaction_date, transaction_time, receipt_number,
        subtotal, tax, total_amount, payment_method, processed_at,
        image_path, uploader
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id`, // 👆 uploader を追加し、VALUES を $14 までに
      [
        receipt.filename,
        receipt.store_name,
        receipt.store_address,
        receipt.store_phone,
        receipt.transaction_date,
        receipt.transaction_time,
        receipt.receipt_number,
        receipt.subtotal,
        receipt.tax,
        receipt.total_amount,
        receipt.payment_method,
        receipt.processed_at || new Date().toISOString(),
        receipt.image_path,
        receipt.uploader, // 👈 パラメータに receipt.uploader を追加
      ]
    );

    const receiptId = receiptResult.rows[0].id;

    // 商品情報を保存
    if (receipt.items && receipt.items.length > 0) {
      for (const item of receipt.items) {
        await client.query(
          `INSERT INTO receipt_items (
            receipt_id, name, category, subcategory, 
            quantity, unit_price, total_price
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            receiptId,
            item.name,
            item.category,
            item.subcategory,
            item.quantity || 1,
            item.unit_price,
            item.total_price,
          ]
        );
      }
    }

    await client.query("COMMIT");
    return receiptId;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// ビルド時かどうかを判定（実行時は常にfalse）
const isBuildTime = false; // 実行時は常にデータベースに接続を試行

// データベース接続のリトライ機能
async function connectWithRetry(maxRetries = 5, delay = 2000): Promise<any> {
  // ビルド時はダミー接続を返す
  if (isBuildTime) {
    throw new Error("Database not available during build time");
  }

  // 実行時にデータベースが利用できない場合の処理
  if (!process.env.POSTGRES_HOST && !process.env.DATABASE_URL) {
    throw new Error("Database configuration not found");
  }

  for (let i = 0; i < maxRetries; i++) {
    try {
      const client = await pool.connect();
      return client;
    } catch (error) {
      console.log(
        `Database connection attempt ${i + 1}/${maxRetries} failed:`,
        error instanceof Error ? error.message : error
      );
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

// データベースからレシート一覧を取得
export async function getReceiptsFromDatabase(
  limit = 50,
  offset = 0
): Promise<ReceiptData[]> {
  // ビルド時は空配列を返す
  if (isBuildTime) {
    return [];
  }

  const client = await connectWithRetry();

  try {
    // レシート基本情報を取得
    const receiptsResult = await client.query(
      `SELECT * FROM receipts 
       ORDER BY processed_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const receipts: ReceiptData[] = [];

    for (const receiptRow of receiptsResult.rows as DbReceiptRow[]) {
      // 各レシートの商品情報を取得
      const itemsResult = await client.query(
        `SELECT * FROM receipt_items 
         WHERE receipt_id = $1 
         ORDER BY id`,
        [receiptRow.id]
      );

      const items: ReceiptItem[] = itemsResult.rows.map(
        (item: DbReceiptItemRow) => ({
          name: item.name,
          category: item.category,
          subcategory: item.subcategory,
          quantity: item.quantity,
          unit_price: parseFloat(item.unit_price) || 0,
          total_price: parseFloat(item.total_price) || 0,
        })
      );

      receipts.push({
        id: receiptRow.id,
        filename: receiptRow.filename,
        store_name: receiptRow.store_name,
        store_address: receiptRow.store_address,
        store_phone: receiptRow.store_phone,
        transaction_date: receiptRow.transaction_date,
        transaction_time: receiptRow.transaction_time,
        receipt_number: receiptRow.receipt_number,
        subtotal: parseFloat(receiptRow.subtotal) || 0,
        tax: parseFloat(receiptRow.tax) || 0,
        total_amount: parseFloat(receiptRow.total_amount) || 0,
        payment_method: receiptRow.payment_method,
        items,
        processed_at: receiptRow.processed_at,
        image_path: receiptRow.image_path,
        uploader: receiptRow.uploader, // 👈 この行を追加
      });
    }

    return receipts;
  } finally {
    client.release();
  }
}

// データベース統計情報を取得
export async function getDatabaseStats() {
  // ビルド時はダミーデータを返す
  if (isBuildTime) {
    return {
      totalReceipts: 0,
      totalAmount: 0,
      totalItems: 0,
      userStats: [],
    };
  }

  const client = await connectWithRetry();

  try {
    const [receiptsCount, totalAmount, itemsCount, userStatsResult] = await Promise.all([
      client.query("SELECT COUNT(*) as count FROM receipts"),
      client.query("SELECT SUM(total_amount) as total FROM receipts"),
      client.query("SELECT COUNT(*) as count FROM receipt_items"),
      client.query(
        "SELECT uploader, SUM(total_amount) as total_amount, COUNT(*) as receipt_count FROM receipts GROUP BY uploader"
      ),
    ]);

    const userStats = (userStatsResult.rows as DbUserStatRow[]).map(row => ({
      uploader: row.uploader,
      totalAmount: parseFloat(row.total_amount) || 0,
      receiptCount: parseInt(row.receipt_count, 10) || 0,
    }));

    return {
      totalReceipts: parseInt((receiptsCount.rows[0] as DbCountRow).count, 10),
      totalAmount:
        parseFloat((totalAmount.rows[0] as DbSumRow).total || "0") || 0,
      totalItems: parseInt((itemsCount.rows[0] as DbCountRow).count, 10),
      userStats,
    };
  } finally {
    client.release();
  }
}

// CSVの行データを型定義
interface CsvRow {
  アップローダー: string;
  ファイル名: string;
  購入場所: string;
  日付: string;
  時間: string;
  品名: string;
  単価: string;
  個数: string;
  単位: string;
  カテゴリ: string;
  金額: string;
  支払方法: string;
}

// CSVデータをまとめてデータベースに登録する関数
export async function importReceiptsFromCsv(data: CsvRow[]) {
  if (isBuildTime) {
    return { newReceipts: 0, newItems: 0 };
  }

  const client = await connectWithRetry();
  
  // ファイル名でデータをグループ化
  const receiptsByFilename = data.reduce((acc, row) => {
    const key = row.ファイル名;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(row);
    return acc;
  }, {} as Record<string, CsvRow[]>);

  let newReceiptsCount = 0;
  let newItemsCount = 0;

  try {
    await client.query('BEGIN');

    for (const filename in receiptsByFilename) {
      const items = receiptsByFilename[filename];
      const firstItem = items[0];

      // 同じレシートが既に存在するか確認（店名と日付で簡易的に判断）
      const existingReceipt = await client.query(
        'SELECT id FROM receipts WHERE store_name = $1 AND transaction_date = $2 AND transaction_time = $3 LIMIT 1',
        [firstItem.購入場所, firstItem.日付.trim(), firstItem.時間.trim()]
      );

      let receiptId;

      if (existingReceipt.rows.length === 0) {
        // 新しいレシートを登録
        const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.金額) || 0), 0);
        
        const receiptResult = await client.query(
          `INSERT INTO receipts (
            filename, store_name, transaction_date, transaction_time,
            total_amount, payment_method, uploader, processed_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id`,
          [
            filename,
            firstItem.購入場所,
            firstItem.日付.trim(),
            firstItem.時間.trim(),
            totalAmount,
            firstItem.支払方法,
            firstItem.アップローダー,
            new Date().toISOString()
          ]
        );
        receiptId = receiptResult.rows[0].id;
        newReceiptsCount++;
      } else {
        // 既存のレシートIDを使用
        receiptId = existingReceipt.rows[0].id;
      }
      
      // 商品情報を登録
      for (const item of items) {
        await client.query(
          `INSERT INTO receipt_items (
            receipt_id, name, category, quantity, unit_price, total_price
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            receiptId,
            item.品名,
            item.カテゴリ,
            parseInt(item.個数) || 1,
            parseFloat(item.単価) || 0,
            parseFloat(item.金額) || 0
          ]
        );
        newItemsCount++;
      }
    }

    await client.query('COMMIT');
    
    return {
      newReceipts: newReceiptsCount,
      newItems: newItemsCount
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// データベース接続テスト
export async function testDatabaseConnection(): Promise<boolean> {
  // ビルド時は常にfalseを返す
  if (isBuildTime) {
    return false;
  }

  try {
    console.log("Testing database connection...");
    const client = await connectWithRetry(3, 1000); // 3回リトライ、1秒間隔
    const result = await client.query("SELECT 1 as test");
    console.log("Database connection successful:", result.rows[0]);
    client.release();
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    console.error("Connection config:", {
      host: process.env.POSTGRES_HOST || "postgres",
      port: process.env.POSTGRES_PORT || "5432",
      database: process.env.POSTGRES_DB || "receipt_db",
      user: process.env.POSTGRES_USER || "receipt_user",
    });
    return false;
  }
}
