import { NextRequest, NextResponse } from 'next/server'
import { ReceiptData } from '../../types'
import { saveReceiptToDatabase, getProcessingPrompt } from '../../lib/database'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { parseXmlToReceiptData, parseXmlWithRegex } from '../../api/_lib/receiptParsing'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let file: File | null = null
  let imagePath: string | undefined = undefined
  let fallbackUsed = false
  const DEFAULT_MODEL = 'gemini/gemini-2.5-flash'
  let model: string = DEFAULT_MODEL
  
  try {
    const formData = await request.formData()
    file = formData.get('file') as File
    model = (formData.get('model') as string) || DEFAULT_MODEL
    const uploader = formData.get('uploader') as string || '夫' // 👈 この行を追加

    let additionalPrompt = ''
    try {
      additionalPrompt = await getProcessingPrompt()
    } catch (error) {
      console.error('Failed to load additional processing prompt:', error)
    }

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが選択されていません' },
        { status: 400 }
      )
    }

    // 画像ファイルを保存
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const savedFileName = `receipt_${timestamp}.${fileExtension}`
    const uploadsDir = join(process.cwd(), 'public/uploads')
    imagePath = `/uploads/${savedFileName}`
    const fullPath = join(uploadsDir, savedFileName)

    // アップロードディレクトリが存在しない場合は作成
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // ディレクトリが既に存在する場合は無視
    }

    // ファイルを保存
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await writeFile(fullPath, buffer)

    // HARINAサービスにファイルを送信
    const harinaFormData = new FormData()
    const harinaBlob = new Blob([buffer], { type: file.type || 'application/octet-stream' })
    harinaFormData.append('file', harinaBlob, file.name)
    
    // モデル名を正しい形式に変換
    let harinaModel = 'gemini/gemini-2.5-flash' // デフォルト
    if (model === 'gpt-4o') {
      harinaModel = 'gpt-4o'
    } else if (model === 'claude') {
      harinaModel = 'claude-3-5-sonnet-20241022'
    }
    
    harinaFormData.append('model', harinaModel)
    harinaFormData.append('format', 'xml') // XMLフォーマットで取得
    if (additionalPrompt && additionalPrompt.trim().length > 0) {
      harinaFormData.append('instructions', additionalPrompt.trim())
    }

    console.log('Sending request to HARINA service...')
    const harinaResponse = await fetch(`${process.env.HARINA_API_URL || 'http://harina:8000'}/process`, {
      method: 'POST',
      body: harinaFormData,
    })

    console.log('HARINA response status:', harinaResponse.status)
    
    if (!harinaResponse.ok) {
      const errorText = await harinaResponse.text()
      console.error('HARINA service error response:', errorText)
      throw new Error(`HARINA service error: ${harinaResponse.status} - ${errorText}`)
    }

    const harinaResult = await harinaResponse.json()
    console.log('HARINA result:', harinaResult)
    fallbackUsed = harinaResult.fallbackUsed === true
    const keyType = typeof harinaResult.keyType === 'string' ? harinaResult.keyType : undefined

    // HARINA APIのレスポンス形式をチェック
    if (!harinaResult.success) {
      throw new Error(`HARINA processing failed: ${harinaResult.error || 'Unknown error'}`)
    }

    // XMLデータをパースしてレシートデータに変換
    const xmlData = harinaResult.data
    console.log('XML data received:', xmlData)
    
    let receiptData: ReceiptData
    
    try {
      // XMLをパースしてReceiptDataに変換
      receiptData = await parseXmlToReceiptData(xmlData, file.name, imagePath)
      receiptData.uploader = uploader; // 👈 パースしたデータにuploaderを追加
      receiptData.fallbackUsed = fallbackUsed
      receiptData.model_used = model
      receiptData.keyType = keyType
      console.log('Parsed receipt data:', receiptData)
    } catch (xmlError) {
      console.error('XML parsing error:', xmlError)
      console.log('Attempting regex-based parsing as fallback...')
      
      // XMLパースに失敗した場合は正規表現で直接抽出
      try {
        receiptData = parseXmlWithRegex(xmlData, file.name, imagePath)
        receiptData.uploader = uploader; // 👈 こちらにも追加
        receiptData.fallbackUsed = fallbackUsed
        receiptData.model_used = model
        receiptData.keyType = keyType
        console.log('Regex-parsed receipt data:', receiptData)
      } catch (regexError) {
        console.error('Regex parsing also failed:', regexError)
        // 両方失敗した場合はダミーデータを使用
        receiptData = {
          filename: file.name,
          store_name: 'XMLパースエラー店舗',
          store_address: '東京都渋谷区',
          store_phone: '03-1234-5678',
          transaction_date: new Date().toISOString().split('T')[0],
          transaction_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
          receipt_number: 'ERROR-' + Date.now(),
          subtotal: 1000,
          tax: 100,
          total_amount: 1100,
          payment_method: 'クレジットカード',
          items: [
            { name: 'パースエラー商品', category: 'その他', total_price: 1000 }
          ],
          processed_at: new Date().toISOString(),
          image_path: imagePath || undefined,
          uploader: uploader, // 👈 ダミーデータにもuploaderを追加
          fallbackUsed,
          keyType: keyType ?? 'primary'
        }
      }
    }

    // データベースに保存
    try {
      const saveResult = await saveReceiptToDatabase(receiptData)
      receiptData.id = saveResult.id

      return NextResponse.json({
        ...receiptData,
        duplicate: saveResult.wasDuplicate,
        duplicateOf: saveResult.wasDuplicate ? saveResult.duplicateOf ?? null : undefined,
          fallbackUsed,
          model_used: model,
          keyType: keyType ?? receiptData.keyType,
      })
    } catch (dbError) {
      console.error('Database save error:', dbError)
      // データベース保存に失敗してもレスポンスは返す
    }

    return NextResponse.json({
      ...receiptData,
      duplicate: false,
      fallbackUsed,
      model_used: model,
      keyType: keyType ?? receiptData.keyType,
    })
  } catch (error) {
    console.error('Receipt processing error:', error)
    
    // HARINAサービスエラーの場合、ダミーデータで処理を続行
    if (error instanceof Error && error.message.includes('HARINA service error')) {
      console.log('Creating dummy receipt data due to HARINA service error')
      
      // 画像がまだ保存されていない場合は保存を試行
      if (!imagePath && file) {
        try {
          const timestamp = Date.now()
          const fileExtension = file.name.split('.').pop() || 'jpg'
          const savedFileName = `receipt_${timestamp}.${fileExtension}`
          const uploadsDir = join(process.cwd(), 'public/uploads')
          imagePath = `/uploads/${savedFileName}`
          const fullPath = join(uploadsDir, savedFileName)

          await mkdir(uploadsDir, { recursive: true })
          const arrayBuffer = await file.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          await writeFile(fullPath, buffer)
        } catch (saveError) {
          console.error('Failed to save image during error handling:', saveError)
          imagePath = undefined
        }
      }
      
      const dummyReceiptData: ReceiptData = {
        filename: file?.name || 'unknown_file',
        store_name: 'テスト店舗',
        store_address: '東京都渋谷区',
        store_phone: '03-1234-5678',
        transaction_date: new Date().toISOString().split('T')[0],
        transaction_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        receipt_number: 'TEST-' + Date.now(),
        subtotal: 1000,
        tax: 100,
        total_amount: 1100,
        payment_method: 'クレジットカード',
        items: [
          { name: 'テスト商品', category: 'その他', total_price: 1000 }
        ],
        processed_at: new Date().toISOString(),
        image_path: imagePath || undefined,
        uploader: '夫', // 👈 エラーハンドリング時のダミーデータにはデフォルト値を設定
        fallbackUsed: false,
        model_used: model,
        keyType: 'primary',
      }
      
      // データベースに保存を試行
      try {
        const saveResult = await saveReceiptToDatabase(dummyReceiptData)
        dummyReceiptData.id = saveResult.id
        dummyReceiptData.duplicate = saveResult.wasDuplicate
        dummyReceiptData.duplicateOf = saveResult.wasDuplicate ? saveResult.duplicateOf ?? null : undefined
        dummyReceiptData.model_used = model
        return NextResponse.json({
          ...dummyReceiptData,
          duplicate: dummyReceiptData.duplicate ?? false,
          fallbackUsed: false,
          model_used: model,
          keyType: 'primary',
        })
      } catch (dbError) {
        console.error('Database save error:', dbError)
      }

      return NextResponse.json({
        ...dummyReceiptData,
        duplicate: false,
        fallbackUsed: false,
        model_used: model,
        keyType: 'primary',
      })
    }
    
    return NextResponse.json(
      { error: 'レシート処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
