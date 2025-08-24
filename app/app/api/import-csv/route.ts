import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
import Papa from 'papaparse';
import { importReceiptsFromCsv } from '../../lib/database';

export const dynamic = 'force-dynamic';

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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'ファイルが選択されていません' }, { status: 400 });
    }

    if (file.type !== 'text/csv') {
      return NextResponse.json({ error: 'CSVファイルを選択してください' }, { status: 400 });
    }

    // ファイルをテキストとして読み込み
    const csvText = await file.text();
    
    // PapaParseでCSVをパース
    const parseResult = Papa.parse<CsvRow>(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      console.error('CSV parse errors:', parseResult.errors);
      return NextResponse.json({ error: 'CSVのパースに失敗しました', details: parseResult.errors }, { status: 400 });
    }
    
    const data = parseResult.data;

    // データベースにインポート
    const result = await importReceiptsFromCsv(data);

    return NextResponse.json({ 
      message: 'CSVのインポートが完了しました',
      ...result 
    });

  } catch (error) {
    console.error('CSV import error:', error);
    return NextResponse.json(
      { 
        error: 'CSVインポート中にエラーが発生しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
