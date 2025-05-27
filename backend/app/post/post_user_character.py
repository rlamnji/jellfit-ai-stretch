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


# 응답 스키마
class CharacterBase(BaseModel):
    character_id: int
    name: str
    pose_id: int
    acquisition_num: int
    # 테스트 후 charater_id만 응답하게 수정할 것

    class Config:
        orm_mode = True

class CharacterResponse(BaseModel):
    unlocked_character_ids: List[int]
    unlocked_characters: List[CharacterBase]


# 해파리 획득 조건 검사
@router.post("/available-characters", response_model=CharacterResponse)
def check_unlocked_characters(
    db: Session = Depends(get_db),
    current_user:User=Depends(get_current_user)
):
    user_id = current_user.user_id

    # 1. 유저의 전체 포즈 수행 기록 조회
    records = db.query(UsageRecord).filter_by(user_id=user_id).all()
    pose_repeat_map = {r.pose_id: r.repeat_cnt for r in records}  # pose_id → 반복 횟수

    # 2. 유저가 이미 보유한 캐릭터
    owned_ids = db.query(UserCharacter.character_id).filter_by(user_id=user_id).all()
    owned_ids = {c[0] for c in owned_ids}

    # 3. 전체 캐릭터 후보 가져오기
    all_candidates = db.query(Character).all()

    # 4. 조건 만족 & 미보유 캐릭터 필터링
    unlocked = []
    for char in all_candidates:
        pose_id = char.pose_id
        if (
            pose_id in pose_repeat_map and
            char.character_id not in owned_ids and
            pose_repeat_map[pose_id] >= char.acquisition_num
        ):
            unlocked.append(char)

    return {
        "unlocked_character_ids": [c.character_id for c in unlocked],
        "unlocked_characters": unlocked
    }


# 요청
class UserCharacterRequest(BaseModel):
    character_id: List[int]

# 해파리 등록
@router.post("/user-characters")
def post_user_characters(
    pose_req: UserCharacterRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_id = current_user.user_id
    created = []

    for character_id in pose_req.character_id: 
        exists = db.query(UserCharacter).filter_by(
            user_id=user_id, character_id=character_id
        ).first()

        if not exists:
            entry = UserCharacter(user_id=user_id, character_id=character_id)
            db.add(entry)
            created.append(character_id)

    db.commit()
    return {"registered": created}
