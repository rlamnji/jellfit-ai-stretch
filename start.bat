REM 윈도우 통합실행

@echo off
echo ================================
echo Jellfit server start
echo ================================

REM 백엔드 실행
echo start backend server...
start /min cmd /k "cd backend && uvicorn app.main:app --reload"

REM 프론트엔드 실행
echo start frontend server...
start /min cmd /k "cd frontend && yarn start"

echo ================================
echo All servers are running (in separate windows)
echo ================================
