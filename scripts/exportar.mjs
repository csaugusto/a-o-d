#!/usr/bin/env node
// A o D · Exporta los archivos de impresión con Chrome sin interfaz.
//
//   node scripts/exportar.mjs          los PDF en salida/
//   node scripts/exportar.mjs --png    además una imagen por carta en salida/png/
//
// Chrome: /Applications/Google Chrome.app/... o la ruta en la variable CHROME.
// Las fuentes vienen de Google Fonts: hace falta conexión a internet.
// Sale con código 1 si alguna medida, conteo o fuente no coincide.

import { spawn } from "node:child_process";
import { access, mkdir, mkdtemp, readFile, readdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import vm from "node:vm";
import { inflateSync } from "node:zlib";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SALIDA = path.join(RAIZ, "salida");
const SALIDA_PNG = path.join(SALIDA, "png");
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const CON_PNG = process.argv.includes("--png");

const TOLERANCIA_MM = 0.2;
const PT_A_MM = 25.4 / 72;
const PNG_PX = [825, 1125];      // 2.75 × 3.75 in a 300 dpi
const PNG_VENTANA = [264, 360];  // la misma página en px CSS (96 por pulgada)
const PRESUPUESTO_MS = 20000;    // tiempo virtual: Chrome lo congela mientras baja fuentes
const EN_PARALELO = 4;

// ---------- El mazo ----------

const fuente = await readFile(path.join(RAIZ, "js", "cartas.js"), "utf8");
const contexto = { window: {} };
vm.runInNewContext(fuente, contexto);
const MAZO = contexto.window.MAZO;
const preguntas = MAZO.categorias.flatMap((c) => c.cartas.map((k) => k.id));
const FRENTES = 2 + preguntas.length + (MAZO.cartasEnBlanco || 0);
const HOJAS = Math.ceil(FRENTES / 9);

// ---------- Chrome ----------

const BASE = [
  "--headless=new",
  "--no-first-run",
  "--no-default-browser-check",
  "--disable-background-networking",
  "--disable-component-update",
  "--disable-sync",
  "--disable-extensions",
  "--hide-scrollbars",
  "--mute-audio",
  `--virtual-time-budget=${PRESUPUESTO_MS}`
];

// Un perfil propio por proceso: con el perfil normal, Chrome le pasaría la
// orden a la ventana que ya esté abierta. Se reutiliza para no bajar las
// fuentes en cada llamada.
const PERFILES = await mkdtemp(path.join(tmpdir(), "aod-chrome-"));
let siguientePerfil = 0;
const perfilesLibres = [];
function tomarPerfil() {
  return perfilesLibres.pop() || path.join(PERFILES, String(siguientePerfil++));
}

function chrome(args) {
  const perfil = tomarPerfil();
  return new Promise((resolver, rechazar) => {
    const proceso = spawn(CHROME, [...BASE, `--user-data-dir=${perfil}`, ...args], { stdio: ["ignore", "pipe", "pipe"] });
    let salida = "";
    let errores = "";
    proceso.stdout.on("data", (d) => { salida += d; });
    proceso.stderr.on("data", (d) => { errores += d; });
    const reloj = setTimeout(() => proceso.kill("SIGKILL"), 180000);
    proceso.on("error", (e) => { clearTimeout(reloj); rechazar(e); });
    proceso.on("close", (codigo) => {
      clearTimeout(reloj);
      perfilesLibres.push(perfil);
      if (codigo === 0) resolver(salida);
      else rechazar(new Error(`Chrome terminó con código ${codigo}:\n${errores.split("\n").slice(-8).join("\n")}`));
    });
  });
}

function direccion(pagina, parametros) {
  const url = pathToFileURL(path.join(RAIZ, "imprimir", pagina));
  url.search = new URLSearchParams(parametros).toString();
  return url.href;
}

async function enParalelo(tareas, n) {
  const resultados = new Array(tareas.length);
  let i = 0;
  async function obrero() {
    while (i < tareas.length) {
      const j = i++;
      resultados[j] = await tareas[j]();
    }
  }
  await Promise.all(Array.from({ length: Math.min(n, tareas.length) }, obrero));
  return resultados;
}

// ---------- Lectura de PDF ----------

// Chrome (Skia) escribe objetos sin comprimir el diccionario: /MediaBox,
// /Type /Page y /FontName se leen directo del archivo.
function leerPdf(datos) {
  const t = datos.toString("latin1");
  const cajas = [...t.matchAll(/\/MediaBox\s*\[\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s*\]/g)]
    .map((m) => [(m[3] - m[1]) * PT_A_MM, (m[4] - m[2]) * PT_A_MM]);
  const paginas = (t.match(/\/Type\s*\/Page(?![A-Za-z])/g) || []).length;
  const fuentes = [...new Set([...t.matchAll(/\/FontName\s*\/(?:[A-Z]{6}\+)?([^\s/[\]<>()]+)/g)].map((m) => m[1]))].sort();
  // Skia escribe como Type 3 el contorno de las letras con -webkit-text-stroke.
  // Se acepta si cada glifo es un trazado vectorial; no si trae imágenes.
  let tipo3 = 0;
  let tipo3ConImagen = 0;
  for (const m of t.matchAll(/\/Subtype\s*\/Type3[\s\S]*?\/CharProcs\s*<<([^>]*)>>/g)) {
    tipo3++;
    for (const ref of m[1].matchAll(/(\d+)\s+0\s+R/g)) {
      const contenido = flujo(datos, t, ref[1]);
      if (contenido === null || /(^|\s)(BI|Do)(\s|$)/.test(contenido)) tipo3ConImagen++;
    }
  }
  return { paginas, cajas, fuentes, tipo3, tipo3ConImagen };
}

function flujo(datos, t, id) {
  const m = new RegExp(`(?:^|\\s)${id}\\s+0\\s+obj\\s*<<([\\s\\S]*?)>>\\s*stream\\r?\\n`).exec(t);
  if (!m) return null;
  const largo = Number((/\/Length\s+(\d+)/.exec(m[1]) || [])[1]);
  const inicio = m.index + m[0].length;
  const bruto = datos.subarray(inicio, inicio + largo);
  try {
    return (/\/FlateDecode/.test(m[1]) ? inflateSync(bruto) : bruto).toString("latin1");
  } catch {
    return null;
  }
}

function leerPng(datos) {
  if (datos.toString("latin1", 1, 4) !== "PNG") return null;
  return [datos.readUInt32BE(16), datos.readUInt32BE(20)];
}

// ---------- Trabajos ----------

const PROBLEMAS = [];
const problema = (texto) => PROBLEMAS.push(texto);
const mm = (v) => v.toFixed(2);

const PDFS = [
  { archivo: "prueba-casera-carta.pdf", pagina: "prueba-casera.html", parametros: { papel: "carta", tinta: "ahorro" }, mm: [215.9, 279.4], esperadas: HOJAS },
  { archivo: "prueba-casera-a4.pdf", pagina: "prueba-casera.html", parametros: { papel: "a4", tinta: "ahorro" }, mm: [210, 297], esperadas: HOJAS },
  { archivo: "prueba-casera-carta-color.pdf", pagina: "prueba-casera.html", parametros: { papel: "carta", tinta: "color" }, mm: [215.9, 279.4], esperadas: HOJAS },
  { archivo: "imprenta-frentes.pdf", pagina: "imprenta.html", parametros: { caras: "frentes" }, mm: [69.85, 95.25], esperadas: FRENTES },
  { archivo: "imprenta-reverso.pdf", pagina: "imprenta.html", parametros: { caras: "reverso" }, mm: [69.85, 95.25], esperadas: 1, familias: ["Mansalva", "CoveredByYourGrace"] },
  { archivo: "imprenta-intercalado.pdf", pagina: "imprenta.html", parametros: { caras: "intercalado" }, mm: [69.85, 95.25], esperadas: FRENTES * 2 }
];
const FUENTES_ESPERADAS = ["Archivo", "CoveredByYourGrace", "Mansalva"];

async function generarPdf(trabajo) {
  const destino = path.join(SALIDA, trabajo.archivo);
  let pedido = null; // pulgadas; solo si Chrome no da la medida a la primera
  let resultado;
  for (let intento = 1; intento <= 3; intento++) {
    const parametros = { ...trabajo.parametros };
    if (pedido) parametros.pagina = `${pedido[0].toFixed(4)}x${pedido[1].toFixed(4)}`;
    await rm(destino, { force: true });
    await chrome(["--no-pdf-header-footer", `--print-to-pdf=${destino}`, direccion(trabajo.pagina, parametros)]);
    const datos = await readFile(destino);
    const info = leerPdf(datos);
    const medida = info.cajas[0] || [0, 0];
    const desvio = Math.max(Math.abs(medida[0] - trabajo.mm[0]), Math.abs(medida[1] - trabajo.mm[1]));
    const uniformes = info.cajas.every((c) => Math.abs(c[0] - medida[0]) < 0.001 && Math.abs(c[1] - medida[1]) < 0.001);
    resultado = { ...trabajo, ...info, medida, desvio, uniformes, intentos: intento, pedido, bytes: datos.length };
    if (desvio <= TOLERANCIA_MM) break;
    // Chrome redondea la página a píxeles CSS: se pide de más o de menos lo
    // que faltó o sobró.
    const base = pedido || trabajo.mm.map((v) => v / 25.4);
    pedido = base.map((v, k) => v + (trabajo.mm[k] - medida[k]) / 25.4);
  }
  return resultado;
}

async function informe(pagina, parametros) {
  const html = await chrome(["--dump-dom", direccion(pagina, { ...parametros, revisar: "si" })]);
  const error = /data-error="([^"]*)"/.exec(html);
  if (error) throw new Error(`${pagina}: ${error[1]}`);
  const m = /<pre id="informe">([\s\S]*?)<\/pre>/.exec(html);
  if (!m) throw new Error(`${pagina}: la página no terminó de prepararse (sin informe).`);
  const texto = m[1].replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
  return JSON.parse(texto);
}

async function generarPng(clave) {
  const destino = path.join(SALIDA_PNG, `${clave}.png`);
  await chrome([
    `--window-size=${PNG_VENTANA.join(",")}`,
    `--force-device-scale-factor=${PNG_PX[0] / PNG_VENTANA[0]}`,
    `--screenshot=${destino}`,
    direccion("imprenta.html", { carta: clave })
  ]);
  return { clave, px: leerPng(await readFile(destino)) };
}

// ---------- Programa ----------

try {
  await access(CHROME);
} catch {
  console.error(`No encuentro Chrome en «${CHROME}». Indica la ruta con la variable de entorno CHROME.`);
  process.exit(1);
}

await mkdir(SALIDA, { recursive: true });
const inicio = Date.now();

try {
  const tareas = [
    ...PDFS.map((t) => () => generarPdf(t)),
    () => informe("imprenta.html", { caras: "intercalado" }),
    () => informe("prueba-casera.html", { papel: "carta" }),
    () => informe("prueba-casera.html", { papel: "a4" })
  ];
  const resultados = await enParalelo(tareas, EN_PARALELO);
  const pdfs = resultados.slice(0, PDFS.length);
  const [imprenta, caseraCarta, caseraA4] = resultados.slice(PDFS.length);

  let pngs = [];
  if (CON_PNG) {
    await mkdir(SALIDA_PNG, { recursive: true });
    for (const viejo of await readdir(SALIDA_PNG)) {
      if (viejo.endsWith(".png")) await rm(path.join(SALIDA_PNG, viejo));
    }
    const claves = ["portada", "reglas", ...preguntas, "blanco", "reverso"];
    pngs = await enParalelo(claves.map((c) => () => generarPng(c)), EN_PARALELO);
  }

  // ----- Resumen -----

  console.log(`\nA o D · archivos de impresión (${MAZO.nombre}, edición ${MAZO.edicion})`);
  console.log(`Mazo: ${preguntas.length} preguntas + ${MAZO.cartasEnBlanco} en blanco + portada y reglas = ${FRENTES} frentes; ${HOJAS} hojas de 9.\n`);

  const filas = [["Archivo", "Páginas", "Página medida (mm)", "Objetivo (mm)", "Desvío", "Peso"]];
  for (const r of pdfs) {
    filas.push([
      `salida/${r.archivo}`,
      `${r.paginas} de ${r.esperadas}`,
      `${mm(r.medida[0])} × ${mm(r.medida[1])}`,
      `${mm(r.mm[0])} × ${mm(r.mm[1])}`,
      `${r.desvio.toFixed(3)} mm`,
      `${(r.bytes / 1048576).toFixed(1)} MB`
    ]);
    if (r.paginas !== r.esperadas) problema(`${r.archivo}: ${r.paginas} páginas; se esperaban ${r.esperadas}.`);
    if (r.cajas.length !== r.paginas) problema(`${r.archivo}: ${r.cajas.length} /MediaBox para ${r.paginas} páginas.`);
    if (!r.uniformes) problema(`${r.archivo}: no todas las páginas miden lo mismo.`);
    if (r.desvio > TOLERANCIA_MM) problema(`${r.archivo}: la página se desvía ${r.desvio.toFixed(3)} mm (máximo ${TOLERANCIA_MM}).`);
    for (const f of r.familias || FUENTES_ESPERADAS) {
      if (!r.fuentes.some((x) => x.startsWith(f))) problema(`${r.archivo}: no trae incrustada la fuente ${f}.`);
    }
    const ajenas = r.fuentes.filter((x) => !FUENTES_ESPERADAS.some((f) => x.startsWith(f)));
    if (ajenas.length) problema(`${r.archivo}: trae fuentes de respaldo: ${ajenas.join(", ")}.`);
    if (r.tipo3ConImagen) problema(`${r.archivo}: ${r.tipo3ConImagen} glifos Type 3 son imagen, no trazado.`);
  }
  const anchos = filas[0].map((_, k) => Math.max(...filas.map((f) => f[k].length)));
  filas.forEach((f, n) => {
    console.log(f.map((c, k) => (k === 1 || k >= 4 ? c.padStart(anchos[k]) : c.padEnd(anchos[k]))).join("   "));
    if (n === 0) console.log(anchos.map((a) => "-".repeat(a)).join("   "));
  });
  for (const r of pdfs) {
    if (r.intentos > 1) console.log(`  ${r.archivo}: medida corregida en ${r.intentos} intentos (pedido ${r.pedido.map((v) => v.toFixed(4)).join(" × ")} in).`);
  }
  const todas = [...new Set(pdfs.flatMap((r) => r.fuentes))];
  console.log(`\nFuentes incrustadas (TrueType en subconjunto): ${todas.join(", ")}.`);
  const tipo3 = pdfs.reduce((n, r) => n + r.tipo3, 0);
  if (tipo3) {
    console.log(`Además ${tipo3} fuentes Type 3 entre todos los PDF: el contorno de -webkit-text-stroke, como trazado vectorial ` +
      `(${pdfs.some((r) => r.tipo3ConImagen) ? "con imágenes" : "ningún glifo es imagen"}).`);
  }

  console.log("\nRevisión en el navegador:");
  const cargadas = (f) => Object.keys(f).filter((k) => f[k]);
  for (const [nombre, inf] of [["imprenta", imprenta], ["prueba casera carta", caseraCarta], ["prueba casera A4", caseraA4]]) {
    const faltan = Object.keys(inf.fuentes).filter((k) => !inf.fuentes[k]);
    if (faltan.length) problema(`${nombre}: no cargaron ${faltan.join(", ")}; se usaron fuentes de respaldo.`);
  }
  console.log(`  Fuentes cargadas: ${cargadas(imprenta.fuentes).join(", ")}.`);
  const z = imprenta.zona;
  console.log(`  Imprenta (${imprenta.paginas} páginas): página ${mm(imprenta.paginaMm[0])} × ${mm(imprenta.paginaMm[1])} mm, ` +
    `carta ${mm(imprenta.cartaMm[0])} × ${mm(imprenta.cartaMm[1])} mm, sangrado ${imprenta.sangradoMm.map((v) => v.toFixed(3)).join(" / ")} mm.`);
  console.log(`  Zona segura: el texto más cercano al corte queda a ${mm(z.texto)} mm (${z.cartaTexto}, ${z.piezaTexto}); ` +
    `el trazo más cercano, a ${mm(z.trazos)} mm (${z.cartaTrazo}, ${z.piezaTrazo}).`);
  if (imprenta.paginas !== FRENTES * 2) problema(`imprenta intercalada: ${imprenta.paginas} páginas en el navegador.`);
  if (z.texto < 5) problema(`Hay texto a ${mm(z.texto)} mm del corte (${z.cartaTexto}); el mínimo es 5 mm.`);
  if (Math.abs(imprenta.cartaMm[0] - 63.5) > 0.01 || Math.abs(imprenta.cartaMm[1] - 88.9) > 0.01) problema("La carta de imprenta no mide 63.5 × 88.9 mm.");
  for (const [nombre, inf] of [["carta", caseraCarta], ["A4", caseraA4]]) {
    console.log(`  Prueba casera ${nombre} (${inf.paginas} hojas, ${inf.cartas} cartas): cada carta mide ` +
      `${mm(inf.cartaAnchoMm[0])}–${mm(inf.cartaAnchoMm[1])} × ${mm(inf.cartaAltoMm[0])}–${mm(inf.cartaAltoMm[1])} mm; ` +
      `márgenes ${mm(inf.margenesMm[0])} y ${mm(inf.margenesMm[1])} mm; descentrado ${mm(inf.descentradoMm)} mm.`);
    if (inf.paginas !== HOJAS) problema(`Prueba casera ${nombre}: ${inf.paginas} hojas; se esperaban ${HOJAS}.`);
    if (inf.cartas !== FRENTES) problema(`Prueba casera ${nombre}: ${inf.cartas} cartas; se esperaban ${FRENTES}.`);
    if (inf.cartaAnchoMm.some((v) => Math.abs(v - 63.5) > 0.01) || inf.cartaAltoMm.some((v) => Math.abs(v - 88.9) > 0.01)) {
      problema(`Prueba casera ${nombre}: alguna carta no mide 63.5 × 88.9 mm.`);
    }
    if (inf.descentradoMm > 0.01) problema(`Prueba casera ${nombre}: la rejilla no está centrada.`);
  }

  if (CON_PNG) {
    const malos = pngs.filter((p) => !p.px || p.px[0] !== PNG_PX[0] || p.px[1] !== PNG_PX[1]);
    console.log(`\nPNG: ${pngs.length} imágenes en salida/png/ (${pngs.length - malos.length} de ${PNG_PX.join(" × ")} px).`);
    for (const p of malos) problema(`png/${p.clave}.png mide ${p.px ? p.px.join(" × ") : "?"} px.`);
  }

  console.log(`\nTiempo: ${((Date.now() - inicio) / 1000).toFixed(0)} s.`);
  if (PROBLEMAS.length) {
    console.log(`\n${PROBLEMAS.length} problema(s):`);
    for (const p of PROBLEMAS) console.log(`  - ${p}`);
    process.exitCode = 1;
  } else {
    console.log("Todo coincide.");
  }
} catch (e) {
  console.error(`\nNo se pudo exportar: ${e.message}`);
  process.exitCode = 1;
} finally {
  await rm(PERFILES, { recursive: true, force: true });
}
