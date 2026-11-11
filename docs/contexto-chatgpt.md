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
  imágenes (`img/`) y el código completo del juego (`codigo/`).

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
