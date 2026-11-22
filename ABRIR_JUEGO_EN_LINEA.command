#!/bin/bash
# Doble clic: abre PUPUSERÍA DEL PUEBLO con un link público (sirve en cualquier celular, aunque sea con datos)
cd "$(dirname "$0")"
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
echo "=== PUPUSERÍA DEL PUEBLO · EN LÍNEA ==="
if ! command -v node >/dev/null 2>&1; then echo "Falta Node.js. Instálalo desde nodejs.org y vuelve a abrir este archivo."; open "https://nodejs.org/es/download"; read -p "Enter para cerrar..."; exit 1; fi
pkill -f "node server.js" 2>/dev/null; pkill -f "cloudflared" 2>/dev/null
npm install || { echo "Error al instalar. Copia este mensaje."; read -p "Enter para cerrar..."; exit 1; }
node server.js > /tmp/pupuseria-servidor.log 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null; pkill -f cloudflared 2>/dev/null' EXIT
sleep 2
if ! kill -0 $SERVER 2>/dev/null; then echo "El servidor no arrancó:"; cat /tmp/pupuseria-servidor.log; read -p "Enter para cerrar..."; exit 1; fi
echo "Creando el link en línea (10-20 segundos la primera vez)..."
OPENED=0
npx --yes cloudflared tunnel --url http://localhost:3000 2>&1 | while IFS= read -r line; do
  URL=$(echo "$line" | grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' | head -1)
  if [ -n "$URL" ] && [ "$OPENED" = "0" ]; then
    OPENED=1
    echo ""; echo "======================================================"
    echo "  LISTO. Link del juego:  $URL"
    echo "  Entra a ⚔️ Duelo en línea, crea una sala y que tus amigos escaneen el QR."
    echo "  NO cierres esta ventana mientras juegan."
    echo "======================================================"
    sleep 3; open "$URL"
  fi
done
read -p "El link se cerró. Enter para cerrar..."
