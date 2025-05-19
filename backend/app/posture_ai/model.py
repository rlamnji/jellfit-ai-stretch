from joblib import load

# 모델을 한 번만 로드
model = load("../../model/posture_rf_model.joblib")

def predict_posture(features: list) -> int:
    # features는 예: [0.65, 0.33, 0.12, ...]
    prediction = model.predict([features])
    return int(prediction[0])  # 0 (unknown)  1 (좋은 자세) 2 (나쁜 자세)
