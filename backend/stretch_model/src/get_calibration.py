from app.services.calibration_service import get_user_calibration_features
from db.database import get_db
import numpy as np

# 추후 반환 형태가 바뀔 수 있음
def load_user_calibration_vector(user_id: int) -> np.ndarray:
    """
    사용자의 캘리브레이션 데이터를 불러와 모델 입력 형태로 변환
    """
    db = next(get_db())
    calib_dict = get_user_calibration_features(user_id=user_id, db=db) # {name: value} 형태

    if not calib_dict:
        raise ValueError(f"❌ user_id={user_id}에 대한 캘리브레이션 데이터가 없습니다.")

    # 가공 형태 여기서 수정? 
    sorted_keys = sorted(calib_dict.keys())
    feature_vector = np.array([calib_dict[key] for key in sorted_keys], dtype=np.float32)

    return feature_vector