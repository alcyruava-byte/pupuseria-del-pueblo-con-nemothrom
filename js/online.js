// Funciones en línea (solo si el juego se abre desde server.js): ranking compartido y duelos por sala.
(function(){
let RES=false,ONLINE=false,ws=null,ME=null,CODE=null,ROOMP=[],MODE=null,STASH=null,SC_IV=null;
const esc=t=>String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const getName=()=>{try{return localStorage.getItem("pupName")||""}catch(e){return""}};
const setName=n=>{try{localStorage.setItem("pupName",n)}catch(e){}};
function askName(cb){const n=getName();if(n)return cb(n);
  modal(`<h2>¿Cómo te llamás, alcalde?</h2><p class="sub">Este nombre sale en el ranking y en los duelos.</p><input id="pn" maxlength="14" placeholder="Tu nombre" style="font:inherit;font-weight:800;font-size:1.2rem;width:100%;padding:8px 12px;border:3px solid #3a1f10;border-radius:12px;box-sizing:border-box"><button class="next" id="pok">Listo</button>`);
  const go=()=>{const v=$("pn").value.trim().toUpperCase()||"ALCALDE";setName(v);closeModal();cb(v)};$("pok").onclick=go;$("pn").onkeydown=e=>{if(e.key==="Enter")go()};setTimeout(()=>$("pn").focus(),50)}
const post=(mode,value,extra)=>{const n=getName();if(!ONLINE||!n)return;fetch("/ranking",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode,name:n,value,extra})}).catch(()=>{})};
// ---------- ranking ----------
const TABS=[["dia","🫓 Mejor día","$"],["campana","🇸🇻 Presidente más rápido","días"],["duelo","⚔️ Duelos","$"]];
function showRanking(tab,back){tab=tab||"dia";
  fetch("/ranking?mode="+tab).then(r=>r.json()).then(rows=>{
    modal(`<h2>🏆 Ranking</h2><div style="display:flex;gap:6px;flex-wrap:wrap;margin:6px 0">${TABS.map(t=>`<button data-t="${t[0]}" style="${t[0]===tab?"":"background:#8a7a6a"}">${t[1]}</button>`).join("")}</div>
    ${rows.length?`<div class="grid" style="grid-template-columns:1fr">${rows.map((r,i)=>`<div class="evb" style="margin:2px 0;${i===0?"background:#fff1c2":""}"><span style="font-size:1.4rem">${["🥇","🥈","🥉"][i]||i+1}</span><div><b>${esc(r.name)}</b><small>${TABS.find(t=>t[0]===tab)[2]==="$"?"$"+r.value:r.value+" días"}${r.extra?" · "+esc(r.extra):""} · ${r.date}</small></div></div>`).join("")}</div>`:'<p class="hint">Todavía no hay récords. ¡Sé el primero!</p>'}
    <button class="next" id="xc">Cerrar</button>`);
    document.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>showRanking(b.dataset.t,back));$("xc").onclick=()=>{closeModal();if(back)back()}}).catch(()=>{})}
// ---------- duelo ----------
const conn=cb=>{if(ws&&ws.readyState===1)return cb();
  ws=new WebSocket((location.protocol==="https:"?"wss://":"ws://")+location.host);
  ws.onopen=cb;ws.onmessage=e=>onMsg(JSON.parse(e.data));ws.onclose=()=>{if(MODE){endDuelUI();showErr("Se perdió la conexión con el servidor.")}ws=null;ME=null;CODE=null;MODE=null};
};
const sendWs=o=>{if(ws&&ws.readyState===1)ws.send(JSON.stringify(o))};
const showErr=m=>{modal(`<h2>⚠️ ${esc(m)}</h2><button class="next" id="xc">Cerrar</button>`);$("xc").onclick=closeModal};
function duelMenu(){askName(name=>{
  modal(`<h2>⚔️ Duelo de pupuserías</h2><p class="sub">Todos cocinan el mismo día de 2 minutos con los mismos clientes. Gana quien junte más dinero. Hasta 8 jugadores.</p>
  <button class="next" id="dc" style="margin-top:8px">➕ Crear sala</button>
  <p class="hint" style="text-align:center">o entrá con el código de tu amigo:</p>
  <div style="display:flex;gap:8px"><input id="dcode" maxlength="4" placeholder="ABCD" style="font:inherit;font-weight:800;font-size:1.3rem;text-transform:uppercase;text-align:center;flex:1;padding:6px;border:3px solid #3a1f10;border-radius:12px;min-width:0"><button id="dj">Entrar</button></div>
  <button class="next" id="xc" style="background:#6b4a2c">Cerrar</button>`);
  $("xc").onclick=closeModal;$("dc").onclick=()=>conn(()=>sendWs({t:"create",name}));
  $("dj").onclick=()=>{const c=$("dcode").value.trim().toUpperCase();if(c.length===4)conn(()=>sendWs({t:"join",code:c,name}))}})}
function lobbyUI(m){CODE=m.code;ROOMP=m.players;if(MODE)return;
  const host=m.players.find(p=>p.id===ME&&p.host),url=location.origin+"/?sala="+m.code;
  modal(`<h2>⚔️ Sala <span style="letter-spacing:4px;font-size:1.8rem">${m.code}</span></h2><p class="sub">Tus amigos escanean el QR o escriben el código.</p>
  <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><img src="/qr.svg?t=${encodeURIComponent(url)}" width="130" height="130" alt="QR" style="border:3px solid #3a1f10;border-radius:10px;background:#fff"><div style="flex:1;min-width:160px">${m.players.map(p=>`<div class="evb" style="margin:3px 0;padding:4px 10px"><span style="font-size:1.3rem">${p.host?"👑":"🫓"}</span><b>${esc(p.name)}${p.id===ME?" (vos)":""}</b></div>`).join("")}</div></div>
  ${host?`<button class="next" id="dgo">▶ Empezar duelo</button>`:'<p class="hint" style="text-align:center">Esperá a que el anfitrión empiece…</p>'}<button class="next" id="dx" style="background:#6b4a2c">Salir de la sala</button>`);
  if(host)$("dgo").onclick=()=>sendWs({t:"start"});$("dx").onclick=()=>{closeModal();if(ws)ws.close()}}
const rng=seed=>{let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
function mkQueue(seed){const r=rng(seed),q=[];let t=1.5;for(let i=0;i<140;i++){q.push({t,pi:Math.floor(r()*1e6)});t+=.8+r()*2.2}
  const X={q,i:0,next:()=>!!X.q[X.i]&&X.q[X.i].t<=(S.t0n-S.t),take:()=>P[X.q[X.i++].pi%P.length]};return X}
function hud(b){let h=$("duel");if(!h){h=document.createElement("div");h.id="duel";h.style.cssText="position:fixed;top:54px;right:8px;z-index:7;background:#fff4dcee;border:3px solid #3a1f10;border-radius:12px;padding:4px 10px;font:800 .85rem 'Baloo 2',sans-serif;color:#3a1f10;min-width:130px";document.body.appendChild(h)}
  h.style.display="block";h.innerHTML=b.map((p,i)=>`<div style="${p.id===ME?"color:#c42f22":""}">${["🥇","🥈","🥉"][i]||i+1+"."} ${esc(p.name).slice(0,10)} · $${p.m}${p.done?" ✓":""}</div>`).join("")}
function endDuelUI(){clearInterval(SC_IV);const h=$("duel");if(h)h.style.display="none";
  if(DUELX){DUELX=null;PAUSED=true;DAYON=false}
  if(STASH){G=STASH.G;S=STASH.S;CAMP=STASH.CAMP;SAVE=STASH.SAVE;STASH=null}MODE=null}
function duelStart(m){closeModal();
  ["menu","alc","dep","news","elec","story","flash","info"].forEach(i=>{const e=$(i);if(e)e.style.display="none"});
  STASH={G,S,CAMP,SAVE};MODE="duel";
  G=freshG();SAVE={};CAMP={gd:0,rank:null,prim:0,pres:0,aff:{},pop:0,up:{},story:{},dil:[],combo:0,best:0};
  S=mkDay();S.t0n=m.dur;S.t=m.dur;PT=[];PAUSED=true;DAYON=false;DUELX=mkQueue(m.seed);
  let n=Math.ceil(m.wait/1000);const el=$("flash");el.className="dim";el.style.display="grid";
  const tick=()=>{if(n<=0){el.style.display="none";el.className="";PAUSED=false;DAYON=true;say("¡Duelo! Cociná y servicio rápido.");
      SC_IV=setInterval(()=>{if(S&&MODE)sendWs({t:"sc",m:S.money,s:S.served})},1000);return}
    el.innerHTML=`<div style="font:900 7rem 'Baloo 2',sans-serif;color:#fff;text-shadow:0 6px 0 #3a1f10;text-align:center">${n}<div style="font-size:1.4rem">¡Prepará el comal!</div></div>`;Snd.play("tick");n--;setTimeout(tick,1000)};tick()}
window.duelEnd=function(m,s){clearInterval(SC_IV);sendWs({t:"done",m,s});Snd.play("win");
  modal(`<h2>⏱ ¡Terminaste! $${m} · ${s} servidos</h2><p class="sub">Esperando a que terminen los demás…</p>`)};
function results(m){RES=true;const mine=m.order.findIndex(o=>o.id===ME);endDuelUI();Snd.play(mine===0?"win":"bell");
  modal(`<h2>${mine===0?"🏆 ¡Ganaste el duelo!":"Resultados del duelo"}</h2><div class="grid" style="grid-template-columns:1fr">${m.order.map((o,i)=>`<div class="evb" style="margin:2px 0;${o.id===ME?"background:#fff1c2":""}"><span style="font-size:1.4rem">${["🥇","🥈","🥉"][i]||i+1}</span><div><b>${esc(o.name)}</b><small>$${o.m} · ${o.s} servidos</small></div></div>`).join("")}</div>
  <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><button class="next" id="rv" style="margin:12px 0 0">⚔️ Revancha</button><button class="next" id="rx" style="background:#6b4a2c;margin:12px 0 0">Salir</button></div>`);
  $("rv").onclick=()=>{RES=false;lobbyUI({code:CODE,players:ROOMP})};$("rx").onclick=()=>{RES=false;closeModal();if(ws)ws.close();showMenu()}}
function onMsg(m){
  if(m.t==="joined"){ME=m.id;CODE=m.code}
  else if(m.t==="lobby"){ROOMP=m.players;if(!MODE&&!RES)lobbyUI(m)}
  else if(m.t==="start"){RES=false;duelStart(m)}
  else if(m.t==="board")hud(m.b);
  else if(m.t==="results")results(m);
  else if(m.t==="err")showErr(m.msg)}
// ---------- integración ----------
const oAfter=window.afterDay;
window.afterDay=function(){oAfter&&oAfter();if(!DUELX&&ONLINE&&S&&S.money>0){if(getName())post("dia",S.money,"día "+(G.days||CAMP.gd))}};
const oWin=window.showWin;
window.showWin=function(r){oWin&&oWin(r);if(ONLINE)askNameLater(()=>post("campana",CAMP.gd,"Presidente Pupusa"))};
const askNameLater=f=>setTimeout(()=>askName(()=>f()),2500);
function init(){
  fetch("/health").then(r=>r.ok?r.text():Promise.reject()).then(t=>{if(t!=="ok")return;ONLINE=true;
    const row=document.createElement("div");row.className="two";row.innerHTML='<button class="mb green" id="mDuel"><span>⚔️ Duelo en línea</span></button><button class="mb purple" id="mRank"><span>🏆 Ranking</span></button>';
    const anchor=$("mCard")&&$("mCard").parentNode;if(anchor)anchor.parentNode.insertBefore(row,anchor.nextSibling);
    $("mDuel").onclick=()=>{$("menu").style.display="grid";duelMenu()};$("mRank").onclick=()=>showRanking("dia");
    const sala=(location.search.match(/[?&]sala=([A-Za-z]{4})/)||[])[1];
    if(sala)setTimeout(()=>{const c=document.getElementById("splash");closeModal();askName(name=>conn(()=>sendWs({t:"join",code:sala.toUpperCase(),name})))},1800)}).catch(()=>{})}
init();
})();
