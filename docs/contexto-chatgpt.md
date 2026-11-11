# A o D · Paquete completo para retomar el proyecto

Este documento junta **todo** lo necesario para entender, revisar o modificar
el juego sin acceso a nada más. Lo genera `node scripts/paquete-chatgpt.mjs` a
partir de los archivos del repositorio; si algo no coincide, manda el
repositorio.

## Dónde está cada cosa

- **Juego publicado (se puede abrir y jugar):** https://csaugusto.github.io/a-o-d/
- **Repositorio (público):** https://github.com/csaugusto/a-o-d
- **Archivos crudos legibles** (por si puedes abrir enlaces):
  `https://raw.githubusercontent.com/csaugusto/a-o-d/main/<ruta>`, por ejemplo
  `.../main/js/cartas.js` o `.../main/docs/img/cartas.png`.
- **Si recibiste este documento dentro de un zip:** junto a él vienen las
  imágenes (`img/`), el código completo del juego (`codigo/`) y las láminas
  HTML de las tres direcciones de diseño (`diseno/`).

## Imágenes de referencia

- `img/cartas.png`: seis frentes (uno por categoría), el reverso y la carta en
  blanco.
- `img/logotipo.png`: logotipo completo con descriptor y lema.
- `img/carta-ejemplo.png`: una carta en grande.
- `img/juego-pantallas.png`: seis pantallas del juego en el teléfono (inicio,
  carta, modo prueba, resultados, hoja «Mazo», hoja «Tus dilemas»).
- `img/juego-*.png`: cada pantalla por separado, a 390 × 844 px (× 2).
- `img/direccion-*.png`: las tres direcciones visuales que se exploraron antes
  de elegir «Sobremesa a mano» (la elegida es `direccion-sobremesa.png`; su
  logotipo todavía decía «Cilantro o Perejil», el nombre anterior).

## Las tres direcciones de diseño que se exploraron

Antes de construir se maquetaron tres direcciones visuales completas. La pareja
eligió **Sobremesa a mano** y es la que tiene el juego. Las otras dos se
incluyen solo como referencia, para que se conozcan; **un cambio de dirección
no se hace en esta conversación**: lo decide la pareja y se aplica en el
repositorio.

Las tres láminas se hicieron cuando el nombre de trabajo era «Cilantro o
Perejil», por eso su logotipo y su reverso dicen eso; el nombre actual es
«A o D». Cada lámina muestra logotipo, seis frentes (uno por categoría), carta
en blanco, reverso, la misma carta en dos tamaños, color, tipografías y la
pantalla del teléfono.

### 1. La carta partida en dos

![Dirección «La carta partida en dos»](img/direccion-mitades.png)

- **Idea:** la elección forzada hecha forma. La carta se parte en dos campos de
  color, la opción A arriba y la B abajo, y una «o» gruesa es la bisagra entre
  los dos. Esa «o» entre dos colores es también el ícono.
- **Color:** un par que choca por categoría, siempre claro contra oscuro.
  Marca: Cilantro `#98DE4E` / Perejil `#0B5239`. Comida: Mango `#FFB62E` /
  Betabel `#7B0F4E`. Destinos: Granate `#8C1220` / Cielo `#86CDFF`. Familia:
  Lila `#C9AEFF` / Chocolate `#4A2010`. Celebrities: Noche `#16175A` / Chicle
  `#FF8FCF`. Dilemas: Coral `#FF8266` / Petróleo `#06384C`. Qué asco: Moretón
  `#3D1C63` / Bilis `#D6D24A`. Papel `#FFFFFF`, tinta `#16171C`, mesa
  `#E8E9EC`.
- **Tipografía:** Archivo (grotesca gruesa, ancha en el logotipo) y Chivo Mono
  para códigos y etiquetas.
- **Reverso:** verde, con «Cilantro» arriba y «Perejil» de cabeza: según cómo
  caiga la carta, gana uno.
- **Carácter:** la más gráfica y contundente; se reconoce a tres metros. Gasta
  más tinta.

### 2. Sobremesa a mano (la elegida)

![Dirección «Sobremesa a mano»](img/direccion-sobremesa.png)

- **Idea:** el juego nació de preguntas inventadas en la mesa, así que todo
  parece escrito ahí mismo con plumón azul sobre papeles de colores.
- **Color:** una sola tinta, Azul pluma `#1F2C92`, sobre un papel por
  categoría: Maíz `#FFCF45` (Comida), Cielo `#84CDEF` (Destinos), Mamey
  `#FF9A6B` (Familia), Chicle `#FF8DC0` (Celebrities), Jacaranda `#B9A5F5`
  (Dilemas), Pepinillo `#B4D43B` (Qué asco). Servilleta `#FDFDFA` para la
  carta en blanco, mantel `#F1F3F5` de fondo, café `#8A5A3C` solo para manchas.
- **Tipografía:** dos manos, Mansalva (quien arranca, opción A) y Covered By
  Your Grace (quien remata, opción B), más Archivo para lo de imprenta.
- **Carácter:** cálida y casera; la carta en blanco no desentona porque todo el
  mazo ya parece escrito a mano.
- En el juego actual se adaptó al nombre «A o D» (ver la sección de identidad
  más abajo).

### 3. Formulario oficial absurdo

![Dirección «Formulario oficial absurdo»](img/direccion-formulario.png)

- **Idea:** humor por contraste. La carta parece una boleta o formulario serio
  («Forma QP-1», casillas A y B, «Marque solo una casilla. Las dos y ninguna no
  proceden.», sello de «¿POR QUÉ?») preguntando cosas ridículas o asquerosas.
- **Color:** cada categoría es una copia de formulario de color con su tinta.
  Comida: verde `#B4E2BC` / `#0B4A2B`. Destinos: azul `#AED5F5` / `#11347C`.
  Familia: salmón `#FBB896` / `#6A2410`. Celebrities: rosa `#F8AFCF` /
  `#7A0E48`. Dilemas: lila `#CFC0F4` / `#3A1D7E`. Qué asco: mostaza `#DDC646` /
  `#403300`. Tus dilemas: bond `#F7F7F2` / azul carbón `#1C2260`. Además rojo
  foliadora `#C92C17` (sellos), trama `#2F3A8F` y noche de mesa `#11153D`.
- **Tipografía:** Archivo condensada para la pregunta y Chivo Mono para la
  letra chica del formulario.
- **Reverso:** azul carbón con un sello circular «Hay que elegir».
- **Carácter:** el chiste más elaborado; la seriedad es la broma.

## Cómo devolver cambios para que se apliquen sin errores

**Cartas.** Las cartas viven solo en `js/cartas.js`. Para proponer cambios usa
esta forma, una línea por carta:

```
CAMBIAR  COM-05 | opción 1 | opción 2
AGREGAR  COM    | opción 1 | opción 2
QUITAR   DIL-17
APROBAR  FAM-02, FAM-08, CEL-03
```

Reglas: cada opción debe entenderse sola, en minúscula salvo nombres propios,
sin punto final ni signos de interrogación (la carta los pone), máximo 60
caracteres. Los códigos no se reutilizan: una carta nueva toma el siguiente
número libre de su categoría. El estado puede ser `ejemplo` (escrita por la
pareja), `borrador` (propuesta) o `aprobada`.

**Código.** El juego es HTML, CSS y JavaScript a mano, sin compilación ni
dependencias. Para cambios de código devuelve el archivo completo o un diff
claro, indicando la ruta. Respeta: nada de emojis en ningún archivo; nada de
`alert`, `confirm` ni `prompt`; el nombre del juego solo se escribe en
`js/cartas.js`; las medidas internas de la carta en `cqw`.

**Diseño.** Para cambios visuales describe qué cambiar en términos de los
tokens de la sección de identidad (por ejemplo «el papel de Familia más
claro») o devuelve el CSS concreto.

## Estructura del código

| Archivo | Qué hace |
| --- | --- |
| `index.html` | La pantalla del juego y sus hojas (Mazo, Tus dilemas, Cómo se juega, Resultados de la prueba) |
| `js/cartas.js` | **Única fuente de las cartas** y del nombre, descriptor, lema y edición (`window.MAZO`) |
| `js/carta.js` | Dibuja cada carta (`window.Carta`: frente, propia, enBlanco, reverso, reglas, portada, logotipo) |
| `js/app.js` | La lógica del juego: barajar, avanzar, regresar, filtros, dilemas propios, modo prueba, guardado |
| `css/tokens.css` | Colores y tipografías (incluye tema claro y oscuro de la mesa) |
| `css/carta.css` | El diseño de la carta, medido en `cqw` para escalar igual en pantalla e imprenta |
| `css/app.css` | El diseño de la pantalla alrededor de la carta |
| `imprimir/`, `scripts/exportar.mjs` | Archivos de impresión (en pausa) |
| `.github/workflows/publicar.yml` | Publica el juego en GitHub Pages con cada cambio en `main` |

## Estado y siguientes pasos

- Hecho: nombre, identidad visual, sistema de cartas, juego digital publicado,
  borrador de 110 cartas, archivos de impresión.
- Siguiente: jugarlo en el teléfono con el modo prueba, depurar las cartas,
  verificar el nombre «A o D» (marca, dominio, redes) y después retomar la
  impresión.
- Preguntas abiertas: qué significa «A o D» para la pareja (para el texto de la
  caja), qué cartas del borrador se quedan y en qué país se imprimiría.
