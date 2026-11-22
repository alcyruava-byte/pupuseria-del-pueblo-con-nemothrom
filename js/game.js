// Pupusería del Pueblo: lógica y dibujo vectorial (canvas 2D, sin librerías).
const W=960,H=760,GOAL=60,OUT="#3a1f10";
const SHORT={"frijol con queso":"Frijol y queso","queso":"Queso","ayote":"Ayote","chicharrón":"Chicharrón","queso con loroco":"Con loroco"};
const fm=n=>{n=Math.round(n*100)/100;return "$"+(Number.isInteger(n)?n:n.toFixed(2))};
const LOSTP=()=>(!DUELX&&typeof BAL!=="undefined")?.5:2;
const F={
"frijol con queso":{c:"#6b3f2a",hi:"#a8714c",lo:"#3a1f12",rim:"#3b7fd0",x:64,y:552},
"queso":{c:"#ffe58a",hi:"#fffbe0",lo:"#e9b83e",rim:"#f08a2e",x:166,y:552},
"ayote":{c:"#f59a2e",hi:"#ffc766",lo:"#c96a12",rim:"#4aa04e",x:268,y:552},
"chicharrón":{c:"#c4502f",hi:"#ec8a62",lo:"#8a2c18",rim:"#f2e6cc",x:115,y:654},
"queso con loroco":{c:"#5aae3c",hi:"#9ad862",lo:"#2f7a24",rim:"#fff4dc",x:217,y:654}};
const DR={"horchata":{c:"#f4e2bc",x:366,y:590},"chocolate":{c:"#5a3020",x:426,y:590},"cebada":{c:"#ec7fae",x:486,y:590}};
const CURF={c:"#f6dd9a",hi:"#fff6d2",lo:"#e8903a",rim:"#f08a2e"},CUR={x:806,y:662},SAL={x:846,y:656};
const TRASH={x1:872,x2:914,y1:626,y2:690};
const CX=[170,480,790],SX=[596,651,706],SY=590,PL={x:860,y:556};

const $=id=>document.getElementById(id),cv=$("cv"),g=cv.getContext("2d");
cv.width=W*2;cv.height=H*2;g.scale(2,2);
const mk=()=>{const c=document.createElement("canvas");c.width=W*2;c.height=H*2;const x=c.getContext("2d");x.scale(2,2);return[c,x]};
const [bgc,b]=mk(),[fgc,fg]=mk();
const hh=(x,y)=>(((x*73856093)^(y*19349663))>>>0)%100;
const sr=seed=>{let s=(Math.abs(seed)*9301+49297)%233280;return()=>{s=(s*9301+49297)%233280;return s/233280}};
const FONT="'Baloo 2','Trebuchet MS',sans-serif";

// ---------- ayudas de dibujo ----------
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function fs(c,fill,lw=4,stroke=OUT){if(fill){c.fillStyle=fill;c.fill()}if(lw){c.lineWidth=lw;c.strokeStyle=stroke;c.lineJoin="round";c.lineCap="round";c.stroke()}}
function lg(c,x0,y0,x1,y1,stops){const q=c.createLinearGradient(x0,y0,x1,y1);stops.forEach(([o,col])=>q.addColorStop(o,col));return q}
function rg(c,x0,y0,r0,x1,y1,r1,stops){const q=c.createRadialGradient(x0,y0,r0,x1,y1,r1);stops.forEach(([o,col])=>q.addColorStop(o,col));return q}
function ell(c,x,y,rx,ry,fill,lw=4,rot=0){c.beginPath();c.ellipse(x,y,rx,ry,rot,0,Math.PI*2);fs(c,fill,lw)}
function circ(c,x,y,r,fill,lw=4){c.beginPath();c.arc(x,y,r,0,Math.PI*2);fs(c,fill,lw)}
function box(c,x,y,w,h,r,fill,lw=4){rr(c,x,y,w,h,r);fs(c,fill,lw)}
function poly(c,pts,fill,lw=4){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();fs(c,fill,lw)}
function label(c,t,x,y,size=17){c.font="800 "+size+"px "+FONT;c.textAlign="center";c.textBaseline="middle";c.lineJoin="round";c.lineWidth=5;c.strokeStyle=OUT;c.strokeText(t,x,y);c.fillStyle="#fff4dc";c.fillText(t,x,y)}

// ---------- objetos de comida ----------
function pupusa(c,x,y,r,s,f){
  const ry=r*.72,th=Math.max(3.5,r*.27),lw=Math.max(2.5,r*.1),rd=sr(Math.round(x*7+y*3+r*11));
  const top=s==="raw"?["#fdf3cc","#e4cb82"]:s==="ready"?["#fbd56e","#c4781a"]:["#6a584d","#1b1411"],side=s==="raw"?"#cdb468":s==="ready"?"#a65f12":"#140e0b";
  ell(c,x+4,y+th+ry*.62,r*.98,ry*.5,"rgba(0,0,0,.28)",0);
  // canto grueso
  c.beginPath();c.ellipse(x,y+th,r,ry,0,0,Math.PI*2);fs(c,side,lw);
  c.fillStyle=side;c.fillRect(x-r,y,r*2,th+1);c.strokeStyle=OUT;c.lineWidth=lw;c.beginPath();c.moveTo(x-r,y);c.lineTo(x-r,y+th);c.moveTo(x+r,y);c.lineTo(x+r,y+th);c.stroke();
  c.beginPath();c.ellipse(x,y+th,r-lw*.5,ry-lw*.5,0,.1,Math.PI-.1);c.fillStyle=side;c.fill();
  if(s==="ready"){c.fillStyle="rgba(255,214,120,.45)";c.fillRect(x-r+lw,y+1,r*2-lw*2,Math.max(1.5,th*.28))}
  // cara superior
  c.beginPath();c.ellipse(x,y,r,ry,0,0,Math.PI*2);fs(c,rg(c,x-r*.3,y-ry*.4,r*.08,x,y,r*1.05,[[0,top[0]],[1,top[1]]]),lw);
  // borde amasado a mano
  c.strokeStyle=s==="raw"?"rgba(120,96,40,.35)":"rgba(255,236,170,.55)";c.lineWidth=Math.max(1.5,r*.06);c.beginPath();c.ellipse(x,y,r*.87,ry*.87,0,0,Math.PI*2);c.stroke();
  if(s==="ready"){ // manchas tostadas del comal
    for(let n=0;n<11;n++){const a=rd()*6.28,d=Math.sqrt(rd())*.86,px=x+Math.cos(a)*d*r,py=y+Math.sin(a)*d*ry,sz=r*(.07+rd()*.11);c.fillStyle="rgba(120,58,10,"+(.45+rd()*.3)+")";c.beginPath();c.ellipse(px,py,sz,sz*.62,rd()*3,0,7);c.fill()}
    c.fillStyle="rgba(70,28,4,.5)";for(let n=0;n<5;n++){const a=rd()*6.28,d=Math.sqrt(rd())*.8;c.beginPath();c.ellipse(x+Math.cos(a)*d*r,y+Math.sin(a)*d*ry,r*.04,r*.03,0,0,7);c.fill()}}
  else if(s==="raw"){c.fillStyle="rgba(140,110,50,.28)";for(let n=0;n<5;n++){const a=rd()*6.28,d=.55+rd()*.25;c.beginPath();c.ellipse(x+Math.cos(a)*d*r,y+Math.sin(a)*d*ry,r*.07,r*.045,0,0,7);c.fill()}}
  else{c.fillStyle="rgba(255,120,30,.9)";for(let n=0;n<4;n++){c.beginPath();c.arc(x+(rd()-.5)*r*1.1,y+(rd()-.5)*ry*1.1,r*.05,0,7);c.fill()}}
  // relleno que se asoma (así se reconoce el sabor)
  if(s!=="burnt"){
    const ox=x+r*.06,oy=y-ry*.04;
    c.beginPath();c.ellipse(ox,oy,r*.4,ry*.4,-.2,0,Math.PI*2);fs(c,rg(c,ox-r*.1,oy-ry*.14,r*.04,ox,oy,r*.42,[[0,f.hi],[1,f.c]]),Math.max(1.6,r*.06));
    if(s==="ready"){c.fillStyle=f.lo;for(let n=0;n<6;n++){const a=rd()*6.28,d=rd()*.28;c.beginPath();c.arc(ox+Math.cos(a)*d*r,oy+Math.sin(a)*d*ry,r*.035,0,7);c.fill()}
      for(const a of[.5,2.4,4.1]){const px=x+Math.cos(a)*r*.93,py=y+Math.sin(a)*ry*.93;c.beginPath();c.ellipse(px,py,r*.1,r*.075,a,0,7);fs(c,f.hi,Math.max(1.2,r*.05));if(Math.sin(a)>0){c.beginPath();c.ellipse(px,py+th*.55,r*.045,th*.55,0,0,7);fs(c,f.c,Math.max(1,r*.04))}}}
  }
  c.strokeStyle="rgba(255,255,255,.6)";c.lineWidth=Math.max(2,r*.07);c.lineCap="round";c.beginPath();c.ellipse(x,y,r*.78,ry*.78,0,3.5,4.5);c.stroke();
}
function salsaDrizzle(c,x,y,r){c.lineCap="round";c.lineJoin="round";const pts=[];for(let i=0;i<=7;i++)pts.push([x-r*.7+i*r*.2,y-r*.18+(i%2?r*.2:-r*.1)]);
  c.beginPath();pts.forEach(([a,d],i)=>i?c.lineTo(a,d):c.moveTo(a,d));c.strokeStyle="#7a140c";c.lineWidth=r*.2;c.stroke();c.strokeStyle="#d8392b";c.lineWidth=r*.13;c.stroke();c.strokeStyle="rgba(255,190,170,.8)";c.lineWidth=r*.04;c.stroke()}
function salsaBottle(c,x,y,w,h){
  ell(c,x+2,y+h/2+2,w*.55,h*.05,"rgba(0,0,0,.25)",0);
  poly(c,[[x-w*.18,y-h*.5],[x+w*.18,y-h*.5],[x+w*.12,y-h*.32],[x-w*.12,y-h*.32]],"#f6c344",3);box(c,x-w*.07,y-h*.62,w*.14,h*.14,3,"#f6c344",3);
  box(c,x-w/2,y-h*.34,w,h*.84,w*.26,lg(c,x-w/2,0,x+w/2,0,[[0,"#f0584a"],[.55,"#d8392b"],[1,"#a81e14"]]),3.5);
  box(c,x-w*.36,y-h*.02,w*.72,h*.3,5,"#fff4dc",2.5);c.font="800 "+Math.round(w*.23)+"px "+FONT;c.textAlign="center";c.textBaseline="middle";c.fillStyle="#b3281e";c.fillText("SALSA",x,y+h*.13);
  c.fillStyle="rgba(255,255,255,.45)";box(c,x-w*.34,y-h*.28,w*.1,h*.5,3,"rgba(255,255,255,.4)",0)}
function bowl(c,x,y,r,f,strands){
  ell(c,x+2,y+r*.14,r*1.03,r*1.0,"rgba(0,0,0,.22)",0);
  circ(c,x,y,r,f.rim,Math.max(3,r*.1));
  circ(c,x,y,r*.8,"rgba(0,0,0,.3)",0);
  c.beginPath();c.arc(x,y+r*.02,r*.68,0,Math.PI*2);fs(c,rg(c,x-r*.2,y-r*.25,r*.05,x,y,r*.7,[[0,f.hi],[1,f.c]]),0);
  const rd=sr(Math.round(x*5+y*11));
  if(strands){const cols=["#fff0b8","#e8903a","#d94a4a","#f6dd9a"];c.lineCap="round";for(let n=0;n<16;n++){const a=rd()*6.28,d=rd()*r*.5,sx=x+Math.cos(a)*d,sy=y+Math.sin(a)*d;c.strokeStyle=cols[n%4];c.lineWidth=Math.max(1.6,r*.07);c.beginPath();c.moveTo(sx-r*.1,sy);c.quadraticCurveTo(sx,sy-r*.14,sx+r*.12,sy+r*.02);c.stroke()}}
  else{for(let n=0;n<22;n++){const a=rd()*6.28,d=Math.sqrt(rd())*r*.58;c.fillStyle=n%2?f.hi:f.lo;c.beginPath();c.arc(x+Math.cos(a)*d,y+Math.sin(a)*d,r*(.05+rd()*.05),0,7);c.fill()}}
  c.strokeStyle="rgba(255,255,255,.7)";c.lineWidth=Math.max(2,r*.08);c.lineCap="round";c.beginPath();c.arc(x,y,r*.88,3.6,4.5);c.stroke();
}
function cup(c,x,y,w,h,col){
  const tw=w/2,bw=w*.36,top=y-h/2,bot=y+h/2;
  ell(c,x+3,bot+3,w*.5,h*.06,"rgba(0,0,0,.22)",0);
  c.save();c.translate(x+w*.1,top-h*.2);c.rotate(.16);box(c,-w*.05,0,w*.1,h*.55,2,"#e8452b",2.5);c.restore();
  poly(c,[[x-tw,top],[x+tw,top],[x+bw,bot],[x-bw,bot]],"#fff8ea",3.5);
  const t=.3,hw=tw+(bw-tw)*t,ly=top+h*t;
  c.beginPath();c.moveTo(x-hw,ly);c.lineTo(x+hw,ly);c.lineTo(x+bw-1.5,bot-1.5);c.lineTo(x-bw+1.5,bot-1.5);c.closePath();fs(c,col,0);c.fillStyle="rgba(0,0,0,.14)";c.fill();c.beginPath();c.moveTo(x-hw,ly);c.lineTo(x+hw,ly);c.lineTo(x+bw-1.5,bot-1.5);c.lineTo(x-bw+1.5,bot-1.5);c.closePath();c.fillStyle=col;c.fill();
  c.fillStyle="rgba(255,255,255,.45)";c.beginPath();c.moveTo(x-tw+4,top+6);c.lineTo(x-tw+9,top+6);c.lineTo(x-bw+7,bot-8);c.lineTo(x-bw+3,bot-8);c.closePath();c.fill();
  box(c,x-tw-3,top-h*.09,w+6,h*.11,h*.05,"#fff",3);
}
function mug(c,x,y,w,col){
  const h=w*.82,top=y-h/2;
  ell(c,x+2,y+h/2+w*.1,w*.78,w*.14,"#fff8ea",3);
  c.beginPath();c.arc(x+w/2-2,y,h*.3,-1.2,1.2);c.lineWidth=w*.14;c.strokeStyle=OUT;c.lineCap="round";c.stroke();
  c.beginPath();c.arc(x+w/2-2,y,h*.3,-1.2,1.2);c.lineWidth=w*.07;c.strokeStyle="#fff";c.stroke();
  c.beginPath();c.moveTo(x-w/2,top);c.lineTo(x+w/2,top);c.lineTo(x+w/2-w*.1,top+h);c.quadraticCurveTo(x,top+h+w*.08,x-w/2+w*.1,top+h);c.closePath();fs(c,lg(c,x-w/2,0,x+w/2,0,[[0,"#fff"],[1,"#e4d8c4"]]),3.5);
  ell(c,x,top+1,w/2-2,w*.11,col,3);
  c.fillStyle="rgba(255,255,255,.55)";c.beginPath();c.ellipse(x-w*.14,top+1,w*.1,w*.035,0,0,7);c.fill();
  c.strokeStyle="rgba(255,255,255,.9)";c.lineWidth=2.5;c.lineCap="round";for(const dx of[-.14,.14]){c.beginPath();c.moveTo(x+w*dx,top-4);c.quadraticCurveTo(x+w*dx+6,top-12,x+w*dx,top-20);c.stroke()}
}
function drink(c,k,x,y,w,h){if(k==="chocolate")mug(c,x,y+h*.12,w*1.1,DR[k].c);else cup(c,x,y,w,h,DR[k].c)}
function plate(c,x,y,r){
  ell(c,x+3,y+r*.1,r,r*.96,"rgba(0,0,0,.2)",0);
  circ(c,x,y,r,"#fffaf0",4);
  c.beginPath();c.arc(x,y,r*.84,0,Math.PI*2);c.lineWidth=r*.09;c.strokeStyle="#e8452b";c.setLineDash([r*.2,r*.11]);c.stroke();c.setLineDash([]);
  circ(c,x,y,r*.66,"#f6ecd8",2.5);
}
function flame(c,x,y,h,w){c.beginPath();c.moveTo(x-w,y);c.quadraticCurveTo(x-w*.9,y-h*.5,x,y-h);c.quadraticCurveTo(x+w*.9,y-h*.5,x+w,y);c.closePath();c.fillStyle=lg(c,x,y,x,y-h,[[0,"#ff4a18"],[.55,"#ffa11f"],[1,"#ffe88a"]]);c.fill()}
function trash(c,x,y,w,h){
  poly(c,[[x+3,y+8],[x+w-3,y+8],[x+w-7,y+h],[x+7,y+h]],lg(c,x,0,x+w,0,[[0,"#e8584a"],[1,"#b3281e"]]),4);
  box(c,x-3,y,w+6,10,4,"#f0786a",4);box(c,x+w/2-7,y-6,14,8,3,"#f0786a",4);
  c.strokeStyle="rgba(90,10,6,.45)";c.lineWidth=3;for(let n=1;n<4;n++){c.beginPath();c.moveTo(x+n*w/4,y+16);c.lineTo(x+n*w/4,y+h-6);c.stroke()}
}

// ---------- fondo (calle con casas, volcán, papel picado) ----------
function cloud(c,x,y,s){ell(c,x,y,48*s,20*s,"#fff",0);ell(c,x-32*s,y+5*s,30*s,16*s,"#fff",0);ell(c,x+34*s,y+6*s,32*s,15*s,"#fff",0)}
function roof(c,x,y,w,h,col){
  const pts=[[x-12,y+h],[x+16,y],[x+w-16,y],[x+w+12,y+h]];
  poly(c,pts,lg(c,0,y,0,y+h,[[0,col],[1,"#8a2c18"]]),4);
  c.save();c.beginPath();pts.forEach(([a,d],i)=>i?c.lineTo(a,d):c.moveTo(a,d));c.closePath();c.clip();
  c.strokeStyle="rgba(60,20,10,.4)";c.lineWidth=2.5;let row=0;
  for(let ry=y+10;ry<y+h+10;ry+=16,row++)for(let tx=x-20+(row%2?14:0);tx<x+w+20;tx+=28){c.beginPath();c.arc(tx,ry,13,0,Math.PI);c.stroke()}
  c.restore();
}
function win(c,x,y,w,h,shut){
  box(c,x-6,y-6,w+12,h+12,6,"#fff4dc",4);
  box(c,x,y,w,h,4,lg(c,0,y,0,y+h,[[0,"#a9e2f4"],[1,"#5ea6d0"]]),3.5);
  c.strokeStyle=OUT;c.lineWidth=3;c.beginPath();c.moveTo(x+w/2,y);c.lineTo(x+w/2,y+h);c.moveTo(x,y+h/2);c.lineTo(x+w,y+h/2);c.stroke();
  if(shut){box(c,x-w*.5-8,y-4,w*.5+2,h+8,3,"#3f9a4f",3.5);box(c,x+w+6,y-4,w*.5+2,h+8,3,"#3f9a4f",3.5)}
  box(c,x-10,y+h+6,w+20,10,4,"#b5532e",3.5);
}
function house(c,x,y,w,h,wall,rf){
  roof(c,x,y-38,w,38,rf);
  box(c,x,y,w,h,0,lg(c,0,y,0,y+h,[[0,wall],[1,"rgba(0,0,0,.16)"]]),4);
  c.fillStyle=wall;c.fillRect(x+2,y+2,w-4,h-4);
  c.fillStyle="rgba(255,255,255,.12)";c.fillRect(x+2,y+2,w-4,h*.3);
  win(c,x+w*.18,y+26,36,54,true);win(c,x+w*.62,y+26,36,54,true);
}
function tree(c,x,y,s){box(c,x-6*s,y-6,12*s,50*s,4,"#7a4a22",4);circ(c,x,y-14*s,32*s,"#4aa04e",4);circ(c,x-26*s,y,24*s,"#3f9a4f",4);circ(c,x+26*s,y+2,24*s,"#5ab45a",4)}
function papel(c,y0,sag,cols){
  const x0=-10,x1=W+10;c.strokeStyle="#5a3a22";c.lineWidth=2;c.beginPath();c.moveTo(x0,y0);c.quadraticCurveTo(W/2,y0+sag*2,x1,y0);c.stroke();
  for(let n=0;n<26;n++){const t=(n+.5)/26,x=(1-t)*(1-t)*x0+2*(1-t)*t*(W/2)+t*t*x1,y=(1-t)*(1-t)*y0+2*(1-t)*t*(y0+sag*2)+t*t*y0;
    const col=cols[n%cols.length];c.beginPath();c.moveTo(x-15,y);c.lineTo(x+15,y);c.lineTo(x+15,y+30);for(let z=0;z<5;z++){c.lineTo(x+15-z*6-3,y+36);c.lineTo(x+15-z*6-6,y+30)}c.lineTo(x-15,y+30);c.closePath();fs(c,col,2.5);
    c.fillStyle="rgba(255,255,255,.55)";c.beginPath();c.ellipse(x,y+13,5,6,0,0,7);c.fill();c.beginPath();c.ellipse(x-8,y+24,3,3,0,0,7);c.ellipse(x+8,y+24,3,3,0,0,7);c.fill()}
}
function drawBG(){
  const c=b;c.clearRect(0,0,W,H);
  c.fillStyle=lg(c,0,0,0,330,[[0,"#6fc8ee"],[1,"#e2f6f8"]]);c.fillRect(0,0,W,424);
  circ(c,880,70,34,"#fff2a8",0);circ(c,880,70,52,"rgba(255,242,168,.35)",0);
  cloud(c,110,70,1);cloud(c,330,40,.8);cloud(c,640,76,1.1);cloud(c,800,150,.7);
  // volcán y cerros
  c.beginPath();c.moveTo(430,350);c.lineTo(600,150);c.quadraticCurveTo(640,128,680,150);c.lineTo(860,350);c.closePath();fs(c,lg(c,0,130,0,350,[[0,"#7fb89a"],[1,"#4f8a74"]]),0);
  c.beginPath();c.moveTo(600,150);c.quadraticCurveTo(640,128,680,150);c.lineTo(668,170);c.quadraticCurveTo(640,152,612,170);c.closePath();fs(c,"#c9dccf",0);
  c.beginPath();c.moveTo(-10,350);c.quadraticCurveTo(140,200,330,350);c.closePath();fs(c,"#69ad7a",0);
  // calle y suelo
  c.fillStyle=lg(c,0,330,0,424,[[0,"#e9bf93"],[1,"#d49a68"]]);c.fillRect(0,330,W,94);
  c.fillStyle="rgba(120,70,30,.18)";for(let row=0;row<4;row++)for(let tx=(row%2?0:30);tx<W;tx+=60){c.beginPath();c.ellipse(tx,350+row*22,26,8,0,0,7);c.fill()}
  // casas laterales y árboles
  house(c,-40,150,250,190,"#f2c24a","#c4502f");house(c,750,164,250,176,"#e8665a","#b5472a");
  tree(c,258,310,1);tree(c,704,316,1);
  // pupusería central
  roof(c,282,70,396,56,"#c4502f");
  box(c,282,126,396,214,0,lg(c,0,126,0,340,[[0,"#e0703f"],[1,"#c4502f"]]),4);
  c.fillStyle="rgba(255,255,255,.1)";c.fillRect(284,128,392,50);
  box(c,282,270,396,70,0,lg(c,0,270,0,340,[[0,"#3b73c4"],[1,"#2a559c"]]),4);
  c.strokeStyle="#f6c344";c.lineWidth=4;c.setLineDash([14,12]);c.beginPath();c.moveTo(286,286);c.lineTo(674,286);c.stroke();c.setLineDash([]);
  win(c,330,160,56,84,true);win(c,574,160,56,84,true);
  // puerta en arco
  c.beginPath();c.moveTo(432,340);c.lineTo(432,214);c.arc(480,214,48,Math.PI,0);c.lineTo(528,340);c.closePath();fs(c,"#3b73c4",4);
  c.beginPath();c.moveTo(442,340);c.lineTo(442,216);c.arc(480,216,38,Math.PI,0);c.lineTo(518,340);c.closePath();fs(c,lg(c,0,170,0,340,[[0,"#7a4a2a"],[1,"#4a2a16"]]),3);
  c.strokeStyle="rgba(0,0,0,.35)";c.lineWidth=3;c.beginPath();c.moveTo(480,180);c.lineTo(480,340);c.stroke();
  // toldos de rayas
  for(let side=0;side<2;side++){const x=side?560:312;for(let n=0;n<6;n++){poly(c,[[x+n*20,132],[x+n*20+20,132],[x+n*20+22,158],[x+n*20+2,158]],n%2?"#fff4dc":"#d8392b",3)}}
  // papel picado
  const cols=["#d8392b","#f6c344","#3f9a4f","#4aa8e8","#e86ab0","#f39a2d"];
  papel(c,92,10,cols);papel(c,146,14,cols.slice(2).concat(cols.slice(0,2)));
  // desenfoque de profundidad
  if("filter" in c){const t=document.createElement("canvas");t.width=W*2;t.height=H*2;t.getContext("2d").drawImage(bgc,0,0);
    c.save();c.setTransform(1,0,0,1,0,0);c.filter="blur(4px)";c.drawImage(t,0,0);c.restore();c.filter="none"}
  c.fillStyle="rgba(255,240,215,.1)";c.fillRect(0,0,W,424);
  // letrero
  box(c,300,6,360,40,18,lg(c,0,6,0,46,[[0,"#b0703a"],[1,"#7a4a22"]]),4.5);
  c.strokeStyle="rgba(255,235,190,.35)";c.lineWidth=2;c.beginPath();c.moveTo(316,18);c.lineTo(644,18);c.stroke();
  label(c,"Pupusería del Pueblo",480,27,25);
}
// ---------- mostrador y estaciones (capa de adelante) ----------
function panel(c,x,y,w,h){box(c,x,y,w,h,18,lg(c,0,y,0,y+h,[[0,"#f1f7fa"],[1,"#b9cbd4"]]),4)}
function drawFG(){
  const c=fg;c.clearRect(0,0,W,H);
  c.fillStyle=lg(c,0,458,0,H,[[0,"#d3e3ea"],[1,"#a7bfcb"]]);c.fillRect(0,458,W,H-458);
  box(c,-10,424,W+20,36,0,lg(c,0,424,0,460,[[0,"#f7b058"],[1,"#d9741f"]]),4);
  c.strokeStyle="rgba(120,60,10,.22)";c.lineWidth=2;for(let n=0;n<4;n++){c.beginPath();c.moveTo(0,433+n*7);c.bezierCurveTo(240,429+n*7,720,439+n*7,W,433+n*7);c.stroke()}
  c.fillStyle="rgba(255,255,255,.35)";c.fillRect(0,426,W,3);
  c.fillStyle="#a85a18";c.fillRect(0,458,W,6);
  box(c,-10,724,W+20,44,0,lg(c,0,724,0,768,[[0,"#a8703a"],[1,"#6a4220"]]),4);
  for(let x=120;x<W;x+=160){c.strokeStyle="rgba(50,25,8,.6)";c.lineWidth=3;c.beginPath();c.moveTo(x,726);c.lineTo(x,760);c.stroke();circ(c,x-14,742,4,"#e0a23c",2);circ(c,x+14,742,4,"#e0a23c",2)}
  // rellenos
  panel(c,16,468,300,248);label(c,"Rellenos",166,492,19);
  for(const k in F){bowl(c,F[k].x,F[k].y,32,F[k],false);label(c,SHORT[k],F[k].x,F[k].y+46,14)}
  // bebidas
  panel(c,326,468,200,248);label(c,"Bebidas",426,492,19);
  for(const k in DR){drink(c,k,DR[k].x,DR[k].y,42,100);label(c,k==="chocolate"?"Chocolate":k==="cebada"?"Cebada":"Horchata",DR[k].x,DR[k].y+66,12.5)}
  // comal
  box(c,536,468,230,248,22,lg(c,0,468,0,716,[[0,"#555d64"],[1,"#23272a"]]),4.5);
  box(c,550,512,202,150,14,lg(c,0,512,0,662,[[0,"#a4adb4"],[1,"#6b747b"]]),4);
  c.fillStyle="rgba(255,255,255,.28)";c.fillRect(560,518,182,6);
  label(c,"Comal",651,492,19);
  // plato, curtido, vaciar
  panel(c,776,468,168,248);label(c,"Plato",860,492,19);
  bowl(c,CUR.x,CUR.y,25,CURF,true);label(c,"Curtido",CUR.x-4,CUR.y+38,13);salsaBottle(c,SAL.x+4,SAL.y,30,62);
  trash(c,TRASH.x1,TRASH.y1,TRASH.x2-TRASH.x1,TRASH.y2-TRASH.y1);label(c,"Vaciar",893,TRASH.y2+16,14);
}

// ---------- diorama 3D (isométrico) del municipio ----------
const TX=42,TY=21,OX=480,OY=34,SLAB=20;
const I=(x,y,z=0)=>[OX+(x-y)*TX,OY+(x+y)*TY-z];
function sh(h,f){const n=parseInt(h.slice(1),16),m=v=>Math.min(255,Math.round(v*f));return"rgb("+m(n>>16&255)+","+m(n>>8&255)+","+m(n&255)+")"}
function Q(c,p,fill,lw=3){c.beginPath();p.forEach((q,i)=>{const[a,b2]=I(q[0],q[1],q[2]||0);i?c.lineTo(a,b2):c.moveTo(a,b2)});c.closePath();fs(c,fill,lw)}
function L3(c,p,col,w){c.beginPath();p.forEach((q,i)=>{const[a,b2]=I(q[0],q[1],q[2]||0);i?c.lineTo(a,b2):c.moveTo(a,b2)});c.strokeStyle=col;c.lineWidth=w;c.lineCap="round";c.lineJoin="round";c.stroke()}
function box3(c,x0,y0,x1,y1,z0,z1,col,top,lw=3){
  Q(c,[[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]],col,lw);
  Q(c,[[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[x1,y0,z1]],sh(col,.74),lw);
  Q(c,[[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],top||sh(col,1.12),lw)}
const FL=(b,u,v)=>[b.x0+(b.x1-b.x0)*u,b.y1,b.z0+(b.z1-b.z0)*v],FR=(b,u,v)=>[b.x1,b.y0+(b.y1-b.y0)*u,b.z0+(b.z1-b.z0)*v];
const qL=(c,b,u0,v0,u1,v1,f,lw=2.5)=>Q(c,[FL(b,u0,v0),FL(b,u1,v0),FL(b,u1,v1),FL(b,u0,v1)],f,lw);
const qR=(c,b,u0,v0,u1,v1,f,lw=2.5)=>Q(c,[FR(b,u0,v0),FR(b,u1,v0),FR(b,u1,v1),FR(b,u0,v1)],f,lw);
const lL=(c,b,p,col,w)=>L3(c,p.map(q=>FL(b,q[0],q[1])),col,w),lR=(c,b,p,col,w)=>L3(c,p.map(q=>FR(b,q[0],q[1])),col,w);
function lamp3(c,x,y,on,fallen){
  const[sx,sy]=I(x,y,0);
  if(fallen){L3(c,[[x,y,2],[x+.9,y+.6,2]],OUT,8);L3(c,[[x,y,2],[x+.9,y+.6,2]],"#6a6a70",4);const[hx,hy]=I(x+.9,y+.6,2);circ(c,hx,hy,8,"#55555a",3);return}
  if(on){ell(c,sx,sy,46,17,"rgba(255,240,150,.28)",0)}
  L3(c,[[x,y,0],[x,y,46]],OUT,8);L3(c,[[x,y,0],[x,y,46]],"#7a7a82",4);
  const[hx,hy]=I(x,y,50);
  if(on){c.fillStyle=rg(c,hx,hy,2,hx,hy,56,[[0,"rgba(255,244,170,.95)"],[1,"rgba(255,244,170,0)"]]);c.beginPath();c.arc(hx,hy,56,0,7);c.fill()}
  circ(c,hx,hy,9,on?"#fff6b0":"#55555a",3.5)}
function tree3(c,x,y,B){const[sx,sy]=I(x,y,0);const g1=B.agua?"#4aa04e":"#9aa24e",g2=B.agua?"#5ab45a":"#a8ae5a";
  ell(c,sx,sy,22,8,"rgba(0,0,0,.2)",0);box(c,sx-4,sy-26,8,28,3,"#7a4a22",3);circ(c,sx,sy-42,22,g1,3.5);circ(c,sx-15,sy-28,15,g2,3.5);circ(c,sx+15,sy-28,15,g1,3.5)}
function house3(c,x0,y0,x1,y1,wall,roof){box3(c,x0,y0,x1,y1,0,26,wall,roof);const b={x0,y0,x1,y1,z0:0,z1:26};qL(c,b,.15,.3,.4,.7,"#7fc4ec");qL(c,b,.6,0,.85,.55,"#7a4a2a")}
function spurt(c,p,t,k){const[sx,sy]=I(p[0],p[1],4);
  for(let i=0;i<4;i++){const dx=[-22,-8,10,24][i],ph=Math.sin(t*.35+i*1.7)*5;c.strokeStyle="rgba(120,205,245,.95)";c.lineWidth=3.2;c.lineCap="round";c.beginPath();c.moveTo(sx,sy);c.quadraticCurveTo(sx+dx*.5,sy-36-ph,sx+dx,sy+10);c.stroke()}
  ell(c,sx+4,sy+16,30+k*4,10,"rgba(80,160,215,.85)",2.5);ell(c,sx+6,sy+16,16,5,"rgba(180,225,250,.8)",0)}
function pipes(c,B,t){
  const paths=[[[8.0,6.6],[7.0,6.6],[6.0,6.6],[6.0,7.6],[6.0,8.6]],[[9.2,6.6],[9.6,6.6],[9.6,7.7],[9.6,8.6]]],gaps=[[1],[1]];
  paths.forEach((pt,pi)=>{for(let i=0;i<pt.length-1;i++){
    if(!B.agua&&gaps[pi].includes(i))continue;
    const seg=[[pt[i][0],pt[i][1],4],[pt[i+1][0],pt[i+1][1],4]];L3(c,seg,OUT,11);L3(c,seg,B.agua?"#8fb4c8":"#8e8a82",6.5)}
    pt.forEach((q,i)=>{if(i&&i<pt.length-1){const[a,b2]=I(q[0],q[1],4);circ(c,a,b2,6,B.agua?"#a8c8d8":"#7a766e",3)}})});
  if(!B.agua){spurt(c,[6.6,6.6],t,0);spurt(c,[6.0,6.6],t+9,1);spurt(c,[9.0,6.6],t+4,0);spurt(c,[9.6,7.1],t+14,1)}
  else{ell(c,...I(6.0,8.9),20,7,"#6ec4f0",2.5)}}
function clinic(c,B,t){
  const b={x0:.8,y0:.8,x1:3.2,y1:3.2,z0:0,z1:58};
  if(B.salud){box3(c,b.x0,b.y0,b.x1,b.y1,0,58,"#f4f7fa","#4aa8e8");
    qL(c,b,.1,.4,.3,.72,"#7fc4ec");qL(c,b,.7,.4,.9,.72,"#7fc4ec");qL(c,b,.4,0,.6,.34,"#4aa8e8");
    qL(c,b,.46,.76,.54,.97,"#d8392b",2);qL(c,b,.38,.83,.62,.9,"#d8392b",2);
    qR(c,b,.15,.4,.35,.72,"#7fc4ec");qR(c,b,.65,.4,.85,.72,"#7fc4ec");
    const[cx,cy]=I(2,2,58);box(c,cx-26,cy-16,52,13,4,"#fff",3);label(c,"CLÍNICA",cx,cy-9,10.5)}
  else{box3(c,b.x0,b.y0,b.x1,b.y1,0,58,"#aaa39a","#4a433c");
    Q(c,[[1.4,1.2,58],[2.6,1.1,58],[2.8,2.3,58],[1.6,2.6,58]],"#1c1713",3);
    lL(c,b,[[.55,1],[.5,.7],[.62,.5],[.45,.25],[.52,0]],"#2a241e",3.5);lR(c,b,[[.2,1],[.3,.6],[.18,.3]],"#2a241e",3);
    for(const[u0,u1]of[[.1,.3],[.7,.9]]){qL(c,b,u0,.4,u1,.72,"#7a5632");lL(c,b,[[u0,.4],[u1,.72]],OUT,3);lL(c,b,[[u1,.4],[u0,.72]],OUT,3)}
    qL(c,b,.4,0,.6,.34,"#5a4a3a");qL(c,b,.28,.36,.72,.5,"#d8392b",3);const[sx,sy]=I(...FL(b,.5,.43));label(c,"CERRADO",sx,sy,10.5);
    box3(c,3.3,2.3,3.7,2.7,0,9,"#8d867c");box3(c,3.5,2.95,4.0,3.35,0,6,"#777");box3(c,2.5,3.4,2.95,3.75,0,8,"#9a9389");
    const[px,py]=I(2.1,1.8,58);for(let n=0;n<4;n++){const u=(t*1.2+n*18)%64;c.globalAlpha=(1-u/64)*.75;ell(c,px+Math.sin((t+n*9)/7)*9,py-u*.9,14+u*.3,10+u*.2,"#d3cdc4",0);c.globalAlpha=1}}}
function school(c,B,t){
  const b={x0:.8,y0:6.6,x1:3.2,y1:9.0,z0:0,z1:50};
  if(B.edu){box3(c,b.x0,b.y0,b.x1,b.y1,0,50,"#f6c344","#d8392b");
    for(const[u0,u1]of[[.08,.26],[.74,.92]])qL(c,b,u0,.45,u1,.78,"#7fc4ec");qL(c,b,.4,0,.6,.42,"#3b73c4");qL(c,b,.3,.82,.7,.94,"#fff4dc",2);
    qR(c,b,.2,.45,.4,.78,"#7fc4ec");qR(c,b,.6,.45,.8,.78,"#7fc4ec");
    const[sx,sy]=I(...FL(b,.5,.88));label(c,"ESCUELA",sx,sy,9.5);
    const[fx,fy]=I(2,7.8,50);c.strokeStyle=OUT;c.lineWidth=5;c.beginPath();c.moveTo(fx,fy);c.lineTo(fx,fy-52);c.stroke();poly(c,[[fx,fy-52],[fx+32,fy-44],[fx,fy-34]],"#3b73c4",3)}
  else{box3(c,b.x0,b.y0,b.x1,b.y1,0,50,"#c9bb92","#6f6050");
    Q(c,[[1.1,7.2,50],[2.5,7.1,50],[2.8,8.3,50],[1.4,8.5,50]],"#1c1713",3);
    lL(c,b,[[.6,1],[.55,.65],[.7,.45],[.5,.2],[.58,0]],"#2a241e",3.5);
    for(const[u0,u1]of[[.08,.26],[.74,.92]]){qL(c,b,u0,.45,u1,.78,"#9fb7c2");lL(c,b,[[u0+.05,.78],[(u0+u1)/2,.6],[u1-.03,.45]],OUT,2.5);lL(c,b,[[(u0+u1)/2,.6],[u0,.5]],OUT,2.5)}
    qL(c,b,.4,0,.6,.42,"#5a4a3a");lL(c,b,[[.4,.1],[.6,.32]],OUT,3);
    const[fx,fy]=I(2,7.8,50);c.strokeStyle=OUT;c.lineWidth=5;c.beginPath();c.moveTo(fx,fy);c.lineTo(fx+4,fy-26);c.lineTo(fx+18,fy-38);c.stroke();poly(c,[[fx+18,fy-38],[fx+30,fy-26],[fx+22,fy-24],[fx+14,fy-30]],"#8a8a92",2.5);
    box3(c,3.3,7.3,3.7,7.7,0,8,"#a89e82");box3(c,3.4,8.1,3.85,8.5,0,6,"#8d846a")}}
function market(c,B,t){
  box3(c,6.5,.6,9.5,3.4,0,5,"#d9c9a8");
  if(B.mercado){const cols=["#d8392b","#3f9a4f","#4aa8e8"];
    for(let k=0;k<3;k++){const x=6.8+k*.95;
      box3(c,x,1.1,x+.75,2.9,5,20,"#b5532e");
      L3(c,[[x,1.1,20],[x,1.1,46]],OUT,5);L3(c,[[x+.75,1.1,20],[x+.75,1.1,46]],OUT,5);
      Q(c,[[x-.1,1.0,46],[x+.85,1.0,46],[x+.85,3.0,36],[x-.1,3.0,36]],cols[k],3.5);
      Q(c,[[x+.3,1.0,46],[x+.55,1.0,46],[x+.55,3.0,36],[x+.3,3.0,36]],"#fff4dc",0);
      for(let n=0;n<3;n++){const[fx,fy]=I(x+.35,1.5+n*.5,20);circ(c,fx,fy-4,6,["#e4444a","#f6c344","#4cb85a"][(n+k)%3],2.5)}}}
  else{
    for(let k=0;k<3;k++){const x=6.8+k*.95;L3(c,[[x,1.1,5],[x,1.1,k===1?24:46]],"#6b4a2c",5);L3(c,[[x+.75,1.1,5],[x+.75,1.1,k===1?18:42]],"#6b4a2c",5)}
    Q(c,[[6.7,1.0,46],[7.6,1.0,46],[7.5,1.9,36],[7.3,2.2,30],[7.1,1.9,38],[6.9,2.6,32],[6.7,2.0,40]],"#a9a69c",2.5);
    L3(c,[[8.55,1.1,10],[9.3,1.9,5]],"#6b4a2c",5);
    box3(c,7.0,2.7,7.5,3.1,5,15,"#9a6a3a");box3(c,8.1,2.4,8.6,2.9,5,13,"#8a5a2a");box3(c,9.0,2.9,9.4,3.3,5,11,"#9a6a3a")}}
function tower(c,B,t){
  const cx=I(8.6,6.6)[0];
  for(const[x,y]of[[8.1,6.1],[9.1,6.1],[8.1,7.1],[9.1,7.1]]){L3(c,[[x,y,0],[8.6,6.6,44]],OUT,7);L3(c,[[x,y,0],[8.6,6.6,44]],"#8a8a90",3.5)}
  const yb=I(8.6,6.6,44)[1],yt=I(8.6,6.6,78)[1],col=B.agua?"#4aa8e8":"#9a8f86";
  c.beginPath();c.moveTo(cx-34,yt);c.lineTo(cx-34,yb);c.ellipse(cx,yb,34,12,0,Math.PI,0,true);c.lineTo(cx+34,yt);c.closePath();fs(c,lg(c,cx-34,0,cx+34,0,[[0,sh(col,1.15)],[.6,col],[1,sh(col,.7)]]),4);
  ell(c,cx,yt,34,12,sh(col,1.2),4);
  if(B.agua){c.beginPath();c.moveTo(cx,yt+16);c.quadraticCurveTo(cx+14,yt+36,cx,yt+44);c.quadraticCurveTo(cx-14,yt+36,cx,yt+16);fs(c,"#fff",2.5)}
  else{c.fillStyle="rgba(150,70,20,.55)";for(const[x,y]of[[-20,12],[12,22],[-6,36],[22,8]]){c.beginPath();c.ellipse(cx+x,yt+y,6,4,.5,0,7);c.fill()}
    c.strokeStyle=OUT;c.lineWidth=3;c.beginPath();c.moveTo(cx-6,yt+4);c.lineTo(cx+2,yt+18);c.lineTo(cx-8,yt+30);c.stroke();
    for(const dx of[-22,6,26]){const ph=(t*.6+dx)%40;c.strokeStyle="rgba(120,205,245,.95)";c.lineWidth=3.5;c.setLineDash([8,6]);c.lineDashOffset=-ph;c.beginPath();c.moveTo(cx+dx,yb+8);c.lineTo(cx+dx,I(8.6,6.6,2)[1]);c.stroke();c.setLineDash([])}
    ell(c,cx,I(8.6,6.6,0)[1]+4,60,16,"rgba(80,160,215,.8)",2.5)}}
function bridge(c,B,t){
  const deck="#7b8288";
  if(B.puente){box3(c,4.1,4.4,5.9,5.6,0,9,deck,"#6f767c");
    L3(c,[[4.2,5,9.2],[5.8,5,9.2]],"#f6c344",3);
    for(const y of[4.4,5.6]){L3(c,[[4.1,y,9],[4.1,y,22],[5.9,y,22],[5.9,y,9]],OUT,6);L3(c,[[4.1,y,9],[4.1,y,22],[5.9,y,22],[5.9,y,9]],"#e8e2d0",3);for(let x=4.1;x<=5.9;x+=.45)L3(c,[[x,y,9],[x,y,22]],"#e8e2d0",2.5)}}
  else{box3(c,4.1,4.4,4.85,5.6,0,9,deck,"#6f767c");
    box3(c,5.25,4.4,5.9,5.6,0,4,deck,"#6f767c");
    Q(c,[[4.85,4.4,9],[5.0,4.4,9],[5.25,4.4,4],[5.25,5.6,4],[5.0,5.6,9],[4.85,5.6,9]],"#6a5a48",3);
    L3(c,[[4.9,4.5,9],[5.4,4.9,1]],"#8a5a2a",6);L3(c,[[4.95,5.3,9],[5.5,5.6,3]],"#8a5a2a",6);
    L3(c,[[4.1,5.6,9],[4.1,5.6,22],[4.7,5.6,18]],OUT,6);L3(c,[[4.1,5.6,9],[4.1,5.6,22],[4.7,5.6,18]],"#e8e2d0",3);
    L3(c,[[5.9,4.4,4],[5.9,4.4,16],[5.5,4.4,10]],OUT,6);L3(c,[[5.9,4.4,4],[5.9,4.4,16],[5.5,4.4,10]],"#e8e2d0",3);
    for(const[x,y,dx]of[[4.3,6.0,0],[5.9,3.9,0]]){const[sx,sy]=I(x,y,0);poly(c,[[sx,sy-26],[sx+9,sy],[sx-9,sy]],"#f08a2e",3);c.fillStyle="#fff";c.fillRect(sx-5,sy-12,10,4)}
    const[wx,wy]=I(5.05,5,0);ell(c,wx,wy+4,30,9,"rgba(255,255,255,.35)",0)}}
function drawTown(c,B,t=0){
  c.clearRect(0,0,960,480);
  c.fillStyle=lg(c,0,0,0,480,[[0,"#6fc8ee"],[1,"#e8f6f4"]]);c.fillRect(0,0,960,480);
  circ(c,860,60,30,"#fff2a8",0);circ(c,860,60,50,"rgba(255,242,168,.3)",0);
  {const cl=(x,y,k)=>cloud(c,((x+t*k)%1160)-100,y,.8+k*.04);cl(120,50,.6);cl(520,36,.4);cl(760,110,.8);cl(300,130,.5)}
  c.beginPath();c.moveTo(0,300);c.lineTo(160,170);c.lineTo(300,260);c.lineTo(480,140);c.lineTo(660,260);c.lineTo(800,180);c.lineTo(960,290);c.lineTo(960,480);c.lineTo(0,480);c.closePath();c.fillStyle="#9fcdb0";c.fill();
  // isla
  {const[ax,ay]=I(5,10,-SLAB);ell(c,ax,ay+14,360,26,"rgba(40,60,40,.22)",0)}
  Q(c,[[0,10,0],[10,10,0],[10,10,-SLAB],[0,10,-SLAB]],"#9a6a3a",3.5);
  Q(c,[[10,0,0],[10,10,0],[10,10,-SLAB],[10,0,-SLAB]],"#734a28",3.5);
  Q(c,[[4.2,10,0],[5.8,10,0],[5.8,10,-SLAB],[4.2,10,-SLAB]],"#3b8fcf",3);
  const ty=I(0,0)[1],by=I(10,10)[1];
  Q(c,[[0,0],[10,0],[10,10],[0,10]],lg(c,0,ty,0,by,[[0,B.agua?"#8cc868":"#bdb67c"],[1,B.agua?"#6fae52":"#a49d66"]]),4);
  for(let i=0;i<10;i++)for(let j=0;j<10;j++)if((i+j)%2)Q(c,[[i,j],[i+1,j],[i+1,j+1],[i,j+1]],"rgba(0,0,0,.05)",0);
  // río
  Q(c,[[4.2,0],[5.8,0],[5.8,10],[4.2,10]],lg(c,0,ty,0,by,[[0,"#5ab8f0"],[1,"#3f9ad8"]]),3.5);
  for(let n=0;n<7;n++){const y0=.6+n*1.4,xw=4.5+((t*.03+n*.37)%.8);L3(c,[[xw,y0],[xw+.45,y0+.22]],"rgba(255,255,255,.75)",3)}
  // calle
  for(const[x0,x1]of[[0,4.2],[5.8,10]]){
    Q(c,[[x0,4.25],[x1,4.25],[x1,5.75],[x0,5.75]],"#e2d3b0",3);
    Q(c,[[x0,4.4],[x1,4.4],[x1,5.6],[x0,5.6]],B.caminos?"#5f666c":"#85817a",2.5);
    for(let x=x0+.2;x<x1-.3;x+=.8)L3(c,[[x,5],[x+.4,5]],B.caminos?"#f6c344":"#cfc8a0",4)}
  if(!B.caminos){
    for(const[x,y,r]of[[1.0,5.0,.5],[2.9,4.75,.42],[6.6,5.2,.5],[8.4,4.8,.45],[9.3,5.2,.3]]){const[sx,sy]=I(x,y);ell(c,sx,sy,r*TX*1.1,r*TY*1.1,"#4a453e",3);ell(c,sx+2,sy+2,r*TX*.7,r*TY*.7,"#2a2622",0)}
    L3(c,[[.4,4.6],[.9,4.9],[.7,5.3]],"rgba(30,26,22,.7)",3);L3(c,[[7.2,4.5],[7.7,4.9],[8.1,4.7]],"rgba(30,26,22,.7)",3);L3(c,[[3.4,5.4],[3.9,5.0]],"rgba(30,26,22,.7)",3)}
  pipes(c,B,t);
  const objs=[
   [4,()=>clinic(c,B,t)],[9.8,()=>school(c,B,t)],[10,()=>market(c,B,t)],[10.01,()=>bridge(c,B,t)],[15.2,()=>tower(c,B,t)],
   [5.7,()=>lamp3(c,1.5,4.2,B.caminos,false)],[7.8,()=>lamp3(c,3.6,4.2,B.caminos,!B.caminos)],[10.6,()=>lamp3(c,6.4,4.2,B.caminos,false)],[12.8,()=>lamp3(c,8.6,4.2,B.caminos,false)],
   [7,()=>tree3(c,3.7,3.4,B)],[9.6,()=>tree3(c,6.2,3.6,B)],[10.3,()=>tree3(c,3.7,6.6,B)],[12.4,()=>tree3(c,6.2,6.2,B)],
   [15.6,()=>house3(c,6.1,8.7,7.1,9.6,"#e8665a","#b5472a")],[18.5,()=>house3(c,9.0,8.7,9.9,9.6,"#f2c24a","#c4502f")]];
  objs.sort((p,q)=>p[0]-q[0]).forEach(o=>o[1]());
}
// ---------- estado ----------
let S,fr=0,PT=[],PAUSED=true,DUELX=null;
const say=x=>$("msg").textContent=x;
// ---------- campaña: días de trabajo + gestión de alcaldía ----------
const BUILD={
 salud:{n:"Unidad de salud",c:20,e:"🏥",p:"La unidad de salud está en ruinas: techo caído, cerrada y sin atención.",d:"Clientes más pacientes (+15 %)",need:"adultos mayores (55+)",f:p=>p.age>=55,a:[2,2,72]},
 edu:{n:"Escuela",c:16,e:"🏫",p:"La escuela tiene el techo hundido y las ventanas quebradas.",d:"Cocinás más rápido (pupusa lista en 5 s)",need:"jóvenes (menos de 25)",f:p=>p.age<25,a:[2,7.8,66]},
 mercado:{n:"Mercado municipal",c:24,e:"🧺",p:"Los puestos se cayeron: los vendedores trabajan sin sombra ni orden.",d:"+$1 de propina por cada venta",need:"comerciantes y oficios independientes",f:p=>/vend|comerc|ventas|artesan|costur|taller|cocin|domest|jornal|mesero|barber|zapat/i.test(p.occupation),a:[8,2,62]},
 caminos:{n:"Calles y alumbrado",c:14,e:"💡",p:"Calles llenas de baches y postes caídos: de noche nadie sale.",d:"Clientes más pacientes (+10 %)",need:"trabajadores del campo",f:p=>/agric|cultiv|ganad|pesca|finca|rural|campo/i.test(p.occupation),a:[1.8,5,14]},
 puente:{n:"Puente",c:26,e:"🌉",p:"El puente está partido: el río divide al pueblo y no pasan los clientes.",d:"Llegan más clientes al día",need:"población general del municipio",f:null,a:[5,5,56]},
 agua:{n:"Tuberías de agua",c:16,e:"🚰",p:"Las tuberías tienen fugas grandes: se pierde el agua y los barrios se quedan sin.",d:"+8 s de jornada cada día",need:"población general del municipio",f:null,a:[8.6,6.6,104]}};
let G,DAYON=false;
const freshG=()=>({dep:null,days:0,earned:0,treasury:0,built:{},welfare:0,muni:"",log:[],seen:[],sel:null});
const RAW=()=>G.built.edu?5:6;
const defMuni0=()=>{const c={};P.forEach(p=>{if(p.municipality)c[p.municipality]=(c[p.municipality]||0)+1});return Object.keys(c).sort((a,b)=>c[b]-c[a])[0]||"tu municipio"};
const norm=t=>String(t||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const DEPS=[
 {id:"ahuachapan",lm:"Los Ausoles de Ahuachapán",dep:"Ahuachapán",cab:"Ahuachapán",r:"Occidente",e:"☕",c:"#2f8a4a",sky:0x8fd8f0,gr:0x6fbf4f,n:"Cafetales y la Ruta de las Flores"},
 {id:"santa-ana",lm:"Catedral de Santa Ana",dep:"Santa Ana",cab:"Santa Ana",r:"Occidente",e:"🌋",c:"#b5472a",sky:0x9ad6ee,gr:0x7cc35a,n:"Catedral gótica y volcán de Santa Ana"},
 {id:"sonsonate",lm:"Volcán de Izalco",dep:"Sonsonate",cab:"Sonsonate",r:"Occidente",e:"🏖️",c:"#d98a1a",sky:0x7fd0f0,gr:0x86c850,n:"Izalco, playas y Los Cóbanos"},
 {id:"la-libertad",lm:"Kiosco del parque de Santa Tecla",dep:"La Libertad",cab:"Santa Tecla",r:"Centro",e:"🏄",c:"#1f7fb5",sky:0x7fd0f6,gr:0x6fbf5a,n:"Surf, café y la ciudad jardín"},
 {id:"chalatenango",lm:"Cerro El Pital",dep:"Chalatenango",cab:"Chalatenango",r:"Centro",e:"⛰️",c:"#4a7a3a",sky:0xa8dcf0,gr:0x5fae55,n:"Montañas, pinos y Cerrón Grande"},
 {id:"san-salvador",lm:"Monumento al Divino Salvador del Mundo",dep:"San Salvador",cab:"San Salvador",r:"Centro",e:"🏛️",c:"#c42f22",sky:0x9ad2ec,gr:0x7cc35a,n:"Centro histórico y el Boquerón"},
 {id:"cuscatlan",lm:"Cerro de las Pavas",dep:"Cuscatlán",cab:"Cojutepeque",r:"Centro",e:"🌊",c:"#2a8f8a",sky:0x8ad8ee,gr:0x78c458,n:"Cerro de las Pavas y lago Suchitlán"},
 {id:"la-paz",lm:"Costa del Sol",dep:"La Paz",cab:"Zacatecoluca",r:"Paracentral",e:"🌴",c:"#c9a227",sky:0x80d4f2,gr:0x8ccb55,n:"Costa del Sol y el Bálsamo"},
 {id:"cabanas",lm:"Cerros y templo de Sensuntepeque",dep:"Cabañas",cab:"Sensuntepeque",r:"Paracentral",e:"🏞️",c:"#7a5a2a",sky:0xa6dcee,gr:0x8fc55a,n:"Cerros, río Lempa y tradición"},
 {id:"san-vicente",lm:"Torre cívica de San Vicente",dep:"San Vicente",cab:"San Vicente",r:"Paracentral",e:"🔔",c:"#8a3ab0",sky:0x98d6ee,gr:0x7cc35a,n:"Volcán Chichontepec y la Torre"},
 {id:"usulutan",lm:"Manglares de la Bahía de Jiquilisco",dep:"Usulután",cab:"Usulután",r:"Oriente",e:"🦀",c:"#1f6fa0",sky:0x7ad2f0,gr:0x7ec654,n:"Bahía de Jiquilisco y manglares"},
 {id:"san-miguel",lm:"Volcán Chaparrastique y Carnaval",dep:"San Miguel",cab:"San Miguel",r:"Oriente",e:"🎭",c:"#a8241a",sky:0x9ad6ec,gr:0x86c250,n:"Volcán Chaparrastique y el Carnaval"},
 {id:"morazan",lm:"Monumento a la Paz de Morazán",dep:"Morazán",cab:"San Francisco Gotera",r:"Oriente",e:"🕊️",c:"#4a5a8a",sky:0xa0d8ee,gr:0x6fb455,n:"Perquín y la memoria de la paz"},
 {id:"la-union",lm:"Puerto y Golfo de Fonseca",dep:"La Unión",cab:"La Unión",r:"Oriente",e:"⚓",c:"#1a5f8a",sky:0x78d0f0,gr:0x86c850,n:"Golfo de Fonseca y puerto"}];
const depOf=id=>DEPS.find(d=>d.id===id);
const inDep=(p,d)=>norm(p.department)===norm(d.dep)||norm(p.municipality).startsWith(norm(d.dep));
const depCount=d=>P.filter(p=>inDep(p,d)).length;
let SAVE={};
const pool=()=>{const d=G.dep&&depOf(G.dep);if(!d)return P;const q=P.filter(p=>inDep(p,d));return q.length>=3?q:P};
const muni=()=>{const d=G.dep&&depOf(G.dep);return d?d.cab:(G.muni||defMuni0())};
function needs(){const seen=G.seen,n=seen.length,o={};
  for(const k in BUILD){const b=BUILD[k];
    if(!b.f){o[k]=Math.min(100,35+hh(muni().length+G.days+k.length,7)%40);continue}
    if(!n){o[k]=50;continue}
    const sh=seen.filter(b.f).length/n;o[k]=Math.max(10,Math.min(100,Math.round(20+sh*160)))}
  return o}
const mkDay=()=>({t:120+(G.built.agua?8:0),money:0,served:0,lost:0,seen:[],slots:[null,null,null],clients:[null,null,null],plate:{r:null,cur:false,sal:false,dr:null}});
function startDay(){G.hl=null;if(typeof GL!=="undefined")GL.unmount();S=mkDay();PT=[];PAUSED=false;DAYON=true;$("alc").style.display="none";$("menu").style.display="none";say("Día de trabajo "+(G.days+1)+". Tocá un tazón para poner una pupusa en el comal.");if(typeof dayIntro!=="undefined")dayIntro()}
function newGame(){G=freshG();SAVE={};CAMP={gd:0,rank:null,prim:0,pres:0,aff:{},pop:0,up:{},story:{},dil:[],combo:0,best:0};S=mkDay();PAUSED=true;DAYON=false;showMenu()}

// ---------- periódico: cada 3 días avances, cada 5 días ranking presidencial ----------
let CAMP={gd:0,rank:null,prim:0,pres:0};
const RIV=[["Lic. Marta Quintanilla","Frente Loroco",58],["Ing. Rodolfo Menjívar","Alianza Chicharrón",52],["Dra. Ana Lissette Cruz","Movimiento Curtido",47],["Don Chepe Alvarenga","Partido Frijol con Queso",41],["Prof. Mauricio Henríquez","Unidad Cebada",35],["Lic. Karla Portillo","Horchata Nueva",30],["Cmdte. Tito Barahona","Coalición del Comal",24],["Sr. Nelson Ayala","Voz del Ayote",18]];
function campTotals(){const L=Object.keys(SAVE).length?Object.values(SAVE):[G];let o=0,w=0,dn=0,sv=0,ld=0;L.forEach(g=>{if(g.led)ld++;o+=Object.keys(g.built||{}).length;w+=g.welfare||0;if(g.fin)dn++;sv+=g.served||0});return{obras:o,welfare:w,deps:dn,served:sv,led:ld}}
function ranking(){const T=campTotals(),me=4*T.obras+T.welfare/4+12*T.deps+10*T.led+Math.min(CAMP.gd,40)*.8;
  const rows=RIV.map(([n,pa,b])=>({n,pa,v:b+CAMP.gd*.55})).concat([{n:"Alcalde Pupusa",pa:"Independiente del comal",v:me,me:1}]).sort((a,b)=>b.v-a.v);
  const tot=rows.reduce((a,r)=>a+r.v,0);rows.forEach(r=>r.pc=Math.round(r.v/tot*100));
  return{rows,pos:rows.findIndex(r=>r.me)+1,T}}
const NQT=[(o,a)=>"Soy "+o.toLowerCase()+" y por fin veo que el alcalde baja al pueblo, no solo sale en la tele.",(o,a)=>"Yo vengo por la pupusa, pero me quedo por lo que está arreglando. Ojalá siga así.",(o,a)=>a>=55?"A mi edad uno ya no espera nada, pero esto sí se nota. ¡Que Dios lo bendiga!":"Los jóvenes queremos obras, no discursos. Esto va por buen camino.",(o,a)=>"Dicen que la pupusa de queso con loroco es la mejor del departamento, y el alcalde también."];
function quote(){const L=[].concat(G.seen||[],...Object.values(SAVE).map(g=>g.seen||[]));if(!L.length)return null;const p=L[(CAMP.gd*7)%L.length];return{t:NQT[(CAMP.gd+p.age)%NQT.length](p.occupation||"vecino",p.age),w:(p.occupation||"Vecino")+", "+p.age+" años · "+(p.municipality||muni())}}
function newsAvance(){const d=G.dep&&depOf(G.dep),done=Object.keys(BUILD).filter(k=>G.built[k]),last=done.length?BUILD[done[done.length-1]]:null,N=needs(),top=Object.keys(BUILD).filter(k=>!G.built[k]).sort((a,b)=>N[b]-N[a])[0],q=quote(),tot=Object.keys(BUILD).length;
  const hl=last?["Alcalde Pupusa estrena "+last.n.toLowerCase()+" en "+muni(),"“Cumplido”: "+last.n+" ya sirve a "+muni()][CAMP.gd%2]:"Alcalde Pupusa promete obras en "+muni()+": “primero las pupusas”";
  const sub=done.length?`${done.length} de ${tot} problemas resueltos y la caja municipal en ${fm(G.treasury)}`:"Cada pupusa vendida va directo a la caja de la alcaldía";
  const p1=last?`${last.d}. Vecinos de ${d?d.dep:muni()} aseguran que el cambio se nota desde la primera semana.`:`El alcalde, que atiende su propia pupusería, asegura que lo recaudado se invertirá en arreglar ${muni()}.`;
  const p2=top?`Lo que sigue en la lista: ${BUILD[top].n.toLowerCase()}. ${BUILD[top].p}`:"Con todos los problemas resueltos, la alcaldía mira hacia otras ciudades.";
  return{tag:"Boletín municipal",h:hl,sub,e:last?last.e:"🫓",cap:last?last.n:"Pupusería del alcalde",p:[p1,p2,`En ${CAMP.gd} días de trabajo, la pupusería ha servido a ${campTotals().served||G.seen.length} vecinos.`],q}}
function newsRanking(){const R=ranking(),pos=R.pos,prev=CAMP.rank;CAMP.rank=pos;
  const mood=pos===1?"¡Alcalde Pupusa lidera las encuestas presidenciales!":pos<=3?"Alcalde Pupusa ya es de los tres favoritos para la presidencia":pos<=6?"Alcalde Pupusa gana terreno: sube al puesto "+pos+" para la presidencia":"Alcalde Pupusa suena para la presidencia: aparece en el puesto "+pos;
  const mv=prev===null?"Debuta en la encuesta":prev>pos?"Sube "+(prev-pos)+" puesto"+(prev-pos>1?"s":""):prev<pos?"Baja "+(pos-prev)+" puesto"+(pos-prev>1?"s":""):"Mantiene su puesto";
  return{tag:"Encuesta presidencial",h:mood,sub:mv+" · "+R.T.obras+" obras y "+R.T.deps+" alcaldía"+(R.T.deps===1?"":"s")+" transformada"+(R.T.deps===1?"":"s"),e:"🏆",cap:"Puesto #"+pos+" de "+R.rows.length,
    p:["La popularidad del alcalde crece con cada obra entregada y cada vecino servido. Analistas dicen que la clave es que “gobierna con las manos en la masa”.",pos===1?"Sus rivales piden revisar la encuesta; él responde que sigue amasando.":"Para escalar solo hace falta lo de siempre: resolver más problemas, en más ciudades."],q:quote(),R}}
function paper(n){const dt=new Date().toLocaleDateString("es-SV",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  const tbl=n.R?`<table><tr><th>#</th><th>Candidato</th><th>Partido</th><th>Intención de voto</th></tr>${n.R.rows.slice(0,6).map((r,i)=>`<tr class="${r.me?"me":""}"><td>${i+1}</td><td>${r.n}</td><td>${r.pa}</td><td><div class="bar"><span style="width:${Math.min(100,r.pc*3.2)}%"></span></div>${r.pc} %</td></tr>`).join("")}${n.R.pos>6?`<tr class="me"><td>${n.R.pos}</td><td>Alcalde Pupusa</td><td>Independiente del comal</td><td>${n.R.rows[n.R.pos-1].pc} %</td></tr>`:""}</table>`:"";
  return `<div class="paper"><div class="mh"><h2>El Diario del Pueblo</h2><small><span>${dt}</span><span>Edición día ${CAMP.gd}</span><span>Precio: una pupusa</span></small></div><span class="tag">${n.tag}</span><h3>${n.h}</h3><div class="by">${n.sub}</div><div class="bd"><div class="ph">${n.e}<i>${n.cap}</i></div><p>${n.p[0]}</p><p>${n.p[1]}</p>${tbl}<p>${n.p[2]||""}</p>${n.q?`<p class="q">“${n.q.t}”<b>— ${n.q.w}</b></p>`:""}</div><button class="cl" id="ncl">Cerrar el periódico</button></div>`}
let NQ=[];
function showNext(){const el=$("news");if(!NQ.length){el.style.display="none";if(typeof nextOverlay!=="undefined")nextOverlay();return}el.innerHTML=paper(NQ.shift());el.style.display="grid";el.scrollTop=0;$("ncl").onclick=showNext}
function queueNews(){NQ=[];if(CAMP.gd%3===0)NQ.push(newsAvance());if(CAMP.gd%5===0)NQ.push(newsRanking());if(NQ.length)setTimeout(showNext,700)}

// ---------- titular del día (después de cada jornada) ----------
function dayHeadline(){
  const m=S.money,sv=S.served,lo=S.lost,mu=muni(),left=Object.keys(BUILD).filter(k=>!G.built[k]).sort((a,b)=>BUILD[a].c-BUILD[b].c),nx=left[0];
  G.streak=lo===0&&sv>0?(G.streak||0)+1:0;
  const cl=S.seen.length?S.seen[(G.days*3)%S.seen.length]:null,done=Object.keys(BUILD).length-left.length;
  let e="📰",h;
  if(!sv)h=["😴","Pupusería casi sin clientes en "+mu+": “hoy la plaza estuvo tranquila”"];
  else if(G.streak>=3)h=["🔥","¡"+G.streak+" jornadas perfectas seguidas! "+mu+" no deja de elogiar al alcalde Pupusa"];
  else if(lo===0&&sv>=5)h=["🌟","¡Día redondo en "+mu+"! Alcalde Pupusa sirvió a "+sv+" vecinos y no perdió a ninguno"];
  else if(nx&&G.treasury>=BUILD[nx].c&&!G.fin)h=["💰","Ya hay fondos: "+BUILD[nx].n.toLowerCase()+" podría arreglarse mañana mismo"];
  else if(lo>=3)h=["⏱️","Filas largas en la pupusería: "+lo+" vecinos se fueron sin su pupusa"];
  else if(m>=40)h=["📈","Récord de ventas: la pupusería del alcalde recaudó "+fm(m)+" en una sola jornada"];
  else h=["🫓","Alcalde Pupusa atendió a "+sv+" vecinos y sumó "+fm(m)+" a la caja municipal"];
  const sub="Caja "+fm(G.treasury)+" · Obras "+done+"/"+Object.keys(BUILD).length+(cl?" · Cliente del día: "+cl.occupation.toLowerCase()+", "+cl.age+" años ("+(cl.municipality||mu)+")":"");
  G.hl={e:h[0],h:h[1],sub,d:G.days}}
const hlHTML=()=>G.hl?`<div class="hl"><span class="st">ÚLTIMA HORA · DÍA ${G.hl.d}</span><b>${G.hl.e} ${G.hl.h}</b><small>${G.hl.sub}</small></div>`:"";
function endDay(){
  if(DUELX){PAUSED=true;DAYON=false;S.t=0;draw();if(typeof duelEnd!=="undefined")duelEnd(S.money,S.served);return}
  PAUSED=true;DAYON=false;S.t=0;draw();G.treasury+=S.money;G.earned+=S.money;G.days++;CAMP.gd++;G.served=(G.served||0)+S.served;dayHeadline();G.seen.push(...S.seen);
  const cnt={};G.seen.forEach(p=>{if(p.municipality)cnt[p.municipality]=(cnt[p.municipality]||0)+1});
  const top=Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a])[0];if(top&&!G.dep)G.muni=top;
  (G.fin?showGov:showHub)("Día de trabajo "+G.days+" terminado: ganaste "+fm(S.money)+" ("+S.served+" servidos, "+S.lost+" se fueron). Ya podés invertir en el municipio.");queueNews();if(typeof afterDay!=="undefined")afterDay()}
function build(k){const b=BUILD[k];if(G.built[k]||G.treasury<b.c)return;const N=needs();G.treasury-=b.c;G.built[k]=1;G.welfare+=10+Math.round(N[k]*.4);G.log.push(b.n);if(typeof onBuild!=="undefined")onBuild(k);
  const fin=()=>{if(!G.fin&&Object.keys(BUILD).filter(x=>G.built[x]).length>=FIN_N)report();else showHub("¡Listo! "+b.n+" construido: "+b.d+".")};
  if(typeof Town3D!=="undefined"&&$("t3")&&$("t3").firstChild){const d=Town3D.celebrate(k);document.querySelectorAll("#alc button").forEach(x=>x.disabled=true);setTimeout(fin,d*1000+300)}else fin()}
function buildAll(){const N=needs(),ks=Object.keys(BUILD).filter(k=>!G.built[k]).sort((a,b)=>N[b]-N[a]),got=[];
  for(const k of ks){const b=BUILD[k];if(G.treasury>=b.c){G.treasury-=b.c;G.built[k]=1;G.welfare+=10+Math.round(N[k]*.4);G.log.push(b.n);got.push(k);if(typeof onBuild!=="undefined")onBuild(k)}}
  if(!got.length)return;const last=got[got.length-1];
  const fin=()=>{if(!G.fin&&Object.keys(BUILD).filter(x=>G.built[x]).length>=FIN_N)report();else if(G.fin)showGov("¡Listo! "+got.map(k=>BUILD[k].n).join(", ")+".");else showHub("¡Listo! Resolviste "+got.length+" obra"+(got.length>1?"s":"")+": "+got.map(k=>BUILD[k].n).join(", ")+".")};
  if(typeof Town3D!=="undefined"&&$("t3")&&$("t3").firstChild){Town3D.setBuilt(G.built);const d=Town3D.celebrate(last);document.querySelectorAll("#alc button").forEach(x=>x.disabled=true);setTimeout(fin,d*1000+300)}else fin()}
function avgIncome(){return G.days?Math.max(1,Math.round(G.earned/G.days)):35}
function daysFor(cost){return Math.ceil(Math.max(0,cost-G.treasury)/avgIncome())}
let MT=0;
function arm(c,x0,y0,qx,qy,x1,y1){
  c.lineCap="round";c.beginPath();c.moveTo(x0,y0);c.quadraticCurveTo(qx,qy,x1,y1);c.lineWidth=22;c.strokeStyle=OUT;c.stroke();c.lineWidth=13;c.strokeStyle="#f0b84e";c.stroke();
  circ(c,x1,y1,17,"#fff",4.5);c.strokeStyle="rgba(58,31,16,.5)";c.lineWidth=2.5;c.beginPath();c.moveTo(x1-5,y1-14);c.lineTo(x1-5,y1-6);c.moveTo(x1+5,y1-14);c.lineTo(x1+5,y1-6);c.stroke();
}
function star(c,x,y,r,fill){const p=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr2=i%2?r*.45:r;p.push([x+Math.cos(a)*rr2,y+Math.sin(a)*rr2])}poly(c,p,fill,3)}
function drawMascot(){
  const cv2=$("mas");if(!cv2)return;const c=cv2.getContext("2d");c.setTransform(2,0,0,2,0,0);c.clearRect(0,0,320,320);
  const ph=Math.sin(MT/5),hop=Math.max(0,ph)*16,sq=ph<0?Math.abs(ph)*.05:-ph*.03,wv=Math.sin(MT/2.6)*.45;
  const blink=(MT%64)<3,look=Math.sin(MT/17)*4;
  ell(c,160,304,96-hop*.9,11-hop*.3,"rgba(0,0,0,.25)",0);
  for(let n=0;n<3;n++){const u=(MT*1.3+n*22)%66;c.globalAlpha=(1-u/66)*.75;ell(c,120+n*40+Math.sin((MT+n*9)/5)*5,50-hop-u*.5,8,12,"#fff",0);c.globalAlpha=1}
  c.save();c.translate(0,-hop);
  // pies
  for(const x of[122,198]){ell(c,x,292,30,15,"#7a3b1a",5);ell(c,x,299,28,6,"#fff4dc",0);ell(c,x-8,287,9,4,"rgba(255,255,255,.45)",0)}
  // brazo izquierdo en la cadera
  c.save();c.translate(160,292);c.scale(1-sq,1+sq);c.translate(-160,-292);c.translate(0,-12);
  // cuerpo
  c.beginPath();c.arc(160,184,106,0,Math.PI*2);fs(c,rg(c,126,138,12,160,184,128,[[0,"#fff0a8"],[.55,"#f7c85a"],[1,"#d9962f"]]),8);
  c.save();c.beginPath();c.arc(160,184,102,0,Math.PI*2);c.clip();
  c.strokeStyle="rgba(150,80,20,.35)";c.lineWidth=7;c.setLineDash([12,13]);c.beginPath();c.arc(160,184,90,0,Math.PI*2);c.stroke();c.setLineDash([]);
  // banda de alcalde
  c.lineCap="butt";c.strokeStyle=OUT;c.lineWidth=42;c.beginPath();c.moveTo(30,290);c.lineTo(296,104);c.stroke();
  c.strokeStyle="#2f78c4";c.lineWidth=34;c.stroke();c.strokeStyle="#fff";c.lineWidth=12;c.stroke();
  c.fillStyle="rgba(120,60,10,.45)";for(const[x,y]of[[96,104],[222,96],[246,176],[96,170],[196,276],[262,236]]){c.beginPath();c.ellipse(x,y,9,6,.6,0,7);c.fill()}
  c.restore();
  star(c,98,236,17,"#f6c344");
  // brillo
  c.strokeStyle="rgba(255,255,255,.75)";c.lineWidth=9;c.lineCap="round";c.beginPath();c.arc(160,184,90,3.55,4.25);c.stroke();
  // queso derretido
  for(const[x,y,w,h]of[[214,256,24,44],[246,230,18,28]]){box(c,x,y,w,h,w/2,"#ffe27a",5);ell(c,x+w*.32,y+10,3,6,"rgba(255,255,255,.7)",0)}
  // cara
  for(const sx of[-1,1]){const ex=160+sx*33,ey=150,ry=blink?3:30;
    ell(c,ex,ey,23,ry,"#fff",5);
    if(!blink){circ(c,ex+look-sx*1,ey+4,13,"#2a1a10",0);circ(c,ex+look-4,ey-3,5,"#fff",0);circ(c,ex+look+4,ey+9,2.4,"#fff",0)}
    c.strokeStyle=OUT;c.lineWidth=8;c.lineCap="round";c.beginPath();c.moveTo(ex-sx*22,ey-40-wv*3);c.quadraticCurveTo(ex,ey-54-wv*3,ex+sx*20,ey-38);c.stroke()}
  ell(c,104,200,17,11,"rgba(255,80,90,.45)",0);ell(c,216,200,17,11,"rgba(255,80,90,.45)",0);
  c.beginPath();c.moveTo(118,196);c.quadraticCurveTo(160,206,202,196);c.quadraticCurveTo(196,250,160,252);c.quadraticCurveTo(124,250,118,196);c.closePath();fs(c,"#6a1a14",6);
  c.save();c.clip();ell(c,160,250,32,20,"#f0707a",0);c.fillStyle="#fff";c.fillRect(124,194,72,13);c.restore();
  c.strokeStyle=OUT;c.lineWidth=3;c.beginPath();c.moveTo(118,196);c.quadraticCurveTo(160,206,202,196);c.stroke();
  c.restore();
  arm(c,64,188,34,226,82,244);
  // brazo derecho saludando
  c.save();c.translate(250,194);c.rotate(-1.05+wv);c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(26,-14,48,-10);c.lineWidth=22;c.strokeStyle=OUT;c.lineCap="round";c.stroke();c.lineWidth=13;c.strokeStyle="#f0b84e";c.stroke();circ(c,52,-10,18,"#fff",4.5);
  c.strokeStyle="rgba(58,31,16,.5)";c.lineWidth=2.5;c.beginPath();c.moveTo(48,-26);c.lineTo(48,-18);c.moveTo(58,-26);c.lineTo(58,-18);c.stroke();c.restore();
  c.restore();
}
setInterval(()=>{const m=$("menu");if(m&&m.style.display==="grid"){MT++;const c=$("mbg").getContext("2d");c.setTransform(2,0,0,2,0,0);drawTown(c,G.built,MT*.5);drawMascot()}},66);
const HOW='<h2>Cómo jugar</h2><p><b>Día de trabajo:</b></p><p>1. Tocá un tazón: la pupusa va al comal.<br>2. Cuando esté dorada, tocala: pasa al plato.<br>3. ¡Toda pupusa lleva salsa! Tocá la botella roja; agregá curtido o bebida si el cliente lo pide.<br>4. Tocá al cliente para servirle. Si te equivocás, el mensaje te dice qué falta.</p><p><b>Alcaldía:</b> lo que ganás se acumula en la caja. Usalo para resolver los problemas del municipio. ¡Cuantos menos días tardés, mejor alcalde!</p>';
const CRED='<h2>Créditos</h2><p>Juego hecho para el hackatón con los datos de <b>Nemotron-Personas-El-Salvador</b> (NVIDIA, licencia CC-BY-4.0): edad, sexo, ocupación y municipio de personas sintéticas.</p><p>Sin APIs ni servidores: todo corre en tu navegador.</p>';
function info(h){const e=$("info");e.innerHTML='<div class="box">'+h+'<button class="next" id="ic">Cerrar</button></div>';e.style.display="grid";$("ic").onclick=()=>e.style.display="none"}

function pickDep(id,then){
  if(G.dep)SAVE[G.dep]=G;
  G=SAVE[id]||Object.assign(freshG(),{dep:id});SAVE[id]=G;
  S=mkDay();PAUSED=true;DAYON=false;$("dep").style.display="none";
  if(then==="day")startDay();else if(then==="alc"){$("menu").style.display="none";G.fin?showGov():showHub()}else showMenu();if(typeof Story!=="undefined"){const d=depOf(id);XQ.push(done=>Story.play("intro",()=>Story.play("dep",done,d)));nextOverlay()}if(typeof saveGame!=="undefined")saveGame()}

// ---------- carrera política: elecciones internas, peticiones ciudadanas, primarias y presidencia ----------
// Los votantes son personas del dataset (Nemotron): edad, sexo, ocupación, municipio, zona. Sin API: todo se calcula aquí.
const PRIM=2,PRES=3,WIN=.505,FIN_N=4;
const RIVAL_INT=["Lic. Roxana Valle","Don Efraín Guardado","Prof. Lilian Ayala","Ing. Santos Rivas"];
const relevantTo=(v,k)=>{const b=BUILD[k];return b.f?!!b.f(v):hh(v.age,k.length+(v.vid||0))%2===0};
const areaOf=v=>v.area&&/rural|urban/i.test(v.area)?(/rural/i.test(v.area)?"Rural":"Urbana"):(/agric|cultiv|ganad|pesca|finca|campo|jornal/i.test(v.occupation||"")?"Rural":"Urbana");
function depOfVoter(v){return DEPS.find(d=>inDep(v,d))}
function electorate(scope,n){
  const base0=scope?P.filter(p=>inDep(p,scope)):P,base=base0.length>=3?base0:P,out=[];
  for(let i=0;i<n;i++){const p=base[(i*7+3)%base.length],age=Math.max(18,Math.min(95,p.age+((i*13)%11)-5));
    const v=Object.assign({},p,{age,vid:i,uuid:p.uuid});v.d=scope||depOfVoter(p)||DEPS[(hh(age,i)+i)%DEPS.length];out.push(v)}
  return out}
function allSaves(){return Object.keys(SAVE).length?Object.values(SAVE):[G]}
function metSet(){const m=new Set();allSaves().forEach(g=>(g.seen||[]).forEach(p=>m.add(p.uuid)));return m}
function ctxFor(kind,scope){
  const L=allSaves(),led=new Set(L.filter(g=>g.led).map(g=>g.dep)),cnt={};
  Object.keys(BUILD).forEach(k=>cnt[k]=L.filter(g=>g.built&&g.built[k]).length);
  const days=CAMP.gd,rival=kind==="dep"?.46+.02*led.size:kind==="prim"?.55:.57;
  return{scope,kind,led,cnt,days,met:metSet(),rival,name:kind==="dep"?RIVAL_INT[(scope?scope.id.length:0)%RIVAL_INT.length]:kind==="prim"?"Ing. Rodolfo Menjívar":"Lic. Marta Quintanilla"}}
function voteScore(v,c){
  let s=.2;
  for(const k in BUILD){const have=c.kind==="dep"?(c.scope&&SAVE[c.scope.id]?(SAVE[c.scope.id].built[k]?1:0):(G.built[k]?1:0)):Math.min(1,c.cnt[k]/2);s+=have*(relevantTo(v,k)?.09:.03)}
  s+=Math.min(.12,c.days*.004);if(c.met.has(v.uuid))s+=.08;
  if(c.kind!=="dep"){if(v.d&&c.led.has(v.d.id))s+=.2;else s+=Math.min(.1,c.led.size*.03)}
  return s+(hh(v.vid,v.age)-50)/500+(typeof popBonus!=="undefined"?popBonus(v,c):0)}
function runElection(kind,scope){
  const c=ctxFor(kind,scope),V=electorate(kind==="dep"?scope:null,kind==="dep"?400:700);let yes=0;const g={};
  const grp=(n,v,y)=>{(g[n]=g[n]||{y:0,t:0});g[n].t++;if(y)g[n].y++};
  const votes=V.map(v=>{const y=voteScore(v,c)>c.rival+(hh(v.age,v.vid+99)-50)/500;if(y)yes++;
    grp(v.age<35?"18–34 años":v.age<55?"35–54 años":"55 años o más",v,y);grp(/fem/i.test(v.sex)?"Mujeres":"Hombres",v,y);grp(areaOf(v),v,y);return{v,y}});
  const pc=Math.round(yes/V.length*1000)/10;
  const byDep={};votes.forEach(o=>{const d=o.v.d;byDep[d.id]=byDep[d.id]||{d,y:0,t:0};byDep[d.id].t++;if(o.y)byDep[d.id].y++});
  const pick=[];[true,false].forEach(w=>{votes.filter(o=>o.y===w).slice(0,40).forEach(o=>{if(pick.length<(w?2:1)+(w?0:pick.length>2?0:0)&&!pick.some(q=>q.v.occupation===o.v.occupation))pick.push(o)})});
  const voices=[];const yv=votes.filter(o=>o.y),nv=votes.filter(o=>!o.y);
  [yv[0],yv[Math.floor(yv.length/2)],nv[0]].filter(Boolean).forEach(o=>voices.push(o));
  return{c,pc,win:pc/100>=WIN,n:V.length,g,byDep,voices,rival:c.name}}
function voiceText(o,c){const v=o.v;
  const have=Object.keys(BUILD).filter(k=>relevantTo(v,k)&&(c.kind==="dep"?(G.built[k]):c.cnt[k]>0));
  if(o.y)return have.length?"Voto por el alcalde Pupusa: "+BUILD[have[0]].n.toLowerCase()+" nos cambió la vida.":"Voto por él porque lo veo trabajar, y las pupusas están buenas.";
  const miss=Object.keys(BUILD).filter(k=>relevantTo(v,k)&&!(c.kind==="dep"?G.built[k]:c.cnt[k]>0));
  return miss.length?"Todavía no: me falta ver "+BUILD[miss[0]].n.toLowerCase()+". Que siga trabajando.":"Me cae bien, pero prefiero a "+c.name+"."}
function electionScreen(kind,res,after){
  const el=$("elec"),d=res.c.scope,tt=kind==="dep"?"Elecciones internas · "+d.cab:kind==="prim"?"Primarias nacionales del partido":"Elecciones presidenciales";
  const bars=Object.entries(res.g).map(([n,x])=>`<div class="eb"><span>${n}</span><i><b style="width:0" data-w="${Math.round(x.y/x.t*100)}"></b></i><em>${Math.round(x.y/x.t*100)} %</em></div>`).join("");
  const dp=kind==="dep"?"":`<h4>Voto por departamento</h4><div class="dg">${DEPS.map(dd=>{const o=res.byDep[dd.id];return`<span class="dd" style="background:${o?(o.y/o.t>=.5?"#2a7a3a":"#a8241a"):"#c9bba0"};color:${o?"#fff":"#3a2a18"}">${dd.cab}${o?" · "+Math.round(o.y/o.t*100)+"%":""}</span>`}).join("")}</div>`;
  el.innerHTML=`<div class="box"><h2>🗳️ ${tt}</h2><p class="sub">Alcalde Pupusa contra <b>${res.rival}</b> · ${res.n} votantes de Nemotron-Personas-El-Salvador${kind==="dep"&&depCount(d)<30?" (muestra pequeña; con el dataset completo votan personas reales de "+d.dep+")":""}</p>
  <div class="vs"><div class="side me"><small>Alcalde Pupusa</small><b id="vme">0 %</b></div><div class="mid"><div class="bar2"><span id="vbar" style="width:0"></span><u></u></div><small>Se necesita más de 50 %</small></div><div class="side"><small>${res.rival}</small><b id="vri">0 %</b></div></div>
  <h4>Cómo votó cada grupo</h4><div class="ebs">${bars}</div>${dp}
  <h4>Voces del electorado</h4><div class="voices">${res.voices.map(o=>`<p class="vc ${o.y?"y":"n"}"><b>${o.v.occupation}, ${o.v.age} años · ${o.v.municipality||""}</b>${o.v.persona?`<small>Perfil: ${o.v.persona}</small>`:""}“${voiceText(o,res.c)}”</p>`).join("")}</div>
  <p class="verdict" id="ver" style="visibility:hidden"></p><button class="next" id="econt" style="visibility:hidden">Continuar</button></div>`;
  el.style.display="grid";el.scrollTop=0;
  let t0=null;const target=res.pc;
  const step=ts=>{if(!t0)t0=ts;const u=Math.min(1,(ts-t0)/2200),e=1-Math.pow(1-u,3),m=target*e;$("vme").textContent=m.toFixed(1)+" %";$("vri").textContent=(100-m).toFixed(1)+" %";$("vbar").style.width=m+"%";
    if(u<1)requestAnimationFrame(step);else{el.querySelectorAll("[data-w]").forEach(b=>b.style.width=b.dataset.w+"%");const v=$("ver");v.textContent=res.win?"¡GANASTE con "+res.pc+" %!":"Perdiste con "+res.pc+": te faltaron "+(50.5-res.pc).toFixed(1)+" puntos";v.className="verdict "+(res.win?"w":"l");v.style.visibility="visible";$("econt").style.visibility="visible"}};
  requestAnimationFrame(step);
  $("econt").onclick=()=>{el.style.display="none";after(res)}}
const PET=[["salud","hospital|medic|enfermer|salud|clinic","una clínica que no cierre a las 3 de la tarde"],["agro","agric|cultiv|ganad|pesca|finca|campo|jornal","caminos para sacar la cosecha y agua para riego"],["mercado","vend|comerc|mercado|ambulante|artesan|costur","ordenar el mercado y poner alumbrado"],["edu","educ|escuel|profes|docen|estudi|maestr","becas, útiles y una escuela con techo"],["transp","transp|conduc|taxi|bus|motorista","arreglar la carretera y el puente"]];
function petitions(d){
  if(G.pets)return G.pets;const base=P.filter(p=>inDep(p,d)),src=base.length>=3?base:P,out=[],used=new Set();
  for(let i=0;i<src.length&&out.length<2;i++){const p=src[(i*5+1)%src.length];if(used.has(p.occupation)&&i<src.length-1)continue;used.add(p.occupation);
    const t=PET.find(x=>new RegExp(x[1],"i").test(p.occupation||""))||["gen","","que vengas a gestionar mi municipio"];
    out.push({p,ask:t[2],cost:25+15*out.length,done:0,mun:p.municipality||d.dep})}
  while(out.length<2){const p=src[out.length%src.length];out.push({p,ask:"que vengas a gestionar mi municipio",cost:25+15*out.length,done:0,mun:p.municipality||d.dep})}
  return G.pets=out}
function showGov(msg){
  $("menu").style.display="none";if(typeof GL!=="undefined")GL.unmount();
  const d=depOf(G.dep),el=$("alc");let body="";
  if(!G.won){const wait=G.tryDay!=null?Math.max(0,G.tryDay+2-G.days):0;
    body=`<p>Resolviste los problemas principales de <b>${d.cab}</b>. Ahora el movimiento debe elegir a su candidato: <b>elecciones internas</b> con votantes de ${d.dep}.</p>${G.lost?`<p class="hint">Perdiste la última interna (${G.lost} %). Sigue trabajando y reintenta.</p>`:""}
    <button class="next" id="gvote" ${wait?"disabled":""}>${wait?"Reintenta en "+wait+" día"+(wait>1?"s":"")+" de trabajo":"🗳️ Convocar elecciones internas"}</button>`}
  else{const P3=petitions(d),ndone=P3.filter(x=>x.done).length;
    body=`<p>¡Ganaste la interna! En ${d.dep} la gente pide que gestiones <b>todo el departamento</b>. Atiende las peticiones ciudadanas (pagan la caja: <b>${fm(G.treasury)}</b>).</p><div class="grid">${P3.map((x,i)=>`<div class="card${x.done?" done":""}"><div class="ct"><span class="em">${x.done?"✅":"🙋"}</span><b>${x.p.occupation}, ${x.p.age} años</b></div><p class="cd">Vive en ${x.mun}. Pide: ${x.ask}.</p>${x.p.persona?`<small class="nl">Perfil: ${x.p.persona}</small>`:""}<button data-pt="${i}" ${x.done||G.treasury<x.cost?"disabled":""}>${x.done?"Atendida":"Atender · $"+x.cost}</button></div>`).join("")}</div>
    ${ndone===P3.length?`<p class="big" style="font-size:1.4rem">🏅 Líder del departamento de ${d.dep}</p>`:""}`}
  el.innerHTML=`<div class="box">${hlHTML()}<div class="hh"><div><h2>${d.e} Gestión de ${d.dep}</h2><p class="sub">${msg||"Camino a la presidencia: "+Object.values(SAVE).filter(g=>g.led).length+" departamento(s) liderado(s)."}</p></div><button id="hm">☰ Menú</button></div>${body}
  <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px"><button class="next" id="gday">🫓 Trabajar un día (ganar caja)</button><button id="gdeps" style="background:#1f5fa8">🗺️ Elegir otra alcaldía</button><button id="gmap" style="background:#2a7a3a">🏗️ Obras pendientes</button><button id="gshop" style="background:#1f5fa8">🛠️ Mejorar pupusería</button><button id="gel" style="background:#6b4a8a">🧑‍🤝‍🧑 Tu electorado</button></div></div>`;
  el.style.display="grid";$("hm").onclick=showMenu;$("gday").onclick=startDay;$("gdeps").onclick=()=>{el.style.display="none";showDeps("menu")};$("gshop").onclick=()=>showShop();$("gmap").onclick=()=>showHub();$("gel").onclick=()=>showElectorate();
  const gv=$("gvote");if(gv)gv.onclick=()=>{el.style.display="none";if(typeof Story!=="undefined")Story.play("interna",()=>{});const res=runElection("dep",d);G.tryDay=CAMP.gd;electionScreen("dep",res,r=>{if(r.win){G.won=1;G.lost=0;special({tag:"Elecciones internas",h:"Alcalde Pupusa gana la interna en "+d.dep,sub:r.pc+" % de los votos frente a "+r.rival,e:"🗳️",cap:d.cab,p:["Los vecinos de "+d.dep+" salieron a votar y le dieron la victoria al alcalde que atiende su propia pupusería.","Ahora piden que gestione todo el departamento: la gente no quiere discursos, quiere resultados."],q:quote()});showGov("¡Ganaste las internas con "+r.pc+" %! Ahora la gente te pide que gestiones el departamento.")}else{G.lost=r.pc;showGov("Perdiste las internas con "+r.pc+" %. Sigue trabajando y vuelve a intentarlo.")}})};
  el.querySelectorAll("[data-pt]").forEach(b=>b.onclick=()=>{const x=petitions(d)[b.dataset.pt];if(x.done||G.treasury<x.cost)return;G.treasury-=x.cost;x.done=1;G.welfare+=15;
    if(petitions(d).every(y=>y.done)){G.led=1;special({tag:"Gestión departamental",h:"Alcalde Pupusa ya gobierna todo "+d.dep,sub:"Líder departamental #"+Object.values(SAVE).filter(g=>g.led).length,e:"🏅",cap:d.dep,p:["Tras atender las peticiones de sus vecinos, el departamento de "+d.dep+" lo reconoce como su líder.","Analistas ya lo mencionan para las primarias nacionales del partido."],q:quote()});showGov("¡Liderás "+d.dep+"! Elegí otra alcaldía para seguir creciendo.")}else showGov("Petición atendida: "+x.mun+" ya tiene gestión del alcalde.")})}
function special(n){NQ.unshift(n);if($("news").style.display!=="grid")setTimeout(showNext,300)}
function nationalPanel(){const led=Object.values(SAVE).filter(g=>g.led).length;
  const st=[["🏛️","Alcalde",1],["🏅","Líder departamental ("+led+")",led>=1],["🗳️","Primarias ("+PRIM+" depts)",CAMP.prim],["🇸🇻","Presidencia ("+PRES+" depts)",CAMP.pres]];
  const canPrim=!CAMP.prim&&led>=PRIM,canPres=CAMP.prim&&!CAMP.pres&&led>=PRES;
  return `<div class="road">${st.map(s=>`<span class="${s[2]?"on":""}">${s[0]} ${s[1]}</span>`).join("<i>›</i>")}</div>
  <div class="nat">${canPrim?'<button class="next" id="nprim">🗳️ Primarias nacionales del partido</button>':""}${canPres?'<button class="next" id="npres">🇸🇻 ¡Elecciones presidenciales!</button>':""}${!canPrim&&!canPres?`<small>${!CAMP.prim?"Lidera "+Math.max(0,PRIM-led)+" departamento(s) más para las primarias.":"Lidera "+Math.max(0,PRES-led)+" departamento(s) más para la presidencia."}</small>`:""}</div>`}
function bindNational(){
  const run=kind=>typeof Story!=="undefined"?Story.play(kind,()=>run1(kind)):run1(kind);const run1=(kind)=>{$("dep").style.display="none";const res=runElection(kind,null);electionScreen(kind,res,r=>{
    if(kind==="prim"){if(r.win){CAMP.prim=1;special({tag:"Primarias nacionales",h:"Alcalde Pupusa es el candidato presidencial del partido",sub:r.pc+" % en las internas nacionales",e:"🗳️",cap:"Candidato",p:["Con el respaldo de sus departamentos, el alcalde derrotó a "+r.rival+" en las primarias.","La Casa Presidencial ya aparece en su ruta."],q:quote()})}else special({tag:"Primarias nacionales",h:"Alcalde Pupusa pierde las primarias con "+r.pc+" %",sub:"Pide más obras y más departamentos",e:"📉",cap:"Revés",p:["El alcalde reconoce que le faltó recorrido: “volveré a la pupusería”.","Podrá intentarlo otra vez tras liderar más departamentos."],q:quote()});showDeps("menu")}
    else{if(r.win)return showWin(r);special({tag:"Elecciones presidenciales",h:"Alcalde Pupusa pierde la presidencia con "+r.pc+" %",sub:"Contra "+r.rival,e:"📉",cap:"Revés",p:["La elección fue cerrada, pero el electorado quiere ver más obras en más departamentos.","El alcalde promete seguir amasando."],q:quote()});showDeps("menu")}})};
  const a=$("nprim"),b=$("npres");if(a)a.onclick=()=>run("prim");if(b)b.onclick=()=>run("pres")}
function showWin(r){
  const T=campTotals(),el=$("alc");
  el.innerHTML=`<div class="box" style="text-align:center"><div class="fw">🎆 🇸🇻 🎆</div><h2 style="font-size:2.3rem">¡Presidente Pupusa!</h2><p class="big">Ganaste la presidencia con ${r.pc} %</p>
  <p class="cash">De alcalde de una pupusería a Casa Presidencial en <b>${CAMP.gd} días de trabajo</b>.</p><p class="hint">${T.obras} obras entregadas · ${Object.values(SAVE).filter(g=>g.led).length} departamentos liderados · ${T.served} vecinos servidos · ${r.n} votantes de Nemotron-Personas-El-Salvador.</p>
  <p class="cd" style="margin:10px auto;max-width:520px">“Todo empezó con una pupusa de queso con loroco y un puente roto. Hoy, el presidente sigue cocinando para su pueblo.”</p><div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><button class="next" id="ncard" style="background:#1f5fa8">🏆 Mi tarjeta</button><button class="next" id="nx">Jugar otra vez</button></div></div>`;if(typeof Snd!=="undefined")Snd.play("win");
  el.style.display="grid";$("ncard").onclick=()=>showCard();$("nx").onclick=()=>{el.style.display="none";newGame()};if(typeof Story!=="undefined")setTimeout(()=>Story.play("epi"),1500);
  special({tag:"EDICIÓN EXTRA",h:"¡Alcalde Pupusa es el nuevo presidente de El Salvador!",sub:r.pc+" % de los votos frente a "+r.rival,e:"🇸🇻",cap:"Presidente Pupusa",p:["Después de transformar "+T.obras+" obras en todo el país, el alcalde que atendía su propia pupusería llega a la presidencia.","“Gobernaré como cocino: sin prisa y sin dejar quemar la pupusa”, dijo en su primer discurso."],q:quote()})}
function showDeps(then){
  if(typeof GL!=="undefined")GL.unmount();
  const el=$("dep"),done=Object.keys(SAVE).filter(k=>SAVE[k].fin).length;
  const card=d=>{const sv=(G.dep===d.id?G:SAVE[d.id]),n=sv?Object.keys(BUILD).filter(k=>sv.built[k]).length:0,tot=Object.keys(BUILD).length;
    const b=sv&&sv.led?`<span class="bd ok">🏅 Líder departamental</span>`:sv&&sv.won?`<span class="bd go">Ganó la interna · peticiones</span>`:sv&&sv.fin?`<span class="bd ok">✓ Resuelta en ${sv.days} día${sv.days>1?"s":""}</span>`:sv&&(sv.days||n)?`<span class="bd go">En curso · ${n}/${tot} · ${sv.days} día${sv.days===1?"":"s"}</span>`:`<span class="bd">Nueva</span>`;
    const c=depCount(d);
    return `<button class="dc${G.dep===d.id?" cur":""}" data-d="${d.id}"><div class="dt" style="background:${d.c}"><span style="font-size:1.9rem">${d.e}</span><span>${d.cab}<small>Depto. ${d.dep}</small></span></div><div class="db"><span>${d.n}</span><span>${c?c+(c===1?" persona":" personas")+" del dataset":"Muestra nacional (sin datos propios)"}</span>${b}</div></button>`};
  const regs=["Occidente","Centro","Paracentral","Oriente"];
  el.innerHTML=`<div class="box"><div class="hh"><div><h2>Elegí tu alcaldía</h2><p class="sub">Una por cada cabecera departamental. Tus clientes salen de las personas reales de ese departamento. Resueltas: <b>${done}/14</b>.</p></div><button class="back" id="dback">← Volver</button></div>${nationalPanel()}${regs.map(r=>`<h3>${r}</h3><div class="gr">${DEPS.filter(d=>d.r===r).map(card).join("")}</div>`).join("")}</div>`;
  el.style.display="grid";el.scrollTop=0;
  el.querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>pickDep(b.dataset.d,then));
  $("dback").onclick=()=>{el.style.display="none"};bindNational()}
function showMenu(){
  if(typeof GL!=="undefined")GL.unmount();
  const m=$("menu"),k=Object.keys(BUILD),done=k.filter(x=>G.built[x]).length;
  const c=$("mbg"),x=c.getContext("2d");x.setTransform(2,0,0,2,0,0);drawTown(x,G.built,MT*.5);
  const dd=G.dep&&depOf(G.dep);$("mdepn").textContent=dd?"🗺️ Alcaldía: "+dd.cab:"🗺️ Elegir alcaldía";$("mdeps").textContent=dd?"Depto. de "+dd.dep+" · tocá para cambiar":"Una por cada cabecera departamental";
  $("mday").textContent=DAYON?"▶ Continuar el día de trabajo":"🫓 Iniciar un día de trabajo";
  $("mst").textContent=G.days||done?"Días trabajados: "+G.days+" · Caja: "+fm(G.treasury)+" · Problemas resueltos: "+done+"/"+k.length:dd?"Sos el alcalde de "+dd.cab+": cada día de trabajo recauda dinero para arreglar la ciudad.":"Elegí la cabecera departamental donde vas a ser alcalde y dueño de la pupusería.";
  $("alc").style.display="none";m.style.display="grid"}
function showHub(msg){
  $("menu").style.display="none";
  const el=$("alc"),N=needs(),keys=Object.keys(BUILD),open=keys.filter(k=>!G.built[k]).sort((a,b)=>N[b]-N[a]),best=open[0],avg=avgIncome();
  if(!G.sel||G.built[G.sel])G.sel=best||keys[0];
  const rem=open.reduce((a,k)=>a+BUILD[k].c,0),dias=Math.ceil(Math.max(0,rem-G.treasury)/avg),done=keys.length-open.length;
  const pins=keys.map(k=>{const ok=G.built[k];return `<button class="pin ${ok?"ok":"bad"}${k===G.sel?" sel":""}" style="left:${(I(...BUILD[k].a)[0]/9.6).toFixed(1)}%;top:${(I(...BUILD[k].a)[1]/4.8).toFixed(1)}%" data-p="${k}" aria-label="${BUILD[k].n}"><b>${ok?"✓":"!"}</b><small>${BUILD[k].n}</small></button>`}).join("")+(G.dep&&depOf(G.dep)?`<button class="pin lm" data-p="lm" style="display:none"><b>⭐</b><small>${depOf(G.dep).lm}</small></button>`:"")+`<button class="pin lm" data-p="shop" style="display:none"><b>🫓</b><small>Tu pupusería</small></button>`;
  const k=G.sel,b=BUILD[k],ok=G.built[k],falta=Math.max(0,b.c-G.treasury),dd=daysFor(b.c),can=!ok&&G.treasury>=b.c;
  el.innerHTML=`<div class="box wide">${hlHTML()}<div class="hh"><div><h2>Alcaldía de ${muni()}</h2><p class="sub">${msg||"Tocá un problema del mapa para ver cómo resolverlo."}</p>${G.dep&&depOf(G.dep)?`<p class="sub" style="margin-top:0">⭐ <b>${depOf(G.dep).e} ${depOf(G.dep).lm}</b> · ${depOf(G.dep).n}</p>`:""}</div><button id="hm">☰ Menú</button></div>
  <div class="town"><div id="t3" style="position:absolute;inset:0"></div><canvas id="tv"></canvas>${pins}</div>
  <div class="stats"><span>Caja <b>${fm(G.treasury)}</b></span><span>Resueltos <b>${done}/${keys.length}</b></span><span>Ganancia por día <b>~$${avg}</b> <i>${G.days?"(promedio)":"(estimada)"}</i></span><span class="days">${rem===0?"Todo resuelto":dias===0?"¡Ya alcanza para resolver todo!":"Para mejorar todo faltan <b>~"+dias+" día"+(dias>1?"s":"")+" de trabajo</b>"}</span></div>
  <div class="detail"><div class="ct"><span class="em">${b.e}</span><b>${b.n}</b>${ok?'<span class="rec ok">Resuelto</span>':k===best?'<span class="rec">Más urgente</span>':""}</div>
  <p><b>Problema:</b> ${b.p}</p><p><b>Mejora:</b> ${b.d}</p>
  <div class="nb"><span style="width:${N[k]}%"></span></div><div class="nl">Necesidad ${N[k]} %: ${b.need}${G.seen.length?"":" (sin datos aún: trabajá un día)"}</div>
  <button data-b="${k}" ${can?"":"disabled"}>${ok?"Resuelto ✓":can?"Resolver · $"+b.c:"Cuesta $"+b.c+" · faltan $"+falta+" (~"+dd+" día"+(dd>1?"s":"")+")"}</button></div>
  <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="next" id="hd">🫓 Iniciar un día de trabajo</button><button class="next" id="hall" style="background:#2a7a3a" ${open.some(k=>G.treasury>=BUILD[k].c)?"":"disabled"}>⚡ Resolver todo lo que alcance</button><button class="next" id="hshop" style="background:#1f5fa8">🛠️ Mejorar pupusería</button><button class="next" id="hel" style="background:#6b4a8a">🧑‍🤝‍🧑 Tu electorado</button></div></div>`;
  el.style.display="grid";
  const tv=$("tv");let g3=false;
  if(typeof Town3D!=="undefined"&&GL.ok()){g3=GL.mount($("t3"),Town3D);
    if(g3){tv.style.display="none";el.querySelector(".town").classList.add("g3");{const dd=G.dep&&depOf(G.dep);if(dd){Town3D.setTheme(dd);Town3D.setLandmark(dd.id,dd.lm)}}Town3D.setBuilt(G.built);if(Town3D.setShop){const led=Object.values(SAVE).filter(g=>g.led).length,dd=G.dep&&depOf(G.dep);Town3D.setShop(CAMP.up||{});Town3D.setProgress({obras:Object.keys(G.built).length,welfare:G.welfare,pop:CAMP.pop||0,led,prim:CAMP.prim,pres:CAMP.pres,dept:dd?dd.dep:""})}Town3D.setSelected(G.sel);Town3D.focus(G.sel);Town3D.pins(el.querySelector(".town"));Town3D.onPick(k=>{Town3D.setAuto(false);G.sel=k;showHub(msg)})}}
  if(!g3){tv.width=1920;tv.height=960;const x=tv.getContext("2d");x.setTransform(2,0,0,2,0,0);drawTown(x,G.built)}
  el.querySelectorAll("[data-p]").forEach(p=>p.onclick=()=>{if(p.dataset.p==="shop"){if(g3){Town3D.setAuto(false);Town3D.focus("shop");setTimeout(()=>{if($("t3")&&$("t3").firstChild)Town3D.focus(G.sel)},6000)}if(typeof showShop!=="undefined")showShop();return}if(p.dataset.p==="lm"){if(g3){Town3D.setAuto(false);Town3D.focus("lm");setTimeout(()=>{if($("t3")&&$("t3").firstChild)Town3D.focus(G.sel)},4500)}return}G.sel=p.dataset.p;if(g3)Town3D.setAuto(false);showHub(msg)});
  if(g3&&G.dep&&!G.intro){G.intro=1;Town3D.focus("lm");setTimeout(()=>{if($("t3")&&$("t3").firstChild)Town3D.focus(G.sel)},3600)}
  el.querySelectorAll("[data-b]").forEach(p=>p.onclick=()=>build(p.dataset.b));
  $("hd").onclick=startDay;$("hm").onclick=showMenu;$("hshop").onclick=()=>showShop();$("hall").onclick=buildAll;$("hel").onclick=()=>showElectorate()}
function report(){
  const d=G.days;G.fin=1;showGov("¡Municipio transformado! Resolviste los problemas principales en "+d+" día"+(d>1?"s":"")+" de trabajo ("+(d<=4?"alcalde ejemplar":d<=6?"alcalde del pueblo":"alcalde novato")+"). Ahora el movimiento elige a su candidato.")}
const st=s=>s.age<RAW()?"raw":s.age<RAW()+9?"ready":"burnt";
const mkOrder=p=>{const k=hh(p.age,p.occupation.length);const o={r:p.pedido,sal:true,cur:k%3!==0,dr:(k%5<3)?(p.age>=55?"chocolate":p.age<25?"cebada":"horchata"):null};if(typeof retoOrder!=="undefined")retoOrder(o);return o};
// ---------- avatares ilustrados opcionales ----------
const AV={};
function avatar(p){
  if(!p.avatar)return null;
  if(!(p.avatar in AV)){const im=new Image();im.onerror=()=>{AV[p.avatar]=null};im.src=p.avatar;AV[p.avatar]=im}
  const im=AV[p.avatar];return im&&im.complete&&im.naturalWidth?im:null;
}
// ---------- clientes ----------
function fit(t,max,size,wt){g.font=wt+" "+size+"px "+FONT;while(g.measureText(t).width>max&&size>9){size-=.5;g.font=wt+" "+size+"px "+FONT}}
function bubble(i,cl,f){
  const cx=CX[i],o=cl.order,items=[{t:"p"}];if(o.sal)items.push({t:"s"});if(o.cur)items.push({t:"c"});if(o.dr)items.push({t:"d"});
  g.beginPath();g.moveTo(cx-16,186);g.lineTo(cx+16,186);g.lineTo(cx,218);g.closePath();fs(g,"#fffaf0",4);
  box(g,cx-96,40,192,152,28,"#fffaf0",4.5);g.fillStyle="#fffaf0";g.fillRect(cx-14,186,28,6);
  items.forEach((it,n)=>{const sp=items.length>3?50:64,x=cx+(n-(items.length-1)/2)*sp,y=78;
    if(it.t==="p")pupusa(g,x,y-4,items.length>3?22:25,"ready",F[o.r]);else if(it.t==="s")salsaBottle(g,x,y+2,24,52);else if(it.t==="c")bowl(g,x,y,items.length>3?19:23,CURF,true);else drink(g,o.dr,x,y,items.length>3?26:30,50)});
  g.textAlign="center";g.textBaseline="middle";g.fillStyle=OUT;
  const t1="Pupusa de "+o.r,t2=["salsa",o.cur?"curtido":"",o.dr||""].filter(Boolean).join(" + ")||"salsa";
  fit(t1,178,15,800);g.fillText(t1,cx,122);
  fit(t2,176,14.5,700);g.fillStyle="#7a4a28";g.fillText(t2,cx,142);
  box(g,cx-74,156,148,14,7,"#3a1f10",0);box(g,cx-72,158,144,10,5,"#5a4030",0);
  const pw=Math.max(0,144*f);if(pw>8){box(g,cx-72,158,pw,10,5,f>.6?"#4cb85a":f>.3?"#f6c344":"#e04030",0)}
}
function person(i,cl){
  const p=cl.p,k=hh(p.age,p.occupation.length),cx=CX[i],f=1-cl.wait/cl.max,bob=Math.sin((fr+i*23)/13)*2.5,fem=p.sex==="Femenino",old=p.age>=60,occ=p.occupation.toLowerCase();
  const im=avatar(p);
  if(im){const h=250,w=im.naturalWidth*h/im.naturalHeight;g.drawImage(im,cx-w/2,190+bob,w,h);bubble(i,cl,f);return}
  const sk=[["#fbd9b5","#eab68c"],["#e8b78e","#cb9166"],["#c98d64","#a86d46"]][k%3];
  const hair=old?["#f4f4f4","#c4c4c4"]:[["#3a2416","#1f120a"],["#6a3a1c","#3e2010"],["#2a2a2a","#0e0e0e"]][k%3];
  const shirt=[["#f6a336","#d97312"],["#4cb86e","#2a8a4c"],["#a47ade","#7448b8"],["#ee6464","#c23a3a"],["#52b0ee","#2a7fc0"],["#f4d44e","#d1a91e"]][k%6];
  const by=bob;
  if(fem){box(g,cx-78,212+by,156,178,62,lg(g,0,212,0,390,[[0,hair[0]],[1,hair[1]]]),4.5)}
  box(g,cx-21,328+by*.5,42,40,12,sk[1],4);
  g.beginPath();g.moveTo(cx-118,480);g.lineTo(cx-108,404);g.quadraticCurveTo(cx-100,360,cx-54,350);g.lineTo(cx+54,350);g.quadraticCurveTo(cx+100,360,cx+108,404);g.lineTo(cx+118,480);g.closePath();fs(g,lg(g,0,350,0,480,[[0,shirt[0]],[1,shirt[1]]]),4.5);
  g.fillStyle="rgba(255,255,255,.2)";g.beginPath();g.ellipse(cx-62,376,16,26,.5,0,7);g.fill();
  poly(g,[[cx-27,351],[cx,394],[cx+27,351]],sk[1],3.5);
  g.beginPath();g.moveTo(cx-32,349);g.lineTo(cx-2,400);g.lineTo(cx-48,372);g.closePath();fs(g,"#fffaf0",3.5);
  g.beginPath();g.moveTo(cx+32,349);g.lineTo(cx+2,400);g.lineTo(cx+48,372);g.closePath();fs(g,"#fffaf0",3.5);
  // cabeza
  ell(g,cx-60,288+by,11,16,sk[1],4);ell(g,cx+60,288+by,11,16,sk[1],4);
  g.beginPath();g.ellipse(cx,282+by,58,66,0,0,Math.PI*2);fs(g,rg(g,cx-18,258+by,10,cx,282+by,84,[[0,sk[0]],[1,sk[1]]]),4.5);
  ell(g,cx-34,310+by,15,8,"rgba(255,100,100,.36)",0);ell(g,cx+34,310+by,15,8,"rgba(255,100,100,.36)",0);
  // ojos
  const mood=f>.6?0:f>.3?1:2;
  for(const sx of[-1,1]){const ex=cx+sx*23,ey=280+by;
    ell(g,ex,ey,13,16,"#fff",3.5);circ(g,ex-sx*1.5,ey+2,7.2,"#2a1a10",0);circ(g,ex-sx*1.5-2.5,ey-2,2.6,"#fff",0);
    g.strokeStyle=old?"#9a9a9a":hair[1];g.lineWidth=7;g.lineCap="round";g.beginPath();
    if(mood===2){g.moveTo(cx+sx*44,252+by);g.quadraticCurveTo(cx+sx*28,252+by,cx+sx*8,266+by)}
    else if(mood===0){g.moveTo(cx+sx*42,256+by);g.quadraticCurveTo(cx+sx*26,244+by,cx+sx*8,254+by)}
    else{g.moveTo(cx+sx*42,258+by);g.quadraticCurveTo(cx+sx*26,250+by,cx+sx*8,258+by)}
    g.stroke()}
  g.strokeStyle=sk[1];g.lineWidth=3.5;g.beginPath();g.moveTo(cx-5,296+by);g.quadraticCurveTo(cx+7,308+by,cx-2,308+by);g.stroke();
  // pelo
  g.beginPath();
  if(fem){g.moveTo(cx-64,278+by);g.bezierCurveTo(cx-82,194+by,cx+82,194+by,cx+64,278+by);g.bezierCurveTo(cx+48,246+by,cx+16,232+by,cx-4,238+by);g.bezierCurveTo(cx-26,248+by,cx-48,256+by,cx-64,278+by)}
  else if(old){g.moveTo(cx-60,262+by);g.bezierCurveTo(cx-66,206+by,cx+66,206+by,cx+60,262+by);g.bezierCurveTo(cx+52,238+by,cx+26,226+by,cx,226+by);g.bezierCurveTo(cx-26,226+by,cx-52,238+by,cx-60,262+by)}
  else{g.moveTo(cx-62,270+by);g.bezierCurveTo(cx-74,194+by,cx+74,194+by,cx+62,270+by);g.bezierCurveTo(cx+54,242+by,cx+26,230+by,cx,232+by);g.bezierCurveTo(cx-28,234+by,cx-52,242+by,cx-62,270+by)}
  g.closePath();fs(g,lg(g,0,200+by,0,270+by,[[0,hair[0]],[1,hair[1]]]),4.5);
  // sombrero o casco según la ocupación
  if(/agric|cultiv|ganad|pesca|finca|rural/.test(occ)){ell(g,cx,230+by,106,22,"#ecc873",4.5);g.beginPath();g.moveTo(cx-58,228+by);g.bezierCurveTo(cx-58,160+by,cx+58,160+by,cx+58,228+by);g.closePath();fs(g,lg(g,0,170+by,0,230+by,[[0,"#f8e096"],[1,"#d9ab4a"]]),4.5);box(g,cx-57,212+by,114,16,5,"#d8392b",3.5)}
  else if(/construc|obra|instal|electric|mecan/.test(occ)){box(g,cx-74,226+by,148,16,8,"#e0ad10",4.5);g.beginPath();g.moveTo(cx-62,228+by);g.bezierCurveTo(cx-62,166+by,cx+62,166+by,cx+62,228+by);g.closePath();fs(g,lg(g,0,170+by,0,230+by,[[0,"#ffe05a"],[1,"#f0b800"]]),4.5);box(g,cx-8,180+by,16,48,5,"#f0b800",3)}
  // lentes y barba
  if(k%4===0){for(const sx of[-1,1])circ(g,cx+sx*24,281+by,19,"rgba(190,230,255,.22)",3.5);g.strokeStyle=OUT;g.lineWidth=3.5;g.beginPath();g.moveTo(cx-5,280+by);g.lineTo(cx+5,280+by);g.stroke()}
  const beard=!fem&&k%5===0&&p.age>30;
  if(beard){g.beginPath();g.moveTo(cx-50,298+by);g.bezierCurveTo(cx-52,378+by,cx+52,378+by,cx+50,298+by);g.bezierCurveTo(cx+32,326+by,cx-32,326+by,cx-50,298+by);g.closePath();fs(g,hair[0],4.5)}
  // boca
  g.lineCap="round";
  if(mood===0){g.beginPath();g.moveTo(cx-21,320+by);g.quadraticCurveTo(cx,346+by,cx+21,320+by);g.closePath();fs(g,beard?"#e0555a":"#8a2a1a",3.5);ell(g,cx,334+by,9,4.5,"#ee6a72",0)}
  else if(mood===1){g.strokeStyle=beard?"#f0b0a8":"#8a2a1a";g.lineWidth=5;g.beginPath();g.moveTo(cx-15,326+by);g.quadraticCurveTo(cx,330+by,cx+15,326+by);g.stroke()}
  else{g.strokeStyle=beard?"#f0b0a8":"#8a2a1a";g.lineWidth=5;g.beginPath();g.moveTo(cx-19,334+by);g.quadraticCurveTo(cx,316+by,cx+19,334+by);g.stroke();
    g.beginPath();g.moveTo(cx+66,240+by);g.quadraticCurveTo(cx+80,262+by,cx+66,266+by);g.quadraticCurveTo(cx+52,262+by,cx+66,240+by);fs(g,"#7fd0f4",2.5)}
  bubble(i,cl,f);
}
function nameTag(i,cl){
  const cx=CX[i];let t=(typeof affLvl!=="undefined"&&affLvl(cl.p)>=3?"♥ ":"")+cl.p.occupation+", "+cl.p.age;if(t.length>26)t=t.slice(0,24)+"…, "+cl.p.age;
  g.font="700 14px "+FONT;g.textAlign="center";g.textBaseline="middle";
  const w=Math.min(190,g.measureText(t).width+26);box(g,cx-w/2,429,w,26,13,"#fff4dc",3);g.fillStyle=OUT;g.fillText(t,cx,443);
}
// ---------- cuadro ----------
function draw(){
  g.drawImage(bgc,0,0,W,H);
  S.clients.forEach((cl,i)=>{if(cl){const e=Math.max(0,1-(fr-cl.born)/14),off=e*e*240;g.save();g.translate(0,off);person(i,cl);g.restore()}});
  g.drawImage(fgc,0,0,W,H);
  S.clients.forEach((cl,i)=>{if(cl)nameTag(i,cl)});
  for(let n=0;n<13;n++){const x=548+n*16,h=16+(Math.sin(fr/3+n*1.7)+1)*9+(n%3)*3;flame(g,x,704,h,8)}
  g.fillStyle="rgba(20,22,24,.55)";g.fillRect(546,682,210,10);
  for(let i=0;i<3;i++){const x=SX[i],s=S.slots[i];
    circ(g,x,SY,30,"#2c3135",3.5);circ(g,x,SY,26,"#555d64",0);
    if(s){const q=st(s);pupusa(g,x,SY,24,q,F[s.r]);
      box(g,x-24,SY+36,48,9,4,"#2a1a10",0);const pw=q==="raw"?48*s.age/6:48;box(g,x-23,SY+37,Math.max(0,pw-2),7,3,q==="raw"?"#f6e2a0":q==="ready"?"#4cb85a":"#e04030",0);
      for(let n=0;n<3;n++){const t=(fr+n*13)%40;g.globalAlpha=(1-t/40)*.6;ell(g,x-10+n*10+Math.sin((fr+n*9)/6)*3,SY-30-t*.9,5+t*.08,7,q==="burnt"?"#555":"#fff",0);g.globalAlpha=1}}}
  const pl=S.plate;plate(g,PL.x,PL.y,56);
  if(pl.cur)bowl(g,PL.x-22,PL.y+30,17,CURF,true);
  if(pl.r){pupusa(g,PL.x-4,PL.y-10,32,"ready",F[pl.r]);if(pl.sal)salsaDrizzle(g,PL.x-4,PL.y-12,32)}
  else if(pl.sal)bowl(g,PL.x+4,PL.y-4,14,{c:"#d8392b",hi:"#ff7a5a",lo:"#8a1810",rim:"#fff4dc"},false);
  if(pl.dr)drink(g,pl.dr,PL.x+40,PL.y+8,22,40);
  if(typeof drawLife!=="undefined")drawLife(g);if(typeof drawHUD!=="undefined")drawHUD(g);if(typeof drawSorp!=="undefined")drawSorp(g);
  PT=PT.filter(p=>p.l<34);
  PT.forEach(p=>{const a=1-p.l/34;g.globalAlpha=a;g.font="800 32px "+FONT;g.textAlign="center";g.textBaseline="middle";g.lineWidth=7;g.lineJoin="round";g.strokeStyle="#fff";g.strokeText(p.s,p.x,p.y-p.l*2);g.fillStyle=p.col;g.fillText(p.s,p.x,p.y-p.l*2);g.globalAlpha=1;p.l++});
  $("t").textContent="⏱ "+Math.ceil(S.t)+" s";$("m").textContent="Día "+(G.days+1)+" · Caja "+fm(G.treasury+S.money);$("s").textContent="Servidos: "+S.served;
}
function tick(){if(typeof rushTick!=="undefined")rushTick();if(typeof sorpTick!=="undefined")sorpTick();
  if(PAUSED)return;
  S.t-=.2;const MM=typeof MODS!=="undefined"?MODS():{cook:1};S.slots.forEach((s,i)=>{if(s){s.age+=.2*MM.cook;if(typeof CAMP!=="undefined"&&CAMP.up&&CAMP.up.ayud&&st(s)==="burnt"){S.slots[i]=null;PT.push({s:"🧑‍🍳",x:SX[i],y:560,l:0,col:"#2f9a3a"})}}});
  const M=typeof MODS!=="undefined"?MODS():{spawn:1,pat:1,cook:1,tip:0};
  S.clients.forEach((cl,i)=>{if(cl){cl.wait+=.2;if(cl.wait>=cl.max){if(typeof onLost!=="undefined")onLost(cl);S.clients[i]=null;S.lost++;S.money=Math.max(0,S.money-LOSTP());PT.push({s:"-"+fm(LOSTP()),x:CX[i],y:330,l:0,col:"#d8392b"});say("Un cliente se fue sin su pedido (-"+fm(LOSTP())+").")}}
    else if(DUELX?DUELX.next():Math.random()<(G.built.puente?.05:.035)*M.spawn*(S.rush?2.4:1)){const PL=pool();let p=DUELX?DUELX.take():typeof pickClient!=="undefined"?pickClient():PL[Math.floor(Math.random()*PL.length)];if(!DUELX&&typeof maybeVip!=="undefined")p=maybeVip(p);const o=mkOrder(p);S.seen.push(p);S.clients[i]={p,order:o,born:fr,wait:0,max:(26+(o.cur?4:0)+(o.dr?4:0)+(p.age>=55?8:0)-(p.age<25?3:0))*1.7*(!DUELX&&typeof BAL!=="undefined"?BAL.pat:1)*(G.built.salud?1.15:1)*(G.built.caminos?1.1:1)*M.pat*(p.vip?p.vip.pat:1)}}});
  if(S.t<=0)endDay()
}
function putPupusa(k){const i=S.slots.findIndex(x=>!x);if(i<0)return say("El comal está lleno.");S.slots[i]={r:k,age:0};if(typeof Snd!=="undefined")Snd.play("pop");say("Cocinándose: pupusa de "+k+".")}
function takePupusa(i){const s=S.slots[i];if(!s)return;const q=st(s);
  if(q==="burnt"){S.slots[i]=null;S.money=Math.max(0,S.money-(LOSTP()>1?1:.5));PT.push({s:"-"+fm(LOSTP()>1?1:.5),x:SX[i],y:560,l:0,col:"#d8392b"});say("Pupusa quemada a la basura (-"+fm(LOSTP()>1?1:.5)+").")}
  else if(q==="ready"){if(S.plate.r)return say("El plato ya tiene pupusa. Servila o vaciá el plato.");S.plate.r=s.r;S.slots[i]=null;if(typeof Snd!=="undefined")Snd.play("take");say("Pupusa en el plato. Agregá curtido o bebida si los piden.")}
  else say("Todavía está cruda.")}
const addSal=()=>{S.plate.sal=true;if(typeof Snd!=="undefined")Snd.play("tick");say("Salsa a la pupusa.")};
const addCur=()=>{S.plate.cur=true;if(typeof Snd!=="undefined")Snd.play("tick");say("Curtido al plato.")};
const addDr=d=>{S.plate.dr=d;if(typeof Snd!=="undefined")Snd.play("tick");say("Bebida: "+d+".")};
const clearPlate=()=>{S.plate={r:null,cur:false,sal:false,dr:null};say("Plato vaciado.")};
function tapClient(i){const cl=S.clients[i];if(!cl)return;const o=cl.order,pl=S.plate,bad=[];
  if(!pl.r&&!pl.cur&&!pl.dr&&!pl.sal)return say("El plato está vacío.");
  if(!pl.r)bad.push("Falta la pupusa");else if(pl.r!==o.r)bad.push("Pupusa equivocada");
  if(o.sal&&!pl.sal)bad.push("Falta la salsa");if(o.cur&&!pl.cur)bad.push("Falta el curtido");if(!o.cur&&pl.cur)bad.push("Sobra el curtido");
  if(o.dr&&!pl.dr)bad.push("Falta la bebida");else if(o.dr&&pl.dr!==o.dr)bad.push("Bebida equivocada");else if(!o.dr&&pl.dr)bad.push("Sobra la bebida");
  if(bad.length){cl.wait+=4;if(typeof onWrong!=="undefined")onWrong();return say(bad.join(". ")+".")}
  let v=5+(o.sal?1:0)+(o.cur?2:0)+(o.dr?3:0)+Math.round(3*(1-cl.wait/cl.max))+(G.built.mercado?1:0);if(!DUELX&&typeof BAL!=="undefined")v=BAL.price(o,cl);else v+=(typeof MODS!=="undefined"?MODS().tip+tipBonus(cl)+drinkBonus(o.dr):0);S.money+=v;S.served++;S.clients[i]=null;if(typeof onServed!=="undefined")onServed(cl,v,i);S.plate={r:null,cur:false,sal:false,dr:null};PT.push({s:"+"+fm(v),x:CX[i],y:330,l:0,col:"#2f9a3a"});say("¡Servido! +"+fm(v)+".")}
cv.addEventListener("click",e=>{
  if(PAUSED||S.t<=0)return;const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*W,y=(e.clientY-r.top)/r.height*H;
  for(const k in F)if(Math.hypot(x-F[k].x,y-F[k].y)<=40)return(putPupusa(k),draw());
  for(const k in DR)if(Math.abs(x-DR[k].x)<=26&&Math.abs(y-DR[k].y)<=52)return(addDr(k),draw());
  if(Math.abs(x-SAL.x)<=20&&Math.abs(y-SAL.y)<=40)return(addSal(),draw());if(Math.hypot(x-CUR.x,y-CUR.y)<=32)return(addCur(),draw());
  if(x>=TRASH.x1-8&&x<=TRASH.x2+8&&y>=TRASH.y1-10&&y<=TRASH.y2+24)return(clearPlate(),draw());
  for(let i=0;i<3;i++)if(Math.hypot(x-SX[i],y-SY)<=30)return(takePupusa(i),draw());
  for(let i=0;i<3;i++)if(Math.abs(x-CX[i])<=100&&y>=36&&y<=424)return(tapClient(i),draw());
});
const sw=c=>c.startsWith("#")?c:"#ddd";
const btn=(a,l,c)=>`<button data-a="${a}"><i style="background:${c}"></i>${l}</button>`;
$("leg").innerHTML=Object.keys(F).map(k=>btn("r:"+k,k,F[k].c)).join("")+btn("sal","salsa","#d8392b")+btn("cur","curtido","#f6dd9a")+Object.keys(DR).map(k=>btn("d:"+k,k,DR[k].c)).join("")+btn("trash","vaciar plato","#e4584a");
$("leg").addEventListener("click",e=>{const bt=e.target.closest("[data-a]");if(!bt||PAUSED||S.t<=0)return;const a=bt.dataset.a;
  if(a.startsWith("r:"))putPupusa(a.slice(2));else if(a.startsWith("d:"))addDr(a.slice(2));else if(a==="sal")addSal();else if(a==="cur")addCur();else clearPlate();draw()});
$("mDep").onclick=()=>showDeps("menu");$("mDayB").onclick=()=>{if(!G.dep)return showDeps("day");if(!DAYON)startDay();else{PAUSED=false;$("menu").style.display="none"}};$("mAlcB").onclick=()=>{if(!G.dep)return showDeps("alc");if(G.fin)return showGov();showHub()};$("mHow").onclick=()=>info(HOW);if($("mDemo"))$("mDemo").onclick=()=>startDemo();if($("mNew"))$("mNew").onclick=()=>confirmBox("¿Borrar la partida guardada y empezar de cero?",newCampaign);if($("mElec"))$("mElec").onclick=()=>showElectorate(()=>{});if($("mShop"))$("mShop").onclick=()=>showShop();if($("mCard"))$("mCard").onclick=()=>showCard();$("mCred").onclick=()=>info(CRED);$("mn").onclick=()=>{if(DUELX)return;if(DAYON)PAUSED=true;showMenu()};
drawBG();drawFG();newGame();draw();
if(document.fonts&&document.fonts.load){Promise.all([document.fonts.load("800 24px 'Baloo 2'"),document.fonts.load("700 14px 'Baloo 2'")]).then(()=>{drawBG();drawFG();draw();if($("menu").style.display!=="none")showMenu()}).catch(()=>{})}
setInterval(tick,200);setInterval(()=>{fr++;if(S.t>0)draw()},40);
