# Pupusería del Pueblo: guía para Claude Code

Juego de cocina contrarreloj estilo Hot Dog Bush. El jugador es dueño de una pupusería y alcalde: sirve pedidos a clientes generados con personas del dataset NVIDIA Nemotron-Personas-El-Salvador y usa las ganancias para arreglar los problemas del municipio. Idea de fondo (aún no construida): al resolver un municipio pasa al siguiente y, tras varios, llega a presidente.

Entrega del hackatón: 22 de noviembre de 2026. Idioma de todo el texto del juego: español salvadoreño con voseo ("tocá", "agregá").

## Restricciones (no negociables)
- Sin APIs, sin llamadas a modelos, sin backend: HTML + JavaScript + JSON estáticos.
- Visual: ilustración vectorial caricaturesca en canvas 2D. NO pixel art. Contornos gruesos (`OUT="#3a1f10"`), colores cálidos, fuente Baloo 2.
- Debe funcionar en celular y computadora. Lienzo lógico 960×760, respaldo 1920×1520 (`ctx.scale(2,2)`).
- Dataset: CC-BY-4.0, mantener el crédito en el menú.

## Cómo correrlo y probarlo
```
python3 -m http.server 8000     # abrir http://localhost:8000
```
Con doble clic (file://) el `fetch` de `data/clientes.json` falla y el juego usa 12 clientes de respaldo de `js/clientes.js`.
Pruebas: no hay archivo de pruebas todavía (pendiente: guardar como `tests/`). Las pruebas se hicieron con Chrome sin ventana: `google-chrome --headless=new --no-sandbox --virtual-time-budget=3000 --dump-dom <url>` con un script inyectado que simula clics sobre el canvas y escribe el resultado en `document.title`.

## Archivos
- `index.html`: HUD, menú principal, pantallas de alcaldía e informe, estilos.
- `js/clientes.js`: carga `data/clientes.json` (arreglo o `{clientes:[…]}`), valida `pedido`, `occupation`, `age`; si falla usa 12 de respaldo.
- `js/game.js`: todo el juego (~580 líneas). Mezcla datos, dibujo vectorial, diorama 3D isométrico, lógica del día, campaña/alcaldía, menú y clics. Dividirlo es la primera mejora estructural (propuesta: `config.js`, `draw/`, `day.js`, `alcaldia.js`, `menu.js`, `input.js`).
- `data/clientes.json`: 12 clientes de ejemplo. Debe reemplazarse con datos reales (ver abajo).
- `scripts/01_generar_clientes.py`: genera el `clientes.json` real desde el dataset. Escrito y probado con datos sintéticos; NO probado contra el dataset real (no hubo acceso de red). Probarlo primero.
- `assets/`: vacío (escenas, avatares por cliente, audio).

## Reglas del juego (valores actuales en `game.js`)
- Rellenos (exactamente 5): frijol con queso, queso, ayote, chicharrón, queso con loroco.
- Bebidas: horchata y cebada (vaso), chocolate (taza). Por edad: 55+ chocolate, menos de 25 cebada, resto horchata.
- Pedido: relleno de `pedido`; curtido en 2 de 3 clientes; bebida en 3 de 5 (determinístico con `hh(edad, largo de ocupación)`).
- Día de trabajo: 120 s (+8 con agua). 3 mostradores, 3 espacios en el comal, un plato.
- Pupusa: cruda hasta 6 s (5 con escuela), lista hasta +9 s, luego quemada (−$1 al tirarla).
- Pago: $5 + $2 curtido + $3 bebida + hasta $3 de propina (+$1 con mercado). Cliente que se va: −$2. Error al servir: mensaje específico y +4 s de espera.
- Paciencia: 26 s base, +4 curtido, +4 bebida, +8 si 55+, −3 si menos de 25, ×1,7; salud +15 %, calles +10 %.
- Llegada de clientes: 3,5 % por tick de 200 ms por mostrador libre; 5 % con puente.

## Campaña y alcaldía
Las ganancias de cada día van a la caja municipal. En la alcaldía (mapa isométrico 3D con problemas dibujados) se construyen 6 obras; cada una cambia el dibujo de arruinado a arreglado y da una mejora:

| Obra | Costo | Efecto | Necesidad (según clientes atendidos) |
|---|---|---|---|
| Unidad de salud | $15 | paciencia +15 % | % de 55+ |
| Escuela | $12 | pupusa lista en 5 s | % de menores de 25 |
| Mercado municipal | $18 | +$1 por venta | % de oficios de comercio/independientes |
| Calles y alumbrado | $10 | paciencia +10 % | % de trabajadores del campo |
| Puente | $20 | más clientes | estimada con el nombre del municipio |
| Tuberías de agua | $12 | +8 s de jornada | estimada con el nombre del municipio |

Necesidad = 20 + 160 × proporción (limitada a 10–100). Días estimados para resolver todo = (costo restante − caja) ÷ ganancia promedio por día ($35 mientras no haya datos). Termina al resolver las 6 obras; título por días: hasta 4 ejemplar, hasta 6 del pueblo, más novato.
IMPORTANTE: las reglas de bebida por edad, paciencia, necesidades y efectos son supuestos de diseño, no vienen de los datos. Decirlo así en el pitch.

## Dataset (verificado en la tarjeta de Hugging Face)
`nvidia/Nemotron-Personas-El-Salvador`: 148 mil filas, un solo split `train`, formato parquet, 25 columnas.
Columnas útiles: `uuid`, `age` (18–100), `sex` (Masculino/Femenino), `occupation` (119 valores), `municipality` (44), `department` (14), `area` (urbano/rural), `education_level` (7), `culinary_persona` (texto libre sobre comida; ejemplo: "...sus favoritas son las pupusas de queso con loroco").
Hoy el juego usa: edad, sexo, ocupación, municipio y `pedido` (derivado de `culinary_persona`).
Aún sin usar y con buen potencial para la campaña: `area` (rural/urbano → caminos y agua), `education_level` (→ escuela), `department`.

## Contrato de `data/clientes.json`
Arreglo de objetos: `uuid` (opc.), `age` (número), `sex`, `occupation`, `municipality` (necesario para la campaña), `pedido` (uno de los 5 rellenos), `avatar` (opc., ruta PNG; si existe se dibuja ese sprite en vez de la caricatura). El script también escribe `department` y `area` (hoy ignorados por el juego).

## Hoja de ruta (por prioridad)
1. Generar el `clientes.json` real (`scripts/01_generar_clientes.py`), validar que carga en el juego y que el nombre del municipio sale de los datos.
2. Repositorio de Git + GitHub Pages.
3. Guardar las pruebas de botones como archivo ejecutable en `tests/`.
4. Probar en celular real y balancear costos y ritmo con 5–10 partidas.
5. Dividir `game.js` en módulos.
6. Integrar escenas y avatares de la compañera (8–12 arquetipos, no uno por cliente).
7. Campaña de varios municipios: `municipios.json`, clientes filtrados por municipio, obras y costos distintos por nivel, usando `area`/`education_level`.
8. Nivel final de presidente con prioridades nacionales.
9. Sonidos y música.

## Decisiones abiertas
Cuántos municipios antes de la presidencia; si el dinero sobrante pasa al siguiente municipio; avatar por arquetipo (recomendado) o único; cómo mostrar al jurado que los problemas vienen de los datos.

## Novedades (3D, departamentos, periódico)
- `js/town3d.js`: municipio 3D (Three.js); cada cabecera departamental tiene un emblema 3D (`LMB`) elegido desde `DEPS` en game.js (`lm`).
- Selector de 14 alcaldías (`showDeps`), clientes filtrados por departamento (`pool()`); verificar con el dataset real qué municipio corresponde a cada cabecera.
- Periódico "El Diario del Pueblo": cada 3 días de trabajo avances, cada 5 días encuesta presidencial (`queueNews`, `ranking`); rivales ficticios.
- Cebada en rosado (`DR.cebada`).
- Mapas por departamento: en `town3d.js`, `MAPS[id]` define giro de la isla, cruce río-calle, cuadrante de cada problema, posición del emblema y paisaje propio (`s`: mar, volcanes, lagos, cafetales, milpa, caña, manglares, ciudad, ganado…). `construct(id)` reconstruye todo el mapa.
- Carrera política (game.js: `runElection`, `electionScreen`, `showGov`, `nationalPanel`): al resolver las 6 obras → elecciones internas del departamento → peticiones ciudadanas (personas del dataset) → líder departamental → primarias (`PRIM` deptos) → presidenciales (`PRES` deptos) → Presidente Pupusa. Votantes = personas Nemotron (edad, sexo, ocupación, zona); sin API. El script de datos ahora exporta también `persona` y `education_level`. Balance (rival, pesos) en `voteScore`/`ctxFor`: ajustar tras probar con el dataset real.
- Titular de "ÚLTIMA HORA" tras cada jornada (`dayHeadline`, `hlHTML`): según clientes servidos/perdidos, racha, fondos y un cliente del día del dataset.

## Extras (js/extras.js)
Cargado después de game.js, comparte ámbito global. Contiene: Snd (WebAudio sintetizado, sin archivos; botón 🔊 #snd), eventos del día (EVS) y mecánica por departamento (DM) combinados en MODS() (spawn/pat/cook/tip), clientes frecuentes (CAMP.aff por uuid; ♥ ≥3 propina+1, ≥5 propina+2 y bono de voto), mejoras UPS (CAMP.up), dilemas (cada 4 días; CAMP.pop afecta voteScore), historia Story (#story), panel showElectorate, guardado localStorage "pupSaveV1" (saveGame/loadGame/newCampaign), modo demo (startDemo o `?demo`), tarjeta compartible (showCard, canvas 1080×1350).
game.js tiene ganchos protegidos con `typeof X!=="undefined"`: startDay→dayIntro, endDay→afterDay, build→onBuild, tick→MODS/pickClient/onLost, tapClient→onServed/onWrong, voteScore→popBonus, showNext→nextOverlay.
Balance a ajustar con el dataset real: probabilidades de eventos (60 %), costos de mejoras, efectos de dilemas.
Periódico flotante: flash({tag,e,h,p,sub,big,now,onClose}) en extras.js (cola FQ, espera si hay overlays). Se usa en titular diario, crónica de evento, obras, mejoras, clientes fieles/promotores y resultado de dilemas.
Ritmo (v24): FIN_N=4 obras bastan para cerrar el municipio (G.fin); obras baratas (116 total); 2 peticiones por depto; PRES=3 deptos; rivales dep .46+.02*led, prim .55, pres .57; botón buildAll "Resolver todo lo que alcance".
En línea (v25): server.js (http+ws, sirve el juego, /ranking, /qr.svg, salas de duelo) y js/online.js (se activa si /health responde). Duelo: DUELX en game.js (cola de clientes con semilla, endDay→duelEnd, MODS neutro). Probado con 2 jugadores en Playwright (DUR=20 para pruebas cortas).
Visual (v26): pueblo 3D con volcán, casas de colores, vallas con leyendas, tráfico (buses/carros) y gente que aumentan con las obras; la pupusería 3D muestra mejoras (cartel luminoso, ventilador, ayudante, radio con notas, mesas, flores); pin "Tu pupusería" abre la tienda. La cocina 2D dibuja obras y mejoras en drawLife() (extras.js).

## v27 Cabildo abierto
js/cabildo.js reemplaza showHub (mapa de obras) por casos diarios de personas Nemotron: 6 índices (salud, edu, agua, mov, eco, seg), decaen -3/día, umbrales 60/55 hacen que G.built (visible en 3D) se arregle o se arruine. Seguimientos de casos anteriores, popularidad, afinidad por persona. showHubOld conservado.
v28: casos del cabildo siempre del tipo más débil (antes caía a otros tipos con pocas personas); costos subidos (obra completa ~27-38, parcial ~10-12), decay -4/día. Bot greedy a $45/día llega a elecciones ~día 9.

## v29-v31 (Minecraft/voxel + escenas + juice)
- js/voxel3d.js: pueblo de bloques (Vox) reemplaza Town3D (let Town3D=Vox al final). Mismo API + setCases/markDone/focusNpc/onNpc. 14 mapas distintos por semilla (RX río, FLIP, ROTK, bioma volcán/costa/colinas/café/lago, landmark, paleta).
- js/scenes.js: drawBG por departamento (DSC) en la cocina 2D. startDay llama drawBG().
- js/juice.js: metas de estrellas (goals()), hora pico (S.rush), VIPs (maybeVip), reacciones REACT por depto, confeti, shake.
- game.js: pupusa() rediseñada (3/4, canto, tostado, relleno), salsa obligatoria (o.sal, addSal, SAL), salsaBottle/salsaDrizzle.
- BUG corregido: cabildo.js definía avatar() y pisaba el avatar() del juego → ahora cabAvatar().
