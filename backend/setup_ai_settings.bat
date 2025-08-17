@echo off
echo Setting up user_ai_settings table...
echo.

:: Check if SQLite3 is available
where sqlite3 >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ SQLite3 is not in your PATH. Please install SQLite or add it to your PATH.
    exit /b 1
)

:: Check if database exists
if not exist notefusion.db (
    echo ❌ Database file not found: notefusion.db
    echo Please run database migrations first.
    exit /b 1
)

echo ✅ Database file exists
echo.

echo Checking if user_ai_settings table exists...
sqlite3 notefusion.db "SELECT name FROM sqlite_master WHERE type='table' AND name='user_ai_settings';" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ user_ai_settings table already exists
    exit /b 0
)

echo ❌ user_ai_settings table does not exist. Creating it...
echo.

echo Creating user_ai_settings table...
sqlite3 notefusion.db "
PRAGMA foreign_keys = ON;

CREATE TABLE user_ai_settings (
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

CREATE INDEX idx_user_ai_settings_user_id ON user_ai_settings (user_id);
CREATE INDEX idx_user_ai_settings_model_id ON user_ai_settings (default_model_id);

CREATE TRIGGER update_user_ai_settings_timestamp
AFTER UPDATE ON user_ai_settings
FOR EACH ROW
BEGIN
    UPDATE user_ai_settings 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = OLD.id;
END;
"

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to create user_ai_settings table
    exit /b 1
)

echo ✅ Successfully created user_ai_settings table
echo.

echo Adding default settings for existing users...
sqlite3 notefusion.db "
PRAGMA foreign_keys = ON;

INSERT INTO user_ai_settings (user_id, default_model_id, auto_upgrade_models)
SELECT id, (SELECT id FROM ai_models WHERE is_default = 1 LIMIT 1), 1
FROM users
WHERE id NOT IN (SELECT user_id FROM user_ai_settings);
"

if %ERRORLEVEL% EQU 0 (
    echo ✅ Added default settings for all users
) else (
    echo ⚠️ Could not add default settings for all users
)

echo.
echo Verification:
sqlite3 notefusion.db "SELECT COUNT(*) as user_count FROM users;"
sqlite3 notefusion.db "SELECT COUNT(*) as settings_count FROM user_ai_settings;"

echo.
pause
