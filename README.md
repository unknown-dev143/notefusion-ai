# NoteFusion AI

<<<<<<< HEAD
An intelligent note-taking and study assistant that transforms lectures, textbooks, and audio recordings into comprehensive, structured study materials using AI. Now with advanced file uploads and AI-powered content generation.
=======
An intelligent note-taking and study assistant that transforms lectures and textbooks into comprehensive, structured study materials using AI.
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

## 🚀 Features

### Core Functionality
<<<<<<< HEAD
- **Multi-file Upload**: Support for PDFs, audio files (MP3, WAV, M4A), and text documents
- **Live Recording**: Real-time audio recording with automatic transcription
- **Smart Fusion**: AI-powered combination of lecture and textbook content
- **Structured Notes**: Organized notes with source tagging ([Lecture] / [Book])
- **AI-Powered Generation**: Automatically expand, summarize, or reformat notes
- **Flashcard Generation**: Create study flashcards from your notes
- **Audio Transcription**: Automatic transcription of audio files with speaker diarization

### Advanced Features

=======
- **Multi-file Upload**: Support for PDFs, audio/video files, and text documents
- **Live Recording**: Real-time audio recording with automatic transcription
- **Smart Fusion**: AI-powered combination of lecture and textbook content
- **Structured Notes**: Organized notes with source tagging ([Lecture] / [Book])
- **Practice Questions**: Auto-generated questions with detailed answers
- **Study Time Estimation**: Intelligent time estimates based on content complexity

### Advanced Features
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
- **Export Options**: Markdown, PDF, and Anki-style flashcards
- **Search Functionality**: Full-text search across all content
- **Version History**: Track changes to notes over time
- **Diagram Support**: Drawing canvas for annotations and sketches
- **Session Management**: Organize and browse study sessions
- **Detail Levels**: Concise, Standard, and In-depth note generation

### Technical Features
<<<<<<< HEAD

=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
- **Real-time Transcription**: Live audio processing with Whisper
- **PDF Processing**: Text extraction and structural analysis
- **WebSocket Support**: Live audio streaming and transcription
- **Responsive Design**: Modern UI with Tailwind CSS
- **Database Storage**: SQLite for session and content management

<<<<<<< HEAD
## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- SQLite (included with Python)
- OpenAI API key (for AI features)
- Required Python packages (install with `pip install -r requirements.txt`)

### Environment Setup

1. Create a `.env` file in the backend directory with the following variables:

   ```env
   # Database
   DATABASE_URL=sqlite+aiosqlite:///./notefusion.db
   
   # Security
   SECRET_KEY=your-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   
   # OpenAI
   OPENAI_API_KEY=your-openai-api-key
   
   # CORS (adjust as needed for your frontend)
   FRONTEND_URL=http://localhost:3000
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Initialize the database:

   ```bash
   alembic upgrade head
   ```

4. Start the development server:

   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

The API will be available at `http://localhost:8000`

## 🛠️ API Documentation

Once the server is running, you can access:
- Interactive API docs: `http://localhost:8000/docs`
- Alternative API docs: `http://localhost:8000/redoc`

## 🧪 Testing

Run the test script to verify all endpoints:

```bash
python test_notes.py
```

This will test:
- User authentication
- Note creation and management
- File uploads
- AI content generation

### Quick Start

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/notefusion-ai.git
   cd notefusion-ai
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Start the services:
   ```powershell
   # On Windows
   .\deploy.ps1
   
   # On Linux/macOS
   chmod +x deploy.sh
   ./deploy.sh
   ```

4. Access the application:
   - API Docs: http://localhost:8000/docs
   - Frontend: http://localhost:3000

### Configuration

Key environment variables:

```env
# Database
POSTGRES_USER=notefusion
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=notefusion

# Backend
SECRET_KEY=your_secret_key_here
JWT_SECRET_KEY=your_jwt_secret_here

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Production Deployment

For production deployments, consider:

1. Setting up a reverse proxy (Nginx/Apache)
2. Enabling HTTPS with Let's Encrypt
3. Setting up proper backups
4. Configuring monitoring and logging
5. Using a proper database backup strategy

## 🛠️ Installation (Development)
=======
## 🛠️ Installation
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

### Prerequisites
- Python 3.8+
- Node.js 16+
- OpenAI API key

### Easy Startup (Recommended)

**Windows Users:**
```bash
# Simply double-click the batch file
start_app.bat
```

**All Platforms:**
```bash
# Run the Python startup script
py start_app.py
```

### Manual Setup

#### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   py -m pip install -r requirements.txt
   ```

3. **Set up environment variables**:
   Create a `.env` file in the backend directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the backend**:
   ```bash
   py -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   The backend will be available at `http://localhost:8000`

#### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
<<<<<<< HEAD

=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```
   The frontend will be available at `http://localhost:3000`

## 📖 Usage

### Creating a New Session

1. **Upload Files**: Drag and drop PDFs, audio, or video files
2. **Live Recording**: Use the microphone to record lectures in real-time
3. **Manual Input**: Paste or type content directly
4. **Configure Session**: Set module code, chapters, and detail level
5. **Generate Notes**: Let AI create structured study materials

### Features Overview

#### File Upload
<<<<<<< HEAD

=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
- **PDFs**: Automatically extract text and structure
- **Audio/Video**: Real-time transcription with Whisper
- **Text Files**: Direct processing and analysis

#### Live Recording
<<<<<<< HEAD

=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
- **Real-time Transcription**: See text appear as you speak
- **Pause/Resume**: Control recording flow
- **WebSocket Connection**: Seamless audio streaming

#### Smart Fusion
<<<<<<< HEAD

=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
- **Source Tagging**: Clear indication of content origin
- **Structured Output**: Organized sections with headings
- **Practice Questions**: Auto-generated for each section
- **Study Time Estimates**: Intelligent time calculations

#### Export Options
<<<<<<< HEAD

=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
- **Markdown**: Clean, formatted text files
- **PDF**: Professional document export
- **Flashcards**: Anki-compatible format

## 🏗️ Architecture

### Backend (FastAPI)
<<<<<<< HEAD

=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
```
backend/
├── main.py                 # FastAPI application
├── requirements.txt        # Python dependencies
├── app/
│   ├── models/
│   │   └── database.py    # Database models and setup
│   ├── services/
│   │   ├── transcription_service.py  # Whisper integration
│   │   ├── fusion_service.py        # OpenAI GPT-4 integration
│   │   └── pdf_service.py           # PDF processing
│   └── api/
│       └── routes.py      # Additional API endpoints
```

### Frontend (React)
<<<<<<< HEAD

=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
```
frontend/
├── package.json           # Node.js dependencies
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Main application pages
│   ├── services/         # API communication
│   └── utils/            # Utility functions
```

## 🔧 Configuration

### Environment Variables

Backend (`.env`):
<<<<<<< HEAD

=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
```env
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=notefusion.db
```

### API Endpoints

- `POST /api/upload` - File upload and processing
- `POST /api/transcribe` - Audio/video transcription
- `POST /api/fuse` - Content fusion
- `GET /api/sessions` - List all sessions
- `GET /api/sessions/{id}` - Get specific session
- `POST /api/export/{format}` - Export notes
- `GET /api/search` - Search content
- `WebSocket /ws/recording` - Live audio streaming

## 🎯 Key Technologies

### Backend
- **FastAPI**: Modern Python web framework
- **Whisper**: OpenAI's speech recognition
- **PyMuPDF**: PDF text extraction
- **OpenAI GPT-4**: Content fusion and generation
- **SQLite**: Database storage
- **WebSockets**: Real-time communication

### Frontend
- **React**: User interface framework
- **Tailwind CSS**: Styling and design
- **React Query**: Data fetching and caching
- **React Dropzone**: File upload handling
- **React Markdown**: Content rendering

## 🚀 Deployment

### Development
```bash
# Backend
cd backend
python main.py

# Frontend
cd frontend
npm start
```

### Production
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000

# Frontend
cd frontend
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

## 🔮 Future Enhancements

- **Collaboration**: Share notes with classmates
- **Adaptive Learning**: Personalized study recommendations
- **Advanced Analytics**: Study progress tracking
- **Mobile App**: Native mobile application
- **Offline Support**: Local processing capabilities
- **Integration**: LMS and educational platform integration 