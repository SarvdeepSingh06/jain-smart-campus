@echo off
title JAIN Smart Campus Web Server
echo ========================================================
echo           JAIN Smart Campus Web Server Launcher
echo ========================================================
echo.
echo [Info] Starting local web server...
echo [Info] Opening browser at http://localhost:3000/
start http://localhost:3000/
node server.js
pause
