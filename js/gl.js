// Renderizador WebGL compartido (Three.js). Una sola instancia que se mueve entre pantallas.
const GL=(()=>{
  let r=null,cur=null,host=null,last=0,raf=0;
  function init(){
    if(r)return true;
    try{
      r=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
      r.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
      r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;
      r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.05;
      r.domElement.style.cssText="position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;border:0;border-radius:0;box-shadow:none;background:none";
      return true}
    catch(e){r=null;return false}}
  function size(){if(!host||!cur||!r)return;const w=host.clientWidth||1,h=host.clientHeight||1;r.setSize(w,h,false);if(cur.resize)cur.resize(w,h)}
  function loop(t){raf=requestAnimationFrame(loop);if(!cur)return;const dt=Math.min(.05,(t-last)/1000||0);last=t;cur.update(dt,t/1000);r.render(cur.scene,cur.camera)}
  return{
    ok(){return typeof THREE!=="undefined"&&init()},
    mount(el,obj){
      if(!this.ok())return false;
      if(cur&&cur!==obj&&cur.onUnmount)cur.onUnmount();
      host=el;cur=obj;
      if(getComputedStyle(el).position==="static")el.style.position="relative";
      el.prepend(r.domElement);size();
      if(!raf)raf=requestAnimationFrame(loop);
      if(obj.onMount)obj.onMount(r.domElement,el);
      return true},
    unmount(){if(cur&&cur.onUnmount)cur.onUnmount();cancelAnimationFrame(raf);raf=0;cur=null;host=null},
    size,
    tex(w,h,fn){const c=document.createElement("canvas");c.width=w;c.height=h;fn(c.getContext("2d"),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t}
  }})();
window.addEventListener("resize",()=>GL.size());
