@echo off
title SmartHisab POS & ERP -- Offline Desktop App
color 0A
echo ==============================================================
echo          SmartHisab POS -- Native Windows Desktop App        
echo ==============================================================
echo.
echo Launching SmartHisab POS Desktop Application...

set EDGE="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not exist %EDGE% set EDGE="C:\Program Files\Microsoft\Edge\Application\msedge.exe"

set APP_PATH=%~dp0dist\index.html

start "" %EDGE% --app="file:///%APP_PATH%" --window-size=1280,800 --start-maximized --disable-features=Translate
