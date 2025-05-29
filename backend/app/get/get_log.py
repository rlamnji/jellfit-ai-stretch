from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Literal
from db.database import get_db
from models import DailyUsageLog, User
from dependencies import get_current_user

router = APIRouter(prefix="/usage/time", tags=["Usage_Time"])

@router.get("")
def get_usage_time(
    current_user: User = Depends(get_current_user),
    target_date: str = Query(..., description="YYYY-MM-DD"),
    type: Literal["일", "월"] = Query(...),
    db: Session = Depends(get_db)
):
    try:
        target = datetime.strptime(target_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="날짜 형식은 YYYY-MM-DD 이어야 합니다.")

    if type == "일":
        log = db.query(DailyUsageLog).filter(
            DailyUsageLog.user_id == current_user,
            DailyUsageLog.date == target
        ).first()
        usage_time = log.usage_time if log else 0

        return {
            "usage_time_seconds": usage_time
        }

    elif type == "월":
        first_day = target.replace(day=1)
        if target.month == 12:
            next_month = first_day.replace(year=first_day.year + 1, month=1)
        else:
            next_month = first_day.replace(month=first_day.month + 1)

        logs = db.query(DailyUsageLog).filter(
            DailyUsageLog.user_id == current_user,
            DailyUsageLog.date >= first_day,
            DailyUsageLog.date < next_month
        ).all()

        usage_times = {log.date.isoformat(): log.usage_time for log in logs}

        return {
            "usage_times": usage_times # dictionary 형태로 날짜별 사용 시간 반환
        }

    else:
        raise HTTPException(status_code=400, detail="type은 '일' 또는 '월'이어야 합니다.")