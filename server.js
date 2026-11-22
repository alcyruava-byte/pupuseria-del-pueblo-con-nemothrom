'use strict';
// PUPUSERÍA DEL PUEBLO — servidor opcional: sirve el juego, ranking compartido y duelos en línea (salas por código).
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os');
const QRCode = require('qrcode');
const { WebSocketServer } = require('ws');
const PORT = process.env.PORT || 3000, ROOT = __dirname;
const lanIPs = () => Object.values(os.networkInterfaces()).flat().filter((i) => i && i.family === 'IPv4' && !i.internal).map((i) => i.address);
// ---------- rankings ----------
const FILES = { dia: 'records_dia.json', campana: 'records_campana.json', duelo: 'records_duelo.json' };
const REC = {};
for (const k in FILES) { try { REC[k] = JSON.parse(fs.readFileSync(path.join(ROOT, FILES[k]), 'utf8')); if (!Array.isArray(REC[k])) REC[k] = []; } catch (e) { REC[k] = []; } }
const better = { dia: (a, b) => b.value - a.value, duelo: (a, b) => b.value - a.value, campana: (a, b) => a.value - b.value };
const cleanName = (s) => String(s || '').replace(/[<>&"'`]/g, '').trim().slice(0, 14) || 'ALCALDE';
function addRecord(kind, name, value, extra) {
  if (!REC[kind] || !Number.isFinite(value)) return 0;
  name = cleanName(name);
  const old = REC[kind].find((r) => r.name === name);
  const rec = { name, value, extra: extra || '', date: new Date().toISOString().slice(0, 10) };
  if (old) { if (better[kind](rec, old) >= 0) return REC[kind].indexOf(old) + 1; REC[kind] = REC[kind].filter((r) => r !== old); }
  REC[kind].push(rec); REC[kind].sort(better[kind]); REC[kind] = REC[kind].slice(0, 50);
  fs.writeFile(path.join(ROOT, FILES[kind]), JSON.stringify(REC[kind], null, 1), () => { });
  return REC[kind].indexOf(rec) + 1;
}
const LIMITS = { dia: (v) => v >= 0 && v <= 900, campana: (v) => v >= 3 && v <= 999 };
// ---------- http ----------
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.mp3': 'audio/mpeg' };
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  let u = decodeURIComponent(url.pathname);
  if (u === '/') u = '/index.html';
  if (u === '/health') { res.writeHead(200, { 'Cache-Control': 'no-store' }); return res.end('ok'); }
  if (u === '/qr.svg') {
    const text = url.searchParams.get('t') || '';
    if (!/^https?:\/\//.test(text) || text.length > 300) { res.writeHead(400); return res.end(); }
    return QRCode.toString(text, { type: 'svg', margin: 1 }, (e, svg) => { if (e) { res.writeHead(500); return res.end(); } res.writeHead(200, { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store' }); res.end(svg); });
  }
  if (u === '/ranking' && req.method === 'GET') { const k = REC[url.searchParams.get('mode')] ? url.searchParams.get('mode') : 'dia'; res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); return res.end(JSON.stringify(REC[k].slice(0, 10))); }
  if (u === '/ranking' && req.method === 'POST') {
    let body = ''; req.on('data', (c) => { body += c; if (body.length > 1000) req.destroy(); });
    return req.on('end', () => {
      try { const m = JSON.parse(body), v = +m.value; if (!LIMITS[m.mode] || !LIMITS[m.mode](v)) throw 0; const pos = addRecord(m.mode, m.name, Math.round(v), String(m.extra || '').slice(0, 40)); res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ pos })); }
      catch (e) { res.writeHead(400); res.end('{}'); }
    });
  }
  if (u === '/lan') { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ ips: lanIPs(), port: +PORT })); }
  if (!/^\/(index\.html|js\/|assets\/|data\/)/.test(u)) { res.writeHead(404); return res.end('404'); }
  const f = path.join(ROOT, path.normalize(u));
  if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.stat(f, (e, st) => {
    if (e || !st.isFile()) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Content-Length': st.size, 'Cache-Control': 'no-cache' });
    fs.createReadStream(f).pipe(res);
  });
});
// ---------- duelos en línea ----------
const DUR = +process.env.DUR || 120, wss = new WebSocketServer({ server, maxPayload: 2048 }), rooms = new Map();
let nextId = 1;
const send = (ws, o) => { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); };
function makeCode() { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; for (;;) { let c = ''; for (let i = 0; i < 4; i++) c += A[Math.floor(Math.random() * A.length)]; if (!rooms.has(c)) return c; } }
class Room {
  constructor(code) { this.code = code; this.players = []; this.phase = 'lobby'; this.t0 = 0; this.timer = null; }
  broadcast(o) { const s = JSON.stringify(o); for (const p of this.players) if (p.ws.readyState === 1) p.ws.send(s); }
  lobby() { this.broadcast({ t: 'lobby', code: this.code, phase: this.phase, players: this.players.map((p) => ({ id: p.id, name: p.name, host: p.host })) }); }
  board() { return this.players.map((p) => ({ id: p.id, name: p.name, m: p.m, s: p.s, done: p.done })).sort((a, b) => b.m - a.m); }
  start() {
    if (this.phase !== 'lobby' || !this.players.length) return;
    this.phase = 'play'; this.t0 = Date.now() + 4000;
    for (const p of this.players) { p.m = 0; p.s = 0; p.done = false; }
    this.broadcast({ t: 'start', seed: Math.floor(Math.random() * 2e9), dur: DUR, wait: 4000 });
    this.timer = setInterval(() => { this.broadcast({ t: 'board', b: this.board() }); if (Date.now() - this.t0 > (DUR + 12) * 1000) this.finish(); }, 1000);
  }
  finish() {
    if (this.phase !== 'play') return; clearInterval(this.timer); this.phase = 'lobby';
    const order = this.board();
    order.forEach((o) => { if (o.m > 0 && o.m <= 900) addRecord('duelo', o.name, o.m, o.s + ' servidos'); });
    this.broadcast({ t: 'results', order }); this.lobby();
  }
  remove(p) { this.players = this.players.filter((q) => q !== p); if (!this.players.length) { clearInterval(this.timer); return false; } if (!this.players.some((q) => q.host)) this.players[0].host = true; if (this.phase === 'play' && this.players.every((q) => q.done)) this.finish(); return true; }
}
wss.on('connection', (ws) => {
  let room = null, me = null; ws.isAlive = true; ws.on('pong', () => { ws.isAlive = true; });
  ws.on('message', (raw) => {
    let m; try { m = JSON.parse(raw); } catch { return; }
    switch (m.t) {
      case 'create': case 'join': {
        if (room) return; let r;
        if (m.t === 'create') { r = new Room(makeCode()); rooms.set(r.code, r); }
        else { r = rooms.get(String(m.code || '').toUpperCase().trim()); if (!r) return send(ws, { t: 'err', msg: 'Esa sala no existe' }); if (r.phase !== 'lobby') return send(ws, { t: 'err', msg: 'El duelo ya empezó' }); if (r.players.length >= 8) return send(ws, { t: 'err', msg: 'La sala está llena (máximo 8)' }); }
        me = { id: nextId++, name: cleanName(m.name), ws, host: !r.players.length, m: 0, s: 0, done: false }; r.players.push(me); room = r;
        send(ws, { t: 'joined', id: me.id, code: r.code }); r.lobby(); break;
      }
      case 'start': if (room && me && me.host) room.start(); break;
      case 'sc': if (room && me && room.phase === 'play' && !me.done) { me.m = Math.max(0, Math.min(900, m.m | 0)); me.s = Math.max(0, Math.min(200, m.s | 0)); } break;
      case 'done': if (room && me && room.phase === 'play') { me.m = Math.max(0, Math.min(900, m.m | 0)); me.s = Math.max(0, Math.min(200, m.s | 0)); me.done = true; if (room.players.every((q) => q.done)) room.finish(); else room.broadcast({ t: 'board', b: room.board() }); } break;
    }
  });
  ws.on('close', () => { if (!room || !me) return; if (!room.remove(me)) rooms.delete(room.code); else room.lobby(); });
});
setInterval(() => { for (const ws of wss.clients) { if (!ws.isAlive) { ws.terminate(); continue; } ws.isAlive = false; ws.ping(); } }, 15000);
server.listen(PORT, '0.0.0.0', () => {
  console.log('PUPUSERÍA DEL PUEBLO en http://localhost:' + PORT);
  for (const ip of lanIPs()) console.log('  Desde el celular (misma WiFi): http://' + ip + ':' + PORT);
});
