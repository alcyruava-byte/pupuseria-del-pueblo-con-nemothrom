@echo off
cd /d "%~dp0"
echo Instalando librerias (solo la primera vez)...
pip install datasets pandas pyarrow
echo Descargando personas de Nemotron y generando clientes...
python scripts\01_generar_clientes.py
echo.
echo Listo. Ahora abre index.html con doble clic.
pause
