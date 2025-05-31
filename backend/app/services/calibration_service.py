from db.models import UserCalibration, Calibration, UserCalibrationLandmark
from sqlalchemy.orm import Session
from db.database import get_db
from typing import List

def save_user_calibration_landmark(
    user_id: int, 
    pose_name: str, 
    landmarks: dict,
    db: Session = None
):
    """
    사용자 랜드마크 저장
    - (user_id, pose_name) 조합이 있으면 update, 없으면 insert
    """
    if db is None:
        db = next(get_db())

    existing = db.query(UserCalibrationLandmark).filter_by(
        user_id=user_id,
        pose_name=pose_name
    ).first()

    if existing:
        existing.landmarks = landmarks
        print(f"🔄 Updated existing calibration landmark for user {user_id}, pose {pose_name}")
    else:
        existing = UserCalibrationLandmark(
            user_id=user_id,
            pose_name=pose_name,
            landmarks=landmarks
        )
        db.add(existing)
        print(f"✅ Inserted new calibration landmark for user {user_id}, pose {pose_name}")
    
    db.commit()
    db.refresh(existing)

def save_user_calibration(db: Session, user_id: int, calibration_features: dict):
    """
    사용자의 캘리브레이션 값을 저장
    - 이미 user_id + calibration_id 조합이 있으면 value만 업데이트
    - 없으면 새로 추가
    """
    for name, value in calibration_features.items():
        # Calibration 테이블에서 해당 이름 찾기 (없으면 새로 생성)
        calibration = db.query(Calibration).filter_by(name=name).first()
        if not calibration:
            calibration = Calibration(name=name)
            db.add(calibration)
            db.commit()
            db.refresh(calibration)

        # 해당 사용자와 캘리브레이션 조합의 기존 데이터 조회
        user_calib = db.query(UserCalibration).filter_by(
            user_id=user_id,
            calibration_id=calibration.calibration_id
        ).first()

        if user_calib:
            # 이미 있으면 업데이트
            user_calib.value = value
            print(f"🔄 Updated value for user_id={user_id}, calibration={name}, value={value}")
        else:
            # 없으면 새로 추가
            user_calib = UserCalibration(
                user_id=user_id,
                calibration_id=calibration.calibration_id,
                value=value
            )
            db.add(user_calib)
            print(f"✅ Inserted value for user_id={user_id}, calibration={name}, value={value}")

    db.commit()


def get_user_calibration_features(user_id: int, db: Session = None) -> dict:
    """
    사용자의 캘리브레이션 값을 {name: value} 형태로 반환
    """
    if db is None:
        db = get_db()

    results = (
        db.query(Calibration.name, UserCalibration.value)
        .join(UserCalibration, Calibration.calibration_id == UserCalibration.calibration_id)
        .filter(UserCalibration.user_id == user_id)
        .all()
    )

    return {name: value for name, value in results}


# 아래 두 함수는 테스트용 (나중에 삭제할 예정)
def get_all_calibrations(db: Session) -> List[Calibration]:
    """
    DB에 저장된 모든 Calibration 항목을 반환
    """
    return db.query(Calibration).all()

def get_calibration_by_name(name: str, db: Session) -> Calibration:
    """
    Calibration 이름으로 calibration_id와 name을 반환
    """
    return db.query(Calibration).filter(Calibration.name == name).first()
