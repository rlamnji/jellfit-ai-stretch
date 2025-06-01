from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import date
from typing import Optional
from sqlalchemy import func
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from db.models import UsageRecord, DailyUsageLog, User
from dependencies import get_current_user
from db.database import get_db
from datetime import datetime, time, timedelta, timezone

router = APIRouter(prefix="/users", tags=["Users"])
# 한국 시간대(KST)
KST = timezone(timedelta(hours=9))

# 반복 횟수 조회
class usageDetail(BaseModel):
    repeat_cnt: int

@router.get("/repeat-count/{pose_id}", response_model=usageDetail)
def get_usage_record(pose_id: int, db: Session = Depends(get_db)):
    usage = db.query(UsageRecord).filter(UsageRecord.pose_id == pose_id).first()
    if not usage:
        return usageDetail(repeat_cnt=0)

    return usageDetail(repeat_cnt=usage.repeat_cnt)



# 특정 날짜 조회 (KST 기준)
class TimeRecord(BaseModel):
    date: str
    usage_time: int

    class Config:
        orm_mode = True

@router.get("/stretch-time", response_model=TimeRecord)
def get_time_by_date(
    date: str = Query(..., description="조회할 날짜 (yyyy-mm-dd)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        query_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="날짜 형식이 잘못되었습니다. YYYY-MM-DD 형식으로 입력하세요.")

    record = db.query(DailyUsageLog).filter_by(
        user_id=current_user.user_id,
        date=query_date
    ).first()

    usage_time = record.usage_time if record else 0

    return TimeRecord(
        date=query_date.strftime("%Y년 %m월 %d일"),
        usage_time=usage_time
    )

# 월별 누적 시간 조회 (KST 기준)
class DailyTimeRecord(BaseModel):
    date: str  # "6/1"
    usage_time: int

class MonthTimeResponse(BaseModel):
    month: str
    total_usage_time: int
    daily_records: List[DailyTimeRecord]

    class Config:
        orm_mode = True

@router.get("/stretch-time/month", response_model=MonthTimeResponse)
def get_time_by_month(
    month: str = Query(..., description="조회할 월 (yyyy-mm)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        query_month = datetime.strptime(month, "%Y-%m")
    except ValueError:
        raise HTTPException(status_code=400, detail="날짜 형식이 잘못되었습니다. YYYY-MM")

    # 정확한 KST 기준 월 범위 계산
    first_day_kst = datetime(query_month.year, query_month.month, 1, tzinfo=KST).date()
    if query_month.month == 12:
        next_month_kst = datetime(query_month.year + 1, 1, 1, tzinfo=KST).date()
    else:
        next_month_kst = datetime(query_month.year, query_month.month + 1, 1, tzinfo=KST).date()

    # DB에 이미 date가 KST 기준으로 저장되어 있다고 가정
    records = db.query(DailyUsageLog).filter(
        DailyUsageLog.user_id == current_user.user_id,
        DailyUsageLog.date >= first_day_kst,
        DailyUsageLog.date < next_month_kst
    ).all()

    total = sum([r.usage_time for r in records])
    daily_records = [
        DailyTimeRecord(
            date=f"{r.date.month}/{r.date.day}",
            usage_time=r.usage_time
        ) for r in records
    ]

    return MonthTimeResponse(
        month=month,
        total_usage_time=total,
        daily_records=daily_records
    )

