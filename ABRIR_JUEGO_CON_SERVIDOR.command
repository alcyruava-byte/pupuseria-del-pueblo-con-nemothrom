#!/bin/bash
# Doble clic: abre PUPUSERÍA DEL PUEBLO con ranking y duelos (misma WiFi)
cd "$(dirname "$0")"
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
echo "=== PUPUSERÍA DEL PUEBLO ==="
if ! command -v node >/dev/null 2>&1; then
  echo "Falta Node.js. Se abrirá la página de descarga (versión LTS). Después vuelve a dar doble clic."
  open "https://nodejs.org/es/download"; read -p "Enter para cerrar..."; exit 1
fi
pkill -f "node server.js" 2>/dev/null
echo "Preparando el juego (la primera vez tarda un poco)..."
npm install || { echo "Error al instalar. Copia este mensaje y mándaselo a Claude."; read -p "Enter para cerrar..."; exit 1; }
(sleep 2; open "http://localhost:3000") &
echo ""
echo "Abriendo el juego... NO cierres esta ventana mientras juegas. Para apagarlo: Control + C"
npm start
read -p "El juego se cerró. Si salió un error, cópialo. Enter para cerrar..."
