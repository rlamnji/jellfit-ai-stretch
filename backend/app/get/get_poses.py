from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from db.database import SessionLocal
from db.models import Pose
from typing import List

from fastapi.responses import JSONResponse


router = APIRouter()

# DB 세션 의존성
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/poses", response_model=List[dict])
def get_all_poses(db: Session = Depends(get_db)):
    poses = db.query(Pose).all()
    return [
        {
            "pose_id": p.pose_id,
            "name": p.name,
            "duration": p.duration,
            "count": p.count,
            "video_url": p.video_url,
            "thumbnail_url": p.thumbnail_url,
            "category_id": p.category_id
        } for p in poses
    ]

#@router.post("/analyze")
#async def analyze_image(file: UploadFile = File(...)):
#    content = await file.read()
#    print(f"이미지 수신 완료: {len(content)} bytes, filename={file.filename}")

    # 여기에 추후 AI 분석 넣을 수 있음
    #return JSONResponse(content={"result": "received", "filename": file.filename})
