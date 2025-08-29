import socket

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

if is_port_in_use(5000):
    print("Port 5000 is still in use. Please try restarting your computer to clear all processes.")
else:
    print("Port 5000 is now available! You can start your application.")
