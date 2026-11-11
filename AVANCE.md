# Avance · A o D

Resumen para compartir. Fecha: 11 de noviembre de 2026.

## En una frase

El juego ya existe en digital: se juega desde el teléfono con un mazo borrador de
110 cartas. Falta probarlo con gente, depurar las cartas y verificar el nombre
antes de imprimir.

## 1. Nombre

**A o D** · *El juego de ¿Qué prefieres?* · Lema: *Hay que elegir.*

- Lo eligieron ustedes. Antes se investigaron 26 nombres y se verificaron 6
  finalistas; la recomendación era «Cilantro o Perejil», que no les convenció.
- «¿Qué prefieres?» queda como descriptor, no como nombre: ya existe un juego de
  cartas con ese título exacto (Juegos Sucios, España, 2025), además de libros,
  apps y un registro de Televisa.
- Pendiente: «A o D» no pasó por búsqueda de conflictos. Antes de imprimir un
  tiraje: búsqueda de marca en el IMPI (clases 28 y 41), juegos parecidos,
  dominio y redes.

Detalle: `docs/nombre.md`.

## 2. Identidad visual: «Sobremesa a mano»

Se maquetaron tres direcciones (carta partida en dos, sobremesa a mano,
formulario oficial absurdo) y eligieron **sobremesa a mano**:

- Todo parece escrito con plumón azul pluma sobre papeles de colores, uno por
  categoría: Maíz (Comida), Cielo (Destinos), Mamey (Familia), Chicle
  (Celebrities), Jacaranda (Dilemas), Pepinillo (Qué asco).
- Dos letras a mano: una para la primera opción y otra para la segunda, que
  remata la pregunta. Una «o» repasada al centro.
- Logotipo «A o D» a mano; el ícono es la «o».
- Reverso azul con bucles y «A o D» dos veces (una de cabeza): se lee igual si
  giras la carta y no revela la categoría.
- Carta en blanco con renglones y «No se vale ponerlo fácil.»

Detalle: `docs/identidad.md`. Imágenes para compartir: `docs/img/`.

## 3. El juego digital (listo)

Abrir `index.html`. Pensado para el teléfono en una sobremesa:

- El mazo boca abajo; tocas y sale la primera carta. Tocar, deslizar o
  «Siguiente carta» para avanzar; «Anterior» para regresar.
- Mazo barajado sin repetir hasta que se acaba. Contador discreto («37 de
  110»). Sin puntos ni ganadores.
- **Mazo:** prender o apagar categorías.
- **Tus dilemas:** escribir cartas propias (las cartas en blanco en digital),
  con vista previa en la carta real. Se mezclan en el mazo y se pueden copiar
  como texto.
- **Modo prueba:** debajo de cada carta, «Se queda», «Muy fácil» o «Fuera».
  Luego «Resultados de la prueba» las agrupa y se pueden copiar para decidir qué
  cartas salen del mazo.
- Modo claro y oscuro; guarda el avance en el navegador.

Probado en navegador a tamaño de teléfono, tableta y escritorio, con 17
pruebas de lógica. No se ha probado con el dedo en un teléfono real.

## 4. Las cartas (borrador)

110 cartas en `js/cartas.js` (única fuente) y legibles en `docs/cartas.md`.
Incluyen sus ejemplos originales; las demás son **borradores** para que ustedes
decidan. Distribución: Comida 20, Destinos y aventuras 20, Familia y vínculos
20, Celebrities y cultura pop 20, Dilemas imposibles 20, Qué asco 10, más 10 en
blanco. Hay cartas de reserva por categoría.

Algunas para calibrar el tono:

- salsa verde **o** salsa roja
- 3 tacos perfectos **o** 10 tacos regulares
- un hotel increíble con playa fea **o** un hotel feo con playa increíble
- visitas que llegan sin avisar **o** visitas que no se van
- que tu jefa sea Miranda Priestly **o** que tu jefe sea Don Cangrejo
- no tener codos **o** no tener rodillas
- un trago de leche cortada **o** una mordida de pan con moho

## 5. Impresión (preparada, en pausa)

Los archivos ya existen y se regeneran con `node scripts/exportar.mjs`:
hojas de prueba casera (9 cartas por hoja, tamaño real) y PDF/PNG para imprenta
en tamaño poker (63.5 × 88.9 mm). Quedó en pausa por decisión de ustedes.
Detalle de proveedores y precios: `docs/impresion.md`.

## Lo que sigue

1. Jugarlo en el teléfono con el modo prueba encendido y marcar cartas.
2. Depurar las 110 cartas con esos resultados y escribir las que falten.
3. Verificar el nombre «A o D» (marca, dominio, redes).
4. Retomar la impresión: prueba casera y luego prototipo.

## Preguntas abiertas para ustedes

- ¿Qué significa «A o D» para ustedes? (ayuda a escribir el texto de la caja)
- ¿Qué cartas del borrador se quedan?
- ¿En qué país lo imprimirían, cuando toque?
