// JUEGO: metas con estrellas, hora pico, clientes VIP, reacciones locales por departamento, confeti y sacudidas.
const REACT={_:["¡Qué rico!","¡Va pues!","¡Sabrosa!"],ahuachapan:["¡Huele a flor!","¡Qué rico, vos!","¡Con cafecito!"],"santa-ana":["¡Divina!","¡Una bendición!","¡Qué volcán de sabor!"],sonsonate:["¡Explotó de rica!","¡Ta' sabrosa, cipote!"],"la-libertad":["¡Qué ola de sabor!","¡Pura vida!","¡Surfeando de rica!"],chalatenango:["¡Calientita pa'l frío!","¡Del cerro a mi plato!"],"san-salvador":["¡Mejor que el tráfico!","¡Está de capital!"],cuscatlan:["¡Suchitoto aprueba!","¡Rica y colonial!"],"la-paz":["¡Despegó de rica!","¡Sabor a playa!"],cabanas:["¡Una sorpresa rica!","¡Hecha a mano!"],"san-vicente":["¡Ya es hora de pupusa!","¡Qué sabor de torre!"],usulutan:["¡Sabor a bahía!","¡Más rica que camarón!"],"san-miguel":["¡Esto es carnaval!","¡Viva San Miguel!"],morazan:["¡Cálida entre la niebla!","¡Perquín aprueba!"],"la-union":["¡Zarpó de rica!","¡Del golfo al comal!"]};
const VIPS=[{n:"Don Diputado",e:"🎩",tip:4,pat:.7,say:"¡Una foto con mis pupusas!"},{n:"Turista gringo",e:"📸",tip:3,pat:1.3,say:"¡Wow, pupusas! So good!"},{n:"Youtuber",e:"🎬",tip:2.5,pat:.8,say:"¡Esto va a ser viral!"},{n:"Doña Chepa",e:"👵",tip:2,pat:2,say:"¡Como las de mi abuela!"},{n:"Chofer de bus",e:"🚌",tip:1.5,pat:.6,say:"¡Rápido que me pitan!"},{n:"Futbolista",e:"⚽",tip:3.5,pat:.9,say:"¡Gol de pupusa!"}];
const maybeVip=p=>{if(typeof S==="undefined"||!S||S.t>112||S.clients.some(c=>c&&c.p.vip)||Math.random()>.13)return p;const v=VIPS[Math.floor(Math.random()*VIPS.length)];return Object.assign({},p,{vip:v})};
let RB=[],CF=[],GOALSHOWN=0;
const goals=()=>{const d=Math.min(G.days||0,12);return[35+d*1.5,55+d*2,75+d*3]};
function rushTick(){if(typeof DUELX!=="undefined"&&DUELX)return;if(!S)return;if(!S.rushDone&&!S.rush&&S.t<85&&S.t>35&&Math.random()<.05){S.rush=1;S.rushEnd=S.t-16;S.rushT=fr;if(typeof Snd!=="undefined")Snd.play("bell");say("¡HORA PICO! Llegan clientes sin parar.")}
  if(S.rush&&S.t<=S.rushEnd){S.rush=0;S.rushDone=1;say("Se calmó la hora pico.")}}
function bubbleSay(i,t,col){RB.push({t,x:CX[i],y:252+(i%2)*6,l:0,c:col||"#fff4dc"})}
function confetti(x,y,n){const C=["#d8392b","#f6c344","#3f9a4f","#4aa8e8","#e86ab0","#f39a2d"];for(let k=0;k<n;k++)CF.push({x,y,vx:(Math.random()-.5)*9,vy:-3-Math.random()*6,c:C[k%6],l:0,r:Math.random()*6})}
const _onServed=onServed;onServed=function(cl,v,i){_onServed(cl,v,i);const id=G.dep,L=REACT[id]||REACT._;let t=L[Math.floor(Math.random()*L.length)];
  if(cl.p.vip){S.money+=cl.p.vip.tip;t=cl.p.vip.say;PT.push({s:cl.p.vip.e+" VIP +"+fm(cl.p.vip.tip),x:CX[i],y:260,l:0,col:"#c98a12"});confetti(CX[i],300,40);Snd.play("combo")}
  bubbleSay(i,t,cl.p.vip?"#ffe9a0":"#fff4dc");confetti(CX[i],330,cl.p.vip?0:14);
  if(CAMP.combo>=3){const el=$("cv");el.classList.remove("pop");void el.offsetWidth;el.classList.add("pop")}};
const _onWrong=onWrong;onWrong=function(){_onWrong();const el=$("cv");el.classList.remove("shake");void el.offsetWidth;el.classList.add("shake")};
const _nameTag=nameTag;nameTag=function(i,cl){_nameTag(i,cl);if(cl.p.vip){const cx=CX[i],t=cl.p.vip.e+" "+cl.p.vip.n+" · +"+fm(cl.p.vip.tip);g.font="800 13px "+FONT;const w=g.measureText(t).width+22;box(g,cx-w/2,402,w,22,11,"#ffd24a",3);g.fillStyle=OUT;g.textAlign="center";g.textBaseline="middle";g.fillText(t,cx,413)}};
function drawHUD(c){if(typeof S==="undefined"||!S||typeof G==="undefined")return;if(typeof DUELX!=="undefined"&&DUELX)return;
  const gl=goals(),m=S.money,x0=160,y0=730,w=220,mx=gl[2]*1.05;
  box(c,x0-10,y0-8,w+20,30,15,"rgba(255,248,224,.94)",3.5);box(c,x0,y0,w,14,7,"#5a4030",0);box(c,x0,y0,Math.max(0,Math.min(w,w*m/mx)),14,7,m>=gl[2]?"#f6c344":m>=gl[1]?"#4cb85a":"#6ab4e8",0);
  gl.forEach((v,n)=>{const px=x0+w*v/mx,on=m>=v;c.font="800 "+(on?22:18)+"px "+FONT;c.textAlign="center";c.textBaseline="middle";c.lineWidth=4;c.strokeStyle=OUT;c.strokeText("★",px,y0+7);c.fillStyle=on?"#ffd23a":"#cbbba0";c.fillText("★",px,y0+7)});
  c.font="800 12px "+FONT;c.fillStyle=OUT;c.textAlign="right";c.fillText(fm(m),x0+w+4,y0-9);
  if(CAMP&&CAMP.combo>=2){const k=CAMP.combo,s=1+Math.sin(fr/3)*.05;c.save();c.translate(630,92);c.scale(s,s);label(c,"COMBO",0,-12,14);label(c,"×"+k,0,12,22);c.restore()}
  if(S.rush){const s=1+Math.sin((fr-S.rushT)/2)*.08;c.save();c.translate(325,96);c.scale(s,s);c.rotate(Math.sin(fr/6)*.03);label(c,"¡HORA",0,-12,16);label(c,"PICO!",0,12,22);c.restore()}
  RB=RB.filter(b=>b.l<60);RB.forEach(b=>{b.l++;const a=Math.min(1,(60-b.l)/20),y=b.y-b.l*.5;c.globalAlpha=a;c.font="800 15px "+FONT;const w=c.measureText(b.t).width+24;box(c,b.x-w/2,y,w,28,14,b.c,3);c.fillStyle=OUT;c.textAlign="center";c.textBaseline="middle";c.fillText(b.t,b.x,y+14);c.globalAlpha=1});
  CF=CF.filter(p=>p.l<46);CF.forEach(p=>{p.l++;p.vy+=.5;p.x+=p.vx;p.y+=p.vy;c.save();c.translate(p.x,p.y);c.rotate(p.r+p.l*.2);c.fillStyle=p.c;c.fillRect(-4,-2.5,8,5);c.restore()})}
const _afterDay=afterDay;afterDay=function(){_afterDay();try{const gl=goals(),m=S.money,st=m>=gl[2]?3:m>=gl[1]?2:m>=gl[0]?1:0,bonus=[0,2,5,10][st];
  const H=["Día flojo: la fila se aburrió y se fue","Jornada decente: el comal no se enfrió","¡Gran jornada! La cola dio la vuelta a la plaza","¡JORNADA ESTELAR! Hasta el presidente pidió pupusas"][st];
  if(bonus){G.treasury+=bonus;const e=$("ccash");if(e)e.textContent=fm(G.treasury)}if(st>=2)CAMP.pop=Math.min(20,(CAMP.pop||0)+1);
  flash({tag:"Resultado del día",e:"⭐".repeat(Math.max(1,st)),h:H,sub:"Ganaste "+fm(m)+" · "+st+" de 3 estrellas"+(bonus?" · bono +"+fm(bonus):"")+" · Meta "+fm(gl[st===3?2:st])+"",ms:6500,now:st===3})}catch(e){}};
