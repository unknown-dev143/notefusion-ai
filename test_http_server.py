import http.server
import socketserver
import sys
import os

PORT = 9000

class SimpleHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        self.wfile.write(b'Python HTTP Server is working!\n')
        self.wfile.write(f'Python Version: {sys.version}'.encode())
        self.wfile.write(b'\n')
        self.wfile.write(f'Current Directory: {os.getcwd()}'.encode())

print(f"Starting HTTP server on port {PORT}...")
print(f"Open http://localhost:{PORT} in your browser")
print("Press Ctrl+C to stop the server")

with socketserver.TCPServer(("", PORT), SimpleHTTPRequestHandler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
