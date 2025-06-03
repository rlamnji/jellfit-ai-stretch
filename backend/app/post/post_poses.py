from fastapi import APIRouter, UploadFile, File, Form, Depends
from stretch_model.src.calibrate import CalibrationProcessor
from dependencies import get_current_user
from db.models import User
import numpy as np

router = APIRouter()
processor = CalibrationProcessor()

@router.post("/analyze")
async def analyze_image(
    file: UploadFile = File(...), 
    pose_type: str = Form(...),
    current_user: User = Depends(get_current_user)
):
    content = await file.read()
    image_array = np.asarray(bytearray(content), dtype=np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

    # 프레임 처리
    result = processor.process_frame(current_user.user_id, image)
    print(f"Processed frame for {pose_type}: {result}")

    return result