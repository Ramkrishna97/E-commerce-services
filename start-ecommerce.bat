@echo off
setlocal
cd /d "%~dp0"

if not exist "logs" mkdir "logs"
where java >nul 2>nul || (echo Java 17+ is required.& pause & exit /b 1)
where node >nul 2>nul || (echo Node.js 20+ is required for the UI.& pause & exit /b 1)

echo Starting discovery, configuration, user, and gateway services...
start "E-Commerce Discovery Server" cmd /k "call gradlew.bat :discovery-server:bootRun"
start "E-Commerce Config Server" cmd /k "call gradlew.bat :config-server:bootRun"
timeout /t 4 /nobreak >nul
start "E-Commerce User Service" cmd /k "call gradlew.bat :user-service:bootRun"
start "E-Commerce API Gateway" cmd /k "call gradlew.bat :api-gateway:bootRun"

cd /d "%~dp0e-commerce-web"
if not exist "node_modules" (
  echo Installing UI dependencies...
  call npm install
  if errorlevel 1 (echo UI dependency installation failed.& pause & exit /b 1)
)
start "E-Commerce UI" cmd /k "call npm run dev"
timeout /t 5 /nobreak >nul
start "" "http://localhost:5173"
echo Services are starting in separate windows. Close those windows to stop them.
endlocal
