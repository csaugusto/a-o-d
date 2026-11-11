// Genera docs/cartas.md a partir de js/cartas.js.
//
// Uso (desde la raíz del repositorio o desde cualquier carpeta):
//   node scripts/listar-cartas.mjs
//
// Node 22, sin dependencias. js/cartas.js es un script de navegador que asigna
// window.MAZO; aquí se ejecuta en un contexto aislado con un «window» falso.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const origen = join(raiz, "js", "cartas.js");
const destino = join(raiz, "docs", "cartas.md");

function leerMazo() {
  const contexto = { window: {} };
  vm.createContext(contexto);
  vm.runInContext(readFileSync(origen, "utf8"), contexto, { filename: origen });
  const mazo = contexto.window.MAZO;
  if (!mazo || !Array.isArray(mazo.categorias)) {
    throw new Error("js/cartas.js no definió window.MAZO con una lista de categorías.");
  }
  return mazo;
}

// Las celdas de Markdown no aguantan «|» ni saltos de línea.
function celda(texto) {
  return String(texto ?? "").replace(/\s+/g, " ").trim().replace(/\|/g, "\\|");
}

function contarEstados(cartas) {
  const cuenta = {};
  for (const c of cartas) cuenta[c.estado || "sin estado"] = (cuenta[c.estado || "sin estado"] || 0) + 1;
  return cuenta;
}

function resumenEstados(cuenta) {
  const orden = ["aprobada", "ejemplo", "borrador"];
  const claves = Object.keys(cuenta).sort((x, y) => {
    const a = orden.indexOf(x), b = orden.indexOf(y);
    return (a < 0 ? 99 : a) - (b < 0 ? 99 : b) || x.localeCompare(y, "es");
  });
  return claves.map((k) => `${cuenta[k]} ${k}`).join(", ");
}

function generar(mazo) {
  const categorias = mazo.categorias;
  const preguntas = categorias.reduce((n, c) => n + (c.cartas || []).length, 0);
  const enBlanco = Number(mazo.cartasEnBlanco) || 0;
  const reserva = categorias.reduce((n, c) => n + (c.banca || []).length, 0);
  const todas = categorias.flatMap((c) => c.cartas || []);

  const l = [];
  l.push(`# Cartas de ${mazo.nombre} · Edición ${mazo.edicion}`);
  l.push("");
  l.push("> Este archivo se genera automáticamente desde `js/cartas.js`. No lo edites a mano:");
  l.push("> cambia las cartas en `js/cartas.js` y vuelve a correr `node scripts/listar-cartas.mjs`.");
  l.push("");
  l.push("Cada carta completa la frase «¿Qué prefieres…?» con dos opciones.");
  l.push("");
  l.push("Estados: **ejemplo** = escrita por ustedes en `docs/esencia.md`;");
  l.push("**borrador** = propuesta por revisar; **aprobada** = ya la probaron y se queda.");
  l.push("");
  l.push("## Conteo");
  l.push("");
  l.push("| Categoría | Código | Cartas | Estados | En reserva |");
  l.push("| --- | --- | ---: | --- | ---: |");
  for (const c of categorias) {
    const cartas = c.cartas || [];
    l.push(`| [${celda(c.nombre)}](#${ancla(c.nombre)}) | ${celda(c.codigo)} | ${cartas.length} | ${resumenEstados(contarEstados(cartas))} | ${(c.banca || []).length} |`);
  }
  l.push(`| Cartas en blanco | TÚ | ${enBlanco} | | |`);
  l.push(`| **Total** | | **${preguntas + enBlanco}** | ${resumenEstados(contarEstados(todas))} | **${reserva}** |`);
  l.push("");
  l.push(`${preguntas} preguntas impresas + ${enBlanco} cartas en blanco = ${preguntas + enBlanco} cartas.`);
  l.push("");

  for (const c of categorias) {
    const cartas = c.cartas || [];
    l.push(`## ${c.nombre}`);
    l.push("");
    if (c.descripcion) {
      l.push(`${c.descripcion} Código ${c.codigo} · ${cartas.length} cartas.`);
      l.push("");
    }
    l.push("| Código | Opción 1 | Opción 2 | Estado |");
    l.push("| --- | --- | --- | --- |");
    for (const k of cartas) {
      l.push(`| ${celda(k.id)} | ${celda(k.a)} | ${celda(k.b)} | ${celda(k.estado)} |`);
    }
    l.push("");
    const banca = c.banca || [];
    l.push(`### Reserva · ${c.nombre} (${banca.length})`);
    l.push("");
    if (banca.length) {
      l.push("Pasaron el filtro pero no están en el mazo. Sirven para reemplazar cartas flojas.");
      l.push("");
      l.push("| # | Opción 1 | Opción 2 |");
      l.push("| ---: | --- | --- |");
      banca.forEach((k, i) => l.push(`| ${i + 1} | ${celda(k.a)} | ${celda(k.b)} |`));
    } else {
      l.push("Sin cartas de reserva.");
    }
    l.push("");
  }

  return l.join("\n");
}

// Ancla de GitHub: minúsculas, sin signos, espacios a guiones (conserva acentos).
function ancla(titulo) {
  return titulo.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").trim().replace(/\s/g, "-");
}

// Avisos que no detienen el proceso: códigos repetidos, opciones demasiado
// largas y opciones idénticas en dos lugares (mazo o reserva).
function revisar(mazo) {
  const avisos = [];
  const vistos = new Set();
  const opciones = new Map();
  const anotar = (texto, donde) => {
    const clave = String(texto).toLowerCase().replace(/\s+/g, " ").trim();
    if (opciones.has(clave)) avisos.push(`opción repetida en ${opciones.get(clave)} y ${donde}: «${texto}»`);
    else opciones.set(clave, donde);
  };
  for (const c of mazo.categorias) {
    for (const k of c.cartas || []) { anotar(k.a, k.id); anotar(k.b, k.id); }
    (c.banca || []).forEach((k, i) => { const d = `reserva ${c.codigo} ${i + 1}`; anotar(k.a, d); anotar(k.b, d); });
    for (const k of c.cartas || []) {
      if (vistos.has(k.id)) avisos.push(`código repetido: ${k.id}`);
      vistos.add(k.id);
      for (const op of [k.a, k.b]) {
        if (String(op).length > 60) avisos.push(`${k.id}: opción de más de 60 caracteres («${op}»)`);
      }
    }
  }
  return avisos;
}

const mazo = leerMazo();
writeFileSync(destino, generar(mazo));
const total = mazo.categorias.reduce((n, c) => n + (c.cartas || []).length, 0);
console.log(`Listo: ${relative(process.cwd(), destino) || destino} (${total} preguntas en ${mazo.categorias.length} categorías).`);
for (const aviso of revisar(mazo)) console.warn(`Aviso: ${aviso}`);
