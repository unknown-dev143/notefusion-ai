from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from typing import List, Optional
import PyPDF2
import io
import os
from datetime import timedelta

from sqlalchemy.orm import Session

import models, schemas, auth, config
from database import SessionLocal, engine
from config import settings

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="NoteFusion API",
    version="1.0.0",
    description="API for NoteFusion - A smart note-taking application",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Authentication endpoints
@app.post("/api/auth/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/auth/token", response_model=schemas.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# User endpoints
@app.get("/api/users/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user

# Note endpoints
@app.post("/api/notes/", response_model=schemas.Note)
def create_note(
    note: schemas.NoteCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    db_note = models.Note(**note.dict(), owner_id=current_user.id)
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

@app.get("/api/notes/", response_model=List[schemas.Note])
def read_notes(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    notes = db.query(models.Note).filter(models.Note.owner_id == current_user.id).offset(skip).limit(limit).all()
    return notes

@app.get("/api/notes/{note_id}", response_model=schemas.Note)
def read_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    db_note = db.query(models.Note).filter(
        models.Note.id == note_id,
        models.Note.owner_id == current_user.id
    ).first()
    if db_note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    return db_note

@app.put("/api/notes/{note_id}", response_model=schemas.Note)
def update_note(
    note_id: int,
    note: schemas.NoteUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    db_note = db.query(models.Note).filter(
        models.Note.id == note_id,
        models.Note.owner_id == current_user.id
    ).first()
    if db_note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    
    update_data = note.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_note, field, value)
    
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

@app.delete("/api/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    db_note = db.query(models.Note).filter(
        models.Note.id == note_id,
        models.Note.owner_id == current_user.id
    ).first()
    if db_note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    
    db.delete(db_note)
    db.commit()
    return {"ok": True}

# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint to verify the API is running"""
    return {
        "status": "ok",
        "message": "Backend is healthy",
        "version": "1.0.0"
    }

@app.post("/api/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Handle file uploads and extract text from PDFs.
    
    Args:
        file: The uploaded file (PDF or text)
        
    Returns:
        dict: Contains filename, content (extracted text), and file type
    """
    try:
        # Validate file type
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
            
        # Read the file
        contents = await file.read()
        
        # If it's a PDF, extract text
        if file.filename.lower().endswith('.pdf'):
            try:
                reader = PyPDF2.PdfReader(io.BytesIO(contents))
                text = ""
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
                
                # Create a note from the PDF content
                note_data = {
                    "title": file.filename,
                    "content": text.strip(),
                    "owner_id": current_user.id
                }
                
                db_note = models.Note(**note_data)
                db.add(db_note)
                db.commit()
                db.refresh(db_note)
                
                return {
                    "status": "success",
                    "message": "PDF processed and saved as note",
                    "note_id": db_note.id,
                    "filename": file.filename,
                    "content": text.strip(),
                    "type": "pdf",
                    "page_count": len(reader.pages)
                }
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Error processing PDF: {str(e)}")
        
        # For text files
        elif file.filename.lower().endswith(('.txt', '.md')):
            # Create a note from the text content
            note_data = {
                "title": file.filename,
                "content": contents.decode('utf-8'),
                "owner_id": current_user.id
            }
            
            db_note = models.Note(**note_data)
            db.add(db_note)
            db.commit()
            db.refresh(db_note)
            
            return {
                "status": "success",
                "message": "Text file processed and saved as note",
                "note_id": db_note.id,
                "filename": file.filename,
                "content": contents.decode('utf-8'),
                "type": "text"
            }
            
        # Unsupported file type
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type. Please upload a PDF or text file.")
    
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to NoteFusion API",
        "docs": "/docs",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    
    # Get port from environment variable or use default 8000
    port = int(os.getenv("PORT", 8000))
    
    print("Starting FastAPI server...")
    print(f"Access the API at: http://127.0.0.1:{port}")
    print(f"API Documentation: http://127.0.0.1:{port}/docs")
    print("Press Ctrl+C to stop")
    
    # Run the FastAPI app
    uvicorn.run(
        "working_server:app",
        host="127.0.0.1",
        port=port,
        reload=True,
        workers=1
    )
