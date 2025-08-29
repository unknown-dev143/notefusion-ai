import socket
import sys

def check_port(host='localhost', port=8000):
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(5)
            result = s.connect_ex((host, port))
            if result == 0:
                print(f"Port {port} is open and accepting connections")
                return True
            else:
                print(f"Port {port} is closed or not responding")
                return False
    except Exception as e:
        print(f"Error checking port {port}: {e}")
        return False

if __name__ == "__main__":
    check_port()
