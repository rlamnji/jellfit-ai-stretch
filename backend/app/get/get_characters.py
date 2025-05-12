from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import SessionLocal
from db.models import Character
from typing import List

router = APIRouter()

# DB 세션 의존성
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/characters", response_model=List[dict])
def get_all_characters(db: Session = Depends(get_db)):
    characters = db.query(Character).all()
    return [
        {
            "character_id": c.character_id,
            "name": c.name,
            "description": c.description,
        } for c in characters
    ]