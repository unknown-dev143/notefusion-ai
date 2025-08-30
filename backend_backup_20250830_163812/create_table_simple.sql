-- Create the user_ai_settings table
CREATE TABLE IF NOT EXISTS user_ai_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    default_model_id INTEGER,
    auto_upgrade_models BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (default_model_id) REFERENCES ai_models (id) ON DELETE SET NULL,
    UNIQUE (user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_ai_settings_user_id ON user_ai_settings (user_id);
CREATE INDEX IF NOT EXISTS idx_user_ai_settings_model_id ON user_ai_settings (default_model_id);

-- Create trigger for updated_at
CREATE TRIGGER IF NOT EXISTS update_user_ai_settings_timestamp
AFTER UPDATE ON user_ai_settings
FOR EACH ROW
BEGIN
    UPDATE user_ai_settings 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = OLD.id;
END;

-- Verify the table was created
SELECT '✅ user_ai_settings table created successfully' as message;

-- Show the table structure
PRAGMA table_info(user_ai_settings);
