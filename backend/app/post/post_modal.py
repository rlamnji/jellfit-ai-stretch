# 획득 가능 캐릭터 id 배열을 사용해 캐릭터 정보를 반환
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import Character, UserCharacter, User, UsageRecord
from dependencies import get_current_user
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix='/characters', tags=['Character'])

# 요청
class UserCharacterRequest(BaseModel):
    pendingJelly: List[int]

@router.post("/by-ids")
def post_user_characters(
    pose_req: UserCharacterRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ids = pose_req.pendingJelly

    characters = db.query(Character).filter(Character.character_id.in_(ids)).all()

    return [
        {
            "character_id": c.character_id,
            "name": c.name,
            #"acquisition_num": c.acquisition_num,
            "description": c.description,
            "image_url": c.image_url,
            #"pose_id": c.pose_id

        } for c in characters
    ]