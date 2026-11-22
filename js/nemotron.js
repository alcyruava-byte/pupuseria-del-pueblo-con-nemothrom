// NEMOTRON visible: ficha de cada cliente (tocá su nombre), resumen "¿A quiénes serviste?" y sello de datos.
const isFarmO=o=>/agric|cultiv|ganad|pesc|campo|jornal|finca/i.test(o||"");
const isVendO=o=>/vend|comerc|tienda|mercado|comida|cocin|negocio/i.test(o||"");
const pct=(a,b)=>b?Math.round(100*a/b):0;
function nemStats(L){const n=L.length;return{n,old:pct(L.filter(p=>p.age>=55).length,n),young:pct(L.filter(p=>p.age<25).length,n),fem:pct(L.filter(p=>isF(p)).length,n),farm:pct(L.filter(p=>isFarmO(p.occupation)).length,n),vend:pct(L.filter(p=>isVendO(p.occupation)).length,n)}}
const REAL=()=>P.some(p=>p.persona||(p.uuid&&!/^ejemplo/.test(p.uuid)));
function pcard(p){let el=document.getElementById("pcard");if(!el){el=document.createElement("div");el.id="pcard";el.style.cssText="position:fixed;left:50%;top:12%;transform:translateX(-50%);z-index:60;max-width:min(430px,92vw);background:#fff4dc;border:4px solid #3a1f10;border-radius:18px;padding:12px 14px;font:700 14px 'Baloo 2',sans-serif;color:#3a1f10;box-shadow:0 8px 0 rgba(0,0,0,.25);cursor:pointer";el.onclick=()=>el.style.display="none";document.body.appendChild(el)}
  const prof=p.professional_persona||"",trav=p.travel_persona||"";
  el.innerHTML=`<div style="display:flex;gap:10px;align-items:center">${cabAvatar(p,58)}<div><b style="font-size:17px">${pname(p)}</b><br><small>${p.age} años · ${(p.occupation||"").toLowerCase()} · ${p.municipality||muni()}</small></div></div>
  <p style="margin:8px 0 4px;font-weight:600">${p.persona?"“"+p.persona+"”":"Persona sintética del dataset."}</p>${prof?`<small>💼 ${prof}</small><br>`:""}<small style="opacity:.75">🧠 Nemotron-Personas-El-Salvador · edad, ocupación y lugar son del dataset · tocá para cerrar</small>`;
  el.style.display="block";clearTimeout(pcard.t);pcard.t=setTimeout(()=>{el.style.display="none"},7000)}
cv.addEventListener("click",e=>{if(typeof S==="undefined"||!S||PAUSED||(typeof DUELX!=="undefined"&&DUELX))return;const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*W,y=(e.clientY-r.top)/r.height*H;
  if(y<424||y>462)return;const i=CX.findIndex(c=>Math.abs(x-c)<100);if(i<0||!S.clients[i])return;e.stopImmediatePropagation();pcard(S.clients[i].p)},true);
// resumen al final del día: lo que sirviste vs. el departamento (calculado con el dataset)
const _aD3=afterDay;afterDay=function(){const seen=(S&&S.seen)?S.seen.slice():[];_aD3();try{if(DUELX||seen.length<4)return;
  const u=[...new Map(seen.map(p=>[pid(p),p])).values()],a=nemStats(u),b=nemStats(pool()),d=G.dep&&depOf(G.dep);
  const top=u.filter(p=>p.occupation).map(p=>p.occupation.toLowerCase()).reduce((m,o)=>(m[o]=(m[o]||0)+1,m),{}),tk=Object.entries(top).sort((x,y)=>y[1]-x[1])[0];
  const mu=[...new Set(u.map(p=>p.municipality).filter(Boolean))].slice(0,3).join(", ");
  setTimeout(()=>flash({tag:"🧠 ¿A quiénes serviste?",e:"👥",h:u.length+" personas de "+(d?d.dep:"tu pueblo")+(mu?" ("+mu+")":""),
    p:`${a.fem}% mujeres · ${a.farm}% del campo · ${a.vend}% comerciantes · ${a.old}% mayores de 55 · ${a.young}% menores de 25`+(tk?` · más común: ${tk[0]} (${tk[1]})`:""),
    sub:`Población del departamento (Nemotron, ${b.n} personas): ${b.fem}% mujeres · ${b.farm}% campo · ${b.vend}% comerciantes · ${b.old}% mayores`,ms:8000}),1800)}catch(e){}};
// sello de datos
(function(){const b=document.createElement("div");b.id="nbadge";b.style.cssText="position:fixed;left:8px;bottom:6px;z-index:30;background:rgba(255,244,220,.92);border:3px solid #3a1f10;border-radius:14px;padding:2px 10px;font:800 11px 'Baloo 2',sans-serif;color:#3a1f10;pointer-events:none";document.body.appendChild(b);
  const up=()=>{b.textContent="🧠 Nemotron-Personas-El-Salvador · "+P.length+(REAL()?" personas reales":" personas (muestra)")};up();setTimeout(up,1500);setTimeout(up,5000)})();
