from fastapi import APIRouter
from pydantic import BaseModel
from model import predict_posture  # 한 프레임 예측 함수

router = APIRouter()

class PoseInput(BaseModel):
    features: list[float]  # 프레임 하나의 좌표

@router.post("/ai/posture/predict")
def predict_pose(data: PoseInput):
    result = predict_posture(data.features) # 0 (unknown) 1 (good) 2 (bad) 로 예측 결과 반환.
    return {"result": result}
