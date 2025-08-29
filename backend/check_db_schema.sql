-- Check database schema
.tables

-- Check if ai_models table exists
SELECT name FROM sqlite_master WHERE type='table' AND name='ai_models';

-- Check columns in ai_models table if it exists
PRAGMA table_info(ai_models);

-- Check if user_ai_model_settings table exists
SELECT name FROM sqlite_master WHERE type='table' AND name='user_ai_model_settings';

-- Check columns in user_ai_model_settings table if it exists
PRAGMA table_info(user_ai_model_settings);

-- Check alembic version
SELECT name FROM sqlite_master WHERE type='table' AND name='alembic_version';

-- Get current alembic version if table exists
SELECT version_num FROM alembic_version;
