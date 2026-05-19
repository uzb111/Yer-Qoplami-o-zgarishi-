@echo off
cd /d "%~dp0"
echo Yer qoplami web karta serveri ishga tushmoqda...
echo URL: http://localhost:8080/

if exist "D:\disertatsiya\.venv\Scripts\python.exe" (
  "D:\disertatsiya\.venv\Scripts\python.exe" -m http.server 8080
  goto :eof
)

python -m http.server 8080
if errorlevel 1 py -m http.server 8080
