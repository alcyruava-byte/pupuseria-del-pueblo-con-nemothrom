@echo off
cd /d "%~dp0"
where node >nul 2>nul || (echo Falta Node.js. Instalalo desde nodejs.org & start https://nodejs.org/es/download & pause & exit /b 1)
call npm install
start "" /b node server.js
timeout /t 2 >nul
echo Creando link publico. Busca abajo la direccion https://....trycloudflare.com y compartela.
echo NO cierres esta ventana mientras juegan.
npx --yes cloudflared tunnel --url http://localhost:3000
pause
