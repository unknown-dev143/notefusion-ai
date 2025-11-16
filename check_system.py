import sys
import subprocess

def check_command(cmd, name):
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, shell=True)
        if result.returncode == 0:
            print(f"✅ {name} is installed:")
            print(f"   {result.stdout.strip()}")
            return True
        else:
            print(f"❌ {name} is not installed or not in PATH")
            print(f"   Error: {result.stderr.strip()}")
            return False
    except Exception as e:
        print(f"❌ Error checking {name}: {str(e)}")
        return False

print("=== System Check ===\n")

# Check Python
python_ok = check_command("python --version", "Python")

# Check Node.js
node_ok = check_command("node --version", "Node.js")

# Check npm
npm_ok = check_command("npm --version", "npm")

# Check Python modules
try:
    import fastapi
    print(f"✅ FastAPI is installed: {fastapi.__version__}")
    fastapi_ok = True
except ImportError:
    print("❌ FastAPI is not installed")
    fastapi_ok = False

# Print summary
print("\n=== Summary ===")
print(f"Python: {'✅' if python_ok else '❌'}")
print(f"Node.js: {'✅' if node_ok else '❌'}")
print(f"npm: {'✅' if npm_ok else '❌'}")
print(f"FastAPI: {'✅' if fastapi_ok else '❌'}")

print("\nPress Enter to exit...")
input()
