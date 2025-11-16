import os

def test_write():
    test_file = 'test_write.txt'
    test_content = 'This is a test file.'
    
    try:
        # Write to file
        with open(test_file, 'w') as f:
            f.write(test_content)
        
        # Verify content
        with open(test_file, 'r') as f:
            content = f.read()
            
        # Clean up
        os.remove(test_file)
        
        if content == test_content:
            print("✅ Successfully wrote and read test file!")
            return True
        else:
            print(f"❌ Content mismatch. Expected '{test_content}', got '{content}'")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("📝 Testing File Write Access")
    print("=" * 50)
    if test_write():
        print("\n✅ Write test completed successfully!")
    else:
        print("\n❌ Write test failed!")
    
    input("\nPress Enter to exit...")
