# 사용자 스트레칭 누적(횟수) 조회
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from db.models import UsageRecord
from db.database import get_db

router = APIRouter(prefix="/users", tags=["Users"])

# 응답 스키마
class usageDetail(BaseModel):
    repeat_cnt: int

@router.get("/repeat-count/{pose_id}", response_model=usageDetail)
def get_usage_record(pose_id: int, db: Session = Depends(get_db)):
    usage = db.query(UsageRecord).filter(UsageRecord.pose_id == pose_id).first()
    if not usage:
        return usageDetail(repeat_cnt=0)

    return usageDetail(
        repeat_cnt=usage.repeat_cnt
    )