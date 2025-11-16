import socket

def check_port(port=8000):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('127.0.0.1', port))
    if result == 0:
        print(f"Port {port} is open and in use")
    else:
        print(f"Port {port} is closed or not responding")
    sock.close()

if __name__ == "__main__":
    check_port()
