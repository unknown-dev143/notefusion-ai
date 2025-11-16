# NoteFusion AI

A real-time collaborative note-taking application with AI-powered features.

## Prerequisites

- Node.js (v14 or later)
- Python 3.8 or later
- npm or yarn

## Environment Setup

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory with the following content:
   ```
   REACT_APP_API_URL=http://localhost:8000
   REACT_APP_WS_URL=ws://localhost:8000
   ```

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   venv\Scripts\activate  # On Windows
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Application

### Option 1: Using the start script (Windows only)

Simply run:
```bash
start-dev.bat
```

### Option 2: Manual start

1. Start the backend server:
   ```bash
   cd backend
   python main.py
   ```

2. In a new terminal, start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Testing the WebSocket Connection

1. Open your browser's developer tools (F12)
2. Go to the Console tab
3. You should see WebSocket connection logs
4. For more detailed testing, open:
   ```
   http://localhost:3000/testConnection.js
   ```

## Troubleshooting

### CORS Issues
- Ensure the backend is running on port 8000
- Check the CORS configuration in `backend/main.py`
- Verify the frontend is making requests to the correct URL

### WebSocket Issues
- Check if the backend is running and accessible
- Verify the WebSocket URL in the frontend configuration
- Look for any errors in the browser's console

## License

This project is licensed under the MIT License.
