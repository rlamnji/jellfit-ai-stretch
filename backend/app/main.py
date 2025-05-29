from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.get import get_poses, get_characters, get_user, get_usage, get_log
from app.post import post_poses, post_user_character, post_modal
from app.auth import login, signup, logout
from app.get_image import get_stretching_image
from app.friends import add_friend, delete_friend, search_friends, accept, reject, confirm_requests
from app.guide import select_poses, get_stretching
from app.posture_ai import predict
from app.update import update_user, update_user_stretch

#디버깅
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import User, DailyUsageLog


app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 개발 환경에서만 사용, 프로덕션에서는 특정 도메인으로 변경
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(get_poses.router, tags=["Pose"])
app.include_router(get_characters.router, tags=["Character"]) 
app.include_router(get_user.router)
app.include_router(get_usage.router)
app.include_router(get_log.router)
app.include_router(update_user.router)
app.include_router(update_user.router)
app.include_router(update_user_stretch.router, prefix="/guide", tags=["Guide"])
app.include_router(login.router)
app.include_router(signup.router)
app.include_router(logout.router)

app.include_router(get_stretching_image.router)
app.include_router(post_poses.router) # 캘리브레이션
app.include_router(post_user_character.router)
app.include_router(post_modal.router) # 캐릭터(정보) 모달창
app.include_router(add_friend.router)
app.include_router(delete_friend.router)
app.include_router(search_friends.router)
app.include_router(accept.router)
app.include_router(reject.router)
app.include_router(confirm_requests.router)
app.include_router(select_poses.router)
app.include_router(get_stretching.router)
app.include_router(predict.router, tags=["predict-posture"])

# 디버깅
@app.get("/test/users")
def test_get_users(db: Session = Depends(get_db)):
    return db.query(DailyUsageLog).all()