// Carga los clientes desde data/clientes.json (generado por scripts/01_generar_clientes.py).
// Si el archivo no existe o falla, el juego usa los clientes de ejemplo de abajo.
// Requiere servidor local (Live Server): fetch no funciona abriendo index.html con doble clic.
const PEDIDOS_VALIDOS=["frijol con queso","queso","ayote","chicharrón","queso con loroco"];
// Muestra de ejemplo; si existe personas.json (age, sex, occupation, municipality, pedido) se usa ese.
let P=[
{age:29,sex:"Masculino",occupation:"Agencia de viajes",pedido:"queso con loroco"},
{age:35,sex:"Masculino",occupation:"Planta de carnes",pedido:"chicharrón"},
{age:32,sex:"Masculino",occupation:"Contabilidad",pedido:"queso"},
{age:22,sex:"Femenino",occupation:"Agricultora",pedido:"frijol con queso"},
{age:21,sex:"Femenino",occupation:"Administración pública",pedido:"queso con loroco"},
{age:88,sex:"Masculino",occupation:"Hospital",pedido:"queso con loroco"},
{age:39,sex:"Femenino",occupation:"Puesto de mercado",pedido:"frijol con queso"},
{age:79,sex:"Femenino",occupation:"Comida ambulante",pedido:"ayote"},
{age:29,sex:"Masculino",occupation:"Alcaldía",pedido:"ayote"},
{age:23,sex:"Femenino",occupation:"Tienda de abarrotes",pedido:"queso"},
{age:55,sex:"Masculino",occupation:"Construcción",pedido:"queso con loroco"},
{age:18,sex:"Femenino",occupation:"Auxiliar docente",pedido:"chicharrón"}];

function cargarClientes(){
  const src=(typeof window!=="undefined"&&window.CLIENTES_DATA)?Promise.resolve(window.CLIENTES_DATA):fetch("data/clientes.json").then(r=>r.ok?r.json():null);
  return src.then(d=>{
    const lista=Array.isArray(d)?d:(d&&d.clientes);
    if(!lista||!lista.length)return;
    const ok=lista.map(p=>({...p,age:Number(p.age)})).filter(p=>PEDIDOS_VALIDOS.includes(p.pedido)&&p.occupation&&p.age>0);
    if(ok.length)P=ok;
  }).catch(()=>console.warn("No se pudo cargar data/clientes.json; se usan clientes de ejemplo."));
}
const clientesListos=cargarClientes();
