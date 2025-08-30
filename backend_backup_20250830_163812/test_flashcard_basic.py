import sys
import os
import sqlite3
from datetime import datetime

print("🔍 Testing Flashcard Functionality")
print("=" * 80)

# Test basic Python functionality
print("\n✅ Python Environment:")
print(f"Python version: {sys.version}")
print(f"Current directory: {os.getcwd()}")

# Test database connection
print("\n🔌 Testing SQLite database connection...")
try:
    # Create a test database file
    db_path = 'test_flashcards.db'
    if os.path.exists(db_path):
        os.remove(db_path)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create a simple table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS flashcards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        front_text TEXT NOT NULL,
        back_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Insert a test flashcard
    test_card = {
        'front': 'What is the capital of France?',
        'back': 'Paris'
    }
    
    cursor.execute('''
    INSERT INTO flashcards (front_text, back_text)
    VALUES (?, ?)
    ''', (test_card['front'], test_card['back']))
    
    # Commit the transaction
    conn.commit()
    
    # Query the test flashcard
    cursor.execute('SELECT * FROM flashcards WHERE front_text = ?', (test_card['front'],))
    result = cursor.fetchone()
    
    if result:
        print("\n✅ Successfully created and retrieved flashcard:")
        print(f"ID: {result[0]}")
        print(f"Front: {result[1]}")
        print(f"Back: {result[2]}")
        print(f"Created at: {result[3]}")
    else:
        print("\n❌ Failed to retrieve the test flashcard")
    
    # Clean up
    cursor.close()
    conn.close()
    os.remove(db_path)
    
except Exception as e:
    print(f"\n❌ An error occurred: {str(e)}")
    if 'conn' in locals():
        conn.close()
    if os.path.exists('test_flashcards.db'):
        os.remove('test_flashcards.db')

print("\n" + "=" * 80)
print("Test completed!" + " " * 30 + "✅")
