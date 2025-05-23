# 스트레칭 결과를 사용자 스트레칭 db에 저장
from fastapi import Header, APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import UsageRecord, DailyUsageLog, User
from pydantic import BaseModel
from datetime import datetime, timezone
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

# 요청
class TimeRequest(BaseModel):
    usage_time: int

# 응답
class TimeRecord(BaseModel):
    date: str
    usage_time: int


class TimeResponse(BaseModel):
    msg: str
    records: list[TimeRecord]


# 시간 누적(같은 날짜에 시간 계속 누적)
@router.post("/time/accumulate", response_model=TimeResponse)
def save_stretching_time(
    request: TimeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = datetime.now(timezone.utc).date()

    record = db.query(DailyUsageLog).filter_by(
        user_id=current_user.user_id,
        date=today
    ).first()

    # 시간 누적
    if record:
        record.usage_time += request.usage_time
    else:
        record = DailyUsageLog(
            user_id=current_user.user_id,
            date=today,
            usage_time=request.usage_time
        )
        db.add(record)

    db.commit()

    # 모든 날짜 기록 반환
    result = db.query(DailyUsageLog).filter_by(user_id=current_user.user_id).all()
    result_table = [
        TimeRecord(
            date=r.date.strftime("%Y년 %m월 %d일"),
            usage_time=r.usage_time
        )
        for r in result
    ]

    return TimeResponse(
        msg="스트레칭 시간이 성공적으로 저장되었습니다.",
        records=result_table
    )
