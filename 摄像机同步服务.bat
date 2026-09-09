@echo off
setlocal EnableExtensions
cd /d "%~dp0"

set "TASK_NAME=PsyTwin Reachy Video Relay"
set "PYTHON=%~dp0.venv-video-relay\Scripts\python.exe"

echo.
echo [PsyTwin] Starting camera relay...

call :check_health
if not errorlevel 1 (
    echo [PsyTwin] Camera relay is already running.
    goto :success
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "$task = Get-ScheduledTask -TaskName 'PsyTwin Reachy Video Relay' -ErrorAction SilentlyContinue; if ($null -eq $task) { exit 2 }; try { Start-ScheduledTask -TaskName 'PsyTwin Reachy Video Relay' } catch { exit 1 }"
if errorlevel 2 goto :direct_start
if errorlevel 1 goto :direct_start

call :wait_for_health
if not errorlevel 1 goto :success

:direct_start
if not exist "%PYTHON%" (
    echo [PsyTwin] Relay Python environment not found: %PYTHON%
    echo [PsyTwin] Run npm run relay:setup in this directory first.
    goto :failed
)

echo [PsyTwin] Scheduled task did not start; launching relay in the background...
start "" /min "%PYTHON%" -m uvicorn scripts.reachy_video_relay:app --host 0.0.0.0 --port 7862
call :wait_for_health
if errorlevel 1 goto :failed

:success
echo [PsyTwin] Camera relay is running on port 7862.
echo [PsyTwin] This window will close in 3 seconds.
powershell -NoProfile -Command "Start-Sleep -Seconds 3"
exit /b 0

:failed
echo [PsyTwin] Startup failed. Check the scheduled task or run npm run relay:setup manually.
pause
exit /b 1

:check_health
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { if ((Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:7862/health' -TimeoutSec 2).StatusCode -eq 200) { exit 0 } } catch {}; exit 1" >nul 2>&1
if errorlevel 1 exit /b 1
exit /b 0

:wait_for_health
for /l %%I in (1,1,10) do (
    call :check_health
    if not errorlevel 1 exit /b 0
    powershell -NoProfile -Command "Start-Sleep -Seconds 1"
)
exit /b 1
