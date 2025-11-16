import http.server
import socketserver
import os
import webbrowser

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Enable CORS for service worker
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Service-Worker-Allowed', '/')
        super().end_headers()
    
    def log_message(self, format, *args):
        # Suppress logging for cleaner output
        pass

def run_server():
    os.chdir(DIRECTORY)
    
    # Open browser to test page
    url = f'http://localhost:{PORT}/sw-test.html'
    print(f'\nStarting server at {url}')
    print('Press Ctrl+C to stop the server\n')
    
    try:
        webbrowser.open(url)
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print('\nServer stopped')
    except Exception as e:
        print(f'Error: {e}')

if __name__ == '__main__':
    run_server()
