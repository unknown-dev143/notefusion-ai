from fastapi import APIRouter, HTTPException, Form, Query, UploadFile, File, Body
from .video_jobs import router as video_jobs_router
from .audio_upload import router as audio_upload_router
from .audio_to_notes import router as audio_to_notes_router
from .endpoints.video import router as video_router
from .endpoints.subscription import router as subscription_router
<<<<<<< HEAD
from .endpoints.flashcards import router as flashcards_router
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
from .test_video import router as test_video_router
from .endpoints.test_subscription import router as test_subscription_router
from fastapi.responses import FileResponse, JSONResponse
import json
import os
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

# Create temp directory for videos
temp_video_dir = "exports/videos"
os.makedirs(temp_video_dir, exist_ok=True)

# Import local modules
from ..models.database import get_db
from ..services.fusion_service import FusionService
from ..services.pdf_service import PDFService
from ..services.visual.service import VisualGenerationService

router = APIRouter()
router.include_router(video_jobs_router)
router.include_router(audio_upload_router)
router.include_router(audio_to_notes_router)
router.include_router(video_router, prefix="/api/v1")
<<<<<<< HEAD
router.include_router(subscription_router, prefix="/api/v1")
router.include_router(flashcards_router, prefix="/api/v1/flashcards", tags=["flashcards"])
router.include_router(test_subscription_router, prefix="/test-subscription")
=======
router.include_router(test_video_router)
router.include_router(test_subscription_router, prefix="/api/v1")
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
router.include_router(subscription_router, prefix="/api/v1", tags=["subscriptions"])

# Initialize services
fusion_service = FusionService()
pdf_service = PDFService()
visual_service = VisualGenerationService()

from ..models.database import Flashcard, PracticeQuestion
from ..services.educational.learning import QuizGenerator
import uuid

quiz_generator = QuizGenerator()

@router.post("/sessions")
async def create_session(
    module_code: str = Form(...),
    title: str = Form(None),
    chapters: str = Form(""),
    detail_level: str = Form("basic")
):
    """Create a new blank session. Title is accepted but not stored if the schema lacks it."""
    try:
        session_id = str(uuid.uuid4())
        now = datetime.now()
        db = await get_db()
        # Insert minimal required columns; store empty contents/fused_notes
        await db.execute(
            """
            INSERT INTO sessions (session_id, module_code, chapters, detail_level, lecture_content, textbook_content, fused_notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (session_id, module_code, chapters, detail_level, "", "", json.dumps({}), now),
        )
        await db.commit()
        await db.close()
        return {
            "session_id": session_id,
            "module_code": module_code,
            "chapters": chapters,
            "detail_level": detail_level,
            "created_at": now.isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")

@router.post("/api/flashcards/generate")
async def generate_flashcards(session_id: str = Form(...)):
    """Generate flashcards from session notes and store in DB."""
    try:
        db = await get_db()
        cursor = await db.execute("SELECT * FROM sessions WHERE session_id = ?", (session_id,))
        session = await cursor.fetchone()
        if not session:
            await db.close()
            raise HTTPException(status_code=404, detail="Session not found")
        fused_notes = json.loads(session[6])
        notes_content = fused_notes.get("summary", "")
        for section in fused_notes.get("sections", []):
            notes_content += "\n" + section.get("title", "") + "\n"
            for item in section.get("content", []):
                notes_content += item.get("text", "") + "\n"
        flashcards = await fusion_service.generate_flashcards(notes_content)
        flashcard_objs = []
        for card in flashcards:
            card_id = str(uuid.uuid4())
            tags = card.get("tags", [])
            flashcard = Flashcard(
                flashcard_id=card_id,
                session_id=session_id,
                front=card["front"],
                back=card["back"],
                tags=tags
            )
            await flashcard.save()
            flashcard_objs.append({"front": card["front"], "back": card["back"], "tags": tags})
        await db.close()
        return {"session_id": session_id, "flashcards": flashcard_objs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Flashcard generation failed: {str(e)}")

@router.get("/api/flashcards/{session_id}")
async def get_flashcards(session_id: str):
    """Retrieve all flashcards for a session."""
    try:
        db = await get_db()
        cursor = await db.execute("SELECT front, back, tags FROM flashcards WHERE session_id = ?", (session_id,))
        rows = await cursor.fetchall()
        flashcards = []
        for row in rows:
            tags = json.loads(row[2]) if row[2] else []
            flashcards.append({"front": row[0], "back": row[1], "tags": tags})
        await db.close()
        return {"session_id": session_id, "flashcards": flashcards}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve flashcards: {str(e)}")

@router.post("/api/quizzes/generate")
async def generate_quiz(session_id: str = Form(...), num_questions: int = Form(5)):
    """Generate quiz questions from session notes and store in DB."""
    try:
        db = await get_db()
        cursor = await db.execute("SELECT * FROM sessions WHERE session_id = ?", (session_id,))
        session = await cursor.fetchone()
        if not session:
            await db.close()
            raise HTTPException(status_code=404, detail="Session not found")
        fused_notes = json.loads(session[6])
        notes_content = fused_notes.get("summary", "")
        for section in fused_notes.get("sections", []):
            notes_content += "\n" + section.get("title", "") + "\n"
            for item in section.get("content", []):
                notes_content += item.get("text", "") + "\n"
        questions = await quiz_generator.generate_quiz(notes_content, num_questions)
        quiz_objs = []
        for q in questions:
            q_id = str(uuid.uuid4())
            pq = PracticeQuestion(
                question_id=q_id,
                session_id=session_id,
                section_name=q.topic_area,
                question_text=q.question,
                answer_text=q.explanation,
                question_type="multiple_choice"
            )
            await pq.save()
            quiz_objs.append({
                "question": q.question,
                "options": q.options,
                "correct_answer": q.correct_answer,
                "explanation": q.explanation,
                "difficulty": q.difficulty,
                "topic_area": q.topic_area
            })
        await db.close()
        return {"session_id": session_id, "quiz": quiz_objs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quiz generation failed: {str(e)}")

@router.get("/api/quizzes/{session_id}")
async def get_quiz(session_id: str):
    """Retrieve all quiz questions for a session."""
    try:
        db = await get_db()
        cursor = await db.execute("SELECT section_name, question_text, answer_text, question_type FROM practice_questions WHERE session_id = ?", (session_id,))
        rows = await cursor.fetchall()
        quizzes = []
        for row in rows:
            quizzes.append({
                "section_name": row[0],
                "question": row[1],
                "answer": row[2],
                "question_type": row[3]
            })
        await db.close()
        return {"session_id": session_id, "quiz": quizzes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve quiz: {str(e)}")


import hmac
import hashlib
import base64
import time
import os

SECRET_KEY = os.environ.get("IMAGE_SIGN_SECRET", "dev-secret-key")


def sign_image_url(path: str, expires: int) -> str:
    msg = f"{path}:{expires}".encode()
    sig = hmac.new(SECRET_KEY.encode(), msg, hashlib.sha256).digest()
    return base64.urlsafe_b64encode(sig).decode()


def verify_image_url(path: str, expires: int, signature: str) -> bool:
    if time.time() > expires:
        return False
    expected = sign_image_url(path, expires)
    # Use hmac.compare_digest for security
    return hmac.compare_digest(signature, expected)

@router.get("/api/diagrams/image")
async def get_diagram_image(
    path: str = Query(..., description="Path to the diagram image file"),
    expires: int = Query(..., description="Unix timestamp when URL expires"),
    signature: str = Query(..., description="Signature for the image URL")
):
    """Serve a diagram image by file path (only from allowed temp dir, with signed URL)."""
    from pathlib import Path
    import mimetypes
    temp_dir = visual_service._temp_dir
    try:
        # Validate signature
        if not verify_image_url(path, expires, signature):
            raise HTTPException(status_code=403, detail="Invalid or expired signature.")
        file_path = Path(path)
        file_path = file_path.resolve()
        if not str(file_path).startswith(str(temp_dir.resolve())):
            raise HTTPException(status_code=403, detail="Access denied.")
        if not file_path.exists() or not file_path.is_file():
            raise HTTPException(status_code=404, detail="Image not found.")
        mime, _ = mimetypes.guess_type(str(file_path))
        return FileResponse(
            path=str(file_path),
            media_type=mime or "image/png",
            filename=file_path.name
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image path: {str(e)}")

@router.get("/api/diagrams/sign-url")
async def sign_diagram_url(
    path: str = Query(..., description="Path to the diagram image file"),
    expires_in: int = Query(300, description="How many seconds until the URL expires (default 5 min)")
):
    """Return a signed URL for a diagram image."""
    expires = int(time.time()) + expires_in
    signature = sign_image_url(path, expires)
    url = f"/api/diagrams/image?path={path}&expires={expires}&signature={signature}"
    return {"url": url, "expires": expires, "signature": signature}

@router.post("/export/markdown")
async def export_markdown(session_id: str = Form(...)):
    """Export session notes as Markdown"""
    try:
        db = await get_db()
        cursor = await db.execute("""
            SELECT * FROM sessions WHERE session_id = ?
        """, (session_id,))
        session = await cursor.fetchone()
        
        if not session:
            await db.close()
            raise HTTPException(status_code=404, detail="Session not found")
        
        fused_notes = json.loads(session[6])
        await db.close()
        
        # Generate Markdown content
        markdown_content = _generate_markdown(fused_notes)
        
        # Save to file
        filename = f"export_{session_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
        filepath = f"exports/{filename}"
        
        os.makedirs("exports", exist_ok=True)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        
        return FileResponse(
            path=filepath,
            filename=filename,
            media_type='text/markdown'
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@router.post("/api/video/generate")
async def generate_video(
    notes: Dict[str, Any] = Body(..., description="Structured notes JSON for video generation"),
    diagrams: Optional[List[Dict[str, Any]]] = Body(None, description="List of diagrams to include in video"),
    voice: Optional[str] = Body(None, description="Voice for narration (e.g., 'male', 'female', or specific)", embed=True),
    style: Optional[str] = Body(None, description="Slide visual style/theme", embed=True),
    duration_per_slide: Optional[int] = Body(5, description="Seconds per slide", embed=True)
):
    """
    Generate a narrated video from notes and (optionally) diagrams.
    Returns a downloadable video file.
    """
    try:
        # Generate video using VisualGenerationService
        result = await visual_service.generate_presentation(
            notes=notes,
            include_diagrams=bool(diagrams),
            diagrams=diagrams,
            duration_per_slide=duration_per_slide,
            voice=voice,
            style=style
        )
        video_path = result.get("video_path")
        if not video_path or not os.path.exists(video_path):
            return JSONResponse(status_code=500, content={"error": "Video generation failed"})
        filename = os.path.basename(video_path)
        return FileResponse(
            path=video_path,
            filename=filename,
            media_type="video/mp4"
        )
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.post("/export/pdf")
async def export_pdf(session_id: str = Form(...)):
    """Export session notes as PDF"""
    try:
        db = await get_db()
        cursor = await db.execute("""
            SELECT * FROM sessions WHERE session_id = ?
        """, (session_id,))
        session = await cursor.fetchone()
        
        if not session:
            await db.close()
            raise HTTPException(status_code=404, detail="Session not found")
        
        fused_notes = json.loads(session[6])
        await db.close()
        
        # Generate PDF content
        pdf_content = await _generate_pdf(fused_notes)
        
        # Save to file
        filename = f"export_{session_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        filepath = f"exports/{filename}"
        
        os.makedirs("exports", exist_ok=True)
        with open(filepath, 'wb') as f:
            f.write(pdf_content)
        
        return FileResponse(
            path=filepath,
            filename=filename,
            media_type='application/pdf'
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF export failed: {str(e)}")

@router.post("/export/flashcards")
async def export_flashcards(session_id: str = Form(...)):
    """Export session as Anki-style flashcards"""
    try:
        db = await get_db()
        cursor = await db.execute("""
            SELECT * FROM sessions WHERE session_id = ?
        """, (session_id,))
        session = await cursor.fetchone()
        
        if not session:
            await db.close()
            raise HTTPException(status_code=404, detail="Session not found")
        
        fused_notes = json.loads(session[6])
        await db.close()
        
        # Generate flashcards
        flashcards = await fusion_service.generate_flashcards(json.dumps(fused_notes))
        
        # Create Anki-compatible format
        anki_content = _generate_anki_format(flashcards, session[1])  # module_code
        
        # Save to file
        filename = f"flashcards_{session_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        filepath = f"exports/{filename}"
        
        os.makedirs("exports", exist_ok=True)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(anki_content)
        
        return FileResponse(
            path=filepath,
            filename=filename,
            media_type='text/plain'
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Flashcard export failed: {str(e)}")

@router.get("/search")
async def search_content(
    query: str = Query(...),
    session_id: Optional[str] = Query(None)
):
    """Search across transcripts and notes"""
    try:
        search_results = []
        
        db = await get_db()
        if session_id:
            # Search within specific session
            cursor = await db.execute("""
                SELECT * FROM sessions WHERE session_id = ? 
                AND (lecture_content LIKE ? OR textbook_content LIKE ? OR fused_notes LIKE ?)
            """, (session_id, f"%{query}%", f"%{query}%", f"%{query}%"))
            sessions = await cursor.fetchall()
            
            for session in sessions:
                search_results.append({
                    "type": "session",
                    "session_id": session[0],
                    "module_code": session[1],
                    "chapters": session[2],
                    "matches": _find_matches(query, session[4] + " " + session[5] + " " + session[6])
                })
        else:
            # Search across all sessions
            cursor = await db.execute("""
                SELECT * FROM sessions 
                WHERE lecture_content LIKE ? OR textbook_content LIKE ? OR fused_notes LIKE ?
            """, (f"%{query}%", f"%{query}%", f"%{query}%"))
            sessions = await cursor.fetchall()
            
            for session in sessions:
                search_results.append({
                    "type": "session",
                    "session_id": session[0],
                    "module_code": session[1],
                    "chapters": session[2],
                    "matches": _find_matches(query, session[4] + " " + session[5] + " " + session[6])
                })
        
        await db.close()
        
        return {
            "query": query,
            "results": search_results,
            "total_results": len(search_results)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.post("/diagrams/save")
async def save_diagram(
    session_id: str = Form(...),
    diagram_data: str = Form(...),
    diagram_type: str = Form("freehand")
):
    """Save diagram/drawing"""
    try:
        diagram_id = str(uuid.uuid4())
        
        db = await get_db()
        await db.execute("""
            INSERT INTO diagrams (diagram_id, session_id, diagram_data, diagram_type, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (diagram_id, session_id, diagram_data, diagram_type, datetime.now()))
        await db.commit()
        await db.close()
        
        return {
            "diagram_id": diagram_id,
            "session_id": session_id,
            "status": "saved"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save diagram: {str(e)}")

@router.get("/diagrams/{session_id}")
async def get_diagrams(session_id: str):
    """Get all diagrams for a session"""
    try:
        db = await get_db()
        cursor = await db.execute("""
            SELECT * FROM diagrams WHERE session_id = ? ORDER BY created_at DESC
        """, (session_id,))
        diagrams = await cursor.fetchall()
        await db.close()
        
        return {
            "session_id": session_id,
            "diagrams": [
                {
                    "diagram_id": diagram[0],
                    "diagram_type": diagram[3],
                    "created_at": diagram[4]
                }
                for diagram in diagrams
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get diagrams: {str(e)}")

@router.post("/notes/version")
async def save_notes_version(
    session_id: str = Form(...),
    notes_content: str = Form(...),
    version_number: int = Form(...)
):
    """Save a new version of notes"""
    try:
        version_id = str(uuid.uuid4())
        
        db = await get_db()
        await db.execute("""
            INSERT INTO notes_versions (version_id, session_id, notes_content, version_number, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (version_id, session_id, notes_content, version_number, datetime.now()))
        await db.commit()
        
        # Trigger flashcard and quiz generation for the session
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save notes version: {str(e)}")
        db_error = None
        flashcard_objs = []
        quiz_objs = []
        error_details = None
        try:
            # Re-fetch session fused_notes for generation
            try:
                cursor = await db.execute("SELECT * FROM sessions WHERE session_id = ?", (session_id,))
                session = await cursor.fetchone()
                if not session:
                    error_details = "Session not found for flashcard/quiz generation."
                else:
                    fused_notes = json.loads(session[6])
                    notes_content = fused_notes.get("summary", "")
                    for section in fused_notes.get("sections", []):
                        notes_content += "\n" + section.get("title", "") + "\n"
                        for item in section.get("content", []):
                            notes_content += item.get("text", "") + "\n"
                    # Generate flashcards
                    try:
                        flashcards = await fusion_service.generate_flashcards(notes_content)
                        for card in flashcards:
                            card_id = str(uuid.uuid4())
                            tags = card.get("tags", [])
                            flashcard = Flashcard(
                                flashcard_id=card_id,
                                session_id=session_id,
                                front=card["front"],
                                back=card["back"],
                                tags=tags
                            )
                            await flashcard.save()
                            flashcard_objs.append({"front": card["front"], "back": card["back"], "tags": tags})
                    except Exception as flashcard_error:
                        error_details = f"Flashcard generation error: {str(flashcard_error)}"
                    # Generate quiz questions
                    try:
                        quiz_questions = await quiz_generator.generate_quiz(notes_content, num_questions=5)
                        for q in quiz_questions:
                            pq = PracticeQuestion(
                                question_id=str(uuid.uuid4()),
                                session_id=session_id,
                                section_name=getattr(q, "topic_area", ""),
                                question_text=q.question,
                                answer_text=q.options[q.correct_answer] if hasattr(q, "options") and hasattr(q, "correct_answer") else getattr(q, "answer", ""),
                                question_type=getattr(q, "question_type", "multiple_choice")
                            )
                            await pq.save()
                            quiz_objs.append({
                                "question": q.question,
                                "options": getattr(q, "options", []),
                                "correct_answer": getattr(q, "correct_answer", None),
                                "explanation": getattr(q, "explanation", ""),
                                "difficulty": getattr(q, "difficulty", ""),
                                "topic_area": getattr(q, "topic_area", "")
                            })
                    except Exception as quiz_error:
                        if error_details:
                            error_details += f" | Quiz generation error: {str(quiz_error)}"
                        else:
                            error_details = f"Quiz generation error: {str(quiz_error)}"
            except Exception as db_inner_error:
                db_error = str(db_inner_error)
        finally:
            try:
                await db.close()
            except Exception as close_error:
                if db_error:
                    db_error += f" | DB close error: {str(close_error)}"
                else:
                    db_error = f"DB close error: {str(close_error)}"
        if error_details or db_error:
            # Determine notification type and message
            notification_type = "error"
            message = "There was a problem generating flashcards or quiz questions. Some or all content may be missing."
            if error_details and ("Flashcard generation error" in error_details or "Quiz generation error" in error_details):
                notification_type = "partial_success"
                if "Flashcard generation error" in error_details and "Quiz generation error" in error_details:
                    message = "Both flashcard and quiz generation failed. Please try again."
                elif "Flashcard generation error" in error_details:
                    message = "Flashcards could not be generated, but quiz questions were created. You can retry generating flashcards."
                elif "Quiz generation error" in error_details:
                    message = "Quiz questions could not be generated, but flashcards were created. You can retry generating quiz questions."
            elif error_details == "Session not found for flashcard/quiz generation.":
                notification_type = "warning"
                message = "Notes saved, but session data was not found for generating flashcards or quiz questions. Please check your session."
            elif db_error:
                notification_type = "error"
                message = "A database error occurred. Please try again or contact support."
            return {
                "success": notification_type != "error",
                "notification_type": notification_type,
                "data": {
                    "version_id": version_id,
                    "session_id": session_id,
                    "version_number": version_number,
                    "flashcards": flashcard_objs,
                    "quiz": quiz_objs
                },
                "message": message,
                "error": {
                    "details": error_details,
                    "db_error": db_error
                }
            }
        else:
            return {
                "success": True,
                "notification_type": "success",
                "data": {
                    "version_id": version_id,
                    "session_id": session_id,
                    "version_number": version_number,
                    "flashcards": flashcard_objs,
                    "quiz": quiz_objs
                },
                "message": "Notes saved successfully. Flashcards and quiz generated!"
            }

def _generate_markdown(fused_notes: dict) -> str:
    """Generate Markdown content from fused notes"""
    markdown = "# Study Notes\n\n"
    
    if "summary" in fused_notes:
        markdown += f"## Summary\n{fused_notes['summary']}\n\n"
    
    if "sections" in fused_notes:
        for section in fused_notes["sections"]:
            markdown += f"## {section['title']}\n\n"
            
            for item in section.get("content", []):
                if item["type"] == "heading":
                    markdown += f"### {item['text']}\n\n"
                elif item["type"] == "bullet":
                    markdown += f"- {item['text']} {item.get('source', '')}\n"
                elif item["type"] == "definition":
                    markdown += f"**{item['text']}** {item.get('source', '')}\n\n"
                elif item["type"] == "example":
                    markdown += f"*Example: {item['text']}* {item.get('source', '')}\n\n"
            
            if "key_takeaways" in section:
                markdown += "### Key Takeaways\n"
                for takeaway in section["key_takeaways"]:
                    markdown += f"- {takeaway}\n"
                markdown += "\n"
            
            if "practice_questions" in section:
                markdown += "### Practice Questions\n"
                for i, question in enumerate(section["practice_questions"], 1):
                    markdown += f"{i}. {question['question']}\n"
                    markdown += f"   **Answer:** {question['answer']}\n\n"
    
    return markdown

async def _generate_pdf(fused_notes: dict) -> bytes:
    """Generate PDF content from fused notes"""
    # This would use WeasyPrint or similar library
    # For now, return a placeholder
    markdown_content = _generate_markdown(fused_notes)
    return markdown_content.encode('utf-8')

def _generate_anki_format(flashcards: list, module_code: str) -> str:
    """Generate Anki-compatible format"""
    anki_content = f"# {module_code} Flashcards\n\n"
    
    for i, card in enumerate(flashcards, 1):
        anki_content += f"## Card {i}\n"
        anki_content += f"**Front:** {card['front']}\n"
        anki_content += f"**Back:** {card['back']}\n"
        if 'tags' in card:
            anki_content += f"**Tags:** {', '.join(card['tags'])}\n"
        anki_content += "\n"
    
    return anki_content

@router.post("/video/generate")
async def generate_video_from_text(payload: dict):
    """
    Generate an AI-powered video explanation from concept text or structured notes.
    
    This endpoint creates a video presentation with synchronized narration from the provided content.
    The video includes text slides and can optionally include diagrams.
    
    Request Body (JSON):
    {
        "text": str,                 # Raw text to convert to video (alternative to 'notes')
        "notes": {                   # Structured notes (alternative to 'text')
            "segments": [
                {
                    "text": str,     # Text content for this segment
                    "speaker": str   # Optional speaker name
                }
            ],
            "diagrams": [            # Optional diagrams to include
                {
                    "diagram_data": str  # Base64-encoded image data
                }
            ]
        },
        "voice": str,                # Optional: "male", "female", "robot", or "default"
        "style": str,                # Optional: "Dark", "Minimal", "Colorful", or "Default"
        "diagrams": list             # Optional: List of diagrams to include in the video
    }
    
    Returns:
        Video file (MP4) with the generated presentation
        
    Example usage with curl:
    ```
    curl -X POST "http://localhost:8000/video/generate" \
         -H "Content-Type: application/json" \
         -d '{"text": "This is a test video.", "voice": "female", "style": "Minimal"}'
    ```
    
    The endpoint supports both simple text input (automatically segmented) and pre-structured
    notes with speaker information and timing.
    """
    try:
        # Accept either raw text or structured notes
        notes = payload.get("notes")
        text = payload.get("text")
        voice = payload.get("voice")
        style = payload.get("style")
        diagrams = payload.get("diagrams")
        if not notes and not text:
            raise HTTPException(status_code=400, detail="Missing 'notes' or 'text' in request.")
        if not notes:
            # Wrap text as a minimal notes structure
            notes = {"segments": [{"text": text, "speaker": "Narrator"}]}
        # Generate video presentation
        result = await visual_service.generate_presentation(notes, voice=voice, style=style, diagrams=diagrams)
        if "error" in result:
            raise HTTPException(status_code=500, detail=f"Video generation failed: {result['error']}")
        video_path = result["path"]
        filename = os.path.basename(video_path)
        return FileResponse(
            path=video_path,
            filename=filename,
            media_type="video/mp4"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video generation failed: {str(e)}")

def _find_matches(query: str, content: str) -> list:
    """Find matches for search query in content"""
    matches = []
    lines = content.split('\n')
    
    for i, line in enumerate(lines):
        if query.lower() in line.lower():
            matches.append({
                "line_number": i + 1,
                "line": line.strip(),
                "context": " ".join(lines[max(0, i-1):min(len(lines), i+2)])
            })
    
    return matches 