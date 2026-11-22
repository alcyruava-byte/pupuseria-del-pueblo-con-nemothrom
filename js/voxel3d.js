// PUEBLO VOXEL (estilo bloques) con la misma API que Town3D. Cada departamento genera su propio mapa
// (río, puente, bioma, volcán/costa/colinas, monumento, casas y paleta) a partir de una semilla.
const Vox=(()=>{
  const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(38,1.6,.5,700);
  sc.background=new THREE.Color(0x8fd2f2);sc.fog=new THREE.Fog(0x8fd2f2,120,330);
  sc.add(new THREE.HemisphereLight(0xeaf4ff,0x9a8a6a,1.9));
  const sun=new THREE.DirectionalLight(0xfff4dc,2.1);sun.position.set(55,95,40);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
  Object.assign(sun.shadow.camera,{left:-60,right:60,top:60,bottom:-60,near:10,far:260});sun.shadow.bias=-.0008;sc.add(sun);sc.add(sun.target);
  const rng=s=>{let a=s>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}};
  const hs=s=>{let h=2166136261;s=String(s);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
  // ---------- texturas de 16x16 ----------
  const R0=rng(7);
  function tx(fn,emis){const c=document.createElement("canvas");c.width=c.height=16;const g=c.getContext("2d");fn(g);const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.colorSpace=THREE.SRGBColorSpace;return t}
  const noise=(g,base,v,fn)=>{const b=new THREE.Color(base);for(let y=0;y<16;y++)for(let x=0;x<16;x++){const k=1+(R0()-.5)*v;g.fillStyle=`rgb(${Math.min(255,b.r*255*k)|0},${Math.min(255,b.g*255*k)|0},${Math.min(255,b.b*255*k)|0})`;g.fillRect(x,y,1,1)}if(fn)fn(g)};
  const T={
    grassTop:tx(g=>noise(g,0x6cbb52,.2)),dirt:tx(g=>noise(g,0x8a5e3a,.3)),stone:tx(g=>noise(g,0x8d8d8d,.22)),sand:tx(g=>noise(g,0xe6d396,.14)),
    grassSide:tx(g=>noise(g,0x8a5e3a,.3,g=>{for(let x=0;x<16;x++){const h=3+(R0()*2|0);for(let y=0;y<h;y++){g.fillStyle=y===h-1?"#4f9a3c":"#62b34a";g.fillRect(x,y,1,1)}}})),
    cobble:tx(g=>noise(g,0xa8a39a,.18,g=>{g.fillStyle="rgba(60,55,50,.45)";for(let i=0;i<16;i+=4){g.fillRect(0,i,16,1);for(let j=(i/4%2)*2;j<16;j+=4)g.fillRect(j,i,1,4)}})),
    plaster:tx(g=>noise(g,0xf2ede0,.07)),
    brick:tx(g=>noise(g,0xf2e2d8,.1,g=>{g.fillStyle="rgba(90,70,60,.55)";for(let i=0;i<16;i+=4){g.fillRect(0,i,16,1);for(let j=(i/4%2)*4;j<16;j+=8)g.fillRect(j,i,1,4)}})),
    roof:tx(g=>noise(g,0xf6dccb,.12,g=>{g.fillStyle="rgba(70,30,20,.4)";for(let i=0;i<16;i+=4)g.fillRect(0,i,16,1)})),
    planks:tx(g=>noise(g,0xb98a52,.14,g=>{g.fillStyle="rgba(60,40,20,.5)";for(let i=0;i<16;i+=4)g.fillRect(0,i,16,1)})),
    logSide:tx(g=>noise(g,0x6b4a2a,.22,g=>{g.fillStyle="rgba(40,25,12,.45)";for(let i=1;i<16;i+=4)g.fillRect(i,0,1,16)})),
    logTop:tx(g=>noise(g,0xb98a52,.12,g=>{g.strokeStyle="rgba(80,50,25,.7)";g.strokeRect(2.5,2.5,11,11);g.strokeRect(5.5,5.5,5,5)})),
    leaves:tx(g=>noise(g,0x6fc455,.4)),glass:tx(g=>{g.fillStyle="#bfe6f6";g.fillRect(0,0,16,16);g.fillStyle="#e8f8ff";for(let i=0;i<5;i++)g.fillRect(2+i*2,12-i*2,2,2);g.strokeStyle="#5a7a8a";g.strokeRect(.5,.5,15,15)}),
    asphalt:tx(g=>noise(g,0x484848,.2)),wool:tx(g=>noise(g,0xffffff,.1,g=>{g.fillStyle="rgba(0,0,0,.08)";for(let i=0;i<16;i+=2)g.fillRect(i,0,1,16)})),
    glow:tx(g=>noise(g,0xffe08a,.15)),lava:tx(g=>noise(g,0xe8591a,.5,g=>{g.fillStyle="#ffd040";for(let i=0;i<6;i++)g.fillRect(R0()*14|0,R0()*14|0,2,1)})),
    water:tx(g=>noise(g,0x3a9ad8,.18,g=>{g.fillStyle="rgba(255,255,255,.25)";for(let i=0;i<8;i++)g.fillRect(R0()*13|0,R0()*15|0,3,1)}))};
  const LM=(map,o)=>new THREE.MeshLambertMaterial(Object.assign({map},o||{}));
  const MAT={grass:[LM(T.grassSide),LM(T.grassSide),LM(T.grassTop),LM(T.dirt),LM(T.grassSide),LM(T.grassSide)],dirt:LM(T.dirt),stone:LM(T.stone),sand:LM(T.sand),cobble:LM(T.cobble),plaster:LM(T.plaster),brick:LM(T.brick),roof:LM(T.roof),planks:LM(T.planks),
    log:[LM(T.logSide),LM(T.logSide),LM(T.logTop),LM(T.logTop),LM(T.logSide),LM(T.logSide)],leaves:LM(T.leaves),glass:LM(T.glass,{transparent:true,opacity:.85}),asphalt:LM(T.asphalt),wool:LM(T.wool),
    glow:new THREE.MeshBasicMaterial({map:T.glow}),lava:new THREE.MeshBasicMaterial({map:T.lava})};
  const GEO=new THREE.BoxGeometry(1,1,1);
  // ---------- constructor de bloques ----------
  class VB{constructor(){this.m=new Map()}
    put(x,y,z,t,c){let a=this.m.get(t);if(!a)this.m.set(t,a=[]);a.push(x,y,z,c===undefined?-1:c);return this}
    box(x0,y0,z0,x1,y1,z1,t,c){for(let x=x0;x<x1;x++)for(let y=y0;y<y1;y++)for(let z=z0;z<z1;z++)this.put(x,y,z,t,c);return this}
    shell(x0,y0,z0,x1,y1,z1,t,c){for(let x=x0;x<x1;x++)for(let y=y0;y<y1;y++)for(let z=z0;z<z1;z++)if(x===x0||x===x1-1||z===z0||z===z1-1)this.put(x,y,z,t,c);return this}
    group(sh){const g=new THREE.Group(),o=new THREE.Object3D(),col=new THREE.Color();
      for(const[t,a]of this.m){const n=a.length/4,mesh=new THREE.InstancedMesh(GEO,MAT[t],n);
        for(let i=0;i<n;i++){const x=a[i*4],y=a[i*4+1],z=a[i*4+2],c=a[i*4+3];o.position.set(x,y,z);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);
          const v=.93+((hs(x*73856093^y*19349663^z*83492791)%1000)/1000)*.12;if(c>=0)col.setHex(c).multiplyScalar(v);else col.setRGB(v,v,v);mesh.setColorAt(i,col)}
        mesh.instanceMatrix.needsUpdate=true;mesh.frustumCulled=false;mesh.castShadow=sh!==false&&t!=="glow";mesh.receiveShadow=true;g.add(mesh)}
      return g}}
  const lbl=(txt,w,h,o)=>{o=o||{};const c=document.createElement("canvas");c.width=o.pw||256;c.height=Math.round((o.pw||256)*h/w);const g=c.getContext("2d");g.fillStyle=o.bg||"#7a2a1a";g.fillRect(0,0,c.width,c.height);g.strokeStyle=o.bd||"#fff2c8";g.lineWidth=8;g.strokeRect(4,4,c.width-8,c.height-8);g.fillStyle=o.fg||"#fff2c8";g.font=(o.font||"800 ")+Math.round(c.height*.46)+"px Baloo 2,Arial Black,sans-serif";g.textAlign="center";g.textBaseline="middle";g.fillText(txt,c.width/2,c.height/2+2,c.width-24);
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t}));m.userData.tex=t;m.userData.cv=c;return m};
  // ---------- personajes de bloques ----------
  const BG=new Map(),bg=(w,h,d)=>{const k=w+"_"+h+"_"+d;if(!BG.has(k))BG.set(k,new THREE.BoxGeometry(w,h,d));return BG.get(k)};
  const FM=new Map(),fm=(c,o)=>{const k=c+JSON.stringify(o||{});if(!FM.has(k))FM.set(k,new THREE.MeshLambertMaterial(Object.assign({color:c},o||{})));return FM.get(k)};
  const faceTex=(()=>{const c=document.createElement("canvas");c.width=c.height=8;const g=c.getContext("2d");g.fillStyle="#fff";g.fillRect(0,0,8,8);g.fillStyle="#222";g.fillRect(1,3,2,2);g.fillRect(5,3,2,2);g.fillStyle="#b4503c";g.fillRect(3,6,2,1);const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.colorSpace=THREE.SRGBColorSpace;return t})();
  function person(o){o=o||{};const g=new THREE.Group(),skin=o.skin||0xe8b98a,shirt=o.shirt||0xd8392b,pants=o.pants||0x2f4a8a,hair=o.hair||0x2a1a10;
    const add=(w,h,d,c,x,y,z,mat)=>{const m=new THREE.Mesh(bg(w,h,d),mat||fm(c));m.position.set(x,y,z);m.castShadow=true;g.add(m);return m};
    const legL=add(.3,.7,.3,pants,-.17,.35,0),legR=add(.3,.7,.3,pants,.17,.35,0);legL.geometry=legR.geometry=bg(.3,.7,.3);legL.position.y=legR.position.y=.35;
    add(.64,.75,.34,shirt,0,1.07,0);const armL=add(.26,.7,.26,skin,-.45,1.1,0),armR=add(.26,.7,.26,skin,.45,1.1,0);
    const head=add(.52,.52,.52,skin,0,1.7,0,[fm(skin),fm(skin),fm(hair),fm(skin),new THREE.MeshLambertMaterial({map:faceTex,color:skin}),fm(skin)]);
    add(.56,.18,.56,hair,0,1.98,0);if(o.fem)add(.56,.4,.12,hair,0,1.78,-.22);
    if(o.hat==="straw"){add(.95,.07,.95,0xe8c45a,0,2.1,0);add(.52,.2,.52,0xf2d474,0,2.2,0)}else if(o.hat==="cap")add(.58,.14,.64,o.capc||0x2f78c4,0,2.08,.04);
    g.userData={legL,legR,armL,armR,head};return g}
  const SK=[0xf6d5b5,0xe8b98a,0xc98f5f,0xa86d43,0x7a4a2a],SHC=[0xd8392b,0x2f78c4,0x3f9a4f,0xe8892a,0x8a3ab0,0xe86ab0,0xf6c344,0x2aa6a0];
  const HAIRC=[0x2a1a10,0x4a2a14,0x6a3a1a,0x1a1a1a,0xc9a45a];
  const randPerson=(r)=>person({skin:SK[r()*5|0],shirt:SHC[r()*8|0],pants:[0x2f4a8a,0x3a3a3a,0x6a4a2a,0x2a5a3a][r()*4|0],hair:HAIRC[r()*5|0],fem:r()<.5,hat:r()<.15?"straw":r()<.15?"cap":null,capc:SHC[r()*8|0]});
  function car(col){const g=new THREE.Group(),a=(w,h,d,c,x,y,z,m)=>{const q=new THREE.Mesh(bg(w,h,d),m||fm(c));q.position.set(x,y,z);q.castShadow=true;g.add(q);return q};
    a(3.2,.7,1.5,col,0,.65,0);a(1.7,.6,1.4,col,-.1,1.3,0);a(1.5,.45,1.42,0xbfe6f6,-.1,1.32,0,fm(0xbfe6f6,{transparent:true,opacity:.8}));[[-1,-.75],[1,-.75],[-1,.75],[1,.75]].forEach(p=>a(.6,.6,.3,0x222222,p[0],.3,p[1]));a(.15,.25,.3,0xfff2a8,1.62,.7,.45,new THREE.MeshBasicMaterial({color:0xfff2a8}));a(.15,.25,.3,0xfff2a8,1.62,.7,-.45,new THREE.MeshBasicMaterial({color:0xfff2a8}));return g}
  // ---------- estado ----------
  const world=new THREE.Group();sc.add(world);
  let mapId=null,rr=null,RX=8,RZ=0,FLIP=1,ROTK=0,B={},UP3={},PROG={obras:0,welfare:0,pop:0,led:0,prim:0,pres:0,dept:""},sites={},anchors={},vehicles=[],walkers=[],clouds=[],boats=[],emit=[],pool=[],shopG=null,vallaM=null,volc=null,lmPos=new THREE.Vector3(),shopPos=new THREE.Vector3(),npcs=[],npcCb=null,onPick=null,sel=null,auto=true,pinsHost=null,pinEls=[],canvas=null,drag=null,moved=0,pinch=null,T0=0,foc=null,anims=[],waterM=null,seaM=null;
  const tgt=new THREE.Vector3(0,0,4),fg={t:new THREE.Vector3(0,0,4),rad:77,el:.62,az:null};let az=.6,el=.62,rad=77;
  const W3=(x,y,z)=>{world.updateMatrixWorld(true);return world.localToWorld(new THREE.Vector3(x,y,z))};
  const disposeAll=o=>o.traverse(c=>{if(c.isInstancedMesh)c.dispose&&c.dispose();if(c.geometry&&c.geometry!==GEO&&!BG.has("x"))c.geometry.dispose&&0});
  // ---------- piezas de construcción ----------
  const PAL=[[0xf2c14e,0xd9805a],[0x7fb8e8,0xc4462a],[0xe86a8a,0x8a4a2a],[0x6ac49a,0xd84a3a],[0xf0d4a8,0x6a8ac4],[0xe8892a,0x5a3a2a],[0xc49ae8,0x7a3a6a],[0xffffff,0xc4462a]];
  function house(b,x,z,w,d,h,wc,rc,face){ // casa con tejado a dos aguas; puerta hacia +z
    b.box(x,0,z,x+w,1,z+d,"cobble");b.shell(x,1,z,x+w,1+h,z+d,"plaster",wc);
    for(let i=1;i<w-1;i+=2){b.put(x+i,2,z,"glass");b.put(x+i,2,z+d-1,"glass")}b.put(x+(w>>1),1,z+d-1,"planks");b.put(x+(w>>1),2,z+d-1,"planks");
    for(let k=0;k<Math.ceil(d/2)+1;k++){const zz=z-1+k;if(zz<z-1)continue;b.box(x-1,1+h+k,zz,x+w+1,2+h+k,zz+1,"roof",rc);const zz2=z+d-k;b.box(x-1,1+h+k,zz2,x+w+1,2+h+k,zz2+1,"roof",rc)}
    return b}
  function tree(b,x,z,kind,r){const h=3+(r()*2|0);
    if(kind==="palm"){for(let y=1;y<=h+3;y++)b.put(x,y,z,"log");for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1],[2,0],[-2,0],[0,2],[0,-2]])b.put(x+dx,h+3,z+dz,"leaves",0x4fbf4a);b.put(x,h+4,z,"leaves",0x4fbf4a);return}
    if(kind==="pine"){for(let y=1;y<=h+1;y++)b.put(x,y,z,"log");for(let k=0;k<4;k++){const rr2=3-k;for(let dx=-rr2+1;dx<rr2;dx++)for(let dz=-rr2+1;dz<rr2;dz++)b.put(x+dx,h-1+k*1,z+dz,"leaves",0x2a7a3a)}b.put(x,h+3,z,"leaves",0x2a7a3a);return}
    for(let y=1;y<=h;y++)b.put(x,y,z,"log");for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++)for(let dy=0;dy<2;dy++)if(Math.abs(dx)+Math.abs(dz)<4)b.put(x+dx,h+dy,z+dz,"leaves");b.put(x,h+2,z,"leaves");b.put(x+1,h+2,z,"leaves");b.put(x-1,h+2,z,"leaves")}
  function flag(g,x,y,z,col){const p=new THREE.Mesh(bg(.12,3.2,.12),fm(0xdddddd));p.position.set(x,y+1.6,z);g.add(p);const f=new THREE.Mesh(new THREE.BoxGeometry(1.4,.9,.06),fm(col||0x2a6ad8));f.position.set(x+.75,y+2.8,z);g.add(f);f.userData.flag=1;return f}
  // ---------- obras ----------
  function mkSalud(ok){const b=new VB();b.box(-5,0,-3,6,1,5,"cobble");b.shell(-4,1,-2,5,5,4,"plaster",ok?0xffffff:0x9a958a);b.box(-4,5,-2,5,6,4,"stone");
    for(let i=-2;i<=3;i+=2){b.put(i,3,-2,"glass");b.put(i,3,3,"glass")}b.put(0,1,3,ok?"glass":"planks");b.put(0,2,3,ok?"glass":"planks");b.put(1,1,3,ok?"glass":"planks");b.put(1,2,3,ok?"glass":"planks");
    if(ok){b.box(-1,6,-3,2,9,-2,"wool",0xe53935);b.box(-2,7,-3,3,8,-2,"wool",0xe53935);b.put(-4,1,5,"wool",0x88cc88);b.put(5,1,5,"wool",0xf06a9a);b.put(-5,1,5,"wool",0xf6c344);}
    const g=b.group();
    if(ok){const amb=new THREE.Group();[[0,.7,0,3,1.2,1.4,0xffffff],[.6,1.5,0,1.4,.9,1.3,0xbfe6f6]].forEach(a=>{const m=new THREE.Mesh(bg(a[3],a[4],a[5]),fm(a[6]));m.position.set(a[0],a[1],a[2]);amb.add(m)});const cr=new THREE.Mesh(bg(.8,.25,.2),fm(0xe53935));cr.position.set(-.3,1.45,.75);amb.add(cr);const cr2=new THREE.Mesh(bg(.25,.8,.2),fm(0xe53935));cr2.position.set(-.3,1.45,.76);amb.add(cr2);amb.position.set(9,.5,2);g.add(amb);
      const bc=new THREE.Mesh(bg(.5,.4,.5),new THREE.MeshBasicMaterial({color:0xff3030}));bc.position.set(9.6,2.3,2);bc.userData.beacon=1;g.add(bc)}
    else{const c1=new THREE.Mesh(bg(.1,1.1,5),fm(0xf0c020));c1.position.set(-5.8,1.5,1);g.add(c1);const tp=new THREE.Mesh(bg(2.2,.5,.1),fm(0xf0c020));tp.position.set(2,2.5,5.4);tp.rotation.z=.15;g.add(tp)}
    return g}
  function mkEdu(ok){const b=new VB();b.box(-7,0,-4,8,1,5,"cobble");b.shell(-6,1,-3,7,5,4,"plaster",ok?0xf6d65a:0xb5a98a);
    for(let i=-4;i<=5;i+=2){b.put(i,3,-3,"glass");b.put(i,3,3,"glass")}b.put(0,1,3,"planks");b.put(0,2,3,"planks");b.put(1,1,3,"planks");b.put(1,2,3,"planks");
    if(ok){for(let x=-7;x<=8;x++)b.box(x,5,-4,x+1,6,5,"roof",0xd84a3a);b.box(-1,6,-4,3,8,5,"roof",0xd84a3a);for(let x=-7;x<9;x+=3)b.put(x,1,6,"leaves",0x4fbf4a)}
    else{b.box(-7,5,-4,0,6,5,"roof",0x9a6a4a);b.box(4,5,-4,8,6,0,"roof",0x9a6a4a);b.put(-5,5,0,"dirt")}
    const g=b.group();
    if(ok){flag(g,10,1,5,0x2a6ad8);flag(g,-9,1,5,0xe53935);const bl=lbl("ESCUELA",3.4,1,{bg:"#2a6ad8",pw:256});bl.position.set(.5,4.2,4.6);g.add(bl)}
    else{const bl=lbl("ESCUELA",3.4,1,{bg:"#5a5448",fg:"#b5a98a",pw:256});bl.position.set(.5,4.2,4.6);bl.rotation.z=.12;g.add(bl)}
    return g}
  function mkMercado(ok){const b=new VB();b.box(-9,0,-4,10,1,6,"cobble");
    for(let k=0;k<4;k++){const x=-8+k*5;b.box(x,1,-2,x+4,2,0,"planks");b.put(x,2,-2,"log");b.put(x+3,2,-2,"log");b.put(x,3,-2,"log");b.put(x+3,3,-2,"log");
      if(ok){const c=[0xe53935,0xf6c344,0x2a8ad8,0x43a047][k];b.box(x-1,4,-3,x+5,5,1,"wool",c);for(let i=0;i<3;i++)b.put(x+i,2,-2,"wool",[0xff7043,0xffd54f,0x66bb6a,0xab47bc][(i+k)%4]);b.put(x+1,1,2,"leaves",0x4fbf4a)}
      else{b.put(x,4,-2,"planks");b.put(x+3,4,-2,"planks");if(k%2)b.put(x+1,1,2,"dirt")}}
    const g=b.group();if(!ok){const t=new THREE.Mesh(bg(1.2,.9,1.2),fm(0x5a6a3a));t.position.set(1,1.5,3);g.add(t)}return g}
  function mkAgua(ok){const b=new VB();b.box(-3,0,-3,4,1,4,ok?"stone":"dirt");for(const[x,z]of[[-2,-2],[2,-2],[-2,2],[2,2]])for(let y=1;y<9;y++)b.put(x,y,z,"log");
    b.box(-3,9,-3,4,10,4,"planks");b.shell(-3,10,-3,4,14,4,ok?"glass":"stone",ok?0x4aa8e8:undefined);if(ok)b.box(-2,10,-2,3,13,3,"wool",0x3a9ad8);b.box(-3,14,-3,4,15,4,"roof",ok?0xcfcfcf:0x999999);
    if(ok){b.box(5,0,-1,9,1,3,"wool",0x3a9ad8);b.put(7,1,1,"stone");b.put(7,2,1,"stone")}else{for(const[x,z]of[[5,0],[6,2],[4,3]])b.put(x,0,z,"dirt")}
    for(let x=-3;x<=9;x++)b.put(x,0,-5,ok?"wool":"dirt",ok?0x3a9ad8:undefined);return b.group()}
  function mkCamino(ok,x0,x1){const b=new VB();for(let x=x0;x<=x1;x++)for(let z=-1;z<=1;z++){if(ok){b.put(x,0,z,"asphalt");if(z===0&&x%4<2)b.put(x,0.001,z,"wool",0xf2e7a0)}
      else{const h=hs(x*31+z*17)%10;if(h<2)b.put(x,-1,z,"dirt");else if(h<3)b.put(x,-1,z,"wool",0x3a7ab8);else b.put(x,0,z,"dirt")}}
    if(ok){for(let x=x0+3;x<=x1;x+=8){b.put(x,1,-2,"log");b.put(x,2,-2,"log");b.put(x,3,-2,"log");b.put(x,4,-2,"glow")}}
    return b.group()}
  function mkPuente(ok,rx){const b=new VB();for(let x=rx-3;x<=rx+3;x++)for(let z=-1;z<=1;z++){const edge=Math.abs(x-rx)===3;if(ok||edge||(Math.abs(x-rx)===2&&z===-1)){b.put(x,0,z,"planks");}}
    if(ok){for(let x=rx-3;x<=rx+3;x++){b.put(x,1,-2,"log");b.put(x,1,2,"log");b.put(x,2,-2,"planks");b.put(x,2,2,"planks")}}
    else{for(let x=rx-3;x<=rx-2;x++){b.put(x,1,-2,"log");b.put(x,2,-2,"planks")}b.put(rx+3,1,2,"log")}
    const g=b.group();if(!ok){const cone=new THREE.Mesh(bg(.8,.8,.8),fm(0xff7a1a));cone.position.set(rx-3.5,1,0);g.add(cone);const cn2=cone.clone();cn2.position.set(rx+3.5,1,.8);g.add(cn2)}return g}
  // ---------- paisajes ----------
  const BIO={ahuachapan:{cafe:1,hills:1,lm:"pyramid"},"santa-ana":{volc:1,lm:"cathedral"},sonsonate:{volc:1,coast:1,lm:"church"},"la-libertad":{coast:1,lm:"lighthouse"},chalatenango:{hills:1,pine:1,lm:"church"},"san-salvador":{volc:1,lm:"monument"},cuscatlan:{hills:1,lake:1,lm:"church"},"la-paz":{coast:1,palm:1,lm:"church"},cabanas:{hills:1,cafe:1,lm:"pyramid"},"san-vicente":{volc:1,lm:"tower"},usulutan:{coast:1,palm:1,lm:"lighthouse"},"san-miguel":{volc:1,lm:"cathedral"},morazan:{hills:1,pine:1,lm:"pyramid"},"la-union":{coast:1,palm:1,lm:"lighthouse"}};
  function landmark(kind,b,g){
    if(kind==="cathedral"){b.shell(-7,0,-5,8,12,6,"plaster",0xf2ece0);b.box(-7,12,-5,8,13,6,"roof",0xb5472a);for(const x of[-7,6]){b.shell(x,0,-6,x+2,20,-3,"plaster",0xf2ece0);b.box(x,20,-6,x+2,23,-3,"roof",0xb5472a);b.put(x,21,-6,"glass")}for(let x=-5;x<6;x+=3)for(let y=3;y<10;y+=4)b.put(x,y,6-1,"glass");b.put(0,1,5,"planks");b.put(0,2,5,"planks");b.put(0,3,5,"planks")}
    else if(kind==="pyramid"){for(let k=0;k<7;k++)b.box(-9+k,k,-9+k,10-k,k+1,10-k,k%2?"stone":"cobble");b.box(-1,7,-1,2,10,2,"stone");b.put(0,10,0,"glow");for(let k=0;k<7;k++)b.put(0,k,10-k,"planks")}
    else if(kind==="monument"){b.box(-3,0,-3,4,2,4,"stone");b.box(-1,2,-1,2,12,2,"plaster",0xf2ece0);for(let x=-3;x<=3;x++)for(let y=-3;y<=3;y++)for(let z=-3;z<=3;z++)if(x*x+y*y+z*z<=9)b.put(x,15+y,z,"wool",0x3a8ad8);b.box(-2,15,-3,3,16,4,"wool",0x3f9a4f);b.box(0,19,0,1,22,1,"wool",0xffffff)}
    else if(kind==="lighthouse"){for(let y=0;y<16;y++){const w=y<14?1:2;b.box(-w,y,-w,w+1,y+1,w+1,"plaster",y%4<2?0xffffff:0xd8392b)}b.box(-2,16,-2,3,17,3,"stone");b.shell(-1,16,-1,2,18,2,"glass");b.put(0,17,0,"glow");b.box(-2,18,-2,3,19,3,"roof",0xd8392b);b.box(-4,0,-4,5,1,5,"stone")}
    else if(kind==="tower"){b.shell(-3,0,-3,4,14,4,"brick",0xe0b8a8);b.box(-4,14,-4,5,15,5,"stone");b.shell(-3,15,-3,4,19,4,"brick",0xe0b8a8);b.put(0,17,4,"glow");b.put(-1,17,4,"glow");b.put(1,17,4,"glow");for(let k=0;k<4;k++)b.box(-3+k,19+k,-3+k,4-k,20+k,4-k,"roof",0x5a8ac4)}
    else {b.shell(-5,0,-4,6,6,5,"plaster",0xfff6e0);b.box(-5,6,-4,6,7,5,"roof",0xc4462a);b.shell(-2,6,-1,3,13,3,"plaster",0xfff6e0);b.put(0,11,3,"glass");b.put(0,1,4,"planks");b.put(0,2,4,"planks");for(let k=0;k<3;k++)b.box(-2+k,13+k,-1+k,3-k,14+k,3-k,"roof",0xc4462a);b.put(0,17,1,"wool",0xf6c344)}}
  // ---------- construcción del mundo ----------
  function clearWorld(){while(world.children.length){const c=world.children[0];world.remove(c);c.traverse(o=>{if(o.isInstancedMesh){o.dispose()}})}sites={};anchors={};vehicles=[];walkers=[];clouds=[];boats=[];emit=[];shopG=null;vallaM=null;volc=null;npcs=[]}
  function construct(id){
    clearWorld();mapId=id;const seed=hs(id),r=rng(seed),bio=BIO[id]||{hills:1,lm:"church"},d=null;rr=r;
    RX=[2,4,6,8,5][seed%5];FLIP=(seed>>3)%2?1:-1;ROTK=FLIP>0?0:2;world.rotation.y=0;
    const pal=[PAL[seed%8],PAL[(seed+3)%8],PAL[(seed+5)%8]],terr=new VB(),occ=[],S=32;
    const coastZ=bio.coast?24:99,land=(x,z)=>z<coastZ-(Math.abs(x-RX)<2?0:0);
    const hillH=(x,z)=>{if(!bio.hills)return 0;if(Math.abs(z)<21&&Math.abs(x)<29)return 0;const n=Math.sin(x*.21+seed)*Math.cos(z*.19+seed*.3)+Math.sin((x+z)*.13)*.7;return Math.max(0,Math.round((n+.4)*3.2*(Math.min(1,(Math.max(Math.abs(z)-20,Math.abs(x)-28))/6))))};
    const vx=(bio.volc?(seed%2?-1:1)*18:0),vz=-26*FLIP,VR=11,VH=13;
    const volH=(x,z)=>{if(!bio.volc)return 0;const dd=Math.hypot(x-vx,z-vz);return Math.max(0,Math.floor(VH*(1-dd/VR)))};
    for(let x=-S;x<S;x++)for(let z=-S;z<S;z++){
      const inRiver=Math.abs(x-RX)<=1,sea=bio.coast&&z>=coastZ,beach=bio.coast&&z>=coastZ-4&&z<coastZ,road=Math.abs(z-RZ)<=1&&!inRiver;
      const roadMg=road&&x<RX-2,lake=bio.lake&&Math.hypot(x+16,z-18)<6;
      if(sea||lake){terr.put(x,-1,z,"sand");continue}
      if(inRiver){terr.put(x,-1,z,"sand");continue}
      let h=hillH(x,z)+volH(x,z);
      if(road&&!roadMg){terr.put(x,0,z,"asphalt");if(z===RZ&&((x%4)+4)%4<2)terr.put(x,0,z,"asphalt");continue}
      if(roadMg)continue;
      if(h>0){for(let y=0;y<=h;y++){const tp=y===h;let t="stone";if(bio.volc&&volH(x,z)>0){const dd=Math.hypot(x-vx,z-vz);t=(tp&&dd<2.6)?"lava":(tp&&volH(x,z)>VH*.6)?"stone":(tp?"grass":"dirt");if(y===VH&&dd<2)t="lava";}else t=tp?"grass":"dirt";terr.put(x,y,z,t)}if(bio.cafe&&h>0&&h<5&&!(x%3)&&hs(x*7+z)%3){terr.put(x,h+1,z,"leaves",0x2f6a2a)}}
      else if(beach)terr.put(x,0,z,"sand");else terr.put(x,0,z,"grass");
      if(Math.abs(x)===S-1||Math.abs(z)===S-1){for(let y=-2;y<0;y++)terr.put(x,y,z,"dirt")}
    }
    world.add(terr.group());
    // agua
    waterM=new THREE.Mesh(new THREE.PlaneGeometry(640,640),new THREE.MeshLambertMaterial({map:T.water,transparent:true,opacity:.88,color:0xffffff}));T.water.wrapS=T.water.wrapT=THREE.RepeatWrapping;T.water.repeat.set(160,160);waterM.rotation.x=-Math.PI/2;waterM.position.y=-.45;world.add(waterM);
    // montañas lejanas
    const fgm=new THREE.Group();for(let i=0;i<22;i++){const a=i/22*Math.PI*2+r(),R=150+r()*25,w=14+r()*22,h=10+r()*22,cx=Math.cos(a)*R,cz=Math.sin(a)*R;for(let k=0;k<4;k++){const s2=w*(1-k*.22),hh=h/4;const m=new THREE.Mesh(new THREE.BoxGeometry(s2,hh,s2),fm(k===3?0xf0f4f8:0x6a8a9a));m.position.set(cx,-2+hh*(k+.5),cz);fgm.add(m)}}world.add(fgm);
    // ---- edificios fijos
    const flipZ=z=>z*FLIP,faceOf=()=>FLIP>0?0:Math.PI;
    const put=(k,mk,x,z,face)=>{const g=new THREE.Group(),ok=mk(true),bad=mk(false);g.add(ok);g.add(bad);g.position.set(x,.02,flipZ(z));g.rotation.y=face===undefined?faceOf():face;world.add(g);sites[k]={g,ok,bad,anchor:new THREE.Vector3(x,5,flipZ(z))};return g};
    put("salud",mkSalud,-24,-11);put("edu",mkEdu,-12,-11);put("mercado",mkMercado,RX+11,-11);put("agua",mkAgua,RX+9,10);
    const oc=(x0,x1,z0,z1)=>occ.push(FLIP>0?[x0,x1,z0,z1]:[x0,x1,-z1,-z0]);oc(-29,-18,-16,-6);oc(-17,-7,-16,-6);oc(RX+1,RX+22,-16,-5);oc(RX+5,RX+14,5,15);
    // caminos y puente
    const cm=mkCamino(true,-S,RX-3),cb=mkCamino(false,-S,RX-3);const cg=new THREE.Group();cg.add(cm);cg.add(cb);cg.position.set(0,0,RZ);world.add(cg);
    const pg=new THREE.Group(),po=mkPuente(true,RX),pb=mkPuente(false,RX);pg.add(po);pg.add(pb);pg.position.y=.02;world.add(pg);
    sites.caminos={g:cg,ok:cm,bad:cb,anchor:new THREE.Vector3(RX-12,3,RZ)};sites.puente={g:pg,ok:po,bad:pb,anchor:new THREE.Vector3(RX,4,RZ)};
    // lámparas en el camino y letreros
    // ---- plaza + alcaldía
    const pz=new VB();for(let x=-14;x<=-4;x++)for(let z=3;z<=9;z++)pz.put(x,0,flipZ(z),"cobble");pz.put(-9,1,flipZ(6),"stone");pz.put(-9,2,flipZ(6),"wool",0x3a9ad8);
    // alcaldía
    const al=new VB();al.box(-7,0,-4,8,1,5,"stone");al.shell(-6,1,-3,7,6,4,"plaster",0xf6e8c4);for(let x=-5;x<=5;x+=2){al.put(x,3,-3,"glass");al.put(x,3,3,"glass")}al.box(-6,6,-3,7,7,4,"stone");al.box(-4,7,-2,5,8,3,"roof",0xc4462a);al.box(-2,8,-1,3,9,2,"roof",0xc4462a);
    for(const x of[-5,-2,2,5]){for(let y=1;y<6;y++)al.put(x,y,4,"plaster",0xffffff)}al.put(0,1,3,"planks");al.put(0,2,3,"planks");al.put(1,1,3,"planks");al.put(1,2,3,"planks");al.box(-1,0,5,3,1,7,"stone");
    const ag=al.group();const gg=new THREE.Group();gg.add(ag);gg.position.set(-9,.02,flipZ(14));gg.rotation.y=FLIP>0?Math.PI:0;world.add(gg);
    flag(gg,-6,6.5,-3,0x2a6ad8);flag(gg,8,1,5,0xe53935);const alc=lbl("ALCALDÍA",4.4,1.2,{bg:"#2a4a8a",pw:320});alc.position.set(.5,5.2,4.55);gg.add(alc);
    const clk=new VB();clk.put(0,9,0,"glow");
    {const pgp=pz.group();pgp.position.y=.02;world.add(pgp)}oc(-17,0,2,20);
    // ---- pupusería (tienda)
    const sg=new THREE.Group(),sb=new VB();sb.box(-4,0,-3,5,1,4,"cobble");sb.shell(-3,1,-2,4,5,3,"brick",0xe0b8a8);for(let x=-3;x<=3;x++)sb.put(x,2,3,x%2?"wool":"wool",x%2?0xd8392b:0xffffff);for(let x=-4;x<=4;x++){sb.put(x,5,3,"wool",x%2?0xd8392b:0xffffff);sb.put(x,4,4,"wool",x%2?0xd8392b:0xffffff)}sb.box(-2,1,3,3,2,4,"planks");sb.box(-3,5,-2,4,6,3,"roof",0xc4462a);sb.put(-3,3,0,"glass");sb.put(3,3,0,"glass");
    sg.add(sb.group());sg.position.set(-24,.02,flipZ(14));sg.rotation.y=FLIP>0?Math.PI:0;world.add(sg);shopG=sg;shopPos.set(-24,3,flipZ(14));oc(-29,-18,10,19);
    const sl=lbl("PUPUSERÍA",4.4,1.1,{bg:"#c4462a",pw:320});sl.position.set(.5,6.8,3.2);sg.add(sl);
    sg.userData={cartel:new THREE.Group(),fan:new THREE.Group(),chef:person({shirt:0xffffff,hat:"cap",capc:0xffffff,skin:0xe8b98a}),radio:new THREE.Group()};
    const U=sg.userData;for(let i=0;i<7;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(.45,.45,.45),new THREE.MeshBasicMaterial({color:0xfff2a8}));m.position.set(-2.7+i*.9,7.7,3.3);m.userData.blink=i;U.cartel.add(m)}sg.add(U.cartel);
    const fb=new THREE.Group();for(let i=0;i<4;i++){const bl=new THREE.Mesh(bg(1.6,.25,.12),fm(0xcccccc));bl.rotation.z=i*Math.PI/4;fb.add(bl)}fb.position.set(3.9,4,0);fb.rotation.y=Math.PI/2;U.fanBl=fb;U.fan.add(fb);sg.add(U.fan);
    U.chef.position.set(1.5,1.5,1);U.chef.scale.setScalar(1);sg.add(U.chef);const rd=new THREE.Mesh(bg(1.1,.7,.5),fm(0xc44a2a));rd.position.set(-2.2,3.35,2.6);U.radio.add(rd);sg.add(U.radio);
    shopAnchorPos(sg);
    // ---- valla
    const vg=new THREE.Group();[-1.9,1.9].forEach(x=>{const p=new THREE.Mesh(bg(.3,4,.3),fm(0x6b4a2a));p.position.set(x,2,0);vg.add(p)});vallaM=lbl("ALCALDE PUPUSA",5.4,1.8,{bg:"#c4462a",pw:512});vallaM.position.set(0,4.6,.2);vg.add(vallaM);vg.position.set(RX-7,.02,flipZ(-4.3));vg.rotation.y=FLIP>0?0:Math.PI;world.add(vg);
    // ---- monumento/landmark del departamento
    const lb=new VB(),lg=new THREE.Group();const lmx=(seed%2?1:-1)*0+RX+12;
    if(!bio.volc||bio.lm!=="cathedral"&&bio.lm!=="monument"){}
    landmark(bio.lm,lb,lg);const lgg=lb.group();const lw=new THREE.Group();lw.add(lgg);const lz=-26,lx=bio.volc?(vx>0?-14:RX+14):RX+14;lw.position.set(lx,.02,flipZ(lz));world.add(lw);lmPos.set(lx,8,flipZ(lz));oc(lx-10,lx+10,-32,-14);
    // ---- casas de relleno
    const hb=new VB(),tb=new VB();let placed=0,tries=0;
    const free=(x,z,w,d)=>!occ.some(o=>x+w+1>o[0]&&x-1<o[1]&&z+d+1>o[2]&&z-1<o[3])&&Math.abs(z+d/2-RZ)>3.5&&Math.abs(x+w/2-RX)>5&&z>-30&&z+d<(bio.coast?coastZ-4:30)&&x>-30&&x+w<30&&!(bio.lake&&Math.hypot(x+16,z-18)<9)&&!(bio.volc&&Math.hypot(x-vx,z+26)<VR+1)&&hillH(x,z)===0;
    while(placed<24&&tries<900){tries++;const w=4+(r()*3|0),d=4+(r()*2|0),x=(r()*56-28)|0,z=(r()*56-28)|0;if(!free(x,z,w,d))continue;const p=pal[r()*3|0],h=3+(r()*2|0);house(hb,x,z,w,d,h,p[0],p[1]);occ.push([x,x+w,z,z+d]);placed++}
    // los que miran a la calle: rotación según lado de la calle
    const hg=hb.group();world.add(hg);hg.position.y=.02;
    let tc=0;tries=0;const kind=bio.palm?"palm":bio.pine?"pine":"oak";while(tc<(bio.cafe?18:30)&&tries<600){tries++;const x=(r()*58-29)|0,z=(r()*58-29)|0;if(!free(x,z,1,1)||hillH(x,z)>0&&kind!=="pine")continue;const hh=hillH(x,z);tree(tb,x,z,kind==="oak"&&r()<.2?"pine":kind,r);tb.m.forEach(()=>{});tc++}
    const tgp=tb.group();tgp.position.y=.02;world.add(tgp);
    // nubes
    for(let i=0;i<9;i++){const c=new VB(),w=4+(r()*5|0),dd=3+(r()*3|0);c.box(0,0,0,w,1,dd,"wool",0xffffff);c.box(1,1,1,w-1,2,dd-1,"wool",0xf4f8ff);const cg2=c.group(false);cg2.position.set(-90+r()*180,64+r()*10,-60+r()*120);cg2.children.forEach(m=>m.castShadow=false);world.add(cg2);clouds.push(cg2)}
    // tráfico
    const cc=[0xd8392b,0x2f78c4,0xf6c344,0x3f9a4f,0xe8892a,0xffffff];for(let i=0;i<8;i++){const v=car(cc[i%6]);world.add(v);vehicles.push({m:v,x:-28+i*7,dir:i%2?1:-1,sp:3+(i%4)*.8})}
    const wr=rng(seed+9);for(let i=0;i<14;i++){const p=randPerson(wr);world.add(p);walkers.push({m:p,x:-26+i*4,dir:i%2?1:-1,sp:1+(i%4)*.25,z:RZ+(i%2?3:-3),ph:i})}
    // botes
    if(bio.coast)for(let i=0;i<3;i++){const b=new THREE.Group(),h=new THREE.Mesh(bg(3.4,.6,1.4),fm(0xf2ece0)),s=new THREE.Mesh(bg(.15,2.6,.15),fm(0x6b4a2a)),vl=new THREE.Mesh(bg(1.8,2.2,.08),fm(i%2?0xd8392b:0x2a6ad8));vl.position.set(.9,2,0);s.position.y=1.5;b.add(h,s,vl);b.position.set(-18+i*14,-.2,coastZ+5+i*4);b.userData.by=-.2;world.add(b);boats.push(b)}
    if(bio.volc){volc={x:vx,y:VH+2,z:vz}}
    // rocas
    // aplicar estado
    az=.6+ROTK*Math.PI/2;el=.62;rad=77;foc=null;fg.t.set(0,7,4*FLIP);fg.rad=77;fg.el=.62;fg.az=null;tgt.set(0,7,4*FLIP);applyBuilt();applyShop();setValla(valText());
    sun.target.position.set(0,0,0);
  }
  function shopAnchorPos(sg){anchors.shop=sg.position}
  const valText=()=>PROG.pres?"¡PRESIDENTE PUPUSA!":PROG.prim?"CANDIDATO PRESIDENCIAL":PROG.led?"LÍDER DE "+String(PROG.dept||"").toUpperCase():"ALCALDE PUPUSA";
  function setValla(t){if(!vallaM)return;const c=vallaM.userData.cv,g=c.getContext("2d");g.fillStyle="#c4462a";g.fillRect(0,0,c.width,c.height);g.strokeStyle="#fff2c8";g.lineWidth=10;g.strokeRect(5,5,c.width-10,c.height-10);g.fillStyle="#fff2c8";g.font="800 "+Math.round(c.height*.36)+"px Baloo 2,Arial Black,sans-serif";g.textAlign="center";g.textBaseline="middle";g.fillText(t,c.width/2,c.height/2+2,c.width-30);vallaM.userData.tex.needsUpdate=true}
  function applyBuilt(){for(const k in sites){const s=sites[k];s.ok.visible=!!B[k];s.bad.visible=!B[k]}}
  function applyShop(){if(!shopG)return;const U=shopG.userData;U.cartel.visible=!!UP3.cartel;U.fan.visible=!!UP3.vent;U.chef.visible=!!UP3.ayud;U.radio.visible=!!UP3.radio}
  // ---------- NPC (casos del cabildo) ----------
  function mkMark(txt,done){const c=document.createElement("canvas");c.width=256;c.height=128;const g=c.getContext("2d");g.fillStyle=done?"#2e7d32":"#fff8e0";g.strokeStyle="#3a1f10";g.lineWidth=8;g.beginPath();g.roundRect?g.roundRect(14,8,228,84,22):g.rect(14,8,228,84);g.fill();g.stroke();g.beginPath();g.moveTo(112,92);g.lineTo(128,116);g.lineTo(146,92);g.fill();g.stroke();g.fillStyle=done?"#fff":"#3a1f10";g.font="800 52px Baloo 2,Arial";g.textAlign="center";g.textBaseline="middle";g.fillText(txt,128,52);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}));s.scale.set(3.6,1.8,1);s.renderOrder=10;return s}
  function setCases(list,cb){npcCb=cb;npcs.forEach(n=>world.remove(n.g));npcs=[];if(!list)return;const slots=[[-12,5],[-9,6],[-6,5],[-13,8],[-7,8]];
    list.forEach((c,i)=>{const r=rng(hs(c.id||c.name));const p=person({skin:SK[hs(c.id+"s")%5],shirt:SHC[hs(c.id+"c")%8],hair:HAIRC[hs(c.id+"h")%5],fem:!!c.fem,hat:c.hat||null,pants:[0x2f4a8a,0x3a3a3a,0x6a4a2a][i%3]});
      const s=slots[i%slots.length],g=new THREE.Group();g.add(p);g.position.set(s[0],.52,s[1]*FLIP);g.userData.npc=i;p.userData.npc=i;p.traverse(o=>o.userData.npc=i);
      const mk=mkMark(c.done?"✓":c.icon||"!",c.done);mk.position.set(0,3.5,0);g.add(mk);g.userData.mk=mk;
      const nm=lbl(c.name.split(" ")[0],1.9,.55,{bg:"#fff8e0",fg:"#3a1f10",bd:"#3a1f10",pw:256});nm.position.set(0,2.65,0);nm.material.depthTest=false;nm.renderOrder=9;g.add(nm);g.userData.nm=nm;
      g.rotation.y=FLIP>0?0:Math.PI;world.add(g);npcs.push({g,p,ph:i*1.7,done:!!c.done,c})})}
  function markDone(i){const n=npcs[i];if(!n)return;n.done=true;n.g.remove(n.g.userData.mk);const m=mkMark("✓",true);m.position.set(0,3.5,0);n.g.add(m);n.g.userData.mk=m}
  function focusNpc(i){const n=npcs[i];if(!n)return;foc="npc";const p=W3(n.g.position.x,2,n.g.position.z);fg.t.copy(p);fg.rad=18;fg.el=.35;fg.az=null;auto=false}
  // ---------- cámara/entrada ----------
  function camPos(){cam.position.set(tgt.x+rad*Math.cos(el)*Math.sin(az),tgt.y+rad*Math.sin(el),tgt.z+rad*Math.cos(el)*Math.cos(az));cam.lookAt(tgt)}
  const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
  function pick(e){if(!canvas)return;const rc=canvas.getBoundingClientRect();ndc.set((e.clientX-rc.left)/rc.width*2-1,-((e.clientY-rc.top)/rc.height)*2+1);ray.setFromCamera(ndc,cam);
    const hit=ray.intersectObjects(npcs.map(n=>n.g),true);if(hit.length){let o=hit[0].object;while(o&&o.userData.npc===undefined)o=o.parent;if(o&&npcCb){npcCb(o.userData.npc);return}}
    const ks=Object.keys(sites);const meshes=[];ks.forEach(k=>sites[k].g.traverse(o=>{if(o.isInstancedMesh||o.isMesh){o.userData.site=k;meshes.push(o)}}));const h2=ray.intersectObjects(meshes,false);if(h2.length&&onPick)onPick(h2[0].object.userData.site)}
  const onDown=e=>{drag={x:e.clientX,y:e.clientY};moved=0;auto=false;try{canvas.setPointerCapture(e.pointerId)}catch(_){}};
  const onMove=e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;moved+=Math.abs(dx)+Math.abs(dy);drag.x=e.clientX;drag.y=e.clientY;if(foc)foc=null;az-=dx*.006;el=Math.max(.18,Math.min(1.35,el+dy*.005));fg.el=el;fg.az=null};
  const onUp=e=>{if(drag&&moved<7)pick(e);drag=null};
  const onWheel=e=>{e.preventDefault();rad=Math.max(14,Math.min(130,rad*(1+e.deltaY*.0012)));fg.rad=rad};
  const onTouch=e=>{if(e.touches.length===2){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(pinch){rad=Math.max(14,Math.min(130,rad*pinch/d));fg.rad=rad}pinch=d}};
  const api={scene:sc,camera:cam,
    onMount(c){canvas=c;c.addEventListener("pointerdown",onDown);c.addEventListener("pointermove",onMove);c.addEventListener("pointerup",onUp);c.addEventListener("pointercancel",()=>drag=null);c.addEventListener("wheel",onWheel,{passive:false});c.addEventListener("touchmove",onTouch,{passive:true});c.addEventListener("touchend",()=>pinch=null)},
    onUnmount(){if(!canvas)return;canvas.removeEventListener("pointerdown",onDown);canvas.removeEventListener("pointermove",onMove);canvas.removeEventListener("pointerup",onUp);canvas.removeEventListener("wheel",onWheel);canvas.removeEventListener("touchmove",onTouch);canvas=null},
    resize(w,h){cam.aspect=w/h;cam.fov=w/h<1.1?55:38;cam.updateProjectionMatrix();this.w=w;this.h=h},
    setTheme(d){sc.background.setHex(d.sky);sc.fog.color.setHex(d.sky)},
    setLandmark(id,name){if(mapId!==id)construct(id)},
    setBuilt(b){B=Object.assign({},b||{});applyBuilt()},setShop(u){UP3=Object.assign({},u||{});applyShop()},
    setProgress(p){PROG=Object.assign(PROG,p||{});setValla(valText())},shopPos(){return shopPos},
    setCases,markDone,focusNpc,onNpc(f){npcCb=f},
    focus(k){if(k==="shop"){foc="shop";fg.t.copy(W3(shopPos.x,3,shopPos.z));fg.rad=24;fg.el=.5;fg.az=.4+ROTK*Math.PI/2;auto=false;return}
      if(k==="lm"){foc="lm";fg.t.copy(W3(lmPos.x,6,lmPos.z));fg.rad=38;fg.el=.45;fg.az=.1+ROTK*Math.PI/2;auto=false;return}
      foc=k;if(!k||!sites[k]){fg.t.set(0,7,4*FLIP);fg.rad=77;fg.el=.62;fg.az=null;return}
      const s=sites[k];fg.t.copy(W3(s.anchor.x,2,s.anchor.z));fg.rad=k==="caminos"?36:30;fg.el=.6;fg.az=.3+ROTK*Math.PI/2;auto=false},
    celebrate(k){const s=sites[k];if(!s)return 0;B[k]=0;applyBuilt();api.focus(k);anims.push({k,t:0,sw:false});return 2.3},
    setSelected(k){sel=k},setAuto(a){auto=a},reset(){az=.6+ROTK*Math.PI/2;el=.62;rad=77;fg.t.set(0,7,4*FLIP)},
    pins(host){pinsHost=host;pinEls=host?[...host.querySelectorAll(".pin")]:[]},
    update(dt,t){if(!mapId)return;
      if(auto&&!drag)az+=dt*.05;const kk=1-Math.exp(-dt*3.2);tgt.lerp(fg.t,kk);rad+=(fg.rad-rad)*kk;if(foc){el+=(fg.el-el)*kk;if(fg.az!==null&&!drag){let d=fg.az-az;d=Math.atan2(Math.sin(d),Math.cos(d));az+=d*kk}}camPos();
      T.water.offset.x=t*.01;waterM.material.opacity=.82+Math.sin(t*1.5)*.05;
      clouds.forEach(c=>{c.position.x+=dt*1.5;if(c.position.x>110)c.position.x=-110});boats.forEach((b,i)=>{b.position.y=b.userData.by+Math.sin(t*1.5+i*2)*.12;b.rotation.z=Math.sin(t*1.2+i)*.05});
      world.traverse(o=>{if(o.userData.flag)o.rotation.y=Math.sin(t*4+o.position.x)*.25;if(o.userData.beacon)o.material.color.setHex(Math.sin(t*6)>0?0xff3030:0x802020)});
      for(let i=anims.length-1;i>=0;i--){const a=anims[i],S=sites[a.k];a.t+=dt;if(a.t<.8){S.bad.position.x=Math.sin(a.t*60)*.25*(a.t/.8);burst(S.anchor,2,0xb9aa90)}else{if(!a.sw){a.sw=true;S.bad.position.x=0;B[a.k]=1;applyBuilt();S.ok.scale.setScalar(.01);for(let n=0;n<4;n++)burst(S.anchor,6,[0xf6c344,0xd8392b,0x4aa8e8,0x3f9a4f,0xe86ab0][n%5])}const u=Math.min(1,(a.t-.8)/.6);S.ok.scale.setScalar(Math.max(.01,u<1?(1-Math.pow(1-u,3))*(1+Math.sin(u*Math.PI)*.18):1));if(a.t>1.8){S.ok.scale.setScalar(1);anims.splice(i,1)}}}
      const lvl=(PROG.obras||0)+(PROG.welfare>=50?1:0)+Object.keys(UP3||{}).filter(k=>UP3[k]).length;
      vehicles.forEach((v,i)=>{const on=i<Math.min(vehicles.length,2+lvl);v.m.visible=on;if(!on)return;const lo=B.puente?-30:(v.x<RX?-30:RX+4),hi=B.puente?30:(v.x<RX?RX-5:30);v.x+=v.dir*v.sp*dt;if(v.x>hi){v.x=hi;v.dir=-1}if(v.x<lo){v.x=lo;v.dir=1}v.m.position.set(v.x,.5,RZ+(v.dir>0?.55:-.55));v.m.rotation.y=v.dir>0?0:Math.PI});
      walkers.forEach((p,i)=>{const on=i<Math.min(walkers.length,4+lvl*2);p.m.visible=on;if(!on)return;const lo=B.puente?-28:(p.x<RX?-28:RX+4),hi=B.puente?28:(p.x<RX?RX-5:28);p.x+=p.dir*p.sp*dt;if(p.x>hi){p.x=hi;p.dir=-1}if(p.x<lo){p.x=lo;p.dir=1}p.m.position.set(p.x,.5,p.z);p.m.rotation.y=p.dir>0?Math.PI/2:-Math.PI/2;const sw=Math.sin(t*7+p.ph)*.7,u=p.m.userData;if(u.legL){u.legL.rotation.x=sw;u.legR.rotation.x=-sw;u.armL.rotation.x=-sw;u.armR.rotation.x=sw}});
      npcs.forEach((n,i)=>{const b=Math.sin(t*2+n.ph);n.p.position.y=Math.abs(b)*.05;n.g.userData.mk.scale.set(3.6*(1+(n.done?0:.06*Math.sin(t*4+n.ph))),1.8*(1+(n.done?0:.06*Math.sin(t*4+n.ph))),1);n.g.userData.mk.position.y=3.5+(n.done?0:Math.sin(t*3+n.ph)*.12)});
      if(shopG){const U=shopG.userData;if(U.cartel.visible)U.cartel.children.forEach(c=>{c.visible=Math.sin(t*5+c.userData.blink)>-.2});if(U.fan.visible)U.fanBl.rotation.z+=dt*14;if(U.chef.visible)U.chef.position.y=1.5+Math.abs(Math.sin(t*4))*.12}
      if(volc){volcT-=dt;if(volcT<=0){volcT=.35;puffV(volc.x,volc.y,volc.z)}}
      pool.forEach(p=>{if(!p.m.visible)return;p.l+=dt;if(p.l>=p.max){p.m.visible=false;return}const u=p.l/p.max;p.m.position.addScaledVector(p.v,dt);p.m.scale.setScalar(p.s*(1+u*p.grow));p.m.material.opacity=p.op*(1-u);p.m.rotation.x+=dt;p.m.rotation.y+=dt*1.3});
      if(pinsHost&&this.w){for(const pe of pinEls){const k=pe.dataset.p,s=k==="lm"?{anchor:lmPos}:k==="shop"?{anchor:shopPos}:sites[k];if(!s)continue;const wp=W3(s.anchor.x,s.anchor.y,s.anchor.z).project(cam);const vis=wp.z<1;pe.style.left=((wp.x+1)/2*this.w)+"px";pe.style.top=((1-wp.y)/2*this.h)+"px";pe.style.display=vis?"":"none"}}}};
  let volcT=0;
  function mkPool(){for(let i=0;i<70;i++){const m=new THREE.Mesh(GEO,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.5,depthWrite:false}));m.visible=false;sc.add(m);pool.push({m,l:0,max:1,v:new THREE.Vector3(),s:1,grow:1,op:.5})}}
  mkPool();
  function spawn(x,y,z,col,size,life,vy,op,grow,vx){const p=pool.find(q=>!q.m.visible);if(!p)return;p.m.visible=true;p.m.position.set(x,y,z);p.m.material.color.setHex(col);p.s=size;p.m.scale.setScalar(size);p.l=0;p.max=life;p.v.set(vx||0,vy,0);p.op=op;p.grow=grow}
  function puffV(x,y,z){const w=W3(x,y,z);spawn(w.x,w.y,w.z,0x8a8a8a,3,3.2,3,.5,2.4,(Math.random()-.5)*1.4)}
  function burst(a,n,col){const w=W3(a.x+(Math.random()-.5)*9,2+Math.random()*5,a.z+(Math.random()-.5)*8);for(let i=0;i<n/3+1;i++)spawn(w.x,w.y,w.z,col,.6,1.6,2+Math.random()*3,.95,.2,(Math.random()-.5)*4)}
  return api})();

if(typeof Town3D!=="undefined")Town3D=Vox;
