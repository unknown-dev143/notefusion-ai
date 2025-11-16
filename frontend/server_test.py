from fastapi import FastAPI
import uvicorn

app = FastAPI(title='NoteFusion AI')

@app.get('/')
async def root():
    return {'message': 'NoteFusion AI is working!'}

if __name__ == '__main__':
    print('Starting server...')
    uvicorn.run(app, host='127.0.0.1', port=8001)
