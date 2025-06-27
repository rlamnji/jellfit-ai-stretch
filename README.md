# JellFit

JellFit는 피트니스 트래킹 애플리케이션입니다.

## 프로젝트 구조

```
jellfit/
├── frontend/          # 프론트엔드 코드
└── backend/           # 백엔드 코드
    ├── main.py        # FastAPI 애플리케이션 진입점
    ├── database.py    # 데이터베이스 설정
    ├── .env          # 환경 변수
    └── requirements.txt # Python 의존성
```

## 실행 방법
1. 개발환경 준비
🐍 Python 백엔드용

```bash
cd backend
python -m venv venv
venv\Scripts\activate         # Windows
# source venv/bin/activate    # Mac/Linux
```

```bash
pip install -r requirements.txt # 필수 패키지 설치치
```
```bash
python -m db.init_db          # DB 파일 생성
```

🌐 Node 프론트엔드용
```bash
cd frontend
yarn install
```

2. 통합 실행 (매번 실행 시)
```bash
start.bat
```
→ 백엔드(uvicorn main:app --reload)와
→ 프론트엔드(yarn start)가 각각 최소화된 창에서 실행

API 문서는 http://localhost:8000/docs 에서 확인할 수 있습니다.
자세한 설정 및 사용법은 backend/README.md와 frontend/README.md에서 확인하실 수 있습니다.
