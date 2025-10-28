-- Create processing settings table to store optional instructions
CREATE TABLE IF NOT EXISTS processing_settings (
    id SERIAL PRIMARY KEY,
    additional_prompt TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ensure at least one row exists
INSERT INTO processing_settings (additional_prompt)
SELECT ''
WHERE NOT EXISTS (SELECT 1 FROM processing_settings);
