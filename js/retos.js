// RETOS por departamento (plato típico) + DÍAS DE JEFE (cada 3er día) + sonido ligado a la acción.
const RET={
 ahuachapan:{k:"dr",v:"chocolate",n:"Chocolate de la Ruta de las Flores",f:"☕"},
 "santa-ana":{k:"r",v:"queso con loroco",n:"Loroco de Santa Ana",f:"🌋"},
 sonsonate:{k:"dr",v:"horchata",n:"Horchata de playa",f:"🏖️"},
 "la-libertad":{k:"dr",v:"cebada",n:"Cebada de los surfistas",f:"🏄"},
 chalatenango:{k:"dr",v:"chocolate",n:"Chocolate para el frío de cerro",f:"⛰️"},
 "san-salvador":{k:"r",v:"frijol con queso",n:"Frijol con queso capitalino",f:"🏙️"},
 cuscatlan:{k:"r",v:"ayote",n:"Ayote de Suchitoto",f:"🌊"},
 "la-paz":{k:"r",v:"chicharrón",n:"Chicharrón de Costa del Sol",f:"✈️"},
 cabanas:{k:"r",v:"ayote",n:"Ayote de los cerros",f:"🌄"},
 "san-vicente":{k:"r",v:"frijol con queso",n:"Frijol con queso del Pulgarcito",f:"🗼"},
 usulutan:{k:"dr",v:"cebada",n:"Cebada del puerto",f:"⚓"},
 "san-miguel":{k:"r",v:"chicharrón",n:"Chicharrón del Carnaval",f:"🎭"},
 morazan:{k:"dr",v:"chocolate",n:"Chocolate de Perquín",f:"🕊️"},
 "la-union":{k:"dr",v:"horchata",n:"Horchata del Golfo",f:"🚢"}};
const BOSSES=[
 {n:"Inspector sanitario",e:"🧼",tip:9,pop:1,say:"¡Todo impecable, felicidades!",ann:"Quiere el pedido completo y perfecto"},
 {n:"Reina del Carnaval",e:"👑",tip:7.5,pop:1,say:"¡Qué fiesta de sabor!",ann:"Viene con corte y pide de todo"},
 {n:"Chef famoso",e:"👨‍🍳",tip:11,pop:2,say:"¡Me dijeron que eran las mejores!",ann:"Se sienta a probar tu mejor pupusa"},
 {n:"El Presidente",e:"🇸🇻",tip:15,pop:2,say:"¡Que vivan las pupusas salvadoreñas!",ann:"¡Visita sorpresa! No lo hagás esperar"}];
const retoOf=()=>G&&RET[G.dep];
const retoMeta=()=>5+Math.min(G.days||0,6);
const isBossDay=()=>((G.days||0)+1)%3===0;
const bossOf=()=>BOSSES[Math.floor(((G.days||0)+1)/3-1)%BOSSES.length];
function retoOrder(o){if(typeof DUELX!=="undefined"&&DUELX)return;const R=retoOf();if(!R||Math.random()>.5)return;if(R.k==="r")o.r=R.v;else o.dr=R.v}
const isTipico=cl=>{const R=retoOf();return R&&(R.k==="r"?cl.order.r===R.v:cl.order.dr===R.v)};
// sonido de la acción
const _putP=putPupusa;putPupusa=function(k){const n=S.slots.filter(Boolean).length;_putP(k);if(S.slots.filter(Boolean).length>n&&typeof Snd!=="undefined")Snd.play("sizzle")};
const _sStart=sorpStart;sorpStart=function(id){_sStart(id);const m={perro:"dog",mariachi:"mariachi",fuego:"fire",tele:"tv"}[id];if(m)Snd.play(m)};
// servir: plato típico, jefe, estrellas
const _onS3=onServed;onServed=function(cl,v,i){_onS3(cl,v,i);
  const R=retoOf();if(R&&isTipico(cl)){S.tipico=(S.tipico||0)+1;S.money+=.5;PT.push({s:R.f+" Típico +$0.50",x:CX[i]-40,y:285,l:0,col:"#c4572a"});
    if(S.tipico===retoMeta()){S.money+=5;S.retoOk=1;PT.push({s:"🎯 ¡RETO CUMPLIDO! +$5",x:480,y:230,l:0,col:"#c98a12"});if(typeof confetti!=="undefined")confetti(480,300,60);Snd.play("star");say("¡Reto cumplido! "+R.n+": +$5.")}}
  if(cl.p.boss){const B=cl.p.boss;CAMP.pop=Math.min(20,(CAMP.pop||0)+B.pop);S.bossOk=1;Snd.play("fanfare");if(typeof confetti!=="undefined"){confetti(CX[i],280,70);confetti(480,300,50)}
    flash({tag:"Día de jefe",e:B.e,h:B.n+" quedó encantado/a",sub:"+"+fm(B.tip)+" de propina · popularidad +"+B.pop,ms:4200,now:true})}
  const gl=goals(),m=S.money;S.starsSeen=S.starsSeen||0;const ns=m>=gl[2]?3:m>=gl[1]?2:m>=gl[0]?1:0;if(ns>S.starsSeen){S.starsSeen=ns;Snd.play("star");if(typeof confetti!=="undefined")confetti(480,60,30);PT.push({s:"★".repeat(ns)+" ¡Meta "+ns+"!",x:480,y:200,l:0,col:"#c98a12"})}};
const _onL=onLost;onLost=function(cl){_onL(cl);if(cl.p&&cl.p.boss){S.money=Math.max(0,S.money-4);PT.push({s:cl.p.boss.e+" se fue -$4",x:480,y:250,l:0,col:"#d8392b"});say(cl.p.boss.n+" se fue sin su pedido (-$4).")}};
// el jefe llega a mitad de jornada
const _sTick=sorpTick;sorpTick=function(){_sTick();if(typeof S==="undefined"||!S||PAUSED||S.t<=0||(typeof DUELX!=="undefined"&&DUELX))return;
  if(S.bossDay&&!S.bossIn&&S.t<=78){let i=[1,0,2].find(k=>!S.clients[k]);if(i===undefined){if(S.t>62)return;i=1;S.clients[1]=null}
    S.bossIn=1;const B=bossOf();let p=Object.assign({},pickClient(),{vip:{n:B.n,e:B.e,tip:B.tip,pat:1,say:B.say},boss:B});const o=mkOrder(p);o.cur=true;o.dr=o.dr||"horchata";
    S.clients[i]={p,order:o,born:fr,wait:0,max:62};S.seen.push(p);Snd.play("boss");SP={id:"boss",end:S.t-1,ann:70};SORPS.boss={e:B.e,n:"¡"+B.n.toUpperCase()+"!",d:B.ann+" · paga "+fm(B.tip)+" de propina"};say(B.n+" llegó: "+B.ann+".")}};
// al empezar el día
const _sd2=startDay;startDay=function(){_sd2.apply(this,arguments);S.tipico=0;S.starsSeen=0;S.bossDay=!DUELX&&isBossDay();S.bossIn=0;S.retoOk=0;S.bossOk=0;if(typeof Snd!=="undefined")Snd.theme(G.dep)};
// tarjeta del reto en la intro del día
const _dI=dayIntro;dayIntro=function(){_dI();try{const R=retoOf(),btn=$("xc");if(!btn)return;const add=h=>{const d=document.createElement("div");d.className="evb dm rt";d.innerHTML=h;btn.parentNode.insertBefore(d,btn)};
  if(R)add(`<span>🎯</span><div><b>Reto: ${R.n}</b><small>Serví ${retoMeta()} pedidos con ${R.v}: +$0.50 cada uno y +$5 al completar</small></div>`);
  if(isBossDay()){const B=bossOf();add(`<span>${B.e}</span><div><b>DÍA DE JEFE: ${B.n}</b><small>${B.ann}. Propina de ${fm(B.tip)} y popularidad +${B.pop}; si se va, perdés $4</small></div>`)}}catch(e){}};
// dibujo: pastilla del reto abajo
const _dSorp=drawSorp;drawSorp=function(c){_dSorp(c);if(typeof S==="undefined"||!S||(typeof DUELX!=="undefined"&&DUELX))return;const R=retoOf();if(!R)return;
  const n=Math.min(S.tipico||0,retoMeta()),M=retoMeta(),done=n>=M,t="🎯 "+R.v+"  "+n+"/"+M+(done?"  ¡cumplido!":"  (+$0.50 c/u · +$5)"),w=Math.min(520,c.measureText(t).width+40);
  c.font="800 14px "+FONT;const tw=c.measureText(t).width+36,x=930-tw;box(c,x,722,tw,30,15,done?"#ffe9a0":"rgba(255,248,224,.94)",3.5);c.fillStyle=OUT;c.textAlign="center";c.textBaseline="middle";c.fillText(t,x+tw/2,737);
  if(S.bossDay&&!S.bossIn){const bt=bossOf().e+" Jefe llega pronto",bw=c.measureText(bt).width+30;box(c,x-bw-10,722,bw,30,15,"#ffd0c0",3.5);c.fillStyle=OUT;c.fillText(bt,x-bw-10+bw/2,737)}};
