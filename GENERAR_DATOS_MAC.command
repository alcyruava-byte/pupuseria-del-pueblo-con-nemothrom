#!/bin/bash
cd "$(dirname "$0")"
pip3 install datasets pandas pyarrow
python3 scripts/01_generar_clientes.py
echo "Listo. Ahora abre index.html con doble clic."
read -p "Presiona Enter para cerrar"
