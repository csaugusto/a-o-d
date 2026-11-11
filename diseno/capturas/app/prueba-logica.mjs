// Prueba de la lógica pura del juego (barajar, filtrar, avanzar, regresar).
// Uso: node diseno/capturas/app/prueba-logica.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import assert from "node:assert/strict";

const raiz = fileURLToPath(new URL("../../../", import.meta.url));
const contexto = { console };
contexto.window = contexto;
vm.createContext(contexto);
vm.runInContext(readFileSync(raiz + "js/cartas.js", "utf8"), contexto);
vm.runInContext(readFileSync(raiz + "js/app.js", "utf8"), contexto);
const L = contexto.AoDLogica;
const MAZO = contexto.MAZO;

// Azar con semilla para que las pruebas se repitan igual.
function semilla(n) {
  return function () {
    n = (n * 1664525 + 1013904223) % 4294967296;
    return n / 4294967296;
  };
}

// Los objetos vienen de otro contexto de vm: se comparan como JSON.
const igual = (a, b) => assert.equal(JSON.stringify(a), JSON.stringify(b));

let pasadas = 0;
function prueba(nombre, fn) {
  fn();
  pasadas++;
  console.log("ok  " + nombre);
}

const ajustes = { inactivas: [], propios: true, prueba: false };
const cat = L.catalogo(MAZO, []);

prueba("el catálogo tiene 110 cartas en 6 categorías", () => {
  assert.equal(cat.ids.length, 110);
  assert.equal(cat.categorias.length, 6);
});

prueba("barajar no pierde ni repite cartas", () => {
  const b = L.barajar(cat.ids, semilla(3));
  assert.equal(b.length, cat.ids.length);
  igual([...b].sort(), [...cat.ids].sort());
  assert.notEqual(JSON.stringify(b), JSON.stringify(cat.ids));
});

prueba("ninguna carta se repite hasta acabar el mazo, y luego llega el fin", () => {
  let p = L.nueva(cat, semilla(7));
  assert.equal(L.estadoDe(p), "inicio");
  const vistas = new Set();
  for (let i = 0; i < 110; i++) {
    p = L.avanzar(p, cat, ajustes);
    assert.equal(L.estadoDe(p), "carta");
    const id = L.actual(p);
    assert.ok(!vistas.has(id), "repetida: " + id);
    vistas.add(id);
    assert.equal(L.conteo(p, cat, ajustes).numero, i + 1);
  }
  p = L.avanzar(p, cat, ajustes);
  assert.equal(L.estadoDe(p), "fin");
  const c = L.conteo(p, cat, ajustes);
  assert.equal(c.numero, 110);
  assert.equal(c.total, 110);
  assert.equal(c.restantes, 0);
  // Avanzar en el fin no rompe nada.
  assert.equal(L.estadoDe(L.avanzar(p, cat, ajustes)), "fin");
});

prueba("regresar muestra la anterior y avanzar vuelve sin sacar otra nueva", () => {
  let p = L.nueva(cat, semilla(11));
  p = L.avanzar(p, cat, ajustes);
  const primera = L.actual(p);
  assert.equal(L.puedeRegresar(p, cat, ajustes), false);
  assert.equal(L.actual(L.regresar(p, cat, ajustes)), primera, "en la primera no hay anterior");
  p = L.avanzar(p, cat, ajustes);
  const segunda = L.actual(p);
  p = L.avanzar(p, cat, ajustes);
  const tercera = L.actual(p);
  p = L.regresar(p, cat, ajustes);
  assert.equal(L.actual(p), segunda);
  p = L.regresar(p, cat, ajustes);
  assert.equal(L.actual(p), primera);
  p = L.avanzar(p, cat, ajustes);
  assert.equal(L.actual(p), segunda);
  p = L.avanzar(p, cat, ajustes);
  assert.equal(L.actual(p), tercera);
  assert.equal(p.vistas.length, 3, "no se sacaron cartas de más");
  p = L.avanzar(p, cat, ajustes);
  assert.equal(p.vistas.length, 4);
});

prueba("desde el fin, regresar lleva a la última carta", () => {
  let p = L.nueva(cat, semilla(5));
  for (let i = 0; i < 111; i++) p = L.avanzar(p, cat, ajustes);
  assert.equal(L.estadoDe(p), "fin");
  const ultima = p.vistas[p.vistas.length - 1];
  p = L.regresar(p, cat, ajustes);
  assert.equal(L.actual(p), ultima);
});

prueba("apagar una categoría a media partida: no sale, el conteo cambia y la carta en la mesa se reemplaza", () => {
  let p = L.nueva(cat, semilla(13));
  for (let i = 0; i < 20; i++) p = L.avanzar(p, cat, ajustes);
  const enMesa = cat.porId[L.actual(p)].categoria;
  const sinEsa = L.alternarCategoria(ajustes, cat, enMesa, false);
  igual(sinEsa.inactivas, [enMesa]);
  p = L.corregir(p, cat, sinEsa, semilla(1));
  assert.equal(L.estadoDe(p), "carta");
  assert.notEqual(cat.porId[L.actual(p)].categoria, enMesa);
  const totalEsperado = 110 - cat.categoriaPorId[enMesa].total;
  assert.equal(L.conteo(p, cat, sinEsa).total, totalEsperado);
  // Se juega hasta el final sin ver esa categoría.
  const vistas = new Set();
  while (L.estadoDe(p) === "carta") {
    const c = cat.porId[L.actual(p)];
    assert.notEqual(c.categoria, enMesa);
    assert.ok(!vistas.has(c.id));
    vistas.add(c.id);
    p = L.avanzar(p, cat, sinEsa);
  }
  assert.equal(L.conteo(p, cat, sinEsa).numero, totalEsperado);
  assert.equal(L.conteo(p, cat, sinEsa).restantes, 0);
  // Al volver a encenderla, sus cartas pendientes aparecen.
  const con = L.alternarCategoria(sinEsa, cat, enMesa, true);
  const q = L.corregir(p, cat, con, semilla(2));
  assert.equal(L.estadoDe(q), "carta");
  assert.equal(cat.porId[L.actual(q)].categoria, enMesa);
});

prueba("regresar se salta las cartas de categorías apagadas", () => {
  let p = L.nueva(cat, semilla(17));
  for (let i = 0; i < 30; i++) p = L.avanzar(p, cat, ajustes);
  const off = cat.porId[p.vistas[28]].categoria;
  const aj = L.alternarCategoria(ajustes, cat, off, false);
  p = L.corregir(p, cat, aj, semilla(1));
  while (L.puedeRegresar(p, cat, aj)) {
    p = L.regresar(p, cat, aj);
    assert.notEqual(cat.porId[L.actual(p)].categoria, off);
  }
});

prueba("siempre queda al menos una categoría", () => {
  let aj = ajustes;
  cat.categorias.forEach((c) => { aj = L.alternarCategoria(aj, cat, c.id, false); });
  assert.equal(aj.inactivas.length, cat.categorias.length - 1);
  const saneados = L.sanearAjustes({ inactivas: cat.categorias.map((c) => c.id) }, cat);
  assert.equal(saneados.inactivas.length, 0);
});

prueba("los dilemas propios entran al mazo y se respetan al apagarlos", () => {
  const propios = [{ id: "TU-1", a: "uno", b: "dos" }, { id: "TU-2", a: "tres", b: "cuatro" }];
  const cat2 = L.catalogo(MAZO, propios);
  assert.equal(cat2.ids.length, 112);
  let p = L.nueva(cat, semilla(19));
  for (let i = 0; i < 5; i++) p = L.avanzar(p, cat, ajustes);
  // Se guardaron a media partida: entran a las pendientes.
  p = L.corregir(p, cat2, ajustes, semilla(4));
  assert.equal(L.conteo(p, cat2, ajustes).total, 112);
  const salieron = new Set();
  while (L.estadoDe(p) !== "fin") {
    p = L.avanzar(p, cat2, ajustes);
    if (L.actual(p)) salieron.add(L.actual(p));
  }
  assert.ok(salieron.has("TU-1") && salieron.has("TU-2"));
  const sinPropios = { inactivas: [], propios: false, prueba: false };
  let q = L.nueva(cat2, semilla(23));
  while (L.estadoDe(q) !== "fin") {
    q = L.avanzar(q, cat2, sinPropios);
    if (L.actual(q)) assert.ok(!L.actual(q).startsWith("TU-"));
  }
  assert.equal(L.conteo(q, cat2, sinPropios).total, 110);
});

prueba("borrar el dilema que está en la mesa saca la siguiente carta", () => {
  const propios = [{ id: "TU-1", a: "uno", b: "dos" }];
  const cat2 = L.catalogo(MAZO, propios);
  let p = { vistas: ["COM-01", "TU-1"], pendientes: cat2.ids.filter((id) => id !== "COM-01" && id !== "TU-1"), pos: 1 };
  assert.equal(L.actual(p), "TU-1");
  p = L.corregir(p, cat, ajustes, semilla(1));
  assert.equal(L.estadoDe(p), "carta");
  assert.notEqual(L.actual(p), "TU-1");
  assert.ok(!p.vistas.includes("TU-1") && !p.pendientes.includes("TU-1"));
  assert.equal(p.vistas[0], "COM-01");
});

prueba("con el mazo acabado, un dilema nuevo sale de inmediato", () => {
  let p = L.nueva(cat, semilla(29));
  while (L.estadoDe(p) !== "fin") p = L.avanzar(p, cat, ajustes);
  const cat2 = L.catalogo(MAZO, [{ id: "TU-9", a: "x", b: "y" }]);
  p = L.corregir(p, cat2, ajustes, semilla(1));
  assert.equal(L.actual(p), "TU-9");
});

prueba("mazo vacío (sin categorías) no rompe", () => {
  const vacio = L.catalogo({ categorias: [] }, []);
  const aj = L.sanearAjustes(null, vacio);
  let p = L.nueva(vacio, semilla(1));
  p = L.avanzar(p, vacio, aj);
  assert.equal(L.estadoDe(p), "fin");
  assert.equal(L.conteo(p, vacio, aj).total, 0);
  assert.equal(L.puedeRegresar(p, vacio, aj), false);
  const s = L.sanear(null, { categorias: [] }, semilla(1));
  assert.equal(L.estadoDe(s.partida), "inicio");
});

prueba("lo guardado roto o ajeno se descarta sin romper", () => {
  const casos = [null, undefined, 42, "texto", [], { partida: { vistas: "no" } },
    { partida: { vistas: [1, 2], pendientes: [] } },
    { propios: [{ id: "TU-1", a: "", b: "x" }, { id: "malo", a: "a", b: "b" }, { id: "TU-3", a: "a", b: "b" }] },
    { marcas: { "COM-01": "queda", "NADA-1": "fuera", "COM-02": "otra" } },
    { ajustes: { inactivas: ["comida", "comida", "inventada"], propios: "sí" } }];
  casos.forEach((d) => {
    const s = L.sanear(d, MAZO, semilla(1));
    assert.ok(Array.isArray(s.partida.vistas));
    assert.ok(s.partida.pendientes.length + s.partida.vistas.length >= 110);
  });
  const s = L.sanear(casos[7], MAZO, semilla(1));
  igual(s.propios.map((p) => p.id), ["TU-3"]);
  assert.equal(s.siguiente, 4);
  igual(L.sanear(casos[8], MAZO, semilla(1)).marcas, { "COM-01": "queda" });
  const aj = L.sanear(casos[9], MAZO, semilla(1)).ajustes;
  igual(aj.inactivas, ["comida"]);
  assert.equal(aj.propios, true);
});

prueba("una partida guardada se retoma en la misma carta", () => {
  let p = L.nueva(cat, semilla(31));
  for (let i = 0; i < 9; i++) p = L.avanzar(p, cat, ajustes);
  const datos = JSON.parse(JSON.stringify({ ajustes, propios: [], marcas: {}, partida: p }));
  const s = L.sanear(datos, MAZO, semilla(1));
  assert.equal(L.actual(s.partida), L.actual(p));
  assert.equal(L.conteo(s.partida, cat, s.ajustes).numero, 9);
});

prueba("una carta nueva en cartas.js entra a las pendientes de una partida guardada", () => {
  let p = L.nueva(cat, semilla(37));
  p = L.avanzar(p, cat, ajustes);
  const sinUna = { vistas: p.vistas, pendientes: p.pendientes.slice(1), pos: p.pos };
  const r = L.corregir(sinUna, cat, ajustes, semilla(1));
  assert.equal(r.vistas.length + r.pendientes.length, 110);
});

prueba("validar dilemas: vacías, largas e iguales", () => {
  assert.equal(L.validarDilema("  ", "b").ok, false);
  assert.equal(L.validarDilema("a".repeat(61), "b").ok, false);
  assert.equal(L.validarDilema("Mar", " mar ").ok, false);
  const v = L.validarDilema("  playa   fea ", "montaña");
  igual([v.ok, v.a, v.b], [true, "playa fea", "montaña"]);
});

prueba("textos para copiar", () => {
  assert.equal(L.textoDilemas([{ id: "TU-1", a: "uno", b: "dos" }, { id: "TU-2", a: "tres", b: "cuatro" }]), "uno | dos\ntres | cuatro");
  const t = L.textoResultados({ "COM-07": "facil", "COM-01": "queda" }, cat, "R");
  assert.ok(t.includes("Se queda (1)\nCOM-01 | cilantro | perejil"));
  assert.ok(t.includes("Muy fácil (1)\nCOM-07 | "));
  assert.ok(t.includes("Fuera (0)"));
});

console.log("\n" + pasadas + " pruebas pasadas.");
