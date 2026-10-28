@echo off
setlocal
cd /d "%~dp0"

echo Stopping E-Commerce services and UI...

echo Closing service windows...
taskkill /FI "WINDOWTITLE eq E-Commerce User Service*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq E-Commerce API Gateway*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq E-Commerce UI*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq E-Commerce*" /T /F >nul 2>&1

echo Checking and stopping processes on service ports (8081, 8080, 5173)...
for %%P in (8081 8080 5173) do (
    for /f "tokens=5" %%A in ('netstat -aon 2^>nul ^| findstr LISTENING ^| findstr /c:":%%P "') do (
        taskkill /F /PID %%A >nul 2>&1
    )
)

echo.
echo E-Commerce services have been stopped.
endlocal
