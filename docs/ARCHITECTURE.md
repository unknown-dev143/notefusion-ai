# Notefusion AI - Architecture Overview

## System Architecture

### Frontend

- **Framework**: React with TypeScript
- **State Management**: React Context API
- **UI Library**: Ant Design
- **Routing**: React Router
- **Build Tool**: Vite

### Backend

- **Framework**: FastAPI
- **Database**: SQLite (development), PostgreSQL (production)
- **ORM**: SQLAlchemy
- **Authentication**: JWT
- **Background Tasks**: Celery with Redis

## Directory Structure

### Frontend (`/frontend/src`)

- `components/` - Reusable UI components
- `features/` - Feature-based modules
  - `study/` - Pomodoro Timer and study tools
  - `notes/` - Note management
  - `flashcards/` - Flashcard system
- `pages/` - Page components
- `services/` - API clients and services
- `contexts/` - React contexts for state management
- `hooks/` - Custom React hooks
- `utils/` - Utility functions
- `styles/` - Global styles and themes

### Backend (`/backend/app`)

- `api/` - API endpoints and routes
- `core/` - Core configurations
- `crud/` - Database operations
- `models/` - SQLAlchemy models
- `schemas/` - Pydantic schemas
- `services/` - Business logic
- `tasks/` - Background tasks
- `utils/` - Utility functions

## Data Flow

1. User interacts with the React frontend
2. Frontend makes API calls to FastAPI backend
3. Backend processes requests, interacts with database
4. Response sent back to frontend
5. UI updates based on response

## Authentication Flow

1. User logs in with credentials
2. Backend verifies and returns JWT token
3. Token stored in HTTP-only cookie
4. Subsequent requests include token in Authorization header
5. Backend validates token for protected routes
