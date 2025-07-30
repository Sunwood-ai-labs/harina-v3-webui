-- Add uploader column to receipts table
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS uploader VARCHAR(50) DEFAULT '夫';

-- Create index for uploader
CREATE INDEX IF NOT EXISTS idx_receipts_uploader ON receipts(uploader);

-- Update existing sample data
UPDATE receipts SET uploader = '夫' WHERE uploader IS NULL;