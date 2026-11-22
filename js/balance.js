// BALANCE: precios reales (pupusa $1.50, bebida $1.00), paciencia y costos. Un solo lugar para ajustar la dificultad.
const BAL={pat:.72,cost:1.25,ups:1.1,pupusa:1.5,bebida:1};
// pago por pedido: pupusa + bebida + propina (unidad de propina = $0.25: rapidez, mercado, eventos, clientes frecuentes)
BAL.price=(o,cl)=>{const speed=Math.round(2*(1-cl.wait/cl.max)),u=speed+(G.built.mercado?1:0)+(typeof MODS!=="undefined"?MODS().tip+tipBonus(cl)+drinkBonus(o.dr):0);return BAL.pupusa+(o.dr?BAL.bebida:0)+u*.25};
(function(){if(typeof NT!=="undefined")Object.values(NT).forEach(n=>n.o.forEach(o=>{if(o[1]>0)o[1]=Math.round(o[1]*BAL.cost/5)*5}));
  if(typeof UPS!=="undefined")UPS.forEach(u=>{u.c=Math.round(u.c*BAL.ups/5)*5})})();
