@echo off
title SmartHisab POS & ERP — High-Speed Local Engine
color 0A
echo ==============================================================
echo          SmartHisab POS -- High-Speed Local Engine        
echo ==============================================================
echo.
cd /d "%~dp0"

if not exist "dist\index.html" (
    echo [Info] Compiling production build, please wait...
    call npm run build
)

echo [Info] Launching High-Speed Local Server at http://localhost:3000/ ...
start "" http://localhost:3000/
node server.cjs
pause
