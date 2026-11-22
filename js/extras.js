// Extras: sonido, eventos del día, mecánica por departamento, clientes frecuentes, mejoras,
// dilemas, historia, panel de electorado, guardado, modo demo y tarjeta para compartir.
// Se carga después de game.js y comparte su ámbito (G, S, CAMP, BUILD, P, DEPS...).
const pid=p=>p.uuid||(p.occupation+"|"+p.age+"|"+(p.municipality||""));
const PIDX=()=>{const m={};P.forEach(p=>m[pid(p)]=p);return m};
// ---------- estado global de campaña (extiende CAMP) ----------
const ensureC=()=>{CAMP.aff=CAMP.aff||{};CAMP.pop=CAMP.pop||0;CAMP.up=CAMP.up||{};CAMP.story=CAMP.story||{};CAMP.dil=CAMP.dil||[];CAMP.ev=CAMP.ev||[];CAMP.combo=CAMP.combo||0;CAMP.best=CAMP.best||0};
// ---------- SONIDO (WebAudio sintetizado, sin archivos) ----------
const Snd=(()=>{let ctx=null,master=null,on=true,musicOn=true,tm=null,beat=0;try{on=localStorage.getItem("pupMute")!=="1"}catch(e){}
  const init=()=>{if(ctx)return ctx;try{ctx=new(window.AudioContext||window.webkitAudioContext)();master=ctx.createGain();master.gain.value=.5;master.connect(ctx.destination)}catch(e){ctx=null}return ctx};
  const tone=(f,t0,d,type,vol,slide)=>{if(!ctx||!on)return;const o=ctx.createOscillator(),g=ctx.createGain();o.type=type||"sine";o.frequency.setValueAtTime(f,t0);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t0+d);g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(vol||.2,t0+.01);g.gain.exponentialRampToValueAtTime(.001,t0+d);o.connect(g);g.connect(master);o.start(t0);o.stop(t0+d+.02)};
  const marimba=(f,t0,v)=>{tone(f,t0,.35,"triangle",v||.12);tone(f*4,t0,.08,"sine",(v||.12)*.4)};
  const N={C:262,D:294,E:330,G:392,A:440,C2:523,D2:587,E2:659,G2:784};
  const SEQ=[["C","E","G","E","A","G","E","D"],["C","G","A","G","E","D","E","C"],["E","G","C2","G","A","G","E","G"],["D","E","G","A","G","E","D","C"]];
  const FX={
    pop:t=>tone(520,t,.12,"sine",.18,820),take:t=>{tone(660,t,.1,"triangle",.2);tone(880,t+.08,.12,"triangle",.18)},
    tick:t=>tone(900,t,.05,"square",.06),coin:t=>{tone(988,t,.09,"square",.12);tone(1319,t+.08,.22,"square",.12)},
    bad:t=>tone(180,t,.25,"sawtooth",.14,90),lost:t=>{tone(330,t,.18,"triangle",.16,220);tone(220,t+.15,.3,"triangle",.16,150)},
    bell:t=>{[0,.18,.36].forEach((d,i)=>marimba([523,659,784][i],t+d,.16))},build:t=>{[392,494,587,784].forEach((f,i)=>tone(f,t+i*.09,.25,"triangle",.17))},
    win:t=>{[523,659,784,1047,784,1047,1319].forEach((f,i)=>tone(f,t+i*.14,.35,"triangle",.17))},vote:t=>{[330,392,494].forEach((f,i)=>tone(f,t+i*.12,.2,"sine",.15))},
    news:t=>{tone(440,t,.08,"square",.08);tone(440,t+.12,.08,"square",.08);tone(660,t+.24,.2,"square",.08)},combo:t=>{tone(880,t,.08,"square",.1);tone(1175,t+.07,.14,"square",.1)}};
  // música por departamento: tonalidad, tempo, escala y timbre propios
  const SC={maj:[0,2,4,7,9],min:[0,3,5,7,10],mix:[0,2,5,7,9]},IDX={C:0,D:1,E:2,G:3,A:4,C2:5,D2:6,E2:7,G2:8};
  const TH={_:{b:262,ms:460,sc:"maj",ty:"tri"},ahuachapan:{b:262,ms:500,sc:"maj",ty:"tri"},"santa-ana":{b:247,ms:540,sc:"min",ty:"sine"},sonsonate:{b:294,ms:410,sc:"mix",ty:"sq"},"la-libertad":{b:330,ms:370,sc:"maj",ty:"tri"},
    chalatenango:{b:220,ms:560,sc:"min",ty:"sine"},"san-salvador":{b:277,ms:360,sc:"maj",ty:"sq"},cuscatlan:{b:262,ms:500,sc:"mix",ty:"tri"},"la-paz":{b:349,ms:430,sc:"maj",ty:"tri"},cabanas:{b:233,ms:540,sc:"min",ty:"tri"},
    "san-vicente":{b:294,ms:470,sc:"mix",ty:"sine"},usulutan:{b:311,ms:410,sc:"maj",ty:"sq"},"san-miguel":{b:330,ms:340,sc:"mix",ty:"sq"},morazan:{b:247,ms:560,sc:"min",ty:"sine"},"la-union":{b:370,ms:430,sc:"maj",ty:"tri"}};
  let th=TH._;
  const fq=(l)=>{const d=IDX[l],oc=Math.floor(d/5),sc=SC[th.sc];return th.b*Math.pow(2,(oc*12+sc[d%5])/12)};
  const lead=(f,t,v)=>{if(th.ty==="sq"){tone(f,t,.18,"square",v*.5);tone(f*2,t,.06,"triangle",v*.4)}else if(th.ty==="sine"){tone(f,t,.5,"sine",v*1.3);tone(f*2,t,.2,"sine",v*.4)}else marimba(f,t,v)};
  const music=()=>{if(!ctx||!on||!musicOn)return;const t=ctx.currentTime+.05,seq=SEQ[Math.floor(beat/8)%4],f=fq(seq[beat%8]);lead(f,t,.09);if(beat%4===0)lead(f/2,t,.07);
    if(th.ms<450&&beat%2===0)tone(150,t,.05,"square",.035);if(beat%8===6)tone(f*1.5,t+.2,.12,"triangle",.05);beat++};
  const noise=(t0,d,vol,hp)=>{if(!ctx||!on)return;const n=Math.floor(ctx.sampleRate*d),bf=ctx.createBuffer(1,n,ctx.sampleRate),ch=bf.getChannelData(0);for(let i=0;i<n;i++)ch[i]=(Math.random()*2-1)*(1-i/n);const s=ctx.createBufferSource();s.buffer=bf;const g=ctx.createGain(),fl=ctx.createBiquadFilter();fl.type="highpass";fl.frequency.value=hp||2500;g.gain.value=vol||.12;s.connect(fl);fl.connect(g);g.connect(master);s.start(t0)};
  Object.assign(FX,{sizzle:t=>noise(t,.5,.1,3500),dog:t=>{tone(300,t,.09,"sawtooth",.16,180);tone(280,t+.14,.09,"sawtooth",.16,170)},
    fanfare:t=>{[392,392,392,523,659,784].forEach((f,i)=>tone(f,t+i*.1,i>2?.28:.1,"square",.12))},mariachi:t=>{[523,659,784,659,784,1047].forEach((f,i)=>{tone(f,t+i*.12,.16,"sawtooth",.09);tone(f/2,t+i*.12,.16,"triangle",.1)})},
    fire:t=>{noise(t,.7,.14,1200);tone(120,t,.5,"sawtooth",.07,260)},tv:t=>{[880,1109,1319,1760].forEach((f,i)=>tone(f,t+i*.08,.14,"square",.09))},
    star:t=>{[784,988,1175,1568].forEach((f,i)=>tone(f,t+i*.09,.3,"triangle",.17))},boss:t=>{[196,247,294,392,392].forEach((f,i)=>tone(f,t+i*.16,.34,"sawtooth",.12));noise(t+.7,.4,.1,800)}});
  return{
    play(n){if(!on)return;if(!init())return;if(ctx.state==="suspended")ctx.resume();const f=FX[n];if(f)f(ctx.currentTime)},
    start(){if(!init())return;if(ctx.state==="suspended")ctx.resume();if(!tm)tm=setInterval(music,th.ms)},
    theme(id){th=TH[id]||TH._;if(tm){clearInterval(tm);tm=setInterval(music,th.ms)}beat=0},
    toggle(){on=!on;try{localStorage.setItem("pupMute",on?"0":"1")}catch(e){}if(on)this.start();return on},isOn:()=>on};
})();
document.addEventListener("pointerdown",()=>Snd.start(),{once:true});
{const b=document.getElementById("snd");if(b){b.textContent=Snd.isOn()?"🔊":"🔇";b.onclick=()=>{b.textContent=Snd.toggle()?"🔊":"🔇"}}}
// ---------- modal genérico ----------
const XQ=[];let XBUSY=false;
function nextOverlay(){if(XBUSY)return;if(XQ.length&&$("flash").style.display==="grid"&&$("flash").className!=="dim")return setTimeout(nextOverlay,600);const f=XQ.shift();if(f){XBUSY=true;f(()=>{XBUSY=false;nextOverlay()})}}
function modal(html,id){const el=$("xo");el.innerHTML='<div class="xbox" id="'+(id||"")+'">'+html+'</div>';el.style.display="grid";el.scrollTop=0;return el}
const closeModal=()=>{$("xo").style.display="none"};
// ---------- MECÁNICA POR DEPARTAMENTO ----------
const DM={
 "ahuachapan":{n:"Cosecha de café",d:"El chocolate caliente paga +$0.25 extra",tip:0,drink:{chocolate:1}},
 "santa-ana":{n:"Pueblo devoto",d:"+10 % de paciencia",pat:1.1},
 "sonsonate":{n:"Turismo de playa",d:"+20 % de clientes, −10 % de paciencia",spawn:1.2,pat:.9},
 "la-libertad":{n:"Surfistas con hambre",d:"+15 % de clientes y la cebada paga +$0.25",spawn:1.15,drink:{cebada:1}},
 "chalatenango":{n:"Montaña tranquila",d:"−15 % de clientes pero +$0.25 de propina",spawn:.85,tip:1},
 "san-salvador":{n:"Hora pico",d:"+30 % de clientes, −10 % de paciencia",spawn:1.3,pat:.9},
 "cuscatlan":{n:"Lago y pesca",d:"La horchata paga +$0.25 extra",drink:{horchata:1}},
 "la-paz":{n:"Costa del Sol",d:"+20 % de clientes",spawn:1.2},
 "cabanas":{n:"Pueblo de cerros",d:"+15 % de paciencia, −10 % de clientes",pat:1.15,spawn:.9},
 "san-vicente":{n:"Pueblo de la Torre",d:"+$0.25 de propina",tip:1},
 "usulutan":{n:"Puerto pesquero",d:"+25 % de clientes, −15 % de paciencia",spawn:1.25,pat:.85},
 "san-miguel":{n:"Capital del Carnaval",d:"+$0.25 de propina y +10 % de clientes",tip:1,spawn:1.1},
 "morazan":{n:"Memoria y paz",d:"+20 % de paciencia",pat:1.2},
 "la-union":{n:"Puerto del Golfo",d:"+15 % de clientes, +$0.25 de propina",spawn:1.15,tip:1}};
// ---------- EVENTOS DEL DÍA ----------
const EVS=[
 {id:"feria",e:"🎪",n:"Feria patronal",d:"+50 % de clientes",spawn:1.5,pat:.95},
 {id:"lluvia",e:"🌧️",n:"Lluvia de la tarde",d:"−25 % de clientes, más paciencia",spawn:.75,pat:1.25},
 {id:"futbol",e:"⚽",n:"Juega la Selección",d:"+35 % de clientes con prisa",spawn:1.35,pat:.85},
 {id:"apagon",e:"🔦",n:"Apagón en el barrio",d:"El comal cocina más lento",cook:.8,pat:.9},
 {id:"carnaval",e:"🎭",n:"Desfile de carnaval",d:"+$0.50 de propina",tip:2,spawn:1.2},
 {id:"inspec",e:"🧼",n:"Inspección sanitaria",d:"+$0.25 de propina si todo está limpio",tip:1,pat:.9},
 {id:"escuela",e:"🚌",n:"Excursión escolar",d:"+40 % de clientes pacientes",spawn:1.4,pat:1.1},
 {id:"quincena",e:"💵",n:"Día de quincena",d:"+25 % de clientes, +$0.25 de propina",spawn:1.25,tip:1},
 {id:"siguanaba",e:"🌙",n:"Noche de la Siguanaba",d:"Poca gente y con miedo",spawn:.85,pat:.8},
 {id:"cipitio",e:"🧒",n:"Visita del Cipitío",d:"Te deja $5 en el comal",tip:1,gift:5}];
function MODS(){if(DUELX)return{spawn:1,pat:1,cook:1,tip:0};ensureC();const E=S.ev||{},D=DM[G.dep]||{},up=CAMP.up;
  return{spawn:(E.spawn||1)*(D.spawn||1)*(up.cartel?1.25:1),pat:(E.pat||1)*(D.pat||1)*(up.vent?1.12:1),cook:E.cook||1,tip:(E.tip||0)+(D.tip||0)+(up.radio?1:0)}}
function drinkBonus(dr){const D=DM[G.dep];return dr&&D&&D.drink&&D.drink[dr]?D.drink[dr]:0}
// ---------- CLIENTES FRECUENTES ----------
function pickClient(){ensureC();const PL=pool(),reg=PL.filter(p=>CAMP.aff[pid(p)]>0);
  if(reg.length&&Math.random()<.35)return reg[Math.floor(Math.random()*reg.length)];return PL[Math.floor(Math.random()*PL.length)]}
const affLvl=p=>CAMP.aff&&CAMP.aff[pid(p)]||0;
function tipBonus(cl){if(DUELX)return 0;const a=affLvl(cl.p);return a>=5?2:a>=3?1:0}
function onServed(cl,v,i){ensureC();const k=pid(cl.p),before=CAMP.aff[k]||0;CAMP.aff[k]=before+1;
  CAMP.combo++;CAMP.best=Math.max(CAMP.best,CAMP.combo);let extra=0;
  if(CAMP.combo>=3&&CAMP.combo%3===0){extra=Math.min(3,CAMP.combo/3)*(!DUELX&&typeof BAL!=="undefined"?.5:1);S.money+=extra;Snd.play("combo");PT.push({s:"COMBO ×"+CAMP.combo+" +"+fm(extra),x:CX[1],y:300,l:0,col:"#e8892a"})}
  for(let n=0;n<5;n++)PT.push({s:"★",x:CX[i]-60+n*30,y:300+(n%2)*20,l:8,col:"#f6c344"});
  if(before<3&&CAMP.aff[k]>=3){PT.push({s:"♥ ¡Cliente frecuente!",x:CX[1],y:250,l:0,col:"#d8392b"});say(cl.p.occupation+" ya es cliente frecuente: te dará propina extra.");flash({tag:"Clientela fiel",e:"♥",h:"Un vecino ("+cl.p.occupation.toLowerCase()+", "+cl.p.age+" años) ya no puede vivir sin la pupusa del alcalde",ms:4500})}
  if(before<5&&CAMP.aff[k]>=5){PT.push({s:"♥♥ ¡Promotor!",x:CX[1],y:250,l:0,col:"#d8392b"});say(cl.p.occupation+" ahora promueve tu candidatura.");flash({tag:"Campaña",e:"📣",h:"Vecino ("+cl.p.occupation.toLowerCase()+") promueve la candidatura de Alcalde Pupusa en "+(cl.p.municipality||muni()),ms:4500})}
  Snd.play("coin")}
function onLost(cl){ensureC();CAMP.combo=0;Snd.play("lost");const k=pid(cl.p);if(CAMP.aff[k]>0)CAMP.aff[k]--}
function onWrong(){CAMP.combo=0;Snd.play("bad")}
function popBonus(v,c){ensureC();const a=CAMP.aff[pid(v)]||0;return(a>=5?.12:a>=3?.07:a>=1?.03:0)+Math.max(-.06,Math.min(.1,CAMP.pop*.005))}
// ---------- MEJORAS DE LA PUPUSERÍA ----------
const UPS=[{id:"cartel",e:"🪧",n:"Cartel nuevo",d:"+25 % de clientes",c:21},{id:"vent",e:"🌀",n:"Ventilador",d:"+12 % de paciencia",c:15},{id:"ayud",e:"🧑‍🍳",n:"Ayudante del comal",d:"Tira solo las pupusas quemadas (sin multa)",c:24},{id:"radio",e:"📻",n:"Radio con marimba",d:"+$0.25 de propina en cada venta",c:30}];
function showShop(back){ensureC();
  const rows=UPS.map(u=>{const have=CAMP.up[u.id];return`<div class="card${have?" done":""}"><div class="ct"><span class="em">${u.e}</span><b>${u.n}</b></div><p class="cd">${u.d}</p><button data-u="${u.id}" ${have||G.treasury<u.c?"disabled":""}>${have?"Comprada ✓":"Comprar · "+fm(u.c)}</button></div>`}).join("");
  modal(`<h2>🛠️ Mejorar la pupusería</h2><p class="sub">Caja: <b>${fm(G.treasury)}</b>. Cada mejora te cuesta plata que no podés invertir en el municipio: ¡elegí bien!</p><div class="grid">${rows}</div><button class="next" id="xc">Cerrar</button>`);
  document.querySelectorAll("[data-u]").forEach(b=>b.onclick=()=>{const u=UPS.find(x=>x.id===b.dataset.u);if(CAMP.up[u.id]||G.treasury<u.c)return;G.treasury-=u.c;CAMP.up[u.id]=1;Snd.play("build");saveGame();if(typeof Town3D!=="undefined"&&Town3D.setShop&&$("t3")&&$("t3").firstChild){Town3D.setShop(CAMP.up);Town3D.focus("shop");setTimeout(()=>{if($("t3")&&$("t3").firstChild)Town3D.focus(G.sel)},4500)}flash({tag:"Mejoras",e:u.e,h:"Pupusería estrena "+u.n.toLowerCase()+": "+u.d.toLowerCase(),sub:"Inversión de "+fm(u.c)});showShop(back);if(back)back()});
  $("xc").onclick=()=>{closeModal();if(back)back()}}
// ---------- DILEMAS DEL ALCALDE ----------
const DIL=[
 {e:"🥤",t:"Una empresa de bebidas te ofrece $30 por poner su rótulo gigante en tu pupusería.",o:[["Aceptar el dinero",40,-3,"La gente murmura que te vendiste."],["Rechazar",0,3,"“Ese sí es de los nuestros”, dicen en la plaza."]]},
 {e:"🧾",t:"Un vecino pide fiado pupusas para toda su cuadra hasta fin de mes.",o:[["Fiar a la cuadra",-10,3,"La cuadra entera te agradece."],["No fiar",0,-1,"Algunos fruncen el ceño."]]},
 {e:"🏗️",t:"Un contratista ofrece una obra barata, pero con materiales dudosos y un “detallito” para ti.",o:[["Aceptar el sobre",25,-5,"El periódico huele el escándalo."],["Exigir licitación limpia",-5,3,"Te ganas fama de honesto."]]},
 {e:"🎉",t:"La comisión de fiestas patronales pide patrocinio para la feria.",o:[["Patrocinar la feria",-15,4,"La feria lleva tu nombre en la manta."],["Decir que no",0,-2,"Te critican en el chat de la colonia."]]},
 {e:"🎤",t:"Un periodista quiere una entrevista justo en hora pico de la pupusería.",o:[["Dar la entrevista",-5,2,"Sales sonriente en el noticiero."],["“Estoy cocinando”",5,0,"Vendiste más, pero te llaman distante."]]},
 {e:"🛒",t:"Una vendedora ambulante trabaja sin permiso frente al mercado.",o:[["Multarla",5,-3,"Los vendedores te dan la espalda."],["Ayudarla a formalizarse",-10,4,"Corre la voz entre los comerciantes."]]},
 {e:"🗳️",t:"Un partido rival te ofrece un puesto seguro si dejás de lado a tu movimiento.",o:[["Aceptar el puesto",10,-4,"Te acusan de traición."],["Seguir independiente",0,4,"“Pupusa no se vende”, escriben en una pared."]]},
 {e:"🔧",t:"El comal viejo se rajó. Un técnico cobra $10 por repararlo ya.",o:[["Pagar la reparación",-10,1,"El comal queda como nuevo."],["Aguantar con el comal rajado",0,-1,"Las pupusas salen con un lado más oscuro."]]}];
function dilemmaDue(){return CAMP.gd>0&&CAMP.gd%4===2}
function showDilemma(done){ensureC();const i=CAMP.dil.length%DIL.length,d=DIL[i];CAMP.dil.push(i);
  modal(`<div class="xh"><span class="st">DILEMA DEL ALCALDE</span></div><h2>${d.e} ¿Qué hacés?</h2><p class="q">${d.t}</p><div class="opts">${d.o.map((o,k)=>`<button data-o="${k}"><b>${o[0]}</b><small>${o[1]?(o[1]>0?"+$":"−$")+Math.abs(o[1])+" · ":""}${o[2]>0?"+":"−"}${Math.abs(o[2])} popularidad</small></button>`).join("")}</div>`);
  document.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{const k=+b.dataset.o,o=d.o[k];G.treasury=Math.max(0,G.treasury+o[1]);CAMP.pop+=o[2];Snd.play(o[2]>0?"vote":"bad");saveGame();closeModal();
    flash({now:1,big:1,tag:o[2]>0?"Aprobación al alza":"Polémica",e:d.e,h:DH[i%DH.length][k],p:o[3],sub:(o[1]?(o[1]>0?"+$":"−$")+Math.abs(o[1])+" en la caja · ":"")+"Popularidad "+(CAMP.pop>=0?"+":"")+CAMP.pop,onClose:done})})}
// ---------- HISTORIA ----------
const CH={abu:{a:"👵",n:"Doña Chelita"},riv:{a:"🧑‍💼",n:"Lic. Marta Quintanilla"},cip:{a:"🧒",n:"El Cipitío"},sig:{a:"🌙",n:"La Siguanaba"},nar:{a:"📻",n:"Locutor de la radio"}};
const SCN={
 intro:()=>[["abu","Mijo, esta pupusería fue de tu abuelo. Acá se cocina con paciencia: la pupusa no se quema, se deja dorar."],["abu","Y el pueblo te eligió alcalde. Pero ojo: el pueblo come primero y vota después."],["riv","¡Un alcalde de pupusería! Qué simpático. Veremos cuánto aguantás."],["abu","Vendé pupusas, arreglá la alcaldía y que la gente vea resultados. Empezá por lo que más duela."]],
 obra1:()=>[["abu","¡Mirá eso! La gente ya lo nota. Así empieza todo: una obra, un voto, una pupusa."]],
 dep:d=>[["nar","Hoy en "+d.cab+": "+d.n+"."],["riv","Acá todos conocen mi apellido, alcalde. "+d.cab+" no se gana con pupusas."],["abu","Acá van a conocer tu sazón. Escuchá a la gente, que ella te dice qué arreglar."]],
 interna:d=>[["abu","Llegó la hora de las internas: el movimiento elige a su candidato. Y la gente de "+d.dep+" decide."]],
 winint:d=>[["abu","¡Ganaste! Ahora te piden que gestionés todo "+d.dep+". Cada petición atendida es un voto más."]],
 prim:()=>[["riv","Las primarias nacionales… no te vayás a marear con la altura, alcalde."]],
 pres:()=>[["abu","Mijo, desde esta cocina llegaste lejos. Que no se te queme la presidencia."],["riv","Nos vemos en las urnas. Que gane el mejor… o la mejor."]],
 epi:()=>[["abu","Tu abuelo estaría orgulloso… y yo también, Señor Presidente."],["nar","Edición extra: el Presidente Pupusa sigue cocinando para su pueblo."]],
 cipitio:()=>[["cip","¡Pssst! Dejé unas moneditas en tu comal. No me preguntés de dónde."]],
 siguanaba:()=>[["sig","Es tarde para andar solo, alcalde… dicen que la gente de hoy tiene miedo de salir."]]};
const Story={play(key,done,arg){ensureC();const f=SCN[key];if(!f||(CAMP.story[key]&&!/^(cipitio|siguanaba)$/.test(key)&&key!=="dep"))return done&&done();
    const sk=key==="dep"?"dep:"+(arg&&arg.id):key;if(key==="dep"){if(CAMP.story[sk])return done&&done();}CAMP.story[sk]=1;
    const L=f(arg);let i=0;const el=$("story");el.style.display="grid";
    const show=()=>{const[w,t]=L[i],c=CH[w];el.innerHTML=`<div class="sbox"><div class="sp">${c.a}</div><div class="sd"><b>${c.n}</b><p id="stx"></p><small>Tocá para continuar ${i+1}/${L.length}</small></div></div>`;
      let n=0;const tx=$("stx"),iv=setInterval(()=>{n+=2;tx.textContent=t.slice(0,n);if(n>=t.length)clearInterval(iv)},22);
      el.onclick=()=>{clearInterval(iv);if(tx.textContent.length<t.length){tx.textContent=t;n=t.length;return}i++;if(i>=L.length){el.style.display="none";el.onclick=null;done&&done()}else show()}};show()}};
// ---------- INTRODUCCIÓN DEL DÍA (mecánica + evento) ----------
function dayIntro(){ensureC();
  const r=Math.abs((CAMP.gd*2654435761)%100)/100;S.ev=r<.6?EVS[(CAMP.gd*7+(G.dep||"").length)%EVS.length]:null;
  const D=DM[G.dep];if(S.ev&&S.ev.gift){S.money+=S.ev.gift;}
  PAUSED=true;
  const ev=S.ev?`<div class="evb ev"><span>${S.ev.e}</span><div><b>${S.ev.n}</b><small>${S.ev.d}</small></div></div>`:`<div class="evb"><span>☀️</span><div><b>Día normal</b><small>Sin sorpresas hoy</small></div></div>`;
  const dm=D?`<div class="evb dm"><span>${depOf(G.dep).e}</span><div><b>${D.n}</b><small>${D.d}</small></div></div>`:"";
  const regs=pool().filter(p=>affLvl(p)>=3).length;
  const ups=Object.keys(CAMP.up).length;
  const el=modal(`<div class="xh"><span class="st">DÍA ${G.days+1} · ${muni().toUpperCase()}</span></div><h2>¡A cocinar!</h2>${dm}${ev}${regs?`<p class="hint">♥ ${regs} cliente${regs>1?"s":""} frecuente${regs>1?"s":""} en ${muni()} podrían pasar hoy.</p>`:""}<p class="hint">Tip: servir sin errores acumula combos con bono.</p><button class="next" id="xc">🫓 Empezar el día</button>`,"dayi");
  Snd.play("news");
  const go=()=>{closeModal();PAUSED=false;if(S.ev&&S.ev.id==="cipitio")Story.play("cipitio");else if(S.ev&&S.ev.id==="siguanaba")Story.play("siguanaba")};
  $("xc").onclick=go}
// ---------- PANEL TU ELECTORADO ----------
function showElectorate(back){ensureC();
  const d=G.dep?depOf(G.dep):null,V=electorate(d,600),c=ctxFor(d?"dep":"pres",d),tot=V.length;
  const cnt=(f)=>V.filter(f).length,pc=n=>Math.round(n/tot*100);
  const occ={};V.forEach(v=>{const k=v.occupation;(occ[k]=occ[k]||{t:0,y:0});occ[k].t++;if(voteScore(v,c)>c.rival)occ[k].y++});
  const top=Object.entries(occ).sort((a,b)=>b[1].t-a[1].t).slice(0,5);
  const age=[["18–34",v=>v.age<35],["35–54",v=>v.age>=35&&v.age<55],["55+",v=>v.age>=55]];
  const bar=(l,p,col)=>`<div class="eb"><span>${l}</span><i><b style="width:${p}%;background:${col||"#2a7a3a"}"></b></i><em>${p} %</em></div>`;
  const reg=Object.values(CAMP.aff).filter(a=>a>=3).length,pro=Object.values(CAMP.aff).filter(a=>a>=5).length;
  modal(`<h2>🧑‍🤝‍🧑 Tu electorado</h2><p class="sub">${d?"Departamento de "+d.dep:"Todo el país"} · ${tot} votantes simulados a partir de ${P.length} personas de Nemotron-Personas-El-Salvador</p>
  <h4>Edad</h4>${age.map(a=>bar(a[0],pc(cnt(a[1])))).join("")}<h4>Sexo</h4>${bar("Mujeres",pc(cnt(v=>/fem/i.test(v.sex))),"#c43b7a")}${bar("Hombres",pc(cnt(v=>!/fem/i.test(v.sex))),"#2f78c4")}<h4>Zona</h4>${bar("Rural",pc(cnt(v=>areaOf(v)==="Rural")),"#8a7a2a")}${bar("Urbana",pc(cnt(v=>areaOf(v)==="Urbana")),"#5a6a7a")}
  <h4>Ocupaciones principales y apoyo al alcalde</h4>${top.map(([k,x])=>`<div class="eb"><span>${k}</span><i><b style="width:${Math.round(x.y/x.t*100)}%"></b></i><em>${Math.round(x.y/x.t*100)} %</em></div>`).join("")}
  <p class="hint">♥ ${reg} cliente${reg===1?"":"s"} frecuente${reg===1?"":"s"} · ${pro} promotor${pro===1?"":"es"} · popularidad ${CAMP.pop>=0?"+":""}${CAMP.pop}</p><button class="next" id="xc">Cerrar</button>`);
  $("xc").onclick=()=>{closeModal();if(back)back()}}
// ---------- GUARDADO ----------
const SKEY="pupSaveV1";
function saveGame(){if(DUELX)return;try{ensureC();const rep=(k,v)=>v&&typeof v==="object"&&v.pedido&&!Array.isArray(v)?{__p:pid(v)}:v;
  localStorage.setItem(SKEY,JSON.stringify({G,SAVE,CAMP},rep))}catch(e){}}
function loadGame(){try{const raw=localStorage.getItem(SKEY);if(!raw)return false;const ix=PIDX();
  const d=JSON.parse(raw,(k,v)=>v&&v.__p?(ix[v.__p]||P[0]):v);if(!d||!d.G)return false;
  G=d.G;SAVE=d.SAVE||{};CAMP=Object.assign({gd:0,rank:null,prim:0,pres:0},d.CAMP||{});if(G.dep)SAVE[G.dep]=G;S=mkDay();PAUSED=true;DAYON=false;return true}catch(e){return false}}
const hasSave=()=>{try{return!!localStorage.getItem(SKEY)}catch(e){return false}};
function newCampaign(){try{localStorage.removeItem(SKEY)}catch(e){}newGame()}
// ---------- MODO DEMO ----------
function startDemo(){
  newGame();ensureC();const mk=(id,extra)=>Object.assign(freshG(),{dep:id,days:5,earned:210,treasury:20,built:{salud:1,edu:1,mercado:1,caminos:1,puente:1,agua:1},welfare:70,log:["demo"],seen:P.slice(0,8),fin:1,won:1,led:1,pets:[]},extra||{});
  ["ahuachapan","santa-ana","sonsonate","la-libertad"].forEach(id=>SAVE[id]=mk(id));
  const cur=Object.assign(freshG(),{dep:"san-salvador",days:3,earned:90,treasury:60,built:{salud:1,edu:1,mercado:1},welfare:40,seen:P.slice(0,8),log:["demo"]});
  SAVE["san-salvador"]=cur;G=cur;
  CAMP=Object.assign(CAMP,{gd:24,prim:1,pres:0,pop:8,up:{cartel:1,vent:1},story:{intro:1,obra1:1}});
  P.slice(0,6).forEach((p,i)=>CAMP.aff[pid(p)]=[6,5,4,3,2,1][i]);
  S=mkDay();PAUSED=true;DAYON=false;saveGame();showDeps("menu")}
// ---------- TARJETA PARA COMPARTIR ----------
function cardStats(){const T=campTotals(),led=Object.values(SAVE).filter(g=>g.led).length;
  const title=CAMP.pres?"Presidente Pupusa":CAMP.prim?"Candidato presidencial":led?"Líder departamental":G.fin?"Alcalde ejemplar":"Alcalde Pupusa";
  return{title,lines:[T.obras+" obras entregadas",led+" departamento"+(led===1?"":"s")+" liderado"+(led===1?"":"s"),CAMP.gd+" días de trabajo",(T.served||0)+" vecinos servidos","Mejor racha: ×"+(CAMP.best||0)]}}
function drawCard(){const cv=document.createElement("canvas");cv.width=1080;cv.height=1350;const c=cv.getContext("2d"),st=cardStats();
  const gr=c.createLinearGradient(0,0,0,1350);gr.addColorStop(0,"#2f5fb5");gr.addColorStop(.5,"#ffffff");gr.addColorStop(1,"#2f5fb5");c.fillStyle=gr;c.fillRect(0,0,1080,1350);
  c.fillStyle="#fbe9c6";c.strokeStyle="#3a1f10";c.lineWidth=14;c.beginPath();c.roundRect(60,60,960,1230,48);c.fill();c.stroke();
  c.textAlign="center";c.fillStyle="#3a1f10";c.font="800 56px 'Baloo 2',sans-serif";c.fillText("PUPUSERÍA DEL PUEBLO",540,160);
  c.font="400 330px serif";c.fillText("🫓",540,520);
  c.fillStyle="#c42f22";let fs=100;c.font="800 "+fs+"px 'Baloo 2',sans-serif";while(c.measureText(st.title).width>860&&fs>40){fs-=4;c.font="800 "+fs+"px 'Baloo 2',sans-serif"}c.fillText(st.title,540,660);
  c.fillStyle="#3a1f10";c.font="700 54px 'Baloo 2',sans-serif";st.lines.forEach((l,i)=>c.fillText(l,540,760+i*84));
  c.fillStyle="#2a7a3a";c.font="800 44px 'Baloo 2',sans-serif";c.fillText("Datos: Nemotron-Personas-El-Salvador",540,1220);
  c.fillStyle="#3a1f10";c.font="700 34px 'Baloo 2',sans-serif";c.fillText("Un juego de cocina, alcaldía y política salvadoreña",540,1262);return cv}
function showCard(back){const cv=drawCard();cv.style.cssText="width:100%;max-width:360px;border:4px solid #3a1f10;border-radius:16px";
  modal(`<h2>🏆 Mi tarjeta de campaña</h2><div id="cardw" style="text-align:center"></div><div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:10px"><button class="next" id="cdl">⬇️ Descargar imagen</button><button class="next" id="csh" style="background:#1f5fa8">📤 Compartir</button><button class="next" id="xc" style="background:#6b4a2c">Cerrar</button></div>`);
  $("cardw").appendChild(cv);
  $("cdl").onclick=()=>cv.toBlob(b=>{const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="pupuseria-del-pueblo.png";a.click()});
  $("csh").onclick=()=>cv.toBlob(async b=>{try{const f=new File([b],"pupuseria.png",{type:"image/png"});if(navigator.canShare&&navigator.canShare({files:[f]}))await navigator.share({files:[f],title:"Pupusería del Pueblo"});else{const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="pupuseria-del-pueblo.png";a.click()}}catch(e){}});
  $("xc").onclick=()=>{closeModal();if(back)back()}}

// ---------- PERIÓDICO FLOTANTE (titulares de todo lo que pasa) ----------
const FQ=[];let FBUSY=false,FT=null;
const busyScreen=()=>$("news").style.display==="grid"||$("xo").style.display==="grid"||$("story").style.display==="grid";
function flash(n){FQ.push(n);if(!FBUSY)flashNext()}
function flashNext(){if(!FQ.length){FBUSY=false;$("flash").style.display="none";return}
  const n=FQ[0];if(!n.now&&busyScreen()){FBUSY=true;return setTimeout(flashNext,700)}
  FQ.shift();FBUSY=true;const el=$("flash");el.className=n.big?"dim":"";
  el.innerHTML=`<div class="fp"><div class="fm">El Diario del Pueblo</div><span class="ft">${n.tag||"Última hora"}</span><h3><span class="fe">${n.e||"📰"}</span>${n.h}</h3>${n.p?`<p>${n.p}</p>`:""}${n.q?`<p class="fq">“${n.q}”</p>`:""}${n.sub?`<small>${n.sub}</small>`:""}${n.big?'<button id="fcl">'+(n.btn||"Continuar")+'</button>':'<small style="text-align:center;margin-top:4px">toca para cerrar</small>'}</div>`;
  el.style.display="grid";Snd.play("news");
  let closed=false;const close=()=>{if(closed)return;closed=true;clearTimeout(FT);el.style.display="none";if(n.onClose)n.onClose();setTimeout(flashNext,250)};
  el.querySelector(".fp").onclick=close;if(!n.big)FT=setTimeout(close,n.ms||7000)}
const confirmBox=(msg,yes)=>{modal(`<h2>${msg}</h2><div style="display:flex;gap:10px;justify-content:center;margin-top:12px"><button class="next" id="cy" style="margin:0">Sí</button><button class="next" id="cn" style="margin:0;background:#6b4a2c">No</button></div>`);$("cy").onclick=()=>{closeModal();yes()};$("cn").onclick=closeModal};
const DH=[["Alcalde Pupusa acepta $30 de una gaseosera y el pueblo murmura","Alcalde Pupusa rechaza patrocinio millonario: “mi comal no se vende”"],["Alcalde fía pupusas a toda una cuadra: “después se arregla”","Alcalde no fía y algunos vecinos fruncen el ceño"],["Escándalo: alcalde aceptó un “detallito” de un contratista","Alcalde exige licitación limpia y gana fama de honesto"],["Alcalde patrocina la feria patronal y su nombre luce en la manta","Alcalde niega patrocinio y le llueven críticas en el chat de la colonia"],["Alcalde da entrevista en plena hora pico y sale sonriente en el noticiero","“Estoy cocinando”: alcalde no atiende a la prensa y lo tachan de distante"],["Alcalde multa a vendedora ambulante frente al mercado","Alcalde ayuda a vendedora a formalizarse y corre la voz en el mercado"],["Alcalde acepta puesto seguro de un partido rival: lo acusan de traición","“Pupusa no se vende”: alcalde sigue independiente"],["Alcalde paga la reparación y el comal queda como nuevo","Alcalde aguanta con comal rajado: pupusas salen oscuras de un lado"]];

// ---------- el puesto cambia a la vista: obras y mejoras dibujadas en la cocina ----------
function drawLife(g){if(DUELX||!G)return;const B=G.built||{},U=(CAMP&&CAMP.up)||{},f=fr;
  if(B.caminos)[330,545].forEach(x=>{box(g,x-4,300,8,100,3,"#3a3f44",3);box(g,x-15,284,30,18,7,"#fff2a8",3);g.globalAlpha=.18+.05*Math.sin(f/8);circ(g,x,293,40,"#fff2a8",0);g.globalAlpha=1});
  if(B.agua){ell(g,480,402,0,0,"#0000",0);ell(g,635+0,398,38,11,"#9ad8f2",3);box(g,628,352,14,46,4,"#d8d2c4",3);circ(g,635,350,9,"#ffe9a8",3);
    for(let n=0;n<7;n++){const t=((f+n*6)%30)/30,a=-1.2+n*.4;g.fillStyle="#7ac8ee";g.beginPath();g.arc(635+Math.sin(a)*t*34,350+(-t*(1-t)*4*30)+t*t*40,3.5,0,7);g.fill()}}
  if(B.mercado){g.save();g.translate(653,0);box(g,12,350,56,46,4,"#f2c24a",3);for(let i=0;i<4;i++)poly(g,[[12+i*14,350],[26+i*14,350],[22+i*14,334],[16+i*14,334]],i%2?"#fff4dc":"#d8392b",2);box(g,18,372,44,24,3,"#b0703a",2);circ(g,30,368,6,"#e8892a",2);circ(g,46,368,6,"#6cc070",2);g.restore()}
  if(B.salud){box(g,885,344,64,52,6,"#ffffff",3);box(g,912,352,10,36,2,"#d8392b",0);box(g,899,365,36,10,2,"#d8392b",0)}
  if(B.edu){for(let k=0;k<2;k++){const x=905+k*28,y=398-Math.abs(Math.sin(f/5+k*2))*6;circ(g,x,y-18,8,"#f2c9a0",2);box(g,x-8,y-10,16,22,4,k?"#2f78c4":"#e86ab0",2);box(g,x-13,y-8,7,14,3,"#c4502f",2)}}
  if(B.puente){const x=(f*1.6)%1200-120;g.save();box(g,x,182,70,24,5,"#e8452b",3);box(g,x+6,186,58,9,2,"#20384a",0);circ(g,x+14,208,6,"#222",2);circ(g,x+56,208,6,"#222",2);g.restore()}
  if(U.cartel){g.save();g.translate(884,104);g.rotate(-.06);box(g,-52,-24,104,48,14,"#ffd23a",4);g.font="800 17px "+FONT;g.textAlign="center";g.textBaseline="middle";g.fillStyle="#c42f22";g.fillText("PUPUSAS",0,-5);g.font="800 12px "+FONT;g.fillText("★ CALIENTITAS ★",0,13);
    for(let i=0;i<9;i++){g.fillStyle=((f>>3)+i)%2?"#fff":"#ffe36a";g.beginPath();g.arc(-48+i*12,-27+(i%2)*0,3,0,7);g.fill()}g.restore()}
  if(U.vent){g.save();g.translate(46,104);box(g,-6,12,12,40,3,"#888",2);circ(g,0,0,26,"#e8e8e8",3);g.rotate(f*.55);for(let i=0;i<4;i++){g.rotate(Math.PI/2);ell(g,0,-13,6,12,"#7fc4ec",2)}circ(g,0,0,5,"#444",2);g.restore()}
  if(U.ayud){const bob=Math.sin(f/6)*3;box(g,22,402+bob,52,36,8,"#ffffff",3);circ(g,48,388+bob,17,"#f2c9a0",3);box(g,34,356+bob,28,26,6,"#ffffff",3);ell(g,48,356+bob,20,8,"#ffffff",3);circ(g,43,388+bob,2,"#3a1f10",0);circ(g,53,388+bob,2,"#3a1f10",0)}
  if(U.radio){box(g,886,420,56,34,6,"#c44a2a",3);circ(g,903,437,9,"#222",2);circ(g,925,437,9,"#222",2);g.strokeStyle="#222";g.lineWidth=3;g.beginPath();g.moveTo(936,420);g.lineTo(950,396);g.stroke();
    g.font="800 22px "+FONT;g.textAlign="center";[0,1,2].forEach(n=>{const t=((f+n*14)%42)/42;g.globalAlpha=1-t;g.fillStyle=["#e86ab0","#f6a31c","#2f9ae8"][n];g.fillText("♪",900+n*24+Math.sin(t*6)*8,410-t*58)});g.globalAlpha=1}
}
// ---------- fin de jornada: dilemas, historia, guardado ----------
function afterDay(){ensureC();saveGame();if(G.hl)flash({tag:"Última hora · Día "+G.hl.d,e:G.hl.e,h:G.hl.h,sub:G.hl.sub,ms:8000});
  if(S.ev)flash({tag:"Crónica del día",e:S.ev.e,h:S.ev.n+" en "+muni()+": "+S.ev.d.toLowerCase(),sub:"Servidos hoy: "+S.served,ms:6000});
  if(dilemmaDue())XQ.push(done=>showDilemma(done));
  if(!NQ.length&&XQ.length)setTimeout(nextOverlay,700)}
function onBuild(k){ensureC();Snd.play("build");{const b=BUILD[k],ndone=Object.keys(G.built).length;flash({tag:"Obra entregada",e:b.e,h:"Alcalde Pupusa entrega "+b.n.toLowerCase()+" en "+muni(),p:b.d+".",sub:"Obras "+ndone+"/"+Object.keys(BUILD).length+" · Bienestar "+G.welfare+" · Caja "+fm(G.treasury),ms:6500})}if(Object.keys(G.built).length===1)Story.play("obra1");saveGame()}
// ---------- PANTALLA DE INICIO + CÓMO USAMOS NEMOTRON ----------
function showNemotron(back){const q=P[Math.floor(Math.random()*P.length)];
  modal(`<h2>🧠 Cómo usamos Nemotron</h2><p class="sub">Todo el juego corre en tu navegador, sin API ni modelos en línea. El dataset <b>Nemotron-Personas-El-Salvador</b> (NVIDIA, CC-BY-4.0) pone a la gente:</p>
  <div class="evb"><span>🫓</span><div><b>Cada cliente es una persona real del dataset</b><small>Su ocupación, edad y municipio salen del registro; su pedido y su paciencia dependen de su perfil.</small></div></div>
  <div class="evb"><span>🏗️</span><div><b>Las necesidades del municipio salen de quién te visita</b><small>Más adultos mayores atendidos → la unidad de salud es más urgente; más jóvenes → la escuela.</small></div></div>
  <div class="evb"><span>🗳️</span><div><b>Los votantes son clones de esas personas</b><small>Votan según las obras que les importan, si los conociste en la pupusería y su departamento.</small></div></div>
  <div class="evb dm"><span>👤</span><div><b>Ejemplo de persona (${P.length} cargadas)</b><small>${q.occupation}, ${q.age} años${q.municipality?" · "+q.municipality:""}${q.persona?"<br>“"+q.persona+"”":""}</small></div></div>
  <button class="next" id="xc">Entendido</button>`);$("xc").onclick=()=>{closeModal();if(back)back()}}
function showSplash(){
  modal(`<div style="text-align:center"><img src="assets/portada.jpg" alt="Pupusería del Pueblo" style="width:100%;border:4px solid #3a1f10;border-radius:14px;display:block;margin-bottom:8px" onerror="this.outerHTML='<div style=font-size:4rem>🫓🏛️🇸🇻</div><h2>Pupusería del Pueblo</h2>'">
  <p class="q">Sos dueño de una pupusería y alcalde: cocina contra reloj, arreglá tu municipio con las ganancias y escalá hasta ser <b>Presidente Pupusa</b>.</p>
  <p class="hint">Tus clientes y votantes son personas de <b>Nemotron-Personas-El-Salvador</b>.</p>
  <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center"><button class="next" id="sp1" style="margin:0">🫓 Jugar</button><button class="next" id="sp2" style="margin:0;background:#2a7a3a">⚡ Demo de 3 minutos</button><button class="next" id="sp3" style="margin:0;background:#1f5fa8">🧠 Cómo usamos Nemotron</button></div></div>`,"splash");
  $("sp1").onclick=()=>{closeModal()};$("sp2").onclick=()=>{closeModal();startDemo()};$("sp3").onclick=()=>showNemotron(showSplash)}
// ---------- arranque: cargar partida o demo cuando el dataset ya está listo ----------
Promise.resolve(typeof clientesListos!=="undefined"?clientesListos:null).catch(()=>{}).then(()=>{
  try{if(/[?&]demo/.test(location.search))startDemo();else if(hasSave()&&loadGame())showMenu();else showSplash()}catch(e){}});
