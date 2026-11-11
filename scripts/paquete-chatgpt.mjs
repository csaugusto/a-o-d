// Arma el paquete para retomar el proyecto en otra conversación (por ejemplo
// ChatGPT): un solo documento con todo el contexto y un zip con ese documento,
// las imágenes de referencia y el código del juego.
//
// Uso: node scripts/paquete-chatgpt.mjs
// Salida: PARA-CHATGPT.md (raíz del repo) y salida/a-o-d-para-chatgpt.zip

import { readFileSync, writeFileSync, rmSync, mkdirSync, cpSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const leer = (ruta) => readFileSync(join(raiz, ruta), "utf8");

// Las cartas se regeneran primero para que el paquete nunca lleve un listado viejo.
execFileSync(process.execPath, [join(raiz, "scripts/listar-cartas.mjs")], { stdio: "inherit" });

// Los documentos traen su propio título de nivel 1; se bajan un nivel para que
// el paquete tenga un solo título principal.
const bajarTitulos = (texto) => texto.replace(/^(#+) /gm, "#$1 ");
const secciones = [
  ["Esencia del proyecto (escrita por la pareja)", "docs/esencia.md"],
  ["Avance", "AVANCE.md"],
  ["Nombre", "docs/nombre.md"],
  ["Identidad visual", "docs/identidad.md"],
  ["Mazo completo", "docs/cartas.md"],
  ["Impresión (en pausa)", "docs/impresion.md"],
];

let doc = leer("docs/contexto-chatgpt.md").trimEnd() + "\n";
for (const [titulo, ruta] of secciones) {
  doc += `\n---\n\n# Anexo · ${titulo}\n\n_Fuente: \`${ruta}\`_\n\n`;
  doc += bajarTitulos(leer(ruta)).trim() + "\n";
}
// Dentro del zip el documento vive junto a img/; en la raíz del repo, las
// imágenes están en docs/img/.
// Las láminas de las tres direcciones viven en diseno/exploracion/.
writeFileSync(
  join(raiz, "PARA-CHATGPT.md"),
  doc.replace(/\]\(img\/direccion-/g, "](diseno/exploracion/direccion-").replace(/\]\(img\//g, "](docs/img/"),
);

const carpeta = join(raiz, "salida/a-o-d-para-chatgpt");
const zip = join(raiz, "salida/a-o-d-para-chatgpt.zip");
rmSync(carpeta, { recursive: true, force: true });
rmSync(zip, { force: true });
mkdirSync(join(carpeta, "img"), { recursive: true });
mkdirSync(join(carpeta, "codigo"), { recursive: true });
mkdirSync(join(carpeta, "diseno"), { recursive: true });

writeFileSync(join(carpeta, "PARA-CHATGPT.md"), doc);
cpSync(join(raiz, "docs/img"), join(carpeta, "img"), { recursive: true });
for (const nombre of ["mitades", "sobremesa", "formulario"]) {
  const origen = join(raiz, `diseno/exploracion/direccion-${nombre}.png`);
  if (existsSync(origen)) cpSync(origen, join(carpeta, `img/direccion-${nombre}.png`));
  // La lámina HTML también, por si se quiere ver a detalle (se abre con doble clic).
  const lamina = join(raiz, `diseno/exploracion/direccion-${nombre}.html`);
  if (existsSync(lamina)) cpSync(lamina, join(carpeta, `diseno/direccion-${nombre}.html`));
}
for (const ruta of ["index.html", "css", "js", ".github/workflows/publicar.yml"]) {
  cpSync(join(raiz, ruta), join(carpeta, "codigo", ruta), { recursive: true });
}

execFileSync("zip", ["-qr", zip, "a-o-d-para-chatgpt"], { cwd: join(raiz, "salida") });
rmSync(carpeta, { recursive: true, force: true });

const kb = (r) => Math.round(readFileSync(r).length / 1024);
console.log(`Listo: PARA-CHATGPT.md (${kb(join(raiz, "PARA-CHATGPT.md"))} KB) y salida/a-o-d-para-chatgpt.zip (${kb(zip)} KB).`);
