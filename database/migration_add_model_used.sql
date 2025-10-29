-- Add model_used column to track which LLM processed the receipt
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS model_used VARCHAR(100) DEFAULT 'gemini/gemini-2.5-flash';

-- Backfill existing rows
UPDATE receipts SET model_used = 'gemini/gemini-2.5-flash' WHERE model_used IS NULL;
