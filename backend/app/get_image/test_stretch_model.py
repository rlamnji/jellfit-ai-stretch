import os
import sys
import cv2
import time

# BACKEND 경로 등록
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from stretch_model.src.infer_anomaly import StretchTracker

# guide_images 폴더 내 이미지 경로들 불러오기
image_dir = os.path.join(os.path.dirname(__file__), "guide_images")
image_files = sorted(
    [os.path.join(image_dir, fname) for fname in os.listdir(image_dir)
    if fname.lower().endswith(('.jpg', '.jpeg', '.png'))]
)

if not image_files:
    raise FileNotFoundError("guide_images 폴더에 이미지가 없습니다.")

# StretchTracker 초기화
tracker = StretchTracker(exercise="등_위")

# 이미지 순회하며 스트레칭 추적
for idx, image_path in enumerate(image_files):
    image = cv2.imread(image_path)
    if image is None:
        print(f"[경고] 이미지를 불러올 수 없습니다: {image_path}")
        continue

    result = tracker.is_performing(image)
    print(f"[{idx+1}/{len(image_files)}] 프레임 결과: {result}")
