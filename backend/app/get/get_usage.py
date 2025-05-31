# 사용자 스트레칭 사용 기록 조회 API(횟수, 시간)
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from db.models import UsageRecord, DailyUsageLog, User
from dependencies import get_current_user
from db.database import get_db
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/users", tags=["Users"])


# 응답 스키마
class usageDetail(BaseModel):
    repeat_cnt: int

# 사용자 스트레칭 누적(횟수) 조회
@router.get("/repeat-count/{pose_id}", response_model=usageDetail)
def get_usage_record(pose_id: int, db: Session = Depends(get_db)):
    usage = db.query(UsageRecord).filter(UsageRecord.pose_id == pose_id).first()
    if not usage:
        return usageDetail(repeat_cnt=0)

    return usageDetail(
        repeat_cnt=usage.repeat_cnt
    )



# 응답 스키마
class TimeRecord(BaseModel):
    date: str           
    usage_time: int
         
    class Config:
        orm_mode = True

# 사용자 스트레칭 누적(시간) 조회 : 특정 날짜 조회
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



class DailyTimeRecord(BaseModel):
    date: str  # "6/1"
    usage_time: int

# 응답 스키마
class MonthTimeResponse(BaseModel):
    month: str               # "2025-06"
    total_usage_time: int   
    daily_records: List[DailyTimeRecord] # 상세 기록

    class Config:
        orm_mode = True


# 사용자 스트레칭 누적(시간) 조회 : 월 누적 조회
@router.get("/stretch-time/month", response_model=MonthTimeResponse)
def get_time_by_month(
    month: str = Query(..., description="조회할 월 (yyyy-mm)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        query_month = datetime.strptime(month, "%Y-%m").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="날짜 형식이 잘못되었습니다. YYYY-MM")

    first_day = query_month.replace(day=1)
    next_month = (first_day.replace(day=28) + timedelta(days=4)).replace(day=1)

    # 이 유저의 해당 월 기록 전부 가져오기
    records = db.query(DailyUsageLog).filter(
        DailyUsageLog.user_id == current_user.user_id,
        DailyUsageLog.date >= first_day,
        DailyUsageLog.date < next_month
    ).all()

    # 누적 시간 계산
    total = sum([r.usage_time for r in records])

    # 각 일자별 기록 정리
    daily_records = [
        DailyTimeRecord(
            date = f"{r.date.month}/{r.date.day}",
            usage_time=r.usage_time
        ) for r in records
    ]

    return MonthTimeResponse(
        month=month,
        total_usage_time=total,
        daily_records=daily_records
    )
