// CABILDO ABIERTO: la gestión de la alcaldía como casos diarios de personas reales (Nemotron).
// Seis índices del municipio (salud, educación, agua, movilidad, economía, seguridad) suben con tus decisiones,
// bajan con el tiempo, y determinan en vivo qué obras se ven arregladas o arruinadas en el pueblo 3D.
const IXK=["salud","edu","agua","mov","eco","seg"];
const IXM={salud:["🏥","Salud"],edu:["🏫","Educación"],agua:["🚰","Agua"],mov:["🛣️","Calles y puente"],eco:["🧺","Economía"],seg:["🛡️","Seguridad"]};
const hstr=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const FN_F=["Rosa","María","Carmen","Ana","Julia","Marta","Lupita","Dina","Karla","Yesenia","Mirna","Blanca","Sonia","Elsy","Glenda","Reina","Teresa","Flor","Gladis","Xiomara"],FN_M=["José","Carlos","Mario","Luis","Miguel","Óscar","Ernesto","Wilfredo","Rafael","Santos","Neftalí","Efraín","Héctor","Douglas","Nelson","Jorge","Manuel","Ricardo","Walter","Ángel"],LN=["Hernández","Martínez","López","Rivera","Menjívar","Cruz","Ramos","Guardado","Portillo","Quintanilla","Alvarado","Pineda","Flores","Mejía","Chávez","Orellana","Cañas","Salazar","Villalta","Amaya"];
const isF=p=>/fem|muj/i.test(p.sex||"");
function pname(p){if(p.name)return p.name;const h=hstr(pid(p));const fn=(isF(p)?FN_F:FN_M)[h%20];return fn+" "+LN[(h>>>5)%20]}
function cabAvatar(p,size){const h=hstr(pid(p)),sk=["#f6d5b5","#e8b98a","#c98f5f","#a86d43","#7a4a2a"][h%5],old=p.age>=55,hc=old?"#9a9a9a":["#2a1a10","#4a2a14","#6a3a1a","#1a1a1a"][(h>>>3)%4],cl=["#d8392b","#2f78c4","#3f9a4f","#e8892a","#8a3ab0","#e86ab0"][(h>>>6)%6],O="#3a1f10",f=isF(p),occ=(p.occupation||"").toLowerCase();
  const farm=/agric|cultiv|ganad|pesc|campo|jornal|finca/.test(occ),vend=/vend|comerc|tienda|cocin|mercado|comida/.test(occ);
  return `<svg viewBox="0 0 80 80" width="${size||72}" height="${size||72}" aria-hidden="true"><circle cx="40" cy="40" r="38" fill="${["#ffe9a8","#cfeaff","#e2f6d8","#ffd9e6"][(h>>>9)%4]}" stroke="${O}" stroke-width="3"/>
  ${f?`<ellipse cx="40" cy="42" rx="24" ry="26" fill="${hc}" stroke="${O}" stroke-width="2.5"/>`:""}
  <path d="M10 80 Q12 58 40 56 Q68 58 70 80Z" fill="${vend?"#fff4dc":cl}" stroke="${O}" stroke-width="2.5"/>${vend?`<path d="M28 60 L28 80 M52 60 L52 80" stroke="${cl}" stroke-width="5"/>`:""}
  <rect x="34" y="48" width="12" height="10" fill="${sk}" stroke="${O}" stroke-width="2"/>
  <circle cx="40" cy="36" r="19" fill="${sk}" stroke="${O}" stroke-width="2.5"/>
  ${!f&&!old&&h%7===0?"":`<path d="M21 34 Q22 15 40 15 Q58 15 59 34 Q52 24 40 24 Q28 24 21 34Z" fill="${hc}" stroke="${O}" stroke-width="2.5"/>`}
  ${farm?`<ellipse cx="40" cy="22" rx="30" ry="7" fill="#e8c45a" stroke="${O}" stroke-width="2.5"/><path d="M26 22 Q40 4 54 22Z" fill="#f2d474" stroke="${O}" stroke-width="2.5"/>`:""}
  <circle cx="33" cy="37" r="2.6" fill="${O}"/><circle cx="47" cy="37" r="2.6" fill="${O}"/>
  ${old&&!farm?`<circle cx="33" cy="37" r="6" fill="none" stroke="${O}" stroke-width="1.8"/><circle cx="47" cy="37" r="6" fill="none" stroke="${O}" stroke-width="1.8"/><path d="M39 37h2" stroke="${O}" stroke-width="1.8"/>`:""}
  <path d="M33 45 Q40 51 47 45" fill="none" stroke="${O}" stroke-width="2.5" stroke-linecap="round"/><circle cx="29" cy="43" r="3" fill="#ff8a8a" opacity=".5"/><circle cx="51" cy="43" r="3" fill="#ff8a8a" opacity=".5"/></svg>`}
// ---------- catálogo de necesidades ----------
const NT={
 salud:{test:p=>p.age>=55||/salud|enferm|m[eé]dic|farmac|cl[ií]nic/i.test(p.occupation||""),q:["Alcalde, llevo horas en la fila de la unidad de salud y no hay medicinas para la presión.","Mi familia se agravó anoche y la clínica estaba cerrada. Aquí uno se cura con suerte.","Las ambulancias no llegan hasta {m}. Necesitamos atención de verdad."],
  o:[["Renovar la unidad de salud",38,30,3,"Alcalde Pupusa renueva la unidad de salud de {m}","Techo nuevo, medicinas y turno de noche."],["Jornada médica móvil",12,10,1,"Jornada médica llega a {m}","Una brigada atiende a los vecinos por una semana."],["“Tenga paciencia”",0,-3,-2,"Vecinos de {m} critican la falta de atención en salud","Se va molesto."]]},
 edu:{test:p=>p.age<25||/docent|maestr|educ|estud|auxiliar/i.test(p.occupation||""),q:["Los patojos de {m} estudian bajo un techo que gotea. Así no se aprende.","Mi hija quiere estudiar pero no hay ni libros ni maestros de refuerzo.","Sin una escuela buena, a los jóvenes de acá solo les queda irse."],
  o:[["Renovar la escuela",33,30,3,"Alcalde Pupusa entrega escuela renovada en {m}","Aulas nuevas, techo firme y biblioteca."],["Becas y útiles escolares",10,10,1,"Entregan becas y útiles en {m}","Los estudiantes reciben mochilas llenas."],["“Ya vendrán tiempos mejores”",0,-3,-2,"Padres de {m} reclaman por la escuela","Se retira sin respuesta."]]},
 agua:{test:p=>/dom[eé]st|hogar|lavand|cocin|ama|agric|campo/i.test(p.occupation||""),q:["Tenemos agua dos horas cada tres días. Hasta para cocinar toca comprar pipa.","Se revienta la tubería y se pierde el agua; en {m} ya casi no sale.","Sin agua no se puede ni abrir el negocio, alcalde."],
  o:[["Cambiar las tuberías",33,30,3,"Alcalde Pupusa repara las tuberías de {m}","Ya no hay fugas y llega agua todos los días."],["Pipas de agua comunitarias",10,10,1,"Pipas reparten agua en {m}","Alivio inmediato, pero temporal."],["“Ahorre agua mientras tanto”",0,-3,-2,"Vecinos de {m} se quejan por la escasez de agua","Se va con los cántaros vacíos."]]},
 mov:{test:p=>/transp|conduc|taxi|motor|pesc|jornal|campo|agric/i.test(p.occupation||""),q:["El camino a {m} es puro hueco; el bus no entra cuando llueve.","De noche no hay luz y da miedo caminar; el puente está dañado.","Para sacar la cosecha hay que dar media vuelta. Necesitamos un camino de verdad."],
  o:[["Pavimentar y alumbrar",33,30,3,"Alcalde Pupusa pavimenta y alumbra calles de {m}","Calles lisas, postes nuevos y puente reparado."],["Bacheo y focos nuevos",10,10,1,"Cuadrillas bachean calles de {m}","Un parche rápido, pero se nota."],["“Espere al verano”",0,-3,-2,"Conductores de {m} critican el mal estado de los caminos","Se va maldiciendo los baches."]]},
 eco:{test:p=>/vend|comerc|artesan|costur|tienda|mercado|comida|negocio|taller/i.test(p.occupation||""),q:["Vendo todo el día sin sombra ni orden en el mercado; las ventas no dan.","No hay trabajo en {m}; mis hijos se van a la capital.","Mi negocio apenas sobrevive. Con un poquito de apoyo levantamos cabeza."],
  o:[["Construir el mercado municipal",38,30,3,"Alcalde Pupusa inaugura mercado municipal en {m}","Puestos con sombra, orden y alumbrado."],["Feria de emprendedores",12,10,1,"Feria de emprendedores llena la plaza de {m}","Los puestos venden como nunca."],["“Busque otro lugar”",0,-3,-2,"Comerciantes de {m} se sienten abandonados","Recoge sus cosas y se va."]]},
 seg:{test:()=>true,q:["Dan ganas de cerrar temprano porque asaltan en la esquina.","Los jóvenes sin qué hacer terminan en malas compañías.","Uno ya no deja salir a los niños. Queremos barrios tranquilos."],
  o:[["Patrulla comunitaria y luminarias",27,28,3,"Alcalde Pupusa instala patrullas y luminarias en {m}","Los vecinos vuelven a salir de noche."],["Cancha y talleres para jóvenes",12,12,2,"Jóvenes de {m} estrenan cancha y talleres","Los patojos tienen dónde estar."],["“Cierre temprano usted”",0,-3,-2,"Vecinos de {m} denuncian inseguridad","Se va con miedo."]]}};
const THR={salud:60,edu:60,agua:60,eco:60,mov:55};
function ensureIX(){if(!G.ix){const b=G.built||{};G.ix={salud:b.salud?72:35,edu:b.edu?72:35,agua:b.agua?72:35,mov:b.caminos?(b.puente?82:62):35,eco:b.mercado?72:35,seg:40}}G.hist=G.hist||{};G.cabLog=G.cabLog||[]}
const mapB=()=>({salud:G.ix.salud>=60,edu:G.ix.edu>=60,mercado:G.ix.eco>=60,agua:G.ix.agua>=60,caminos:G.ix.mov>=55,puente:G.ix.mov>=75});
function syncBuilt(){const B=mapB(),nb={};for(const k in B)if(B[k])nb[k]=1;G.built=nb;G.welfare=Math.round(IXK.reduce((a,k)=>a+G.ix[k],0)/IXK.length)}
function cabDecay(){IXK.forEach(k=>G.ix[k]=Math.max(0,G.ix[k]-4));syncBuilt()}
function pickType(p,order){for(const k of order){if(k!=="seg"&&NT[k].test(p))return k}return "seg"}
function genCases(){ensureIX();const PL=pool(),n=PL.length,order=[...IXK].sort((a,b)=>G.ix[a]-G.ix[b]),out=[],used=new Set(),seed=(CAMP.gd*7+(G.dep||"").length*13)>>>0;
  let t3=IXK[seed%6];if(t3===order[0]||t3===order[1])t3=order[2];const want=[order[0],order[1],t3];
  // seguimiento de alguien atendido o ignorado antes
  const prev=Object.values(G.hist).filter(h=>h.day<=CAMP.gd-2&&!h.fu);
  let fu=null;if(prev.length&&(seed%10)<5){fu=prev[seed%prev.length];}
  want.forEach((tp,i)=>{
    if(i===2&&fu){fu.fu=1;out.push({fu:1,type:fu.type,p:fu.p,name:fu.name,good:fu.good,done:null,tpl:0});return}
    let cand=PL.filter(p=>!used.has(pid(p))&&NT[tp].test(p)&&tp!=="seg");if(!cand.length)cand=PL.filter(p=>!used.has(pid(p)));if(!cand.length)cand=PL;
    const p=cand[(hstr(tp+CAMP.gd+i)+i*7)%cand.length];used.add(pid(p));out.push({type:tp,p,name:pname(p),done:null,tpl:(hstr(pid(p))+CAMP.gd)%3})});
  G.cases=out;G.casesDay=CAMP.gd}
const mun=(c)=>c.p.municipality||muni();
const fillT=(t,c)=>t.replace(/\{m\}/g,mun(c));
function optChips(o,aff){return `<span class="chip ${o[1]?"cost":"free"}">${o[1]?"−"+fm(o[1]):"Gratis"}</span><span class="chip ${o[2]>=0?"up":"dn"}">${o[2]>=0?"▲":"▼"} ${Math.abs(o[2])}</span><span class="chip ${o[3]>=0?"up":"dn"}">${o[3]>=0?"♥ +":"♥ −"}${Math.abs(o[3])}</span>`}
function caseHTML(c,i){const T=NT[c.type],m=IXM[c.type],p=c.p;let body;
  if(c.fu){const opts=c.good?[["Aceptar el obsequio y saludar",0,0,1],["Invitarlo a probar tus pupusas",0,0,2]]:[["Escucharlo y ofrecer una solución",6,6,2],["Ignorar la protesta",0,-2,-3]];
    c.fuo=opts;body=`<p class="cq">${c.good?"“Alcalde, vine a darle las gracias: desde que me ayudó, otra cosa es "+mun(c)+". Le traje esto.”":"“¡Alcalde, usted prometió y no cumplió! Vengo a reclamarle frente a todos.”"}</p>`;
    c.opts=opts.map(o=>[o[0],o[1],o[2],o[3],c.good?"Vecino agradecido en "+mun(c)+" visita a Alcalde Pupusa":"Protesta frente a la alcaldía de "+mun(c),""])}
  else{c.opts=T.o;body=`<p class="cq">“${fillT(T.q[c.tpl],c)}”</p>`}
  const res=c.done!==null?`<div class="stamp ${c.done.ok?"ok":"no"}">${c.done.ok?"ATENDIDO":"PENDIENTE"}</div><p class="cr">${c.done.txt}</p>`:`<div class="co">${c.opts.map((o,k)=>`<button data-c="${i}" data-o="${k}" class="op op${k}" ${G.treasury<o[1]?"disabled":""}><b>${o[0]}</b><span class="chips">${optChips(o)}</span></button>`).join("")}</div>`;
  return `<article class="cc" id="cc${i}"><div class="tape"></div><div class="cp">${cabAvatar(p,64)}<div><b>${c.name}</b><small>${p.age} años · ${(p.occupation||"").toLowerCase()} · ${mun(c)}</small></div><span class="ctype">${m[0]} ${m[1]}${c.fu?" · seguimiento":""}</span></div>${body}<details class="cn"><summary>🧠 Perfil Nemotron</summary><p>${p.persona?p.persona:"Persona del dataset: "+p.occupation+", "+p.age+" años."}<br><small>Nombre generado para el juego; edad, ocupación y lugar vienen del dataset.</small></p></details>${res}</article>`}
function ixHTML(){return IXK.map(k=>{const v=Math.round(G.ix[k]),t=THR[k]||0,ok=t&&v>=t;return `<div class="ix ${ok?"ok":""}" id="ix_${k}"><span>${IXM[k][0]} ${IXM[k][1]}</span><i><b style="width:${v}%"></b>${t?`<u style="left:${t}%"></u>`:""}</i><em>${v}</em></div>`}).join("")}
function cabHeader(){const done=Object.keys(G.built).length,eligible=done>=4;return `<div class="cstats"><span>Día <b>${G.days+1}</b></span><span>Caja <b id="ccash">${fm(G.treasury)}</b></span><span>Obras <b id="cob">${done}/6</b></span><span>Popularidad <b id="cpop">${CAMP.pop>=0?"+":""}${CAMP.pop}</b></span></div>`}
function showCabildo(msg){
  ensureIX();if(G.casesDay!==CAMP.gd||!G.cases){if(G.casesDay!=null&&G.cases)cabDecay();genCases()}syncBuilt();
  $("menu").style.display="none";const el=$("alc"),d=G.dep&&depOf(G.dep);
  el.innerHTML=`<div class="box wide cab">${hlHTML()}<div class="chd"><div><h2>🏛️ Cabildo abierto · ${muni()}</h2><p class="sub">${msg||"Estas personas de "+(d?d.dep:"tu municipio")+" vinieron a verte. Tu caja es limitada: elegí a quién ayudar."}</p></div><button id="hm">☰ Menú</button></div>
  <div class="town g3 ctown big"><div id="t3" style="position:absolute;inset:0"></div><canvas id="tv" style="display:none"></canvas><div class="thud">${cabHeader()}</div><div class="thint">👆 Tocá a los vecinos con <b>!</b> en la plaza o elegí abajo. Arrastrá para girar · rueda para acercar.</div></div>
  <div class="cgrid"><section class="cases">${G.cases.map(caseHTML).join("")}</section>
  <aside class="cside"><div class="ixs"><h4>Estado del municipio</h4>${ixHTML()}<p class="hint">La línea marca cuándo la obra se ve arreglada en el pueblo. Cada día todo se deteriora un poco.</p></div>
  <div class="cact"><button class="next" id="hd">🫓 Trabajar un día</button><button id="hshop" class="blue">🛠️ Mejorar pupusería</button><button id="hel" class="purple">🧑‍🤝‍🧑 Tu electorado</button>${G.fin?'<button id="hgov" class="gold">🗳️ Elecciones y departamento</button>':""}</div></aside></div></div>`;
  el.style.display="grid";mountTown();
  el.querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>decide(+b.dataset.c,+b.dataset.o));
  $("hd").onclick=startDay;$("hm").onclick=showMenu;$("hshop").onclick=()=>showShop();$("hel").onclick=()=>showElectorate();const gg=$("hgov");if(gg)gg.onclick=()=>showGov();
  const bn=document.querySelector(".cab .pins");}
function mountTown(){let g3=false;if(typeof Town3D!=="undefined"&&GL.ok()){g3=GL.mount($("t3"),Town3D);
  if(g3){const dd=G.dep&&depOf(G.dep);if(dd){Town3D.setTheme(dd);Town3D.setLandmark(dd.id,dd.lm)}Town3D.setBuilt(G.built);const led=Object.values(SAVE).filter(g=>g.led).length;Town3D.setShop(CAMP.up||{});Town3D.setProgress({obras:Object.keys(G.built).length,welfare:G.welfare,pop:CAMP.pop||0,led,prim:CAMP.prim,pres:CAMP.pres,dept:dd?dd.dep:""});Town3D.setSelected(null);Town3D.focus(null);Town3D.setAuto(true);Town3D.pins(null);if(Town3D.setCases){Town3D.setCases(G.cases.map(c=>({id:pid(c.p),name:c.name,fem:isF(c.p),icon:IXM[c.type][0],done:c.done!==null,hat:/agric|cultiv|ganad|campo|jornal|finca/i.test(c.p.occupation||"")?"straw":null})),npcPick)}}}
  if(!g3){const t=$("t3");if(t)t.style.background="linear-gradient(#8fd2f2,#cfeaff)";}}
function refresh(){$("ccash").textContent="$"+G.treasury;$("cob").textContent=Object.keys(G.built).length+"/6";$("cpop").textContent=(CAMP.pop>=0?"+":"")+CAMP.pop;
  IXK.forEach(k=>{const e=$("ix_"+k);if(!e)return;const v=Math.round(G.ix[k]),t=THR[k]||0;e.querySelector("b").style.width=v+"%";e.querySelector("em").textContent=v;e.classList.toggle("ok",!!t&&v>=t)});
  document.querySelectorAll(".cab .op").forEach(b=>{const c=G.cases[+b.dataset.c];if(c&&c.opts)b.disabled=G.treasury<c.opts[+b.dataset.o][1]})}
function decide(i,k){const c=G.cases[i];if(!c||c.done!==null)return;const o=c.opts[k];if(G.treasury<o[1])return;
  const prevB=mapB();G.treasury-=o[1];
  if(!c.fu)G.ix[c.type]=Math.max(0,Math.min(100,G.ix[c.type]+o[2]));
  else if(o[2])G.treasury+=0;
  CAMP.pop=Math.max(-10,Math.min(20,(CAMP.pop||0)+o[3]));
  const ok=o[3]>0||(c.fu&&o[3]>=0),key=pid(c.p);
  if(ok)CAMP.aff[key]=(CAMP.aff[key]||0)+(k===0?2:1);else CAMP.aff[key]=Math.max(0,(CAMP.aff[key]||0)-1);
  if(c.fu&&c.good&&k===0){G.treasury+=6;}
  c.done={ok,txt:c.fu?(c.good?(k===0?"Te dejó una bandeja de pupusas (+$3) y se fue sonriendo.":"Prometió traer a todos sus vecinos a tu pupusería."):(k===0?"Se calmó. Esperá resultados.":"Se fue indignado y lo comentó en el barrio.")):o[5]};
  G.hist[key]={p:c.p,name:c.name,type:c.type,day:CAMP.gd,good:ok,fu:!!c.fu};
  syncBuilt();const newB=mapB(),gained=Object.keys(newB).filter(x=>newB[x]&&!prevB[x]);
  const card=$("cc"+i);card.outerHTML=caseHTML(c,i);
  if(typeof Town3D!=="undefined"&&$("t3")&&$("t3").firstChild){const B2=Object.assign({},G.built);gained.forEach(x=>delete B2[x]);Town3D.setBuilt(B2);
    if(gained.length){Town3D.setAuto(false);const dur=Town3D.celebrate(gained[0]);setTimeout(()=>{Town3D.setBuilt(G.built);if($("t3")&&$("t3").firstChild){Town3D.focus(null);Town3D.setAuto(true)}},dur*1000+500)}
    Town3D.setProgress({obras:Object.keys(G.built).length,welfare:G.welfare,pop:CAMP.pop})}
  if(Town3D.markDone)Town3D.markDone(i);Snd.play(ok?"build":"bad");
  const h=c.fu?o[4]:fillT(c.opts[k][4],c);
  flash({tag:"Cabildo abierto",e:IXM[c.type][0],h:c.name+": "+h,p:c.done.txt,sub:(o[1]?"−"+fm(o[1])+" · ":"")+(c.fu?"":IXM[c.type][1]+" "+(o[2]>=0?"+":"")+o[2]+" · ")+"Popularidad "+(CAMP.pop>=0?"+":"")+CAMP.pop,ms:5200});
  gained.forEach(x=>{G.log.push(BUILD[x].n);onBuild(x)});
  refresh();saveGame();
  if(!G.fin&&Object.keys(G.built).length>=FIN_N){G.fin=1;setTimeout(()=>showGov("¡"+muni()+" está lista para elecciones! Con "+Object.keys(G.built).length+" obras arregladas, el movimiento te pide como candidato."),3600)}}

const showHubOld=showHub;showHub=function(msg){if(DUELX)return showHubOld(msg);showCabildo(msg)};

function npcPick(i){const el=$("cc"+i);if(!el)return;el.scrollIntoView({behavior:"smooth",block:"center"});el.classList.add("pulse");setTimeout(()=>el.classList.remove("pulse"),1800);if(Town3D.focusNpc){Town3D.focusNpc(i);setTimeout(()=>{if($("t3")&&$("t3").firstChild){Town3D.focus(null);Town3D.setAuto(true)}},5000)}}
