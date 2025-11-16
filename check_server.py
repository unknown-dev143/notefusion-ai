import socket

def check_port(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

ports = [5000, 8000, 8080, 3000, 5001, 8001, 8081]
print("Checking for running servers on common ports...\n")

for port in ports:
    if check_port(port):
        print(f"⚠️  Port {port} is in use!")
    else:
        print(f"✅ Port {port} is available")

print("\nIf you see a port in use, you can either:")
print("1. Stop the process using that port")
print("2. Configure your application to use a different port")
