// SORPRESAS durante la jornada: perro ladrón (tocalo!), mariachi, comal a todo fuego, cámara de TV.
const SORPS={
  mariachi:{e:"🎺",n:"¡MARIACHI!",d:"Clientes más pacientes y +$0.25 por pupusa",dur:14},
  fuego:{e:"🔥",n:"¡COMAL A TODO FUEGO!",d:"Cocina el doble de rápido… ¡cuidado con quemar!",dur:11},
  tele:{e:"📺",n:"¡CÁMARA DE TV!",d:"Todo lo que servís paga 50 % más",dur:12},
  perro:{e:"🐕",n:"¡UN PERRO!",d:"¡Tocalo antes de que se robe tu pupusa!",dur:0}};
let SP=null,DOG=null,SPN=0,SPT=999;
function sorpReset(){SP=null;DOG=null;SPN=0;SPT=999}
function sorpStart(id){const d=SORPS[id];Snd&&Snd.play("bell");
  if(id==="perro"){DOG={x:-50,y:438,sp:11+Math.random()*2,hit:0,l:0};SP={id,end:S.t-99,ann:44};say(d.d);return}
  SP={id,end:S.t-d.dur,ann:60,dur:d.dur};say(d.n+" "+d.d)}
function sorpTick(){if(typeof S==="undefined"||!S||PAUSED||(typeof DUELX!=="undefined"&&DUELX))return;
  if(S.t<=0){return}
  if(DOG){DOG.l++;if(DOG.hit){DOG.x+=44;DOG.y-=3;if(DOG.l>DOG.hit+14){DOG=null;SP=null}return}
    DOG.x+=DOG.sp*2.6;
    if(DOG.x>=830){const had=S.plate.r||S.plate.cur||S.plate.dr||S.plate.sal;S.plate={r:null,cur:false,sal:false,dr:null};
      if(had){S.money=Math.max(0,S.money-.5);PT.push({s:"🐕 -$0.50",x:PL.x-40,y:520,l:0,col:"#d8392b"});say("¡El perro se llevó tu plato! (-$0.50)")}else say("El perro pasó y se fue con las ganas.");
      DOG.hit=DOG.l;DOG.x=840;DOG.steal=1}
    return}
  if(SP){if(S.t<=SP.end){say("Se acabó: "+SORPS[SP.id].n.replace(/¡|!/g,"").toLowerCase()+".");SP=null}
    else{if(SP.id==="mariachi")S.clients.forEach(cl=>{if(cl)cl.wait=Math.max(0,cl.wait-.08)});
      if(SP.id==="fuego")S.slots.forEach(s=>{if(s)s.age+=.16})}
    return}
  if(S.rush||S.t>108||S.t<24||SPN>=2||SPT-S.t<22||Math.random()>.012)return;
  const ids=Object.keys(SORPS),id=ids[Math.floor(Math.random()*ids.length)];SPN++;SPT=S.t;sorpStart(id)}
// el toque al perro tiene prioridad sobre el resto de la cocina
cv.addEventListener("click",e=>{if(!DOG||DOG.hit||PAUSED)return;const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*W,y=(e.clientY-r.top)/r.height*H;
  if(Math.abs(x-DOG.x)<=62&&Math.abs(y-DOG.y)<=56){e.stopImmediatePropagation();DOG.hit=DOG.l;S.money+=1;PT.push({s:"¡Chucho! +$1",x:DOG.x,y:DOG.y-40,l:0,col:"#2f9a3a"});if(typeof confetti!=="undefined")confetti(DOG.x,DOG.y,18);Snd.play("combo");say("¡Espantaste al perro! +$1")}},true);
const _onS2=onServed;onServed=function(cl,v,i){_onS2(cl,v,i);if(!SP)return;let x=0;if(SP.id==="mariachi")x=.25;else if(SP.id==="tele")x=Math.round(v*.5*4)/4;
  if(x){S.money+=x;PT.push({s:(SP.id==="tele"?"📺 +":"🎺 +")+fm(x),x:CX[i]+50,y:300,l:0,col:"#8a4fd0"})}};
function dogDraw(c,x,y,hit,fr){const w=Math.sin(fr/2)*5;c.save();c.translate(x,y);if(hit)c.rotate(-.3);
  const O="#3a1f10";c.lineWidth=4.5;c.strokeStyle=O;c.lineJoin="round";
  c.fillStyle="#c58a4a";[-26,-10,14,28].forEach((lx,k)=>{c.beginPath();c.roundRect(lx-5,10,11,24+(k%2?w:-w)*.5,5);c.fill();c.stroke()});
  c.beginPath();c.ellipse(0,0,42,24,0,0,7);c.fill();c.stroke();
  c.beginPath();c.moveTo(-40,-6);c.quadraticCurveTo(-62,-24+w,-54,-34);c.lineWidth=7;c.stroke();c.lineWidth=4.5;c.strokeStyle=O;
  c.fillStyle="#d79d5e";c.beginPath();c.ellipse(46,-16,24,20,0,0,7);c.fill();c.stroke();
  c.fillStyle="#8a5426";c.beginPath();c.ellipse(34,-30,9,18,.4,0,7);c.fill();c.stroke();
  c.fillStyle="#fff";c.beginPath();c.arc(52,-22,6,0,7);c.fill();c.stroke();c.fillStyle=O;c.beginPath();c.arc(54,-22,2.6,0,7);c.fill();
  c.beginPath();c.ellipse(66,-10,7,5,0,0,7);c.fill();
  if(hit){c.font="800 20px Baloo 2, sans-serif";c.textAlign="center";c.fillStyle="#d8392b";c.strokeStyle="#fff";c.lineWidth=4;c.strokeText("¡guau!",30,-52);c.fillText("¡guau!",30,-52)}
  c.restore()}
function drawSorp(c){if(typeof S==="undefined"||!S||(typeof DUELX!=="undefined"&&DUELX))return;
  if(DOG){dogDraw(c,DOG.x,DOG.y,DOG.hit,fr);if(!DOG.hit){c.font="800 15px "+FONT;c.textAlign="center";c.fillStyle=OUT;c.strokeStyle="#fff";c.lineWidth=4;c.strokeText("¡TOCALO!",DOG.x+20,DOG.y-62+Math.sin(fr/3)*3);c.fillText("¡TOCALO!",DOG.x+20,DOG.y-62+Math.sin(fr/3)*3)}}
  if(!SP)return;const d=SORPS[SP.id];
  if(SP.dur){const f=Math.max(0,Math.min(1,(S.t-SP.end)/SP.dur)),cx=36,cy=34;
    c.fillStyle="rgba(255,248,224,.95)";c.beginPath();c.arc(cx,cy,24,0,7);c.fill();c.lineWidth=4;c.strokeStyle=OUT;c.stroke();
    c.beginPath();c.arc(cx,cy,19,-Math.PI/2,-Math.PI/2+f*Math.PI*2);c.lineWidth=5;c.strokeStyle=SP.id==="fuego"?"#e0561e":SP.id==="tele"?"#4a90e0":"#8a4fd0";c.stroke();
    c.font="22px sans-serif";c.textAlign="center";c.textBaseline="middle";c.fillStyle=OUT;c.fillText(d.e,cx,cy+1);
    if(SP.id==="mariachi"){for(let k=0;k<3;k++){const t=(fr*.03+k/3)%1;c.globalAlpha=1-t;c.font="800 20px sans-serif";c.fillStyle="#8a4fd0";c.fillText(k%2?"♪":"♫",cx+34+k*16,cy-8-t*30);c.globalAlpha=1}}
    if(SP.id==="fuego"){c.globalAlpha=.10+.05*Math.sin(fr/3);c.fillStyle="#ff6a1a";c.fillRect(0,476,W,40);c.globalAlpha=1}}
  if(SP.ann>0){SP.ann--;const a=Math.min(1,SP.ann/14),s=1+(SP.ann>50?(SP.ann-50)*.04:0);c.save();c.globalAlpha=a;c.translate(480,300);c.scale(s,s);c.rotate(-.04);
    if(typeof label!=="undefined")label(c,d.e+" "+d.n,0,0,40);c.font="800 20px "+FONT;c.textAlign="center";c.fillStyle="#fff";c.strokeStyle=OUT;c.lineWidth=5;c.strokeText(d.d,0,46);c.fillText(d.d,0,46);c.restore()}}
const _sd=startDay;startDay=function(){_sd.apply(this,arguments);sorpReset()};
