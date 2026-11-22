// Municipio 3D por departamento (Three.js): cada departamento tiene su propio mapa:
// distribución de los problemas, paisaje y emblema propios.
let Town3D=(()=>{
  const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(38,1.6,.5,700);
  let B={},foc=null,fg={t:new THREE.Vector3(0,0,9),rad:92,el:.62,az:null},anims=[],sel=null,pinsHost=null,pinEls=[],auto=true,az=.55,el=.62,rad=92,drag=null,moved=0,onPick=null,canvas=null,T=0;
  const GY=.6,tgt=new THREE.Vector3(0,0,9),pool=[],drops=[];
  let vehicles=[],people=[],shopG=null,shopAnchor=new THREE.Vector3(),UP3={},PROG={obras:0,welfare:0,pop:0,led:0,prim:0,pres:0,dept:""},valla=null,volc=null,volcT=0,notes=0,boats=[],sites={},emit=[],flags=[],strings=[],bunting=[],waves=[],lamps=[],clouds=[],water=null,roads=[],potholes=null,grass=null,lava=null,bus=null,busX=-28,busDir=1,busLim=-8,mapId=null,rot=0,RX=0,RZ=6,lmAnchor=new THREE.Vector3(),LMP={x:0,z:-19.5};
  const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.82,metalness:0},o||{}));
  const MB=(c,o)=>new THREE.MeshBasicMaterial(Object.assign({color:c},o||{}));
  const sh=m=>{m.castShadow=m.receiveShadow=true;return m};
  const bx=(g,w,h,d,c,x,y,z,o)=>{const m=sh(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c,o)));m.position.set(x,y,z);g.add(m);return m};
  const cy=(g,rt,rb,h,c,x,y,z,seg,o)=>{const m=sh(new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||24),M(c,o)));m.position.set(x,y,z);g.add(m);return m};
  const sp=(g,r,c,x,y,z,o)=>{const m=sh(new THREE.Mesh(new THREE.SphereGeometry(r,16,12),M(c,o)));m.position.set(x,y,z);g.add(m);return m};
  const cn=(g,r,h,c,x,y,z,seg,o)=>{const m=sh(new THREE.Mesh(new THREE.ConeGeometry(r,h,seg||24),M(c,o)));m.position.set(x,y,z);g.add(m);return m};
  const grp=(p,x,y,z)=>{const g=new THREE.Group();g.position.set(x,y,z);p.add(g);return g};
  function seeded(n){let s=n*9301+49297;return()=>{s=(s*9301+49297)%233280;return s/233280}}
  function sign(g,txt,w,h,x,y,z,bg,fg,ry){
    const t=GL.tex(256,Math.round(256*h/w),(c,W,H)=>{c.fillStyle=bg;c.fillRect(0,0,W,H);c.strokeStyle="#3a1f10";c.lineWidth=10;c.strokeRect(5,5,W-10,H-10);c.fillStyle=fg;c.font="800 "+Math.round(H*.5)+"px 'Baloo 2',sans-serif";c.textAlign="center";c.textBaseline="middle";c.fillText(txt,W/2,H/2+3)});
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide}));m.position.set(x,y,z);if(ry)m.rotation.y=ry;g.add(m);return m}
  function pipe(g,a,b,c,r){const A=new THREE.Vector3(...a),Bv=new THREE.Vector3(...b),d=Bv.clone().sub(A),L=d.length();
    const m=sh(new THREE.Mesh(new THREE.CylinderGeometry(r||.28,r||.28,L,10),M(c||0x8fb4c8,{metalness:.3,roughness:.5})));
    m.position.copy(A.clone().add(Bv).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());g.add(m);return m}
  function cone3(g,x,z){cn(g,.5,1.3,0xf08a2e,x,.65,z,16);cy(g,.52,.52,.18,0xffffff,x,.7,z,16)}

  // ---------- partículas (en coordenadas del mundo) ----------
  const puffGeo=new THREE.SphereGeometry(1,10,8);
  for(let i=0;i<60;i++){const m=new THREE.Mesh(puffGeo,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false}));m.visible=false;sc.add(m);pool.push({m,l:0,v:new THREE.Vector3(),s:1,max:2,op:.6,grow:1})}
  let pi=0;
  function puff(x,y,z,col,size,life,vy,op,grow){const p=pool[pi++%pool.length];p.m.visible=true;p.m.position.set(x,y,z);p.m.material.color.setHex(col);p.s=size;p.max=life;p.l=0;p.v.set((Math.random()-.5)*.6,vy,(Math.random()-.5)*.6);p.op=op||.6;p.grow=grow||1.2;p.m.scale.setScalar(size)}
  const dropGeo=new THREE.SphereGeometry(.2,8,6),dropMat=MB(0x6ec4f0);
  for(let i=0;i<60;i++){const m=new THREE.Mesh(dropGeo,dropMat);m.visible=false;sc.add(m);drops.push({m,v:new THREE.Vector3(),on:false})}
  let di=0;
  function drop(x,y,z,vx,vy,vz){const d=drops[di++%drops.length];d.on=true;d.m.visible=true;d.m.position.set(x,y,z);d.v.set(vx,vy,vz)}

  // ---------- raíz: el mapa del departamento vive en dyn (se reconstruye) ----------
  const root=new THREE.Group();sc.add(root);const dyn=new THREE.Group();root.add(dyn);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1,.18,8,48),MB(0xf6c344,{transparent:true,opacity:.95}));ring.rotation.x=Math.PI/2;ring.visible=false;root.add(ring);
  const grassMat=M(0x7cc35a),dryMat=M(0xb9b37a),roadMat=M(0x5f666c),roadBad=M(0x8b867e);
  const W3=(x,y,z)=>root.localToWorld(new THREE.Vector3(x,y,z));
  const emitL=o=>emit.push(Object.assign({t:0,on:()=>true},o));
  let lmId=null,lmCur=null;
  const lmEm=(x,y,z,col,rate,size,life,vy)=>{const my=lmId;emit.push({lm:1,x:LMP.x+x,y:GY+y,z:LMP.z+z,col,rate,size,life,vy,op:.55,grow:1.5,on:()=>lmId===my,t:0})};
  function plaque(g,txt){const t=GL.tex(512,112,(c,W,H)=>{c.fillStyle="#fff4dc";c.fillRect(0,0,W,H);c.strokeStyle="#3a1f10";c.lineWidth=10;c.strokeRect(5,5,W-10,H-10);let f=58;c.font="800 "+f+"px 'Baloo 2',sans-serif";while(c.measureText(txt).width>W-40&&f>20){f-=2;c.font="800 "+f+"px 'Baloo 2',sans-serif"}c.fillStyle="#3a1f10";c.textAlign="center";c.textBaseline="middle";c.fillText(txt,W/2,H/2+3)});
    const m=new THREE.Mesh(new THREE.PlaneGeometry(9,1.97),new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide}));m.position.set(0,1.7,6.8);g.add(m);bx(g,.25,1.7,.25,0x6b4a2c,-4.2,.85,6.7);bx(g,.25,1.7,.25,0x6b4a2c,4.2,.85,6.7)}
  const pine=(g,x,z,s)=>{cy(g,.2,.3,1.4*s,0x7a4a22,x,.7*s,z,6);cn(g,1.2*s,2.4*s,0x2f7a4a,x,2.2*s,z,8);cn(g,.9*s,2*s,0x3a8a55,x,3.4*s,z,8)};
  const palmL=(g,x,z)=>{for(let i=0;i<5;i++)cy(g,.22,.3,1.4,0x8a5a30,x+Math.sin(i*.1)*.2,.7+i*1.3,z,8);for(let a=0;a<6;a++){const l=bx(g,3,.1,.7,0x3f9a4f,x+Math.cos(a*1.05)*1.4,7.1,z+Math.sin(a*1.05)*1.4);l.rotation.y=-a*1.05;l.rotation.z=-.3}};
  const lbase=(g,r,c)=>cy(g,r,r+.3,.4,c||0xd9c9a8,0,.2,0,40);
  const LMB={
   "ahuachapan":g=>{cy(g,5,5.4,.3,0xa07a50,0,.15,0,24);[[-1.5,.5],[1.6,-1],[0,1.8]].forEach(([x,z])=>{cn(g,1.3,1.5,0x8a6a42,x,.85,z,10);cy(g,.5,.5,.12,0x4a3020,x,1.6,z,10)});for(let i=0;i<7;i++){const a=i*.9;sp(g,.6,0x2e7d3a,Math.cos(a)*4.3,.7,Math.sin(a)*4.3-.5);sp(g,.1,0xd8392b,Math.cos(a)*4.3+.4,.9,Math.sin(a)*4.3-.4)}
     [[-1.5,1.7,.5],[1.6,1.7,-1],[0,1.7,1.8]].forEach(p=>lmEm(p[0],p[1],p[2],0xffffff,.28,.8,2.8,2.2));lmCur="ahuachapan"},
   "santa-ana":g=>{lbase(g,5.8);bx(g,6,6,8,0xf3ecd8,0,3.4,-.5);bx(g,6.6,.4,8.6,0xb7b0a0,0,6.5,-.5);
     for(const x of[-2.2,2.2]){bx(g,2,9.5,2,0xf3ecd8,x,4.9,3.3);bx(g,2.3,.4,2.3,0xb7b0a0,x,9.7,3.3);const c=cn(g,1.7,5.2,0x6a7f95,x,12.5,3.3,4);c.rotation.y=Math.PI/4;bx(g,.8,2,.2,0x2a2a30,x,7.8,4.35)}
     const c2=cn(g,1.9,6,0x6a7f95,0,9.5,-.5,4);c2.rotation.y=Math.PI/4;
     cy(g,1.05,1.05,.2,0x6ec4f0,0,5.3,4.4,20).rotation.x=Math.PI/2;cy(g,1.25,1.25,.15,0xc9a227,0,5.3,4.35,20).rotation.x=Math.PI/2;bx(g,1.5,2.8,.2,0x3a2a1a,0,1.8,4.4);lmCur="santa-ana"},
   "sonsonate":g=>{cy(g,5,5.5,.3,0x8a7a5a,0,.15,0,24);cy(g,.8,4.8,10,0x4a3a30,0,5.2,0,24);cy(g,3,5,2.5,0x5a7a4a,0,1.6,0,24);cy(g,.9,.9,.3,0xff5a1a,0,10.3,0,16,{emissive:0xff4400,emissiveIntensity:1.2});palmL(g,-5,3);palmL(g,5,2);
     lmEm(0,10.5,0,0x9a948c,.35,1.8,4,2.4);lmCur="sonsonate"},
   "la-libertad":g=>{lbase(g,4.4,0xe0d0a8);cy(g,3.2,3.4,.6,0xdddddd,0,.7,0,8);for(let i=0;i<8;i++){const a=i*Math.PI/4;cy(g,.14,.14,3,0xf4efe0,Math.cos(a)*2.7,2.5,Math.sin(a)*2.7,8)}
     const r=cn(g,3.8,2,0xc4502f,0,5.2,0,8);sp(g,.35,0xc9a227,0,6.4,0);cy(g,3.4,3.4,.2,0xf4efe0,0,4,0,8);cy(g,.25,.25,.6,0x7a7a7a,0,1.3,0,8);
     bx(g,.5,.2,2.2,0x4aa8e8,-4.3,.3,-2).rotation.set(.2,0,.5);bx(g,.5,.2,2.2,0xf6c344,4.3,.3,-1.4).rotation.set(.2,0,-.5);lmCur="la-libertad"},
   "chalatenango":g=>{cn(g,5,9.5,0x6a8a6a,0,4.7,-1.6,7);cn(g,1.7,2.6,0xffffff,0,8.9,-1.6,7);[[-4,2,1.3],[-2.3,3.4,1],[1.8,3.2,1.2],[4,1.2,1.4],[3,-2,1],[-4.5,-1.5,1]].forEach(a=>pine(g,a[0],a[1],a[2]));
     lmEm(0,10.2,-1.6,0xf0f4f8,.7,1.6,3.5,1);lmCur="chalatenango"},
   "san-salvador":g=>{lbase(g,5);bx(g,6,.6,6,0xdddddd,0,.5,0);bx(g,4.6,.6,4.6,0xe8e8e8,0,1.1,0);bx(g,1.7,7,1.7,0xf6f6f6,0,4.9,0);const gl=sp(g,1.9,0x3a8fd8,0,9.4,0);for(const[x,y,z]of[[.6,10,1.4],[-1,9,1.2],[1.4,8.6,-.5],[-.5,10.6,.4]])sp(g,.5,0x4cb85a,x,y,z).scale.set(1,.7,.5);
     cy(g,.3,.5,1.8,0xffffff,0,12.2,0,8);sp(g,.45,0xffffff,0,13.4,0);bx(g,2.4,.2,.3,0xffffff,0,12.7,0);const ha=cn(g,.7,.4,0xffe36a,0,14,0,12);lmCur="san-salvador"},
   "cuscatlan":g=>{cn(g,5.5,7,0x6fae4f,0,3.5,0,14);bx(g,.3,2.4,.3,0xffffff,0,8.2,0);bx(g,1.3,.3,.3,0xffffff,0,8.7,0);for(const[x,z,c]of[[-4.5,2,0xe8665a],[4.6,1.6,0xf2c24a],[-2,4.2,0x6ec4f0]]){bx(g,2,1.4,1.8,c,x,.9,z);cn(g,1.6,1,0xb5472a,x,2.1,z,4).rotation.y=Math.PI/4}lmCur="cuscatlan"},
   "la-paz":g=>{cy(g,5.4,5.6,.25,0xe8d9a8,0,.12,0,32);cy(g,3,3.4,.12,0x2fa4e0,0,.28,-3.2,32);palmL(g,-3,-1);palmL(g,3.4,0);palmL(g,0,1.8);for(const[x,z,c]of[[-1.6,3,0xd8392b],[1.8,3.4,0xf6c344]]){cy(g,.07,.07,2.4,0xffffff,x,1.2,z,6);cn(g,1.6,.7,c,x,2.5,z,10)}lmCur="la-paz"},
   "cabanas":g=>{cn(g,5,6,0x7aa456,-3.2,3,-1.5,12);cn(g,4,5,0x6a9a50,3.6,2.5,-2,12);bx(g,2.8,2.4,3,0xf3ecd8,0,1.5,2);bx(g,3.2,.3,3.4,0xc4502f,0,2.8,2);bx(g,1.1,4,1.1,0xf3ecd8,-1.4,3,3.4);cn(g,.9,1.2,0xc4502f,-1.4,5.6,3.4,4).rotation.y=Math.PI/4;bx(g,1,1.6,.1,0x5a3a22,0,.9,3.55);lmCur="cabanas"},
   "san-vicente":g=>{bx(g,8,.3,8,0xd9c9a8,0,.15,0);bx(g,3,.6,3,0xdddddd,0,.6,0);bx(g,2.4,8,2.4,0xf2efe6,0,4.9,0);for(const z of[1.25,-1.25])for(const y of[2.4,5.2])bx(g,1,1.6,.1,0x3a3a42,0,y,z);bx(g,1.9,3,1.9,0xf2efe6,0,10.4,0);cy(g,.75,.75,.15,0xffffff,0,10.6,1.0,20).rotation.x=Math.PI/2;cy(g,.08,.08,.5,0x222222,0,10.75,1.1,6);const c=cn(g,1.7,3.2,0xc4502f,0,13.5,0,4);c.rotation.y=Math.PI/4;lmCur="san-vicente"},
   "usulutan":g=>{cy(g,5.6,5.8,.25,0x2fa4e0,0,.12,0,40,{roughness:.1,emissive:0x0a4a7a,emissiveIntensity:.4});for(let i=0;i<6;i++){const a=i*1.05+.3,x=Math.cos(a)*3.2,z=Math.sin(a)*3.2;for(let k=0;k<4;k++){const r=cy(g,.08,.08,2.2,0x6b4a2c,x+Math.cos(k*1.6)*.5,1,z+Math.sin(k*1.6)*.5,5);r.rotation.set(Math.sin(k*1.6)*.4,0,Math.cos(k*1.6)*.4)}sp(g,1.2,0x2e7d3a,x,2.6,z)}
     const bt=bx(g,2.4,.5,.9,0xf6c344,.4,.4,.2);bx(g,.1,2,.1,0x6b4a2c,.4,1.4,.2);bx(g,1.1,1.5,.05,0xffffff,.4,1.6,.2);lmCur="usulutan"},
   "san-miguel":g=>{cy(g,5,5.4,.3,0x6f9a5e,0,.15,0,28);cy(g,.9,4.6,9,0x6a8a62,0,4.7,0,24);cy(g,1,1,.3,0xff5a1a,0,9.2,0,16,{emissive:0xff4400,emissiveIntensity:1.1});
     for(const x of[-5,5]){cy(g,.15,.15,6,0x7a5a3a,x,3,4,6)}const cols=[0xe86ab0,0xf6c344,0x4aa8e8,0x3f9a4f,0xd8392b,0xf39a2d];for(let i=0;i<10;i++){const m=bx(g,.9,1.1,.05,cols[i%6],-5+i*1.1,5.2-Math.sin((i+.5)/10*Math.PI)*.9,4);m.userData.sw=i}
     lmEm(0,9.4,0,0x9a948c,.4,1.6,4,2.2);lmCur="san-miguel"},
   "morazan":g=>{lbase(g,4.6,0xd9c9a8);bx(g,3.4,3,3.4,0x9a9a9a,0,1.7,0);bx(g,3.8,.4,3.8,0x7a7a7a,0,3.3,0);const d=sp(g,1.3,0xffffff,0,4.9,0);d.scale.set(1.5,1,.8);sp(g,.55,0xffffff,1.6,5.6,0);cn(g,.22,.7,0xf59a2e,2.2,5.55,0,8).rotation.z=-Math.PI/2;for(const z of[-1,1]){const w=bx(g,3.4,.14,1.4,0xffffff,-.2,5.5,z*1.1);w.rotation.set(z*.5,0,.3)}bx(g,1.8,.3,.7,0xffffff,-2.3,4.9,0);const br=bx(g,.1,.1,1.6,0x3f9a4f,2.3,4.5,.4);br.rotation.z=.6;lmCur="morazan"},
   "la-union":g=>{cy(g,6,6,.3,0x2fa4e0,0,.15,0,40,{roughness:.1,emissive:0x0a4a7a,emissiveIntensity:.4});bx(g,6.4,1.3,2.2,0x2a3a4a,0,1,-.5);bx(g,1.8,1.8,1.8,0xffffff,-2.2,2.6,-.5);bx(g,.9,.6,.9,0xd8392b,-2.2,3.8,-.5);[[0xe8452b,-.4],[0x2f78c4,1],[0xf6c344,2.3]].forEach(([c,x])=>{bx(g,1.2,1,1.8,c,x,2.1,-.5);bx(g,1.2,1,1.8,[0x3f9a4f,0xe86ab0,0xf39a2d][Math.round(x)%3],x,3.1,-.5)});
     bx(g,.3,6,.3,0xd8392b,3.9,3.2,2.2);bx(g,.3,6,.3,0xd8392b,1.3,3.2,2.2);bx(g,4,.35,.35,0xd8392b,2.6,6.3,2.2);bx(g,.1,2,.1,0x222222,2,5.3,2.2);lmEm(-.8,4.2,-.5,0xdddddd,.7,.7,2.5,1.2);lmCur="la-union"}};
  // ---------- configuración de cada departamento ----------
  // rot: giro del mapa (x90°), rx/rz: cruce río-calle, q: cuadrante de cada sitio, lx: posición del emblema,
  // trees: arbolado, s: paisaje propio (ops)
  const MAPS={
   "ahuachapan":{rot:0,rx:4,rz:8,q:{mercado:"NW",salud:"NE",edu:"SW",agua:"SE"},lx:12,trees:"broad",ground:0x6fb04a,
     s:[["lake",-14,-25,6.5,0x35b79a],["hill",-27,-20,6,10,0x5f9a62],["hill",25,-26,8,12,0x679f66],["hill",-6,-30,6,8,0x5a9460],["caf",-28,-6,3,6],["caf",24,4,2,5],["mist",-14,-22],["mist",22,-22]]},
   "santa-ana":{rot:1,rx:-3,rz:6,q:{salud:"NW",edu:"NE",mercado:"SW",agua:"SE"},lx:-13,trees:"broad",ground:0x78bd55,
     s:[["volcano",14,-26,12,19,0x6a5a5a,1,1],["lake",27,-12,5,0x2fa4e0],["caf",-28,10,3,7],["caf",26,10,2,6],["hill",-27,-26,6,9,0x6aa86a]]},
   "sonsonate":{rot:2,rx:6,rz:9,q:{salud:"SW",edu:"NE",mercado:"NW",agua:"SE"},lx:-10,trees:"palm",ground:0x86c452,
     s:[["sea"],["boat",12,-29],["boat",-20,-28],["boat",24,-28],["palms",18,-20,5],["palms",-27,-12,4],["hill",27,-14,6,9,0x6a9a58]]},
   "la-libertad":{rot:3,rx:-2,rz:4,q:{salud:"NE",edu:"NW",mercado:"SE",agua:"SW"},lx:11,trees:"broad",ground:0x6fbf5a,
     s:[["sea"],["surf",-8,-27],["surf",20,-27],["hill",-27,-17,7,11,0x5e9a5a],["hill",27,-10,6,9,0x679f66],["caf",-28,6,3,5],["palms",-16,-21,3]]},
   "chalatenango":{rot:0,rx:-3,rz:9,q:{salud:"NE",edu:"NW",mercado:"SW",agua:"SE"},lx:-14,trees:"pine",ground:0x5fae55,
     s:[["hill",10,-27,10,16,0x5a8a62],["hill",24,-19,7,10,0x6a9a6a],["hill",-27,-27,8,12,0x5a8a62],["lake",24,-27,6,0x2f8fc8],["pines",18,-17,12],["pines",-27,-6,8],["milpa",26,8,4,7]]},
   "san-salvador":{rot:1,rx:0,rz:6,q:{salud:"NW",mercado:"NE",edu:"SW",agua:"SE"},lx:12,trees:"broad",ground:0x7cc35a,
     s:[["volcano",-14,-26,13,20,0x6f9a5e,1,1],["lake",26,-24,6,0x2a9fd8],["city",27,-3],["city",-28,12]]},
   "cuscatlan":{rot:2,rx:-4,rz:7,q:{salud:"SW",edu:"NW",mercado:"NE",agua:"SE"},lx:13,trees:"broad",ground:0x78c458,
     s:[["lake",-12,-27,10,0x2f9ad8],["hill",26,-25,8,11,0x6fae4f],["cattle",-27,6,4],["milpa",27,6,3,6],["hill",-27,-8,5,7,0x70b050]]},
   "la-paz":{rot:3,rx:5,rz:3,q:{salud:"NW",edu:"NE",mercado:"SE",agua:"SW"},lx:-12,trees:"palm",ground:0x8ccb55,
     s:[["sea"],["palms",14,-20,6],["cane",24,-12,4,8],["cane",-28,12,3,6],["lake",16,-22,4.5,0x4ab8d8],["boat",-6,-29],["boat",14,-28]]},
   "cabanas":{rot:0,rx:3,rz:5,q:{salud:"SW",edu:"NW",mercado:"NE",agua:"SE"},lx:-12,trees:"broad",ground:0x8fc55a,
     s:[["band",-29,5,0x5a9ab8],["hill",14,-21,8,10,0x7aa456],["hill",-27,-20,6,9,0x6a9a50],["milpa",27,10,4,7],["cattle",-27,10,4],["cattle",27,-6,3]]},
   "san-vicente":{rot:1,rx:-5,rz:8,q:{edu:"NW",salud:"NE",mercado:"SW",agua:"SE"},lx:-10,trees:"broad",ground:0x7cc35a,
     s:[["volcano",12,-27,9,17,0x6a8a62,1,0],["volcano",24,-25,7,14,0x5f8058,0,0],["cane",-28,10,3,7],["cane",27,10,3,6],["hill",-27,-24,6,8,0x6aa86a]]},
   "usulutan":{rot:2,rx:2,rz:9,q:{salud:"NW",mercado:"NE",edu:"SE",agua:"SW"},lx:11,trees:"palm",ground:0x7ec654,
     s:[["sea"],["mangle",-14,-21,9],["mangle",26,-18,5],["isle",-22,-29,3],["isle",6,-30,2.5],["boat",-4,-28],["salt",-27,-8]]},
   "san-miguel":{rot:3,rx:0,rz:7,q:{salud:"NW",edu:"NE",mercado:"SE",agua:"SW"},lx:12,trees:"broad",ground:0x86c250,
     s:[["volcano",-14,-26,13,21,0x6a8a62,1,1],["lake",26,-22,5,0x3f9ad0],["cattle",-27,8,4],["cane",27,8,3,6],["hill",26,-8,5,6,0x7ab050]]},
   "morazan":{rot:0,rx:-3,rz:4,q:{mercado:"NW",salud:"NE",edu:"SE",agua:"SW"},lx:12,trees:"pine",ground:0x6fb455,
     s:[["hill",-14,-26,10,15,0x5a8a62],["hill",26,-22,9,13,0x6a9a6a],["hill",-28,-10,6,9,0x5f8f5f],["pines",20,-14,9],["pines",-27,12,7],["mist",-12,-22],["mist",22,-18]]},
   "la-union":{rot:1,rx:6,rz:6,q:{mercado:"NW",salud:"NE",edu:"SW",agua:"SE"},lx:-9,trees:"palm",ground:0x86c850,
     s:[["sea"],["volcano",16,-27,11,16,0x6a8a62,0,0],["isle",-24,-29,3.5],["isle",-4,-30,2.5],["boat",6,-29],["boat",-16,-28]]}};
  const QPOS=(rx,rz)=>({NW:[rx-16,rz-9],NE:[rx+16,rz-9],SW:[rx-16,rz+11],SE:[rx+16,rz+11]});
  const SKYMAP={};
  function disposeAll(o){o.traverse(c=>{if(c.geometry)c.geometry.dispose();if(c.material){const ms=Array.isArray(c.material)?c.material:[c.material];ms.forEach(m=>{if(m.map)m.map.dispose();m.dispose()})}})}

  function construct(id){
    const C=MAPS[id]||MAPS["san-salvador"];mapId=MAPS[id]?id:"san-salvador";
    while(dyn.children.length){const c=dyn.children[0];dyn.remove(c);disposeAll(c)}
    sites={};boats=[];emit=[];flags=[];strings=[];bunting=[];waves=[];lamps=[];busX=-30;busDir=1;
    anims=[];const R=dyn;rot=C.rot;RX=C.rx;RZ=C.rz;root.rotation.y=rot*Math.PI/2;
    const rx=C.rx,rz=C.rz,occ=[],oc=(x,z,r)=>occ.push([x,z,r]),free=(x,z,m)=>!occ.some(o=>(x-o[0])*(x-o[0])+(z-o[1])*(z-o[1])<Math.pow(o[2]+(m||0),2));
    grassMat.color.setHex(C.ground||0x7cc35a);
    // ----- isla -----
    bx(R,64,3,64,0x8a5a30,0,-1.5,0);bx(R,60,8,60,0x6b4426,0,-7,0);bx(R,48,7,48,0x58381e,0,-14.5,0);
    grass=sh(new THREE.Mesh(new THREE.BoxGeometry(64,.6,64),grassMat));grass.position.set(0,.3,0);R.add(grass);
    const rr=seeded(rot*7+rx+rz+3);
    for(let i=0;i<40;i++){const w=3+rr()*6,d=3+rr()*6,x=(rr()-.5)*58,z=(rr()-.5)*58;const m=new THREE.Mesh(new THREE.BoxGeometry(w,.08,d),new THREE.MeshStandardMaterial({color:i%2?0x000000:0xffffff,roughness:.9,transparent:true,opacity:.07}));m.position.set(x,GY+.02,z);m.receiveShadow=true;R.add(m)}
    // ----- río (cruza la calle donde está el puente) y calle -----
    water=new THREE.Mesh(new THREE.BoxGeometry(7,.2,50),M(0x3fa8e8,{roughness:.15,emissive:0x0b3a66,emissiveIntensity:.5}));water.position.set(rx,GY+.05,rz+1);water.receiveShadow=true;R.add(water);
    for(let i=0;i<9;i++){const w=new THREE.Mesh(new THREE.BoxGeometry(2.2,.06,.25),MB(0xffffff,{transparent:true,opacity:.7}));w.position.set(rx+(i%3-1)*1.8,GY+.2,rz-17+i*5);w.userData.z0=rz+1-25;R.add(w);waves.push(w)}
    roads=[];
    for(const[x0,x1]of[[-32,rx-3.5],[rx+3.5,32]]){const w=x1-x0,cx=(x0+x1)/2;
      bx(R,w,.3,7.4,0xe2d3b0,cx,GY+.1,rz);roads.push(bx(R,w,.36,6,0x5f666c,cx,GY+.12,rz));
      for(let x=x0+1;x<x1-1;x+=3)bx(R,1.5,.05,.25,0xf6c344,x,GY+.33,rz)}
    for(let x=-30;x<=30;x+=6)oc(x,rz,5.2);for(let z=-18;z<=32;z+=6)oc(rx,z,5);
    // ----- sitios -----
    const Q=QPOS(rx,rz);
    function site(k,x,z,anchor,r2){const g=grp(R,x,GY,z),ok=new THREE.Group(),bad=new THREE.Group();g.add(ok,bad);sites[k]={g,ok,bad,anchor:new THREE.Vector3(x+anchor[0],GY+anchor[1],z+anchor[2]),r:r2||8};oc(x,z,8.5);return sites[k]}
    {const[x,z]=Q[C.q.salud],s=site("salud",x,z,[0,10.5,0],9),o=s.ok,b=s.bad;
     bx(o,12,7.5,10,0xf6f8fa,0,3.75,0);bx(o,12.8,.9,10.8,0x4aa8e8,0,7.9,0);
     bx(o,1.4,4.2,.3,0xd8392b,0,5.5,5.2);bx(o,4.2,1.4,.3,0xd8392b,0,5.5,5.2);
     for(const xx of[-3.8,3.8])bx(o,2.4,2.6,.3,0x7fc4ec,xx,3.8,5.1);bx(o,2.4,3.6,.3,0x4aa8e8,0,1.8,5.1);
     const bc=sp(o,.6,0x4aa8e8,0,8.8,0,{emissive:0x2288ff,emissiveIntensity:1});bc.userData.beacon=1;
     sign(o,"UNIDAD DE SALUD",7,1.4,0,9.8,5.3,"#fff4dc","#d8392b");
     const amb=grp(o,8.5,0,3.5);bx(amb,4,2,2.2,0xffffff,0,1.2,0);bx(amb,1.6,1.4,2.1,0xcfeaff,1.4,1.8,0);bx(amb,.9,.3,.3,0xd8392b,-.6,1.7,1.12);bx(amb,.3,.9,.3,0xd8392b,-.6,1.7,1.12);for(const xx of[-1.2,1.4])cy(amb,.5,.5,.4,0x222222,xx,.5,1.1,12).rotation.x=Math.PI/2;
     sp(o,1.2,0x4cb85a,-7.5,1.2,4.5);sp(o,1,0x5ab45a,7.2,1,-3);
     bx(b,12,7.5,10,0xb3ab9f,0,3.75,0);bx(b,12.6,.8,10.6,0x5a5148,0,7.9,0);bx(b,5,.2,4,0x14100d,1,8.35,.5);
     const lean=bx(b,.5,.5,8,0x6b4a2c,-1,7.4,-.5);lean.rotation.z=.5;
     bx(b,.3,6,.15,0x2a241e,-.5,4,5.08).rotation.z=.12;bx(b,.25,4,.15,0x2a241e,3.5,5,5.08).rotation.z=-.25;
     for(const xx of[-3.8,3.8]){bx(b,2.6,2.8,.3,0x7a5632,xx,3.8,5.1);const p1=bx(b,3.2,.3,.18,0x2a1a10,xx,3.8,5.3);p1.rotation.z=.6;const p2=bx(b,3.2,.3,.18,0x2a1a10,xx,3.8,5.3);p2.rotation.z=-.6}
     bx(b,2.4,3.6,.3,0x5a4a3a,0,1.8,5.1);sign(b,"CERRADO",4.6,1.2,0,3.2,5.4,"#d8392b","#ffffff");
     for(const[xx,y,zz,w]of[[7.5,.4,2,1.2],[8.5,.3,4.5,1.6],[6.6,.3,-1,1],[-7,.35,5.5,1.3]]){const d=bx(b,w,.8,w,0x8d867c,xx,y,zz);d.rotation.y=xx}
     emitL({x:x+1,y:GY+8.2,z:z+.5,col:0xcfc9c0,rate:.35,size:1.3,life:3,vy:1.6,op:.6,grow:1.4,on:()=>!B.salud})}
    {const[x,z]=Q[C.q.edu],s=site("edu",x,z,[0,10,0],9),o=s.ok,b=s.bad;
     bx(o,12,6.5,8,0xf6c344,0,3.25,0);bx(o,12.8,.9,8.8,0xd8392b,0,6.9,0);
     for(const xx of[-4,4])bx(o,2.4,2.6,.3,0x7fc4ec,xx,3.6,4.1);bx(o,2.4,3.4,.3,0x3b73c4,0,1.7,4.1);
     sign(o,"ESCUELA",6,1.3,0,5.5,4.3,"#fff4dc","#3b73c4");
     cy(o,.12,.12,8,0xdddddd,5.4,10.6,0,8);const fl=bx(o,2.8,1.7,.1,0x3b73c4,6.9,13.4,0);fl.userData.flag=1;flags.push(fl);const fl2=bx(o,2.8,.6,.12,0xffffff,6.9,13.4,0);flags.push(fl2);
     const sw=grp(o,0,0,8);bx(sw,.2,3,.2,0x8a5a30,-1,1.5,0);bx(sw,.2,3,.2,0x8a5a30,1,1.5,0);bx(sw,2.2,.15,.15,0x8a5a30,0,3,0);bx(sw,.9,.15,.5,0xe8452b,0,1,0);
     bx(b,12,6.5,8,0xc9bb92,0,3.25,0);const half=bx(b,6.6,.7,8.8,0x6f6050,-3,6.9,0);half.rotation.z=.12;const half2=bx(b,6.4,.7,8.8,0x6f6050,3.2,6.3,0);half2.rotation.z=-.5;bx(b,4,.2,4,0x14100d,0,6.7,0);
     for(const xx of[-4,4]){bx(b,2.4,2.6,.3,0x9fb7c2,xx,3.6,4.1);const c1=bx(b,.12,2.6,.1,0x2a241e,xx,3.6,4.3);c1.rotation.z=.5}
     bx(b,2.4,3.4,.3,0x5a4a3a,0,1.7,4.1).rotation.z=.04;
     cy(b,.12,.12,4,0xcccccc,5.4,2,0,8);const bent=cy(b,.12,.12,4,0xcccccc,6.6,4.4,0,8);bent.rotation.z=-1;
     for(const[xx,zz]of[[7,3],[7.6,5],[-7.2,4.6]]){const d=bx(b,1.1,.6,.9,0xa89e82,xx,.3,zz);d.rotation.y=xx}}
    {const[x,z]=Q[C.q.mercado],s=site("mercado",x,z,[0,8.5,0],9),o=s.ok,b=s.bad;
     bx(s.g,14,.5,9,0xd9c9a8,0,.25,0);
     [0xd8392b,0x3f9a4f,0x4aa8e8].forEach((c,i)=>{const xx=-4.4+i*4.4;
       bx(o,3.4,1.5,2.4,0xb5532e,xx,1.2,0);for(const dx of[-1.6,1.6])for(const dz of[-1.1,1.1])cy(o,.1,.1,4,0x6b4a2c,xx+dx,2.5,dz,6);
       const aw=bx(o,4.2,.25,3.2,c,xx,4.6,0);aw.rotation.x=.18;for(let k=-1;k<=1;k+=1){const st=bx(o,.45,.27,3.3,0xfff4dc,xx+k*1.3,4.62,0);st.rotation.x=.18}
       for(let k=0;k<5;k++)sp(o,.28,[0xe4444a,0xf6c344,0x4cb85a,0xf59a2e][k%4],xx-1.2+k*.6,2.2,0)});
     sign(o,"MERCADO",5.5,1.3,0,6.5,-3.6,"#fff4dc","#d8392b");
     for(let i=0;i<3;i++){const xx=-4.4+i*4.4;for(const dx of[-1.6,1.6])cy(b,.1,.1,i===1?1.8:4,0x6b4a2c,xx+dx,i===1?.9+.5:2.5,-1.1,6)}
     const tarp=bx(b,3.2,.1,2.2,0xa9a69c,-4.4,4,-.6);tarp.rotation.set(.9,.2,.1);
     const fallen=bx(b,.2,.2,4,0x6b4a2c,0,.6,1.4);fallen.rotation.y=.5;
     for(const[xx,zz,w]of[[-5,2.8,1.1],[1,3,1.3],[5.6,2,1.1],[4,-3.4,.9]]){const cc=bx(b,w,w*.8,w,0x9a6a3a,xx,.9,zz);cc.rotation.y=xx}}
    {const[x,z]=Q[C.q.agua],s=site("agua",x,z,[0,17,0],9),o=s.ok,b=s.bad;
     for(const[xx,zz]of[[-2.4,-2.4],[2.4,-2.4],[-2.4,2.4],[2.4,2.4]])pipe(s.g,[xx,0,zz],[xx*.7,8,zz*.7],0x77777f,.25);
     for(const gg of[o,b]){const col=gg===o?0x4aa8e8:0x9a8f86;cy(gg,3.2,3.2,4,col,0,10,0,32);cn(gg,3.4,1.8,gg===o?0x3b73c4:0x7a7068,0,12.9,0,32)}
     sign(o,"AGUA",3,1.4,0,10,3.3,"#ffffff","#2f78c4");
     for(const[xx,y,zz]of[[2,10.4,2.4],[-2.6,9.5,1.6],[.4,11,-3]]){const r=sp(b,.55,0x9a4a20,xx,y,zz);r.scale.set(1,.5,1)}
     bx(b,.12,3,.12,0x2a241e,1,10.2,3.18).rotation.z=.3;
     const pud=(xx,zz,rx2)=>cy(b,rx2,rx2,.12,0x6ec4f0,xx,.1,zz,24,{roughness:.1,emissive:0x1a5a8a,emissiveIntensity:.4});
     pud(1.5,3.5,2.6);pud(-8,.5,2.2);pud(8.5,-2.5,1.6);
     emitL({leak:[x+1.6,GY+7.8,z+3.2],on:()=>!B.agua});emitL({leak:[x-2.4,GY+8.2,z+1],on:()=>!B.agua});
     // red de tuberías hacia las casas (relativa a la torre)
     const okp=new THREE.Group(),badp=new THREE.Group();s.g.add(okp,badp);
     const A=[[-3,1,0],[-10,1,0],[-10,1,7]],Cc=[[3,1,0],[7,1,0],[7,1,7]];
     [A,Cc].forEach(p=>{for(let i=0;i<p.length-1;i++){pipe(okp,p[i],p[i+1],0x8fb4c8);if(i!==0)pipe(badp,p[i],p[i+1],0x8e8a82)}});
     pipe(badp,A[0],[A[0][0]-3.5,1,0],0x8e8a82);pipe(badp,Cc[0],[Cc[0][0]+1.5,1,0],0x8e8a82);
     s.pipesOk=okp;s.pipesBad=badp;
     emitL({leak:[x-6.4,GY+1.2,z],on:()=>!B.agua});emitL({leak:[x-10,GY+1.2,z+2.5],on:()=>!B.agua});emitL({leak:[x+4.5,GY+1.2,z],on:()=>!B.agua});
     const pd=(xx,zz,r2)=>cy(badp,r2,r2,.1,0x6ec4f0,xx,.15,zz,24,{roughness:.1,emissive:0x1a5a8a,emissiveIntensity:.4});pd(-6.4,1,1.8);pd(-10,3,1.5);pd(5,1,1.6);
     const hs=(xx,zz,c,rf)=>{const h=grp(R,xx,GY,zz);bx(h,5,3.4,4.5,c,0,1.7,0);const r2=cn(h,3.9,2.2,rf,0,4.5,0,4);r2.rotation.y=Math.PI/4;bx(h,1,2,.2,0x7a4a2a,0,1,2.3);bx(h,1.1,1.1,.2,0x7fc4ec,-1.5,2,2.3);oc(xx,zz,4);return h};
     hs(x-10,z+10,0xe8665a,0xb5472a);hs(x+7,z+10,0xf2c24a,0xc4502f)}
    {const s=site("puente",rx,rz,[0,8,0],7),o=s.ok,b=s.bad;
     bx(o,8,.9,6.2,0x7b8288,0,.8,0);bx(o,8,.12,.3,0xf6c344,0,1.3,0);
     for(const zz of[-3,3]){bx(o,8,.25,.25,0xe8e2d0,0,2.6,zz);for(let xx=-3.8;xx<=3.8;xx+=1.3)bx(o,.2,1.9,.2,0xe8e2d0,xx,1.8,zz)}
     bx(b,3,.9,6.2,0x7b8288,-2.6,.8,0);const rt=bx(b,3,.9,6.2,0x7b8288,2.7,.1,0);rt.rotation.z=-.16;
     for(const[xx,y,zz,r2]of[[-.3,.4,-1.4,.7],[.5,.2,1,-.9],[.1,.3,.2,.2]]){const p=bx(b,2.6,.18,.7,0x8a5a2a,xx,y,zz);p.rotation.set(0,r2,r2*.4)}
     const br=bx(b,.25,.25,3,0xe8e2d0,-3.9,2.2,2.2);br.rotation.z=.5;bx(b,.2,1.9,.2,0xe8e2d0,-3.8,1.8,-3);bx(b,.2,1.4,.2,0xe8e2d0,4,1.4,3);
     cone3(b,-4.6,-3.6);cone3(b,-4.6,3.8);cone3(b,4.6,3.8);
     bx(b,.3,1.8,4.6,0xf08a2e,-5.2,1.1,0);bx(b,.32,.5,4.6,0xffffff,-5.2,1.3,0)}
    {const s=site("caminos",rx-8,rz,[0,6,-3.5],14);s.ok=s.ok;
     potholes=new THREE.Group();R.add(potholes);
     for(const[dx,dz,r2]of[[-20,.6,1.5],[-10,-.8,1.2],[11,.8,1.6],[18,-1,1.3],[26,.4,.9]]){const x=rx+dx;if(x<-30||x>30)continue;cy(potholes,r2,r2,.08,0x2a2622,x,GY+.4,rz+dz,20);cy(potholes,r2*1.25,r2*1.25,.05,0x77726a,x,GY+.38,rz+dz,20)}
     for(const dx of[-20,-9,9,20]){const x=rx+dx;if(x<-30||x>30)continue;const l=grp(R,x,GY,rz-3.8);cy(l,.18,.25,6.4,0x555a60,0,3.2,0,8);bx(l,1.6,.18,.18,0x555a60,.7,6.4,0);const bulb=sp(l,.5,0xfff2a8,1.5,6.2,0,{emissive:0xffe36a,emissiveIntensity:2});const glow=new THREE.Mesh(new THREE.SphereGeometry(2.6,14,10),MB(0xffee99,{transparent:true,opacity:.22,depthWrite:false}));glow.position.set(1.5,6.2,0);l.add(glow);lamps.push({l,bulb,glow,fallen:dx===-9})}}
    // papel picado, bandera, pupusería, bus
    {const cols=[0xd8392b,0xf6c344,0x3f9a4f,0x4aa8e8,0xe86ab0,0xf39a2d];
     for(const[dz,sag]of[[-4.8,1.2],[4.8,1.4]]){const z0=rz+dz;cy(R,.22,.3,12,0x7a5a3a,-27,GY+6,z0,8);cy(R,.22,.3,12,0x7a5a3a,27,GY+6,z0,8);
       for(let i=0;i<18;i++){const t=(i+.5)/18,x=-27+54*t,y=11.5-Math.sin(t*Math.PI)*sag*2;const p=new THREE.Mesh(new THREE.PlaneGeometry(1.5,1.9),MB(cols[i%6],{side:THREE.DoubleSide}));p.position.set(x,y-1,z0);R.add(p);bunting.push(p);p.userData.ph=i}
       const line=new THREE.Mesh(new THREE.BoxGeometry(54,.06,.06),MB(0x5a3a22));line.position.set(0,11.5-sag,z0);R.add(line);strings.push(line)}
     const ft=GL.tex(256,160,(c,w,h)=>{c.fillStyle="#2f5fb5";c.fillRect(0,0,w,h);c.fillStyle="#fff";c.fillRect(0,h/3,w,h/3);c.fillStyle="#3a7a3a";c.beginPath();c.arc(w/2,h/2,18,0,7);c.fill();c.strokeStyle="#c9a227";c.lineWidth=4;c.stroke()});
     const fx=rx-7.5,fz=rz-12;cy(R,.18,.2,14,0xdddddd,fx,GY+7,fz,8);const f=new THREE.Mesh(new THREE.PlaneGeometry(5,3.1,10,1),new THREE.MeshBasicMaterial({map:ft,side:THREE.DoubleSide}));f.position.set(fx+2.6,GY+12.2,fz);R.add(f);flags.push(f);oc(fx,fz,2)}
    {const g=grp(R,rx-6.5,GY,rz+6.5);shopG=g;shopAnchor=new THREE.Vector3(rx-6.5,GY+9,rz+6.5);bx(g,5.4,3.6,4,0xf2c24a,0,1.8,0);bx(g,5.8,.5,4.4,0xc4502f,0,3.8,0);
     for(let i=0;i<6;i++)bx(g,.95,.18,1.6,i%2?0xfff4dc:0xd8392b,-2.4+i*.95,3.2,2.4).rotation.x=.4;
     bx(g,1.4,2.2,.2,0x7a4a2a,0,1.1,2.05);bx(g,1.5,1.3,.2,0x7fc4ec,-1.9,2,2.05);sign(g,"PUPUSERÍA",4.4,1,0,4.5,2.1,"#b0703a","#fff4dc");oc(rx-6.5,rz+6.5,4);
     emitL({x:rx-6.5,y:GY+4,z:rz+6.5,col:0xffffff,rate:.4,size:.7,life:2.4,vy:1.4,op:.5,grow:1.5})}
    bus=new THREE.Group();R.add(bus);
    {const col=0xe8452b;bx(bus,7,2.2,2.5,col,0,1.9,0);bx(bus,7.1,.5,2.55,0x2f78c4,0,1.3,0);bx(bus,7.1,.35,2.55,0xf6c344,0,2.5,0);bx(bus,6.4,.9,2.6,0x20384a,0,3.1,0);
     bx(bus,1.5,.9,2.6,col,3.3,3.1,0);bx(bus,6,.15,2,0x333,0,3.7,0);bx(bus,1.4,.8,1.2,0x8a5a30,-1.5,4.2,0);bx(bus,1.4,.7,1.2,0xe8b04a,.4,4.2,0);
     for(const x of[-2.2,2.2])for(const z of[-1.3,1.3]){const w=cy(bus,.62,.62,.4,0x222,x,.7,z,16);w.rotation.x=Math.PI/2;const h=cy(bus,.3,.3,.45,0xcccccc,x,.7,z,10);h.rotation.x=Math.PI/2}
     bx(bus,.15,.5,1.8,0xfff2a8,3.55,1.5,0,{emissive:0xffe36a,emissiveIntensity:.8});emitL({bus:true})}
    // ----- emblema -----
    LMP={x:C.lx,z:-19.5};oc(C.lx,-19.5,8);
    const LG=grp(R,LMP.x,GY,LMP.z);lmId=id;lmCur=null;const lf=LMB[id];if(lf){lf(LG);}lmAnchor=new THREE.Vector3(LMP.x,GY+15,LMP.z);
    LG.userData.plaqueHost=1;api.LG=LG;
    // ----- paisaje propio -----
    let zmin=-30;
    const pines=(x,z,n)=>{const r=seeded(x*3+z+n);for(let i=0;i<n;i++){const px=x+(r()-.5)*10,pz=z+(r()-.5)*8;if(free(px,pz,1))pine(R,px,pz,.8+r()*.8)}};
    const tree=(x,z,s)=>{const t=grp(R,x,GY,z);t.scale.setScalar(s);cy(t,.35,.5,3.2,0x7a4a22,0,1.6,0,8);sp(t,2,0x4aa04e,0,4.4,0);sp(t,1.4,0x5ab45a,1.3,3.6,.4);sp(t,1.3,0x3f9a4f,-1.2,3.7,-.3)};
    const OPS={
     sea:()=>{zmin=-23;const sea=new THREE.Mesh(new THREE.BoxGeometry(64,.35,9),M(0x2f9fe0,{roughness:.1,emissive:0x0a4a7a,emissiveIntensity:.45}));sea.position.set(0,GY+.08,-27.5);R.add(sea);bx(R,64,.25,3,0xe8d9a8,0,GY+.05,-22.5);
       for(let i=0;i<10;i++){const w=new THREE.Mesh(new THREE.BoxGeometry(3,.08,.3),MB(0xffffff,{transparent:true,opacity:.8}));w.position.set(-27+i*6,GY+.3,-24.5);w.userData.sea=i;R.add(w);waves.push(w)}for(let x=-30;x<=30;x+=6)oc(x,-27,5)},
     band:(z,w,c)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(64,.3,w),M(c,{roughness:.1,emissive:0x0a3a5a,emissiveIntensity:.35}));m.position.set(0,GY+.08,z);R.add(m);for(let x=-30;x<=30;x+=6)oc(x,z,w/2+1)},
     lake:(x,z,r,c)=>{cy(R,r,r,.25,c,x,GY+.1,z,40,{roughness:.1,emissive:0x0a4a7a,emissiveIntensity:.35});cy(R,r+1.2,r+1.2,.15,0xe8d9a8,x,GY+.04,z,40);oc(x,z,r+2)},
     hill:(x,z,r,h,c)=>{const m=cn(R,r,h,c,x,GY+h/2,z,7);m.rotation.y=x;oc(x,z,r*.8)},
     volcano:(x,z,r,h,c,smoke,crater)=>{const v=grp(R,x,GY,z);cy(v,r*.23,r,h,c,0,h/2,0,32);cy(v,r*.26,r*.5,h*.27,0x7a6a58,0,h*.87,0,32);cy(v,r*.2,r*.2,.6,0x2a1a12,0,h+.1,0,28);if(crater){cy(v,r*.14,r*.14,.5,0xff6a1a,0,h+.2,0,24,{emissive:0xff4400,emissiveIntensity:1.2})}
       if(smoke)emitL({x,y:GY+h+1,z,col:0xd9d4cc,rate:.5,size:2.2,life:4,vy:2.4,op:.55,grow:1.5});oc(x,z,r)},
     caf:(x,z,rows,cols)=>{for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const px=x+r*2.4,pz=z+c*2.2;if(!free(px,pz,1))continue;sp(R,.9,0x2e7d3a,px,GY+.9,pz);sp(R,.12,0xd8392b,px+.5,GY+1.1,pz+.3);sp(R,.12,0xd8392b,px-.4,GY+1.3,pz-.2)}},
     milpa:(x,z,rows,len)=>{for(let r=0;r<rows;r++){const px=x,pz=z+r*2.2;if(!free(px,pz,2))continue;bx(R,len,1.8,.6,0x9ac248,px,GY+.9,pz);bx(R,len,.45,.7,0xe6c84a,px,GY+1.9,pz)}},
     cane:(x,z,rows,len)=>{for(let r=0;r<rows;r++){const px=x,pz=z+r*2.2;if(!free(px,pz,2))continue;bx(R,len,2.8,.8,0x74b240,px,GY+1.4,pz);bx(R,len,.5,1,0xb8d86a,px,GY+2.9,pz)}},
     pines:(x,z,n)=>pines(x,z,n),
     palms:(x,z,n)=>{const r=seeded(x+z+n);for(let i=0;i<n;i++){const px=x+(r()-.5)*10,pz=z+(r()-.5)*8;if(free(px,pz,1.5))palmL(grp(R,px,GY,pz),0,0)}},
     mangle:(x,z,n)=>{cy(R,n*.7,n*.7,.15,0x4aa8d8,x,GY+.08,z,32,{roughness:.1});const r=seeded(x+z);for(let i=0;i<n;i++){const a=r()*6.28,d=r()*n*.55,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;for(let k=0;k<4;k++){const rt=cy(R,.07,.07,2.2,0x6b4a2c,px+Math.cos(k*1.6)*.45,GY+1,pz+Math.sin(k*1.6)*.45,5);rt.rotation.set(Math.sin(k*1.6)*.4,0,Math.cos(k*1.6)*.4)}sp(R,1.1,0x2e7d3a,px,GY+2.6,pz)}oc(x,z,n*.7)},
     isle:(x,z,r)=>{cn(R,r,r*.8,0x6fae4f,x,GY+r*.4,z,10);palmL(grp(R,x+.3,GY,z),0,0)},
     city:(x,z)=>{const r=seeded(x+z);for(let i=0;i<7;i++){const w=2+r()*2,h=4+r()*10,px=x+(i%3)*3.4-3,pz=z+Math.floor(i/3)*3.4-3;if(!free(px,pz,1))continue;bx(R,w,h,w,[0xb8c4d0,0x9fb0c0,0xd0c8b8][i%3],px,GY+h/2,pz);bx(R,w*.8,h*.9,.1,0x7fc4ec,px,GY+h/2,pz+w/2+.02)}},
     cattle:(x,z,n)=>{const r=seeded(x+z);for(let i=0;i<n;i++){const px=x+(r()-.5)*8,pz=z+(r()-.5)*8;if(!free(px,pz,1.5))continue;const c=grp(R,px,GY,pz);c.rotation.y=r()*6;bx(c,1.6,.9,.8,0xffffff,0,.9,0);bx(c,.5,.4,.8,0x2a2a2a,.2,1.2,0);bx(c,.5,.5,.6,0xffffff,1,1.1,0);for(const lx of[-.6,.6])for(const lz of[-.25,.25])bx(c,.15,.6,.15,0x6a5a4a,lx,.3,lz)}},
     boat:(x,z)=>{const b=grp(R,x,GY+.2,z);b.userData.by=GY+.2;boats.push(b);bx(b,2.6,.5,1,0xf6c344,0,.3,0);bx(b,.1,2.2,.1,0x6b4a2c,0,1.4,0);bx(b,1.2,1.6,.05,0xffffff,.4,1.6,0)},
     surf:(x,z)=>{const g=grp(R,x,GY,z);bx(g,.4,.1,2.2,0xf6c344,0,.3,0).rotation.set(.1,0,.2);bx(g,.4,.1,2.2,0xe86ab0,1.2,.3,.4);const w=bx(g,3,1.4,.6,0x6ec8f0,-2,.7,0);w.rotation.z=.2},
     salt:(x,z)=>{for(let i=0;i<4;i++)bx(R,4,.12,3,i%2?0xeef2f4:0xcfe6ee,x+(i%2)*4.2,GY+.1,z+Math.floor(i/2)*3.4)},
     mist:(x,z)=>{for(let i=0;i<4;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(3+i%2,12,8),MB(0xffffff,{transparent:true,opacity:.35,depthWrite:false}));m.position.set(x+i*2.6-4,GY+4+i%2,z+(i%2)*1.5);m.scale.y=.45;R.add(m);m.userData.mist=1}}
    };
    (C.s||[]).forEach(o=>{const f=OPS[o[0]];if(f)f(...o.slice(1))});
    living(R,rx,rz,free,oc);if(shopG)shopExtras(shopG);setValla(PROG.led?"LÍDER DE "+String(PROG.dept||"").toUpperCase():"ALCALDE PUPUSA");
    // arbolado general en los espacios libres
    const tr=seeded(rot*11+rx*3+rz+9);let placed=0,tries=0;
    while(placed<26&&tries<400){tries++;const x=(tr()-.5)*60,z=(tr()-.5)*60;if(z<zmin||!free(x,z,2.5))continue;placed++;
      if(C.trees==="pine")pine(R,x,z,.9+tr()*.6);else if(C.trees==="palm"&&tr()<.65)palmL(grp(R,x,GY,z),0,0);else tree(x,z,.8+tr()*.4)}
    root.updateMatrixWorld(true);applyBuilt();
  }


  // ---------- vida del pueblo: casas, vallas, tráfico, gente y mejoras de la pupusería ----------
  function person(g,x,z,col,hat){const p=grp(g,x,0,z);cy(p,.3,.38,.9,col,0,.65,0,10);sp(p,.28,0xf2c9a0,0,1.3,0);if(hat){cy(p,.22,.22,.45,0xffffff,0,1.75,0,10);sp(p,.3,0xffffff,0,2.05,0)}else cy(p,.3,.3,.12,[0x3a2a1a,0x7a4a22,0xc4502f][(x*7|0)%3],0,1.5,0,10);return p}
  function carMesh(col,kind,name){const c=new THREE.Group();
    if(kind==="bus"){bx(c,6,2,2.2,col,0,1.7,0);bx(c,6.1,.4,2.25,0xffffff,0,1.2,0);bx(c,5.4,.8,2.3,0x20384a,0,2.7,0);bx(c,5,.15,1.8,0x333,0,3.2,0);
      for(const x of[-1.9,1.9])for(const z of[-1.1,1.1]){const w=cy(c,.55,.55,.35,0x222,x,.6,z,14);w.rotation.x=Math.PI/2}
      sign(c,name||"RUTA 29",3.2,.7,0,1.75,1.12,"#fff4dc","#3a1f10");const b=sign(c,name||"RUTA 29",3.2,.7,0,1.75,-1.12,"#fff4dc","#3a1f10");b.rotation.y=Math.PI;bx(c,.12,.45,1.6,0xfff2a8,3.05,1.4,0,{emissive:0xffe36a,emissiveIntensity:.8})}
    else{bx(c,3.4,1,1.7,col,0,.95,0);bx(c,1.9,.8,1.6,0x20384a,-.2,1.75,0);bx(c,1.7,.2,1.5,col,-.2,2.2,0);
      for(const x of[-1,1])for(const z of[-.8,.8]){const w=cy(c,.4,.4,.3,0x222,x,.4,z,12);w.rotation.x=Math.PI/2}bx(c,.1,.3,1.2,0xfff2a8,1.72,.9,0,{emissive:0xffe36a,emissiveIntensity:.8})}
    return c}
  function mkValla(R,x,z,text,bg,fg,ry){const g=grp(R,x,GY,z);if(ry)g.rotation.y=ry;cy(g,.18,.22,5,0x6b4a2c,-2.4,2.5,0,6);cy(g,.18,.22,5,0x6b4a2c,2.4,2.5,0,6);bx(g,6.4,2.8,.3,0x3a1f10,0,5.1,-.2);return sign(g,text,6,2.4,0,5.1,0,bg,fg)}
  function setValla(text){if(!valla)return;const t=GL.tex(256,102,(c,W,H)=>{c.fillStyle="#c42f22";c.fillRect(0,0,W,H);c.strokeStyle="#3a1f10";c.lineWidth=10;c.strokeRect(5,5,W-10,H-10);c.fillStyle="#fff";c.textAlign="center";c.textBaseline="middle";let f=H*.46;c.font="800 "+f+"px 'Baloo 2',sans-serif";while(c.measureText(text).width>W-24&&f>10){f-=2;c.font="800 "+f+"px 'Baloo 2',sans-serif"}c.fillText(text,W/2,H/2+3)});valla.material.map=t;valla.material.needsUpdate=true}
  function shopExtras(g){
    const ct=grp(g,0,4.4,0);cy(ct,.12,.12,1.6,0x6b4a2c,-2,.8,1.8,6);cy(ct,.12,.12,1.6,0x6b4a2c,2,.8,1.8,6);sign(ct,"¡PUPUSAS!",6,1.5,0,2,1.9,"#ffd23a","#c42f22");
    for(let i=0;i<7;i++){const b=sp(ct,.16,0xfff2a8,-2.7+i*.9,2.9,1.9,{emissive:0xffd23a,emissiveIntensity:1.6});b.userData.blink=i}
    g.userData.cartel=ct;
    const fan=grp(g,2.6,2.6,2.35);cy(fan,.08,.08,1.4,0x888888,0,-.7,0,6);const bl=grp(fan,0,0,0);for(let i=0;i<4;i++){const b=bx(bl,.18,.9,.04,0xe8e8e8,0,.5,0);b.rotation.z=i*Math.PI/2;b.position.set(Math.sin(i*Math.PI/2)*-.5,Math.cos(i*Math.PI/2)*.5,0)}sp(fan,.14,0x444444,0,0,0);g.userData.fan=fan;g.userData.fanBl=bl;
    const ay=grp(g,-1.6,0,2.9);const ap=person(ay,0,0,0xffffff,true);bx(ay,.9,.7,.7,0x555d64,.8,.6,.1);cy(ay,.3,.3,.08,0xf0c06a,.8,1,.1,12);g.userData.chef=ay;
    const ra=grp(g,.2,3.1,.2);bx(ra,1,.55,.4,0xc44a2a,0,.3,2.0);cy(ra,.18,.18,.05,0x222,-.25,.3,2.22,12).rotation.x=Math.PI/2;cy(ra,.18,.18,.05,0x222,.25,.3,2.22,12).rotation.x=Math.PI/2;bx(ra,.04,.5,.04,0x222,.4,.8,2.0);g.userData.radio=ra;
    const tb=grp(g,-8.5,0,-1.5);for(const[dx,dz,col]of[[0,0,0xd8392b],[0,5,0x2f78c4]]){cy(tb,.9,.9,.12,0xfff4dc,dx,1,dz,16);cy(tb,.1,.1,1,0x6b4a2c,dx,.5,dz,6);cn(tb,1.6,.7,col,dx,2.6,dz,16);cy(tb,.05,.05,1.6,0x6b4a2c,dx,1.7,dz,6);person(tb,dx-1.2,dz,0xe86ab0);person(tb,dx+1.2,dz,0x4a8ad8)}g.userData.tables=tb;
    const fl=grp(g,0,0,3.9);for(let i=0;i<8;i++){const c=[0xe86ab0,0xf6c344,0xd8392b,0xffffff][i%4];sp(fl,.25,c,-3.2+i*.9,.35,0);bx(fl,.5,.2,.4,0x6b4a2c,-3.2+i*.9,.1,0)}g.userData.flowers=fl;
    applyShop()}
  function applyShop(){if(!shopG||!shopG.userData.cartel)return;const u=UP3||{},n=Object.keys(u).filter(k=>u[k]).length,u2=shopG.userData;
    u2.cartel.visible=!!u.cartel;u2.fan.visible=!!u.vent;u2.chef.visible=!!u.ayud;u2.radio.visible=!!u.radio;u2.tables.visible=n>=1;u2.flowers.visible=PROG.welfare>=30}
  function living(R,rx,rz,free,oc){
    vehicles=[];people=[];valla=null;
    const hc=[0xf2c24a,0xe8754a,0x4aa8e8,0xe86ab0,0x6cc070,0xb06ae0,0xffa040],hr=seeded(rot*5+rx+rz+21);let hp=0,tr=0;
    while(hp<14&&tr<500){tr++;const x=(hr()-.5)*58,z=(hr()-.5)*58;if(!free(x,z,3.4))continue;hp++;oc(x,z,3);
      const h=grp(R,x,GY,z);h.rotation.y=Math.round(hr()*3)*Math.PI/2;const c=hc[hp%7],hh=2.6+hr()*1.6;
      bx(h,3.6,hh,3.4,c,0,hh/2,0);const rf=cn(h,2.9,1.5,0xc4502f,0,hh+.7,0,4);rf.rotation.y=Math.PI/4;
      bx(h,.9,1.6,.2,0x7a4a2a,0,.8,1.72);bx(h,.9,.9,.2,0x7fc4ec,-1.1,hh*.62,1.72);bx(h,.9,.9,.2,0x7fc4ec,1.1,hh*.62,1.72);
      if(hp%3===0)sign(h,["TIENDA","COMEDOR","PAN DULCE","PUPUSAS"][hp%4],2.6,.62,0,hh+.05,1.82,"#fff4dc","#3a1f10");
      if(hp%2===0)person(h,1.3+hr()*.6,2.6,[0xd8392b,0x2f78c4,0x3f9a4f][hp%3])}
    // vallas con leyendas
    const VL=[["¡QUE VIVA EL SALVADOR!",rx-20,rz-5.8,"#2f5fb5","#fff"],["HOY SÍ SE PUEDE",rx+21,rz+6,"#2a7a3a","#fff"],["PUPUSA ES AMOR",rx+12,rz-5.8,"#e8892a","#fff"]];
    VL.forEach(v=>mkValla(R,v[1],v[2],v[0],v[3],v[4],0));
    valla=mkValla(R,rx-14,rz+6.2,"ALCALDE PUPUSA","#c42f22","#fff",0);
    // tráfico
    const VS=[[0xe8452b,"bus","RUTA 29",1,5.5,-1],[0x2f78c4,"bus","LA PRECIOSA",-1,6.5,1],[0xf6c344,"bus","MI REINA",1,4.5,1],[0x3f9a4f,"car","",-1,7,-1],[0xe86ab0,"car","",1,8,1],[0xffffff,"car","",-1,6,1]];
    VS.forEach((v,i)=>{const m=carMesh(v[0],v[1],v[2]);R.add(m);vehicles.push({m,dir:v[3],sp:v[4],side:v[5],x:(i*17%50)-25})});
    // gente
    for(let i=0;i<12;i++){const pp=person(R,0,0,[0xd8392b,0x2f78c4,0x3f9a4f,0xe86ab0,0xf6c344,0xb06ae0][i%6],i%5===0);people.push({m:pp,dir:i%2?1:-1,sp:1.1+(i%4)*.3,side:i%2?1:-1,x:(i*9%50)-25,z:rz+(i%2?4.3:-4.3),ph:i})}
  }

  {const V=new THREE.Group();V.position.set(-85,-4,-185);sc.add(V);cn(V,60,34,0x5a8a4a,0,17,0,28);cn(V,44,52,0x7a6a5a,0,34,0,28);cn(V,10,6,0x2a1a14,0,59,0,20);const lv=sp(V,5,0xff6a20,0,58,0,{emissive:0xff4a10,emissiveIntensity:1.2});lv.scale.y=.4;volc=new THREE.Vector3(-85,64,-185);
   const V2=new THREE.Group();V2.position.set(110,-4,-200);sc.add(V2);cn(V2,48,30,0x6a9a56,0,15,0,24);cn(V2,28,40,0x8a7a64,0,30,0,24)}
  // ---------- cielo, luces ----------
  sc.add(new THREE.HemisphereLight(0xdff3ff,0x8a6a3a,1.05));
  const sun=new THREE.DirectionalLight(0xfff1d6,2.4);sun.position.set(40,60,30);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
  Object.assign(sun.shadow.camera,{left:-50,right:50,top:50,bottom:-50,near:5,far:200});sun.shadow.bias=-.0004;sc.add(sun);
  sc.background=new THREE.Color(0x8fd2f2);sc.fog=new THREE.Fog(0xb9e2f5,140,360);
  for(let i=0;i<7;i++){const g=grp(sc,(i-3)*30,80+(i%3)*8,-40+(i%4)*20);for(let k=0;k<4;k++){const s=new THREE.Mesh(new THREE.SphereGeometry(4+(k%2)*2,14,10),MB(0xffffff,{transparent:true,opacity:.92}));s.position.set(k*4.5-6,(k%2)*1.2,0);s.scale.y=.6;g.add(s)}clouds.push(g)}

  function applyBuilt(){
    for(const k in sites){const s=sites[k];s.ok.visible=!!B[k];s.bad.visible=!B[k];if(s.pipesOk){s.pipesOk.visible=!!B[k];s.pipesBad.visible=!B[k]}}
    if(potholes)potholes.visible=!B.caminos;roads.forEach(r=>r.material=B.caminos?roadMat:roadBad);
    if(grass)grass.material=B.agua?grassMat:dryMat;
    lamps.forEach(l=>{const on=!!B.caminos;l.bulb.material.emissiveIntensity=on?2:0;l.bulb.material.color.setHex(on?0xfff2a8:0x444444);l.glow.visible=on;l.l.rotation.z=(!on&&l.fallen)?1.2:0;l.l.position.y=(!on&&l.fallen)?GY+.5:GY});
    refreshRing()}
  function refreshRing(){const s=sel&&sites[sel];if(!s){ring.visible=false;return}ring.visible=true;ring.position.set(s.g.position.x,GY+.6,s.g.position.z);ring.scale.setScalar(s.r*.7)}
  function camPos(){const cx=Math.cos(el),y=rad*Math.sin(el);cam.position.set(tgt.x+rad*Math.sin(az)*cx,tgt.y+y,tgt.z+rad*Math.cos(az)*cx);cam.lookAt(tgt)}
  function project(v,w,h){const p=v.clone().project(cam);return[(p.x*.5+.5)*w,(-p.y*.5+.5)*h,p.z<1]}
  function pins(host){pinsHost=host;pinEls=host?[...host.querySelectorAll("[data-p]")]:[]}
  const hideDeco=h=>{clouds.forEach(c=>c.visible=!h);bunting.forEach(p=>p.visible=!h);strings.forEach(p=>p.visible=!h)};
  const ROT=()=>rot*Math.PI/2;
  // ---------- eventos ----------
  const rc=new THREE.Raycaster();
  function onDown(e){drag={x:e.clientX,y:e.clientY,az,el};moved=0;canvas.setPointerCapture&&canvas.setPointerCapture(e.pointerId)}
  function onMove(e){if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;moved=Math.max(moved,Math.abs(dx)+Math.abs(dy));az=drag.az-dx*.008;el=Math.max(.22,Math.min(1.3,drag.el+dy*.006));auto=false}
  function onUp(e){if(drag&&moved<6&&onPick){const r=canvas.getBoundingClientRect(),m=new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);rc.setFromCamera(m,cam);
      let best=null,bd=1e9;for(const k in sites){const s=sites[k],c=new THREE.Vector3();s.g.getWorldPosition(c);c.y+=4;const d=rc.ray.distanceToPoint(c);if(d<s.r*.55&&d<bd){bd=d;best=k}}if(best)onPick(best)}drag=null}
  function onWheel(e){e.preventDefault();rad=Math.max(50,Math.min(150,rad+e.deltaY*.05))}
  let pinch=null;
  function onTouch(e){if(e.touches.length===2){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(pinch){rad=Math.max(50,Math.min(150,rad*(pinch/d)))}pinch=d}else pinch=null}


  const api={
    scene:sc,camera:cam,LG:null,
    onMount(c){canvas=c;c.addEventListener("pointerdown",onDown);c.addEventListener("pointermove",onMove);c.addEventListener("pointerup",onUp);c.addEventListener("pointercancel",()=>drag=null);c.addEventListener("wheel",onWheel,{passive:false});c.addEventListener("touchmove",onTouch,{passive:true});c.addEventListener("touchend",()=>pinch=null)},
    onUnmount(){if(!canvas)return;canvas.removeEventListener("pointerdown",onDown);canvas.removeEventListener("pointermove",onMove);canvas.removeEventListener("pointerup",onUp);canvas.removeEventListener("wheel",onWheel);canvas.removeEventListener("touchmove",onTouch);canvas=null},
    resize(w,h){cam.aspect=w/h;cam.fov=w/h<1.1?52:38;cam.updateProjectionMatrix();this.w=w;this.h=h},
    setTheme(d){sc.background.setHex(d.sky);sc.fog.color.setHex(d.sky)},
    setLandmark(id,name){if(mapId!==id||!water){construct(id)}while(api.LG&&api.LG.children.length&&false){}
      const LG=api.LG;if(LG&&!LG.userData.plaque){plaque(LG,name||id);LG.userData.plaque=1}},
    setBuilt(b){B=Object.assign({},b||{});applyBuilt()},
    setShop(u){UP3=Object.assign({},u||{});applyShop()},
    setProgress(p){PROG=Object.assign(PROG,p||{});applyShop();setValla(PROG.pres?"¡PRESIDENTE PUPUSA!":PROG.prim?"CANDIDATO PRESIDENCIAL":PROG.led?"LÍDER DE "+String(PROG.dept||"").toUpperCase():"ALCALDE PUPUSA")},
    shopPos(){return shopAnchor},
    focus(k){
      if(k==="shop"){foc="shop";hideDeco(true);const p=W3(shopAnchor.x,3,shopAnchor.z);fg.t.copy(p);fg.rad=26;fg.el=.55;fg.az=.35+ROT();auto=false;return}
      if(k==="lm"){foc="lm";hideDeco(true);const p=W3(LMP.x,4.5,LMP.z);fg.t.copy(p);fg.rad=27;fg.el=.5;fg.az=.12+ROT();auto=false;return}
      foc=k;hideDeco(!!k);
      if(!k||!sites[k]){fg.t.set(0,0,9);fg.rad=92;fg.el=.62;fg.az=null;return}
      const g=sites[k].g.position;let P;
      if(k==="caminos")P=W3(RX-9,1.5,RZ);else if(k==="puente")P=W3(RX,2,RZ);else if(k==="agua")P=W3(g.x,6,g.z);else P=W3(g.x,g.y+3,g.z-3);
      fg.t.copy(P);fg.rad=k==="agua"?58:46;fg.el=.85;fg.az=.25+ROT();auto=false},
    celebrate(k){const s=sites[k];if(!s)return 0;B[k]=0;applyBuilt();api.focus(k);anims.push({k,t:0,sw:false});return 2.3},
    setSelected(k){sel=k;refreshRing()},onPick(f){onPick=f},setAuto(a){auto=a},pins,
    reset(){az=.55;el=.62;rad=92},
    update(dt,t){
      if(!water)return;
      T=t;if(auto&&!drag)az+=dt*.06;
      const kk=1-Math.exp(-dt*3.2);tgt.lerp(fg.t,kk);rad+=(fg.rad-rad)*kk;if(foc){el+=(fg.el-el)*kk;if(fg.az!==null&&!drag){let d=fg.az-az;d=Math.atan2(Math.sin(d),Math.cos(d));az+=d*kk}}
      for(let i=anims.length-1;i>=0;i--){const a=anims[i],S=sites[a.k];a.t+=dt;const sx=S.g.position.x,sz=S.g.position.z;
        if(a.t<.8){S.bad.position.x=Math.sin(a.t*60)*.25*(a.t/.8);if(Math.random()<.7)for(let n=0;n<2;n++){const w=W3(sx+(Math.random()-.5)*9,GY+1+Math.random()*3,sz+(Math.random()-.5)*8);puff(w.x,w.y,w.z,0xb9aa90,1.1,1.2,1.6,.7,1.8)}}
        else{if(!a.sw){a.sw=true;S.bad.position.x=0;B[a.k]=1;applyBuilt();S.ok.scale.setScalar(.01);
          for(let n=0;n<28;n++){const w=W3(sx+(Math.random()-.5)*10,GY+2+Math.random()*6,sz+(Math.random()-.5)*8);puff(w.x,w.y,w.z,[0xf6c344,0xd8392b,0x4aa8e8,0x3f9a4f,0xe86ab0][n%5],.55,2.2,2+Math.random()*3,.95,.3)}}
          const u=Math.min(1,(a.t-.8)/.6);const sc2=u<1?(1-Math.pow(1-u,3))*(1+Math.sin(u*Math.PI)*.18):1;S.ok.scale.setScalar(Math.max(.01,sc2));
          if(a.t>1.8){S.ok.scale.setScalar(1);anims.splice(i,1)}}}
      camPos();
      water.material.emissiveIntensity=.45+Math.sin(t*2)*.1;
      waves.forEach((w,i)=>{if(w.userData.sea!==undefined){w.position.z=-24.5+Math.sin(t*1.4+i)*.9;w.material.opacity=.5+Math.sin(t*2+i)*.3}else{w.position.z+=dt*3;if(w.position.z>RZ+26)w.position.z-=50;w.material.opacity=.45+Math.sin(t*3+i)*.25}});
      boats.forEach((b,i)=>{b.position.y=b.userData.by+Math.sin(t*1.6+i*2)*.12;b.rotation.z=Math.sin(t*1.3+i)*.05});
      clouds.forEach((c,i)=>{c.position.x+=dt*(1.2+i*.15);if(c.position.x>110)c.position.x=-110});
      bunting.forEach(p=>{p.rotation.z=Math.sin(t*2.4+p.userData.ph)*.22;p.rotation.x=Math.sin(t*1.7+p.userData.ph*1.3)*.15});
      flags.forEach(f=>{if(f.geometry.parameters&&f.geometry.parameters.widthSegments>1){const pos=f.geometry.attributes.position,w=f.geometry.parameters.width;for(let k=0;k<pos.count;k++){const x=pos.getX(k)+w/2;pos.setZ(k,Math.sin(x*1.6-t*5)*.28*x/w)}pos.needsUpdate=true}else{f.rotation.y=Math.sin(t*4)*.15}});
      if(api.LG)api.LG.children.forEach(c=>{if(c.userData&&c.userData.sw!==undefined)c.rotation.z=Math.sin(t*2+c.userData.sw)*.2});
      const s0=sites.salud;if(s0)s0.ok.children.forEach(c=>{if(c.userData.beacon)c.material.emissiveIntensity=.5+Math.abs(Math.sin(t*5))*1.5});
      lamps.forEach(l=>{if(B.caminos)l.glow.material.opacity=.2+Math.sin(t*2+l.l.position.x)*.04});

      // vida: tráfico, gente, mejoras de la pupusería
      {const lvl=(PROG.obras||0)+(PROG.welfare>=50?1:0)+Object.keys(UP3||{}).filter(k=>UP3[k]).length;
       vehicles.forEach((v,i)=>{const on=i<Math.min(vehicles.length,2+lvl);v.m.visible=on;if(!on)return;const lo=B.puente?-30:(v.side<0?-30:RX+8),hi=B.puente?30:(v.side<0?RX-8:30);
         v.x+=v.dir*v.sp*dt;if(v.x>hi){v.x=hi;v.dir=-1}if(v.x<lo){v.x=lo;v.dir=1}if(v.x<lo+.01&&lo>-29)v.dir=1;
         v.m.position.set(v.x,GY+.35+Math.abs(Math.sin(t*8+i))*.04,RZ+(v.dir>0?1.45:-1.25));v.m.rotation.y=v.dir>0?0:Math.PI});
       people.forEach((p,i)=>{const on=i<Math.min(people.length,3+lvl*2);p.m.visible=on;if(!on)return;const lo=B.puente?-28:(p.side<0?-28:RX+5),hi=B.puente?28:(p.side<0?RX-5:28);
         p.x+=p.dir*p.sp*dt;if(p.x>hi){p.x=hi;p.dir=-1}if(p.x<lo){p.x=lo;p.dir=1}p.m.position.set(p.x,GY+Math.abs(Math.sin(t*6+p.ph))*.12,p.z);p.m.rotation.y=p.dir>0?Math.PI/2:-Math.PI/2});
       if(shopG&&shopG.userData.cartel){const u2=shopG.userData;
         if(u2.cartel.visible)u2.cartel.children.forEach(c=>{if(c.userData.blink!==undefined)c.material.emissiveIntensity=(Math.sin(t*5+c.userData.blink)>0)?2:.3});
         if(u2.fan.visible)u2.fanBl.rotation.z+=dt*14;
         if(u2.chef.visible)u2.chef.position.y=Math.abs(Math.sin(t*4))*.15;
         if(u2.radio.visible){notes-=dt;if(notes<=0){notes=.55;const w=W3(shopAnchor.x+.4,GY+7.2,shopAnchor.z+2.4);puff(w.x,w.y,w.z,[0xe86ab0,0xf6c344,0x4aa8e8][(t*3|0)%3],.4,2,1.8,.9,.5)}}}}
      if(volc){volcT-=dt;if(volcT<=0){volcT=.5;puff(volc.x,volc.y,volc.z,0x8a8a8a,5,5,3,.45,3)}}
      // bus: da vuelta antes del puente roto
      const lim=B.puente?30:RX-8;busX+=busDir*dt*(B.puente?6:5);
      if(busX>lim){busDir=-1;bus.rotation.y=Math.PI}if(busX<-30){busDir=1;bus.rotation.y=0}
      const bz=RZ+(busDir>0?1.4:-1.2);bus.position.set(busX,GY+.35+Math.abs(Math.sin(t*9))*.05,bz);
      emit.forEach(e=>{e.t-=dt;if(e.t>0||!e.on())return;
        if(e.leak){e.t=.07;const w=W3(e.leak[0],e.leak[1],e.leak[2]);drop(w.x,w.y,w.z,(Math.random()-.5)*3,2+Math.random()*3,(Math.random()-.2)*3)}
        else if(e.bus){e.t=.25;if(Math.random()<.6){const w=W3(busX-(busDir>0?3.6:-3.6),GY+1,bz);puff(w.x,w.y,w.z,0x777777,.5,1.4,.8,.45,1.6)}}
        else{e.t=e.rate;const w=W3(e.x+(Math.random()-.5)*1.4,e.y,e.z+(Math.random()-.5)*1.4);puff(w.x,w.y,w.z,e.col,e.size,e.life,e.vy,e.op,e.grow)}});
      pool.forEach(p=>{if(!p.m.visible)return;p.l+=dt;if(p.l>=p.max){p.m.visible=false;return}const u=p.l/p.max;p.m.position.addScaledVector(p.v,dt);p.m.scale.setScalar(p.s*(1+u*p.grow));p.m.material.opacity=p.op*(1-u)});
      drops.forEach(d=>{if(!d.on)return;d.v.y-=14*dt;d.m.position.addScaledVector(d.v,dt);if(d.m.position.y<GY+.3){d.on=false;d.m.visible=false}});
      if(ring.visible){ring.rotation.z+=dt;ring.material.opacity=.6+Math.sin(t*5)*.35}
      if(pinsHost&&this.w){for(const p of pinEls){const k=p.dataset.p,s=k==="lm"?{anchor:lmAnchor}:k==="shop"?{anchor:shopAnchor}:sites[k];if(!s)continue;
        if((foc==="lm"||foc==="shop")&&k!==foc){p.style.display="none";continue}
        const wp=W3(s.anchor.x,s.anchor.y,s.anchor.z),[x,y,vis]=project(wp,this.w,this.h);p.style.left=x+"px";p.style.top=y+"px";p.style.display=vis?"":"none"}}}
  };
  return api})();
