// Empaqueta el juego en un solo fragmento HTML: salida/juego.html.
//
// Lee index.html, mete en línea cada CSS y cada script locales, conserva los
// <link> de Google Fonts y escribe un FRAGMENTO (sin <!doctype>, <html>,
// <head> ni <body>) para incrustarlo en otra página:
//   <title>, <meta claude:viewport-fit-sides>, fuentes, un <style>,
//   el contenido del body y al final los scripts en el mismo orden.
//
// Uso: node scripts/empaquetar.mjs   (Node 22, sin dependencias)

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(raiz, "index.html"), "utf8");

function fallar(mensaje) {
  console.error("empaquetar: " + mensaje);
  process.exit(1);
}

function atributo(etiqueta, nombre) {
  const m = etiqueta.match(new RegExp("\\s" + nombre + "\\s*=\\s*(\"([^\"]*)\"|'([^']*)')", "i"));
  return m ? (m[2] ?? m[3]) : null;
}

function esLocal(ruta) {
  return ruta && !/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(ruta);
}

function leer(ruta) {
  try {
    return readFileSync(join(raiz, ruta), "utf8");
  } catch (e) {
    fallar("no encuentro " + ruta);
  }
}

const cabeza = (html.match(/<head[^>]*>([\s\S]*?)<\/head>/i) || fallar("index.html sin <head>"))[1];
const cuerpoCompleto = (html.match(/<body[^>]*>([\s\S]*?)<\/body>/i) || fallar("index.html sin <body>"))[1];

// Fuentes y hojas de estilo, en orden de aparición.
const fuentes = [];
const estilos = [];
for (const [etiqueta] of cabeza.matchAll(/<link\b[^>]*>/gi)) {
  const href = atributo(etiqueta, "href");
  const rel = (atributo(etiqueta, "rel") || "").toLowerCase();
  if (/^https:\/\/fonts\.(googleapis|gstatic)\.com/i.test(href || "")) {
    fuentes.push(etiqueta.trim());
  } else if (rel === "stylesheet" && esLocal(href)) {
    estilos.push({ ruta: href, css: leer(href) });
  } else if (rel === "stylesheet") {
    fallar("hoja de estilo externa no permitida: " + href);
  }
}
for (const [, css] of cabeza.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
  estilos.push({ ruta: "<style> de index.html", css });
}

// Scripts del body, en orden; el resto del body se queda tal cual.
const scripts = [];
const cuerpo = cuerpoCompleto.replace(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi, (todo, attrs, codigo) => {
  const src = atributo("<script" + attrs + ">", "src");
  if (src) {
    if (!esLocal(src)) fallar("script externo no permitido: " + src);
    scripts.push({ ruta: src, js: leer(src) });
  } else {
    scripts.push({ ruta: "<script> en línea", js: codigo });
  }
  return "";
});
if (/<script\b/i.test(cabeza)) fallar("los scripts van al final del body, no en el head");

// Que el código no pueda cerrar su propia etiqueta. «<\/» es la misma cadena
// dentro de un texto o una expresión regular de JavaScript, y en CSS el
// escape «\/» también vale «/». «<!--» se rompe igual para que el analizador
// de HTML no entre en el modo de comentario dentro del script.
function blindarJS(js, ruta) {
  const r = js.replace(/<\/(script)/gi, "<\\/$1").replace(/<!--/g, "<\\!--");
  if (/<\/script/i.test(r)) fallar("no pude blindar " + ruta);
  return r;
}

function blindarCSS(css, ruta) {
  const r = css.replace(/<\/(style)/gi, "<\\/$1");
  if (/<\/style/i.test(r)) fallar("no pude blindar " + ruta);
  if (/url\(\s*["']?(?!data:|https:\/\/fonts\.|#|%23)[^)"']+/i.test(r)) {
    fallar("recurso externo en " + ruta + ": solo se permiten data: y Google Fonts");
  }
  return r;
}

const partes = [
  "<title>A o D</title>",
  '<meta name="claude:viewport-fit-sides" content="cover">',
  ...fuentes,
  "<style>\n" + estilos.map((e) => "/* " + e.ruta + " */\n" + blindarCSS(e.css, e.ruta).trim()).join("\n\n") + "\n</style>",
  cuerpo.replace(/\n{3,}/g, "\n\n").trim(),
  ...scripts.map((s) => "<script>\n/* " + s.ruta + " */\n" + blindarJS(s.js, s.ruta).trim() + "\n</script>")
];

const salida = partes.join("\n") + "\n";
mkdirSync(join(raiz, "salida"), { recursive: true });
writeFileSync(join(raiz, "salida", "juego.html"), salida);

console.log("salida/juego.html: " + (Buffer.byteLength(salida) / 1024).toFixed(1) + " KB · " +
  estilos.length + " hojas de estilo, " + scripts.length + " scripts, " + fuentes.length + " enlaces de fuentes.");
