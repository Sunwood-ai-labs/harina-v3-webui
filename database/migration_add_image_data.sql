-- Add image_path column to receipts table
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS image_path VARCHAR(500);

-- Create index for image_path
CREATE INDEX IF NOT EXISTS idx_receipts_image_path ON receipts(image_path);

-- Update existing records to have a default image path if needed
-- UPDATE receipts SET image_path = '/uploads/default_receipt.jpg' WHERE image_path IS NULL;
