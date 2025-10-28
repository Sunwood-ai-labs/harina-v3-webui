-- Receipt Recognition Database Initialization

-- Create database if not exists (this is handled by docker-compose environment variables)

-- Create product categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS subcategories (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    UNIQUE (category_id, name)
);

CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories(category_id);

-- Create receipts table
CREATE TABLE IF NOT EXISTS receipts (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    store_name VARCHAR(255),
    store_address TEXT,
    store_phone VARCHAR(50),
    transaction_date VARCHAR(20),
    transaction_time VARCHAR(20),
    receipt_number VARCHAR(100),
    subtotal DECIMAL(10,2) DEFAULT 0.00,
    tax DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    payment_method VARCHAR(50),
    uploader VARCHAR(50) DEFAULT '夫',
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image_path VARCHAR(500)
);

-- Create receipt_items table
CREATE TABLE IF NOT EXISTS receipt_items (
    id SERIAL PRIMARY KEY,
    receipt_id INTEGER NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) DEFAULT 0.00,
    total_price DECIMAL(10,2) DEFAULT 0.00
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_receipts_processed_at ON receipts(processed_at);
CREATE INDEX IF NOT EXISTS idx_receipts_store_name ON receipts(store_name);
CREATE INDEX IF NOT EXISTS idx_receipts_uploader ON receipts(uploader);
CREATE INDEX IF NOT EXISTS idx_receipt_items_receipt_id ON receipt_items(receipt_id);
CREATE INDEX IF NOT EXISTS idx_receipt_items_category ON receipt_items(category);

-- Ensure default ordering for newly inserted categories
UPDATE categories SET display_order = id WHERE display_order = 0;
UPDATE subcategories SET display_order = id WHERE display_order = 0;

-- Insert sample data for testing
INSERT INTO receipts (
    filename, store_name, store_address, store_phone, 
    transaction_date, transaction_time, receipt_number,
    subtotal, tax, total_amount, payment_method, uploader
) VALUES (
    'sample_receipt.jpg', 
    'サンプルストア', 
    '東京都渋谷区1-1-1', 
    '03-1234-5678',
    '2025-01-15', 
    '14:30', 
    'R001',
    1000.00, 
    100.00, 
    1100.00, 
    'クレジット',
    '夫'
) ON CONFLICT DO NOTHING;

-- Get the receipt ID for sample items
DO $$
DECLARE
    sample_receipt_id INTEGER;
BEGIN
    SELECT id INTO sample_receipt_id FROM receipts WHERE filename = 'sample_receipt.jpg' LIMIT 1;
    
    IF sample_receipt_id IS NOT NULL THEN
        INSERT INTO receipt_items (receipt_id, name, category, subcategory, quantity, unit_price, total_price)
        VALUES 
            (sample_receipt_id, 'サンプル商品1', '食品・飲料', '肉類', 2, 300.00, 600.00),
            (sample_receipt_id, 'サンプル商品2', '日用品・雑貨', '洗剤・清掃用品', 1, 400.00, 400.00)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
