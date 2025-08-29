"""Test configuration and fixtures for note-related tests."""
import pytest
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient

from app.main import app
from app.database import Base, get_db
from app.models.user import User
from app.models.note import Note, Attachment, Folder

# Test client
@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

# Test database session
@pytest.fixture(scope="function")
def test_db():
    from app.database import SessionLocal, engine
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

# Test user
@pytest.fixture(scope="function")
def test_user(test_db: Session) -> User:
    user = User(
        email="test@example.com",
        hashed_password="hashed_password",
        full_name="Test User",
        is_active=True,
        is_superuser=False
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    return user

# Test note
@pytest.fixture(scope="function")
def test_note(test_db: Session, test_user: User) -> Note:
    note = Note(
        title="Test Note",
        content="This is a test note",
        user_id=test_user.id,
        tags=["test", "pytest"],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    test_db.add(note)
    test_db.commit()
    test_db.refresh(note)
    return note

# Test folder
@pytest.fixture(scope="function")
def test_folder(test_db: Session, test_user: User) -> Folder:
    folder = Folder(
        name="Test Folder",
        user_id=test_user.id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    test_db.add(folder)
    test_db.commit()
    test_db.refresh(folder)
    return folder

# Test attachment
@pytest.fixture(scope="function")
def test_attachment(test_db: Session, test_note: Note) -> Attachment:
    attachment = Attachment(
        filename="test.txt",
        file_path="notes/1/test.txt",
        file_url="http://example.com/test.txt",
        file_type="text/plain",
        file_size=1024,
        note_id=test_note.id,
        uploaded_at=datetime.utcnow()
    )
    test_db.add(attachment)
    test_db.commit()
    test_db.refresh(attachment)
    return attachment

# Override get_db dependency for testing
@pytest.fixture(scope="function")
def override_get_db(test_db):
    def _get_db():
        try:
            yield test_db
        finally:
            test_db.rollback()
    return _get_db

# Override get_current_user dependency for testing
@pytest.fixture(scope="function")
def override_get_current_user(test_user):
    def _get_current_user():
        return test_user
    return _get_current_user
