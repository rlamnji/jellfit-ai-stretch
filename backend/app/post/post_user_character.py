# 해파리 획득 조건 검사 후 
# 사용자 캐릭터 테이블에 등록하기
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import Character, UserCharacter, User, UsageRecord
from dependencies import get_current_user
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix='/guide', tags=['Guide'])

# 요청 스키마
class PoseRequest(BaseModel):
    pose_id: int

# 응답 스키마
class CharacterBase(BaseModel):
    character_id: int
    name: str
    pose_id: int
    acquisition_num: int

    class Config:
        orm_mode = True

class CharacterResponse(BaseModel):
    unlocked_character_ids: List[int]
    unlocked_characters: List[CharacterBase]

# 해파리 획득 조건 검사
@router.post("/available-characters", response_model=CharacterResponse)
def check_unlocked_characters(
    pose_req: PoseRequest,
    db: Session = Depends(get_db),
     current_user: User = Depends(get_current_user)
):
    user_id = current_user.user_id
    pose_id = pose_req.pose_id

    # 1. 누적 수행 횟수 가져오기
    record = (db.query(UsageRecord).filter_by(user_id=user_id, pose_id=pose_id).first())
    
    if not record :
        raise HTTPException(status_code=404, detail="해당 pose_id에 대한 기록이 없습니다.")
    
    user_repeat = record.repeat_cnt
    
    # 2. 해당 pose_id에 연결된 캐릭터들 찾기
    candidate_character = (db.query(Character).filter_by(pose_id=pose_id).all())
    
    # 3. 이미 유저가 보유한 캐릭터 ID 가져오기
    user_get_character = db.query(UserCharacter.character_id).filter_by(user_id=user_id).all()
    user_get_character = {c[0] for c in user_get_character}

    # 4. 조건 충족 & 미보유 캐릭터 필터링
    get_available_character = [
        c for c in candidate_character
        if c.acquisition_num <= user_repeat and c.character_id not in user_get_character
    ]

    return {
        "unlocked_character_ids": [c.character_id for c in get_available_character],
        "unlocked_characters": get_available_character
    }