# 스트레칭 결과를 사용자 스트레칭 db에 저장
from fastapi import Header, APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import UsageRecord, User
from pydantic import BaseModel
from typing import Optional
from passlib.context import CryptContext
from dependencies import get_current_user

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 요청
class StretchRequest(BaseModel):
    pose_id: int
    repeat_cnt: int

# 응답
class StretchRecord(BaseModel):
    pose_id: int
    repeat_cnt: int

class StretchResponse(BaseModel):
    msg: str
    records: list[StretchRecord]

# 횟수 누적
@router.post("/record/accumulate", response_model=StretchResponse)
def save_stretching_record(
    request: StretchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(UsageRecord).filter_by(
        user_id=current_user.user_id,
        pose_id=request.pose_id
    ).first()

    # 누적
    if record:
        record.repeat_cnt += request.repeat_cnt
    else:
        record = UsageRecord(
            user_id=current_user.user_id,
            pose_id=request.pose_id,
            repeat_cnt=request.repeat_cnt
        )
        db.add(record)

    db.commit()

    result = db.query(UsageRecord).filter_by(user_id=current_user.user_id).all()
    result_table = [
        StretchRecord(pose_id=r.pose_id, repeat_cnt=r.repeat_cnt)
        for r in result
    ]

    return StretchResponse(
        msg="스트레칭 기록이 성공적으로 저장되었습니다.",
        records=result_table
    )