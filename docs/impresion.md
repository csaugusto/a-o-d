# Impresión

Todo lo que hay que saber para pasar del mazo digital a cartas físicas. Los
precios y especificaciones se consultaron el **10 de noviembre de 2026** en los
sitios de cada proveedor; cambian sin aviso y no incluyen envío, impuestos ni
aduana. Los totales por copia son cálculos a partir de esas tarifas.

## Formato decidido

| | |
| --- | --- |
| **Tamaño** | Poker, 63.5 × 88.9 mm (2.5 × 3.5 in), vertical |
| **Archivo con sangrado** | 69.85 × 95.25 mm (2.75 × 3.75 in) = 825 × 1125 px a 300 dpi |
| **Sangrado** | 3.175 mm (1/8 in) por lado |
| **Zona segura** | Texto a 5 mm o más de la línea de corte |
| **Esquinas** | Las redondea la imprenta (radio aproximado de 3 mm); no se dibujan en el archivo |
| **Cartas** | 120 (110 preguntas + 10 en blanco) + hasta 6 extra |
| **Mazo** | Aproximadamente 64 × 89 × 38 mm, entre 230 y 240 g |

### Por qué poker

- Es el tamaño que ofrecen todos los proveedores revisados y el más barato por
  carta.
- Es el único con caja lista para 120 cartas en varios proveedores.
- Hay fundas y cartas en blanco del mismo tamaño para hacer prototipos.
- El área segura (aproximadamente 57 × 82 mm) alcanza para una pregunta corta en
  tipografía grande y para escribir a mano en las cartas en blanco.

«Poker» significa dos medidas casi iguales: 63.5 × 88.9 mm (el de Estados
Unidos) y 63 × 88 mm (el europeo). El archivo de este repositorio está armado
para la primera; como el texto queda a 5 mm del corte, el mismo arte sirve para
la segunda sin rediseñar. Hay que confirmar cuál usa el proveedor antes de
exportar.

### Las 6 cartas extra

The Game Crafter cobra por hojas de 18 cartas y MakePlayingCards por escalones
(108, 126, 144): 120 cartas se pagan como 126. Sobran 6 espacios para una carta
de reglas, una portada o más cartas en blanco.

## Reglas para el arte

- El fondo se extiende hasta el borde del archivo (sangrado); nada importante a
  menos de 5 mm del corte.
- Sin marcos delgados cerca del borde, sobre todo en el reverso: el corte puede
  moverse hasta 3 mm y un marco descentrado se nota.
- El reverso es igual en todas las cartas y aguanta girarse 180 grados.
- Color: no hay un estándar único. The Game Crafter solo acepta RGB;
  MakePlayingCards acepta RGB o CMYK; DriveThruCards exige PDF en CMYK con
  cobertura de tinta máxima de 240 %; Ludotipia pide CMYK con perfil Coated
  FOGRA39. Los archivos de este repositorio salen en RGB (lo que aceptan The
  Game Crafter y MakePlayingCards). Para un proveedor que exija CMYK hay que
  convertir el PDF con un programa de preprensa y pedir prueba de color.
- Los colores planos e intensos pueden variar entre impresiones; pedir siempre
  una copia de prueba antes de un tiraje.

## Cartas en blanco

Hay un choque real entre «resistente a la sobremesa» (carta recubierta) y «apta
para escribir» (carta sin recubrir). Ningún proveedor garantiza por escrito que
una pluma común no se corra.

- **Regla general:** el papel mate sin laminar acepta pluma; el barniz UV
  brillante y los laminados la repelen. El plumón permanente de punta fina es lo
  más confiable sobre casi cualquier acabado. Las plumas de gel son las que más
  se corren. La textura lino dificulta escribir.
- **Opción más respaldada:** The Game Crafter sin barniz UV (cartulina mate de
  12 pt). El barniz se aplica a todo el mazo, no carta por carta.
- **Salida práctica** si el mazo final lleva acabado protector: indicar en las
  reglas «usa plumón permanente de punta fina».
- **Antes de decidir el acabado:** comprar cartas en blanco y probar con las
  plumas reales. The Game Crafter las vende sueltas ($0.14 USD cada una de 1 a
  9); MakePlayingCards vende 54 cartas en blanco por $2.85 USD.

## Materiales

- Cartulina de 300 a 330 g/m² con núcleo (azul basta: aquí no hay información
  oculta que proteger a contraluz).
- Acabado mate protector si se prioriza la durabilidad; sin barniz si se
  prioriza poder escribir.
- Liso en lugar de lino: reproduce mejor los colores planos y el texto, y es
  mejor para escribir.
- Caja: estuche de cartulina (tuck box) para el prototipo; caja rígida de dos
  piezas para el tiraje, porque un estuche de casi 4 cm en cartulina delgada se
  maltrata con el uso.

## Ruta por etapas

### Etapa 1 · Prueba casera

Objetivo: probar las preguntas, no el acabado. Costo estimado sin verificar: de
5 a 20 USD.

1. Imprimir las hojas de prueba de este repositorio (9 cartas por hoja, con
   marcas de corte) al **100 %**, nunca «ajustar a la página». Las 120 cartas
   son 14 hojas.
2. Papel bond normal, en casa o en una papelería.
3. Cortar con guillotina o con regla metálica y cúter.
4. Meter cada papel en una funda transparente tamaño estándar (las de cartas
   coleccionables, de aproximadamente 66 × 91 mm) delante de un naipe viejo, que
   da rigidez y reverso uniforme. Se necesitan 120 fundas y unos 120 naipes.

Cambiar una pregunta es cambiar un papelito. Para algo más parecido al producto:
cartulina u opalina de 200 a 250 g/m² en un centro de copiado láser, solo el
frente, y un perforador de esquinas de 3 mm.

### Etapa 2 · Prototipo bajo demanda (1 a 3 copias)

| Proveedor | Por copia (USD) | Notas |
| --- | ---: | --- |
| The Game Crafter (EE. UU.), sin barniz UV | aprox. 31 con caja rígida; aprox. 28 con estuche | La mejor para comprobar que las cartas en blanco se pueden escribir. Pide PNG o JPG en RGB, una imagen por cara. El estuche es para 108 cartas: que quepan 120 es un cálculo, no una garantía. |
| DriveThruCards (EE. UU.) | 18.50 con estuche para 120, más 2.15 de manejo | La más barata. Exige un solo PDF en CMYK y cuenta de editor. Todas las cartas llevan recubrimiento satinado. |
| MakePlayingCards (Hong Kong / China) | 44.35 con estuche; 51.29 con caja rígida | Solo conviene si el tiraje final será con ellos y se quiere ver esa calidad exacta. |
| The Playing Card Factory (Canadá) | 59 CAD por 120 cartas, sin caja | Evita aduana si la entrega es en Canadá. Datos parciales: su sitio principal no se pudo consultar. |

Sugerencia: pedir The Game Crafter y DriveThruCards para comparar acabados y
escritura (aproximadamente 50 USD más dos envíos).

### Etapa 3 · Tiraje corto

| Proveedor | 100 copias (USD c/u) | 250 copias | 500 copias |
| --- | ---: | ---: | ---: |
| MakePlayingCards o BoardGamesMaker, con estuche | 14.70 | 12.05 | 8.60 |
| MakePlayingCards, con caja rígida | 16.63 | 13.07 | 9.42 |
| DriveThruCards, con estuche | aprox. 14.80 | | aprox. 12.95 |
| The Game Crafter, con caja rígida | aprox. 19.14 | | aprox. 16.51 |
| Ludotipia (España), 162 cartas sin caja | 10.53 EUR | | |

A partir de 500 copias entra una imprenta offset como PrintNinja (mínimo 500;
no se obtuvo cotización). En México no se encontró un servicio bajo demanda de 1
a 10 copias para juegos de cartas: Barajas.com.mx trabaja con mínimo de 100 e
imprime en PVC (no apto para pluma), y Falex Games trabaja por cotización.

### Antes de pagar cualquier tiraje

- Pedir siempre una copia de prueba al mismo proveedor.
- Sumar envío e impuestos de importación del país de entrega: pueden mover el
  costo real entre 20 % y 40 %. Si la entrega es en México, las fuentes
  consultadas indican una tasa de 33.5 % para paquetería desde países sin
  tratado (como China) y un trato distinto para Estados Unidos y Canadá; hay que
  verificarlo con el SAT o la paquetería.
- El mazo usa nombres de famosos solo como texto. No se revisó si eso choca con
  las políticas de algún proveedor; esto no es asesoría legal.

## Lo que no se verificó

- Ningún costo de envío real: todos los proveedores lo muestran solo al pagar.
- Que una pluma común no se corra sobre alguna de las cartulinas.
- El radio de esquina y el grosor exacto por proveedor (son estándares de la
  industria).
- El país de entrega: por eso no hay cálculo de envío ni de aduana.

## Fuentes

- The Game Crafter: <https://www.thegamecrafter.com/make/products/PokerDeck>,
  <https://www.thegamecrafter.com/make/pricing>,
  <https://www.thegamecrafter.com/make/products/SmallProBox>,
  <https://help.thegamecrafter.com/article/169-uv-coating>,
  <https://www.thegamecrafter.com/parts/blank-poker-card>
- MakePlayingCards: <https://www.makeplayingcards.com/design/custom-blank-card.html>,
  <https://www.makeplayingcards.com/faq-photo.aspx>,
  <https://www.makeplayingcards.com/pops/card-finish.html>
- BoardGamesMaker: <https://www.boardgamesmaker.com/print/custom-blank-card.html>
- DriveThruCards:
  <https://help.drivethrupartners.com/hc/en-us/articles/12780747991575-Printed-Card-Formats-Costs>,
  <https://help.drivethrupartners.com/hc/en-us/articles/12780748203543-Specifications-for-Print-Cards>,
  <https://help.drivethrupartners.com/hc/en-us/articles/12780801612439-Packaging-Tuckboxes-and-Deckboxes>
- Printer's Studio: <https://www.printerstudio.com/personalized/custom-playing-cards-gifts.html>
- Ludotipia: <https://www.tipia.es/product-page/baraja-tama%C3%B1o-p%C3%B3ker>,
  <https://www.tipia.es/plantillas>
- The Playing Card Factory: <https://shop.theplayingcardfactory.com/en/gamer-deck-120-240sides/>
- Barajas.com.mx: <https://www.barajas.com.mx/> · Falex Games: <https://falexgames.com/fabrica>
- PrintNinja: <https://printninja.com/card-stock/>,
  <https://printninja.com/board-game-quantity-minimums>
- Guía de prototipos de BGDF: <https://bgdf.com/how-to/easy-prototype-deck>
