from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import SessionLocal
from db.models import Character, UserCharacter, User
from dependencies import get_current_user  # access token 인증
from typing import List

router = APIRouter()

# DB 세션 의존성
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 전체 캐릭터
@router.get("/characters", response_model=List[dict])
def get_all_characters(db: Session = Depends(get_db)):
    characters = db.query(Character).all()
    return [
        {
            "character_id": c.character_id,
            "name": c.name,
            "acquisition_num": c.acquisition_num,
            "description": c.description,
            "image_url": c.image_url,
            "pose_id": c.pose_id

        } for c in characters
    ]

# 사용자 보유 캐릭터 (05.19 rlamnji)
@router.get("/characters/my-characters", response_model=List[dict])
def get_user_characters(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) 
):
    user_id = current_user.user_id 
    user_characters = db.query(UserCharacter).filter(UserCharacter.user_id == int(user_id)).all()
    return [
        {
            "user_character_id": c.user_character_id,
            "user_id": c.user_id,
            "character_id": c.character_id
        }
        for c in user_characters
    ]