@echo off
title JAIN Smart Campus App Launcher
echo ========================================================
echo           JAIN Smart Campus Desktop App Launcher
echo ========================================================
echo.

IF NOT EXIST "node_modules\electron" (
  echo [Info] Installing Electron runtime for Desktop execution...
  call npm install
)

echo [Info] Launching JAIN Smart Campus Desktop App...
call npm start

pause
