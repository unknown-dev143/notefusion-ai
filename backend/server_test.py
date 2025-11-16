from fastapi import FastAPI
import uvicorn

app = FastAPI(title='NoteFusion AI', version='1.0.0')

@app.get('/')
async def root():
    return {
        'message': 'NoteFusion AI is running!',
        'version': '1.0.0',
        'status': 'active'
    }

@app.get('/health')
async def health():
    return {'status': 'healthy', 'service': 'NoteFusion AI'}

if __name__ == '__main__':
    print(' Starting NoteFusion AI server...')
    print(' API Documentation: http://127.0.0.1:8001/docs')
    print(' Alternative docs: http://127.0.0.1:8001/redoc')
    print(' Health check: http://127.0.0.1:8001/health')
    uvicorn.run(app, host='127.0.0.1', port=8002)
