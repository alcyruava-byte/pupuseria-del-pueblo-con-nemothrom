@echo off
cd /d "%~dp0"
where node >nul 2>nul || (echo Falta Node.js. Instalalo desde nodejs.org y vuelve a abrir este archivo. & start https://nodejs.org/es/download & pause & exit /b 1)
call npm install
start "" http://localhost:3000
echo NO cierres esta ventana mientras juegas. Ctrl+C para apagar.
node server.js
pause
