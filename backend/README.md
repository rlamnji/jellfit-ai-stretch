## 가상환경 설정(Windows 기준, vscode에서 실행)
python -m venv venv 
venv\Scripts\activate.bat  
pip install -r requirements.txt  

## FastAPI 서버 실행
uvicorn app.main:app --reload

## 데이터베이스 생성(/backend 폴더에서 실행)
python -m db.init_db  
-> db.sqlite3 파일 생성됨

## 데이터베이스 더미 데이터 넣기
init_db.py 파일을 수정해서 원하는 더미 데이터를 넣울 수 있음  
<b> ! 더미 데이터 수정할 때는 db 간의 관계와 데이터 생성 순서를 고려해야 함 ! </b> 
데이터 넣고서는 생성된 db.sqlite3 파일을 삭제하고 다시 데이터베이스 생성해야 함

## 데이터베이스 사용
example.py 의 내용을 참고하여 db.sqlite3 파일 사용법을 확인할 수 있음



## 추가(05.10) 자세 캘리브레이션 테스트 중
pip install python-multipart

FastAPI는 UploadFile, File(...)을 통해 폼데이터를 받을 때
python-multipart라는 외부 라이브러리에 의존해서 필수 패키지를 설치해야한다고 함 나중에 requirements.txt에 추가합쉬당

## 5.14 오류
pip install pillow 설치해야하는듯? 나중에 requirements.txt에 추가합쉬당