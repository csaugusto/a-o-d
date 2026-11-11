# Archivos de impresión

Las hojas de esta carpeta arman el mazo impreso a partir de `js/cartas.js` y del
sistema de cartas (`css/carta.css`, `js/carta.js`). El formato está decidido en
`docs/impresion.md`: poker de 63.5 × 88.9 mm con 3.175 mm de sangrado.

El mazo impreso son 122 frentes (portada, reglas, 110 preguntas y 10 cartas en
blanco) y un solo reverso.

## Generar los archivos

Hace falta Node 22, Google Chrome y conexión a internet (las fuentes vienen de
Google Fonts). Desde la raíz del repositorio:

```sh
node scripts/exportar.mjs          # los PDF
node scripts/exportar.mjs --png    # los PDF y una imagen por carta
```

Si Chrome no está en `/Applications`, indica la ruta:
`CHROME=/ruta/a/chrome node scripts/exportar.mjs`.

El script deja todo en `salida/` y al final imprime un resumen: páginas y tamaño
de página de cada PDF (leídos del archivo), fuentes incrustadas, distancia del
texto al corte y medida de las cartas. Si algo no coincide, lo dice y termina
con error.

| Archivo | Qué es |
| --- | --- |
| `prueba-casera-carta.pdf` | 14 hojas tamaño carta, ahorro de tinta |
| `prueba-casera-a4.pdf` | 14 hojas A4, ahorro de tinta |
| `prueba-casera-carta-color.pdf` | 14 hojas tamaño carta, a color |
| `imprenta-frentes.pdf` | 122 páginas de 69.85 × 95.25 mm, una carta con sangrado por página |
| `imprenta-reverso.pdf` | 1 página con el reverso |
| `imprenta-intercalado.pdf` | 244 páginas: reverso, frente, reverso, frente… |
| `png/` (con `--png`) | 114 imágenes de 825 × 1125 px: una por pregunta (`COM-01.png`…), `blanco.png`, `portada.png`, `reglas.png` y `reverso.png` |

Las páginas también se abren en el navegador para revisarlas:
`imprenta.html?caras=frentes|reverso|intercalado`, `imprenta.html?carta=COM-01`
y `prueba-casera.html?papel=carta|a4&tinta=ahorro|color&reverso=si`.

## Imprimir la prueba casera

1. Abre el PDF y en el diálogo de impresión elige **tamaño real** o **escala
   100 %**. Nunca «ajustar a la página» ni «reducir a los márgenes»: eso encoge
   las cartas.
2. Mide la regla de control del margen izquierdo de la primera hoja: debe medir
   **50 mm**. Si no, la impresora escaló la hoja; corrige la escala y vuelve a
   imprimir.
3. Corta siguiendo las marcas de los márgenes: une con la regla cada par de
   marcas opuestas y corta de punta a punta. Las cartas están pegadas, así que
   cada corte separa dos filas o dos columnas.

En papel carta el margen de arriba y el de abajo miden 6.35 mm. Si tu impresora
no imprime tan cerca de la orilla, puede comerse parte del encabezado o de las
marcas; la carta queda completa mientras se vean las marcas de las esquinas.

Para reversos impresos, `prueba-casera.html?reverso=si` agrega una hoja de nueve
reversos. La rejilla está centrada y el reverso es simétrico, así que esa hoja
sirve al dorso de cualquier hoja de frentes; con impresoras que desalinean el
dorso más de 1 o 2 mm conviene seguir con fundas y naipes viejos, como dice
`docs/impresion.md`.

## Qué archivo va a cada proveedor

Según `docs/impresion.md`; confirma siempre la plantilla del proveedor antes de
subir (poker puede ser 63.5 × 88.9 o 63 × 88 mm).

| Proveedor | Archivo | Nota |
| --- | --- | --- |
| Prueba casera (etapa 1) | `prueba-casera-*.pdf` | Ahorro de tinta para probar preguntas; color si se quiere ver el diseño. |
| The Game Crafter | `png/` | Pide PNG o JPG en RGB, una imagen por cara. Las 10 cartas en blanco son `blanco.png` diez veces. |
| MakePlayingCards | `png/` | Acepta RGB. Revisa que su plantilla sea 825 × 1125 px antes de subir. |
| DriveThruCards | `imprenta-intercalado.pdf` | Pide un solo PDF, **en CMYK** y con tinta máxima de 240 %: este archivo hay que convertirlo antes (ver abajo). |
| Ludotipia | `imprenta-frentes.pdf` y `imprenta-reverso.pdf` | Pide **CMYK** con perfil Coated FOGRA39: también hay que convertir. |

## Lo que esto no resuelve

- **Color.** Todos los PDF y PNG salen en **RGB**. Un proveedor que exija CMYK
  (DriveThruCards, Ludotipia) necesita una conversión de preprensa con el perfil
  que pida (FOGRA39, límite de tinta de 240 %, etcétera) en un programa como
  Acrobat Pro o un RIP, y luego una prueba de color. Los colores planos e
  intensos de las categorías son los que más cambian al pasar a CMYK.
- **Transparencias.** El grano del papel y la trama del reverso llevan
  transparencia. Los RIP la aplanan sin problema, pero un preflight estricto
  puede pedir aplanarla antes.
- **Contorno de las letras.** El trazo fino que engruesa la letra a mano
  (`-webkit-text-stroke` en `css/carta.css`) Chrome lo escribe como fuentes
  Type 3 vectoriales. Se imprime bien, pero algunos preflight las marcan.
- **Fuentes en línea.** Si Google Fonts no responde, el navegador usa fuentes de
  respaldo y las cartas cambian; el script lo detecta y termina con error.
- **Redondeo de Chrome.** Chrome lleva la página a píxeles enteros: el A4 sale
  de 209.89 × 297.01 mm (0.11 mm de diferencia, dentro de la tolerancia de
  0.2 mm). Si una medida se pasa, el script la corrige pidiendo otro tamaño.
