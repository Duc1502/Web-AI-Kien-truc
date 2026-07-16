@echo off
setlocal

cd /d "%~dp0"

echo ============================================
echo   CaiTaoNha.AI - Khoi dong ung dung
echo ============================================
echo.

REM 1. Cai dat dependencies neu chua co
if not exist "node_modules" (
  echo [1/3] Chua co node_modules, dang cai dat dependencies...
  call npm install
  if errorlevel 1 (
    echo.
    echo LOI: npm install that bai. Vui long kiem tra ket noi mang / Node.js.
    pause
    exit /b 1
  )
) else (
  echo [1/3] Da co node_modules, bo qua buoc cai dat.
)
echo.

REM 2. Kiem tra file .env.local (chua GEMINI_API_KEY)
if not exist ".env.local" (
  echo [2/3] Chua co file .env.local, dang tao tu .env.example...
  copy /y ".env.example" ".env.local" >nul
  echo CANH BAO: Hay mo file .env.local va dien GEMINI_API_KEY that cua ban truoc khi tao anh.
) else (
  echo [2/3] Da co file .env.local.
)
echo.

REM 3. Giai phong cong 3000 neu co tien trinh cu con giu (tranh loi EADDRINUSE)
echo [3/3] Kiem tra cong 3000...
set FOUND=0
for /f "tokens=5" %%p in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
  set FOUND=1
  echo   Dang dong tien trinh cu PID %%p dang chiem cong 3000...
  taskkill /F /PID %%p >nul 2>&1
)
if "%FOUND%"=="0" (
  echo   Cong 3000 dang trong.
)
echo.

echo ============================================
echo   Dang khoi dong server tai http://localhost:3000
echo   (Giu cua so nay mo trong khi su dung web. Nhan Ctrl+C de dung.)
echo ============================================
echo.

call npm run dev

pause
