from http.server import HTTPServer, SimpleHTTPRequestHandler
import webbrowser
import threading
import os

PORT = 3000

def start_server():
    web_dir = os.path.join(os.path.dirname(__file__), 'frontend', 'dist')
    if not os.path.exists(web_dir):
        web_dir = os.path.join(os.path.dirname(__file__), 'frontend')
    
    os.chdir(web_dir)
    
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)
    print(f"Serving at http://localhost:{PORT}")
    httpd.serve_forever()

if __name__ == '__main__':
    # Start the server in a separate thread
    server_thread = threading.Thread(target=start_server)
    server_thread.daemon = True
    server_thread.start()
    
    # Open the browser
    webbrowser.open(f'http://localhost:{PORT}')
    
    # Keep the main thread alive
    try:
        while True:
            pass
    except KeyboardInterrupt:
        print("\nShutting down server...")
