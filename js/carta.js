// A o D · Componente carta
//
// Crea las cartas como elementos <article class="carta ..."> nuevos. Necesita
// css/tokens.css y css/carta.css. Lee window.MAZO (js/cartas.js) para el
// nombre, el descriptor, el lema y la edición: el nombre del juego no se
// escribe en ningún otro lugar.
//
//   Carta.frente(carta, categoria)  carta = {id, a, b, estado}; categoria = {id, codigo, nombre}
//   Carta.propia(carta)             dilema escrito en la app = {a, b}
//   Carta.enBlanco()                frente para escribir a mano
//   Carta.reverso()                 igual para todas
//   Carta.reglas()                  reglas resumidas
//   Carta.portada()                 logotipo, descriptor y edición
//   Carta.logotipo(opciones)        {variante: "marca" | "completo" | "icono", claro: bool}
//   Carta.nivel(a, b)               "t-corta" | "t-media" | "t-larga" | "t-mini"

(function () {
  "use strict";

  // Garabatos trazados a pulso (los mismos de la lámina). Se inyectan una sola
  // vez en el documento y las cartas los usan con <use href="#g-…">.
  var SIMBOLOS = '<symbol id="g-o" viewBox="0 0 100 100"><path d="M61 28.9C59.1 28 53.3 23.9 49.3 23.2C45.3 22.5 40.7 23 36.9 24.7C33.1 26.3 29.3 29.4 26.7 33C24.1 36.6 22 41.6 21.1 46.4C20.3 51.1 20.4 56.8 21.5 61.7C22.6 66.5 24.9 71.6 27.8 75.5C30.6 79.3 34.6 82.7 38.6 84.6C42.5 86.5 47.3 87.4 51.5 87C55.6 86.6 60.1 84.8 63.6 82.1C67.1 79.5 70.3 75.4 72.3 71.1C74.3 66.8 75.5 61.4 75.6 56.5C75.7 51.5 74.7 46 72.9 41.6C71.1 37.1 68.2 32.8 64.9 29.8C61.6 26.9 57.2 24.8 53.2 24C49.2 23.2 44.6 23.6 40.7 25C36.8 26.5 32.9 29.3 30 32.6C27.1 35.9 24.6 40.5 23.3 44.9C22 49.3 21.5 54.5 22 59C22.5 63.5 24.1 68.3 26.3 71.8C28.5 75.4 31.8 78.6 35.2 80.5C38.6 82.4 42.9 83.3 46.7 83.1C50.6 82.9 54.9 81.5 58.3 79.2C61.7 77 65.1 73.5 67.3 69.7C69.5 66 71.1 61.2 71.6 56.7C72.1 52.3 71.7 47.2 70.3 43.1C68.9 38.9 66.4 34.8 63.5 31.6C60.5 28.5 56.5 25.5 52.6 24C48.8 22.6 44.2 22 40.3 22.7C36.4 23.5 32.3 25.5 29.2 28.3C26.2 31.1 23.5 35.3 21.9 39.6C20.4 43.9 19.7 49.3 20.1 54.2C20.4 59 21.8 64.5 23.9 68.7C26 73 29.2 77.1 32.5 79.7C35.8 82.3 40 84.1 43.8 84.3C47.6 84.6 51.9 83.6 55.3 81.4C58.7 79.2 62.1 75.4 64.4 71.1C66.7 66.9 68.4 61.2 69 55.8C69.7 50.5 69.4 44.1 68.4 38.9C67.3 33.6 65.2 27.9 62.7 24.1C60.3 20.4 56.9 17.7 53.5 16.5C50.2 15.3 46.2 15.5 42.7 17C39.3 18.4 35.6 21.5 32.9 25.3C30.2 29 27.8 34.3 26.5 39.4C25.2 44.6 24.6 50.8 25 56.1C25.5 61.4 26.9 67.1 29 71.4C31.1 75.7 34.3 79.6 37.5 81.9C40.8 84.3 44.9 85.5 48.7 85.4C52.4 85.4 56.5 83.8 59.8 81.4C63.1 79 66.3 75 68.4 70.9C70.6 66.8 72.1 61.5 72.6 56.6C73.1 51.8 72.6 46.4 71.4 42C70.2 37.7 67.9 33.5 65.2 30.5C62.5 27.6 58.8 25.4 55.2 24.4C51.7 23.5 47.5 23.8 44 25.1C40.4 26.3 36.7 29 33.8 32.2C31 35.4 28.5 39.9 27 44.3C25.5 48.7 24.8 54 25 58.7C25.2 63.3 26.4 68.3 28.2 72.1C30 75.9 32.9 79.5 35.9 81.7C38.9 83.9 42.8 85.2 46.4 85.4C50 85.5 54 84.4 57.3 82.4C60.6 80.4 63.8 77.1 66.1 73.6C68.3 70 70 65.3 70.6 60.9C71.2 56.6 70.9 51.5 69.7 47.4C68.5 43.2 66.2 39.1 63.5 36C60.7 32.8 53.2 30.4 53 28.5C52.8 26.6 59 24.7 62 24.5C65 24.4 69.5 27 71 27.5"/></symbol><symbol id="g-tenedor" viewBox="0 0 100 100"><g transform="rotate(16 50 50)"><path d="M30.5 6.5C30.4 9 29.3 16.5 29.5 21.5C29.6 26.5 29.9 32.2 31.4 36.3C32.9 40.3 35.1 43.5 38.2 45.8C41.3 48.1 46.1 50.2 50.1 50.1C54.1 50.1 59 48 62.1 45.6C65.2 43.2 67.6 39.7 68.9 35.9C70.3 32 70 27.6 70.3 22.6C70.5 17.6 70.5 8.8 70.5 6.1"/><path d="M42.9 7.7Q42.7 21.1 42.4 34.4"/><path d="M56.8 6.9Q57 20.9 57.5 35"/><path d="M49.7 49.4C49.5 51.8 48.6 58.4 48.8 63.6C49 68.8 50.8 75.3 51 80.6C51.2 85.9 50.3 93.1 50.2 95.6"/></g></symbol><symbol id="g-avion" viewBox="0 0 100 100"><path d="M6.7 39.6Q50.8 24.2 94.9 8.7Q76.2 49.5 56.6 89.9Q49.8 74.4 44.4 58.3Q25.4 49.9 7.3 39.7"/><path d="M43.8 58.3Q69.4 34.7 94.3 10.2"/><path d="M37.7 75.8C36.4 77.9 33.7 86.5 30.1 88.2C26.6 90 19.3 88.7 16.4 86.4C13.4 84 11.5 77.2 12.6 74.1C13.7 71 20.3 67.4 23.2 68C26 68.7 29.9 73.7 29.7 78C29.4 82.2 25.6 90.6 21.6 93.4C17.5 96.3 8.1 94.8 5.4 95" stroke-dasharray="4.5 6"/></symbol><symbol id="g-burbujas" viewBox="0 0 100 100"><path d="M14.4 12.4C19.6 9.5 31.8 7.9 40 7.7C48.2 7.5 58.1 8.1 63.4 11.2C68.7 14.3 71.4 20.8 72 26.3C72.5 31.8 71.2 40.6 66.8 44.3C62.5 48 51.7 47.8 45.7 48.4C39.8 49 35.7 45.9 31.3 47.9C26.8 49.9 20.7 60.4 19 60.2C17.4 60.1 22.9 50.3 21.6 47.1C20.4 43.8 13.6 44.4 11.4 40.7C9.2 37.1 7.9 29.9 8.4 25.2C8.9 20.5 9.1 15.3 14.4 12.4Z"/><path d="M27 28h.2M40 28h.2M53 28h.2" stroke-width="6.5"/><path d="M46.4 57.8C50.4 55.8 57 54.5 63.5 54.4C70 54.2 80.5 54.6 85.4 56.9C90.2 59.3 91.9 64.3 92.5 68.6C93.1 72.9 91.2 79.8 89.2 82.7C87.2 85.7 81.6 83.7 80.5 86.1C79.5 88.5 84.6 96.8 82.6 97.2C80.7 97.6 73.9 90.2 68.8 88.5C63.8 86.8 57.1 88.6 52.5 87C47.9 85.5 43.4 82.6 41.2 79.2C39 75.8 38.5 70.1 39.4 66.6C40.2 63 42.4 59.8 46.4 57.8Z"/><path d="M52.4 66.8Q66.3 66.4 80.1 65.8"/><path d="M52.5 76.5Q61.8 76.3 71 75.5"/></symbol><symbol id="g-estrella" viewBox="0 0 100 100"><path d="M49.6 6.7Q62.4 49.3 73.4 92.3Q40 63.6 5.3 36.6Q50 34.3 94.8 34.5Q61.6 64.4 27.2 92.9Q38.1 47.6 51.9 3"/></symbol><symbol id="g-bifurcacion" viewBox="0 0 100 100"><path d="M50.1 95.9C50.1 92.9 50.2 83.3 50.1 77.7C50 72.1 51 67.7 49.3 62.3C47.7 57 44 50.7 40.2 45.7C36.3 40.6 30.4 36.7 26 31.8C21.6 27 15.8 19 13.7 16.5"/><path d="M49.5 63.5C51 61 54.6 53.1 58.4 48.1C62.1 43.1 67.2 38.8 71.9 33.8C76.5 28.8 83.8 20.6 86.2 18"/><path d="M16.1 33.1Q15.1 24.6 13.7 16.2Q22.3 18.6 30.4 22.4"/><path d="M69.6 23.7Q77.9 20.5 86.4 17.8Q85 26.6 83.9 35.3"/></symbol><symbol id="g-mosca" viewBox="0 0 100 100"><path d="M4 93.1C5.3 90.7 8.5 81.8 12.1 78.7C15.7 75.7 22.3 73.8 25.6 74.9C28.9 76 32.1 82.2 31.8 85.2C31.6 88.3 26.8 93.1 24.2 93.1C21.5 93.1 16.5 89.2 16 85.1C15.6 81.1 18.6 73.1 21.7 69C24.8 64.8 30.9 62.8 34.7 60.3C38.6 57.9 43 55.3 44.6 54.3" stroke-dasharray="0.1 6.5"/><path d="M68.7 49.3C68.5 48.8 68.4 46.9 67.6 45.8C66.8 44.8 65.5 43.9 64.1 43.3C62.6 42.7 60.7 42.3 59.1 42.3C57.4 42.3 55.4 42.6 53.9 43.1C52.4 43.7 51 44.6 50.1 45.5C49.2 46.4 48.6 47.6 48.6 48.7C48.5 49.7 49 50.9 49.9 51.8C50.7 52.7 52.1 53.5 53.7 53.9C55.2 54.3 57.2 54.5 59 54.4C60.7 54.3 62.8 53.9 64.3 53.2C65.9 52.6 67.4 51.6 68.3 50.6C69.2 49.7 69.7 48.4 69.7 47.4C69.7 46.4 69.2 45.4 68.3 44.6C67.4 43.8 65.9 43.1 64.4 42.7C62.9 42.2 60.9 42 59.1 42.1C57.4 42.2 55.4 42.6 53.9 43.1C52.4 43.7 51 44.6 50.2 45.5C49.4 46.4 48.9 47.6 49 48.6C49.1 49.7 49.8 50.8 50.8 51.7C51.8 52.6 53.4 53.5 55.1 54.1C56.7 54.6 58.9 55 60.8 55C62.7 55.1 64.9 54.8 66.5 54.4C68.2 53.9 69.8 53.1 70.9 52.3C71.9 51.4 72.6 50.3 72.7 49.3C72.7 48.2 72 47 71.1 46C70.1 45.1 68.5 44.2 66.9 43.6C65.2 43 63.1 42.6 61.1 42.6C59.2 42.5 57 42.8 55.3 43.2C53.6 43.7 52 44.6 51 45.5C49.9 46.4 49.2 47.6 49.1 48.7C49 49.8 49.4 51 50.2 52C51 53 52.5 53.9 54 54.6C55.5 55.2 57.5 55.6 59.3 55.7C61 55.8 63.1 55.6 64.6 55.1C66.2 54.7 67.7 53.9 68.6 53C69.5 52.1 70 51 70 49.8C70.1 48.7 69.7 47.4 68.8 46.3C68 45.3 65.6 44 64.9 43.6"/><path d="M77 48.5C76.9 48.1 76.9 46.7 76.5 46C76.1 45.3 75.3 44.6 74.6 44.3C73.9 44 73 43.9 72.3 44.1C71.6 44.3 70.8 44.8 70.3 45.4C69.9 46 69.6 46.9 69.6 47.7C69.5 48.4 69.8 49.4 70.2 50C70.6 50.7 71.3 51.3 72 51.5C72.7 51.8 73.6 51.8 74.3 51.6C75 51.3 75.8 50.7 76.2 50.1C76.7 49.4 77 48.4 77 47.6C77 46.8 76.8 45.9 76.4 45.3C76 44.6 75.3 44.1 74.7 43.8C74 43.6 73.1 43.6 72.5 43.8C71.8 44.1 71.1 44.6 70.6 45.2C70.2 45.8 69.9 46.7 69.9 47.4C69.9 48.2 70.1 49 70.5 49.6C70.9 50.2 71.6 50.7 72.3 50.9C72.9 51.1 73.8 51.1 74.5 50.9C75.1 50.7 75.9 50.2 76.3 49.6C76.7 49.1 77 48.3 77 47.6C77 47 76.7 46.2 76.3 45.7C75.9 45.1 74.8 44.6 74.6 44.4"/><path d="M55.6 43.2C54 41.1 47.5 35.2 45.8 30.9C44.1 26.6 44.2 20.1 45.3 17.5C46.5 14.9 50.1 13.9 52.6 15.4C55 16.9 58.7 22.1 60 26.6C61.3 31.1 60.4 39.8 60.5 42.4"/><path d="M61.6 41.9C62.3 39.2 63.2 30.2 65.6 25.8C68.1 21.4 73 16.5 76.1 15.7C79.2 14.8 83.8 17.8 84.2 20.6C84.6 23.3 81.9 28.6 78.7 32.3C75.5 36 67.2 41.2 64.9 42.9"/><path d="M54.1 55Q51.8 58.6 49.9 62.4"/><path d="M60.6 56.6Q60.5 60.7 60.2 64.8"/><path d="M66.2 55.2Q68 58.9 69.5 62.7"/></symbol><symbol id="g-pluma" viewBox="0 0 100 100"><path d="M22.4 70.2Q48.2 44.2 74.3 18.4Q79.4 24.9 85.8 30.1Q60.6 56.8 34.4 82.4Q28 76.2 22.1 69.7"/><path d="M22.4 70Q16.2 81.5 9.8 92.9Q22.1 87.5 34.3 81.9"/><path d="M65.2 27Q71.4 32.6 76.7 39"/><path d="M80.7 22.8Q86.8 27.8 92.2 33.8Q79.7 47.3 66.2 59.7"/></symbol><symbol id="g-circulo" viewBox="0 0 100 100"><path d="M60.7 10.7C58.2 10.5 50.5 8.9 45.6 9.5C40.6 10.1 35.4 11.8 31.1 14.3C26.7 16.8 22.5 20.3 19.4 24.3C16.2 28.3 13.7 33.2 12.2 38.1C10.7 42.9 10.2 48.5 10.6 53.6C11 58.6 12.6 64 14.8 68.5C17.1 73 20.5 77.3 24.2 80.6C28 83.9 32.7 86.7 37.4 88.3C42.2 89.9 47.5 90.6 52.5 90.3C57.4 90 62.7 88.6 67.1 86.5C71.6 84.3 75.9 81 79.3 77.4C82.6 73.7 85.3 69 87 64.4C88.7 59.7 89.5 54.4 89.3 49.5C89.1 44.5 87.8 39.3 85.7 34.9C83.6 30.4 80.5 26.1 76.9 22.8C73.3 19.4 68.7 16.7 64 14.9C59.4 13.2 53.9 12.2 48.8 12.3C43.8 12.4 36.2 15 33.7 15.5"/></symbol><symbol id="g-circulo2" viewBox="0 0 100 100"><path d="M32.3 15.1C30.2 16.5 23 20.1 19.4 23.5C15.8 27 12.8 31.4 10.9 35.8C9 40.3 7.9 45.4 8 50.2C8.1 54.9 9.3 60 11.4 64.4C13.4 68.8 16.7 73.2 20.4 76.5C24.2 79.9 29 82.8 33.8 84.6C38.7 86.4 44.4 87.5 49.7 87.5C54.9 87.5 60.6 86.5 65.5 84.6C70.4 82.8 75.2 79.9 78.9 76.5C82.6 73.2 85.9 68.8 87.9 64.4C89.9 60 91.1 54.8 91.1 50C91.1 45.2 90 40.1 88 35.6C85.9 31.2 82.7 26.8 79 23.4C75.2 20.1 70.3 17.1 65.4 15.3C60.5 13.5 54.7 12.6 49.4 12.6C44 12.7 38.2 13.9 33.2 15.8C28.3 17.8 23.4 20.8 19.6 24.4C15.9 27.9 12.7 32.4 10.7 37C8.7 41.6 8.2 49.3 7.7 51.7"/></symbol><symbol id="g-ovalo" viewBox="0 0 200 60"><path d="M79.8 5.1C75.9 5.5 63.6 6.4 56.2 7.4C48.8 8.4 41.6 9.8 35.3 11.3C29.1 12.8 23.3 14.5 18.6 16.4C14 18.2 10 20.3 7.3 22.4C4.5 24.5 2.7 26.8 2 28.9C1.3 31.1 1.7 33.4 3.2 35.5C4.6 37.7 7.2 39.8 10.7 41.8C14.2 43.7 18.9 45.6 24.2 47.2C29.5 48.9 35.8 50.3 42.6 51.5C49.3 52.7 56.9 53.7 64.7 54.4C72.4 55.1 80.8 55.6 89 55.7C97.2 55.9 105.8 55.8 113.9 55.4C122 55 130.2 54.3 137.6 53.3C145.1 52.4 152.4 51.2 158.7 49.8C165 48.4 170.8 46.8 175.5 45C180.3 43.3 184.2 41.3 187.1 39.3C189.9 37.3 191.8 35.1 192.5 33C193.3 30.9 192.9 28.7 191.5 26.6C190.1 24.5 187.6 22.4 184.1 20.5C180.7 18.5 176.1 16.7 170.8 15C165.6 13.4 159.3 11.9 152.6 10.6C145.9 9.4 138.3 8.3 130.6 7.6C122.9 6.8 114.6 6.3 106.4 6.1C98.2 5.8 89.7 5.9 81.6 6.2C73.5 6.5 65.4 7.1 58 7.9C50.6 8.7 40.7 10.6 37.2 11.1" stroke-width="1.7"/></symbol><symbol id="g-raya2" viewBox="0 0 200 18"><path d="M3 5.6C4.3 5.7 8.4 6.4 11 6.4C13.7 6.4 16.4 5.9 19.1 5.7C21.8 5.5 24.4 5.4 27.1 5.1C29.8 4.9 32.5 4.5 35.2 4.3C37.8 4.1 40.5 3.9 43.2 3.8C45.9 3.6 48.6 3.4 51.2 3.5C53.9 3.6 56.6 4.2 59.3 4.5C62 4.8 64.7 5.2 67.3 5.4C70 5.6 72.7 5.8 75.4 5.8C78.1 5.8 80.7 5.7 83.4 5.6C86.1 5.4 88.8 5 91.5 4.8C94.1 4.5 96.8 4.2 99.5 3.9C102.2 3.6 104.9 3.1 107.5 3.1C110.2 3 112.9 3.4 115.6 3.6C118.3 3.8 120.9 4 123.6 4.2C126.3 4.4 129 4.7 131.7 4.8C134.3 5 137 5.3 139.7 5.3C142.4 5.4 145.1 5.3 147.8 5.2C150.4 5.1 153.1 4.8 155.8 4.5C158.5 4.2 161.2 3.7 163.8 3.5C166.5 3.3 169.2 3.2 171.9 3.2C174.6 3.1 177.2 3.1 179.9 3.2C182.6 3.3 185.3 3.5 188 3.8C190.6 4 194.7 4.4 196 4.5" stroke-width="2.2"/><path d="M188 12.7C186.4 12.8 181.7 13.2 178.5 13.3C175.3 13.4 172.2 13.3 169 13.2C165.8 13 162.7 12.7 159.5 12.4C156.3 12.2 153.2 11.8 150 11.6C146.8 11.3 143.7 11 140.5 11C137.3 11 134.2 11.5 131 11.7C127.8 11.9 124.7 12 121.5 12.2C118.3 12.5 115.2 13 112 13.3C108.8 13.5 105.7 13.6 102.5 13.7C99.3 13.8 96.2 13.9 93 13.7C89.8 13.6 86.7 13.1 83.5 12.9C80.3 12.6 77.2 12.3 74 12.1C70.8 12 67.7 11.9 64.5 11.9C61.3 11.8 58.2 11.8 55 11.9C51.8 12.1 48.7 12.5 45.5 12.7C42.3 13 37.6 13.3 36 13.5" stroke-width="2.2"/></symbol><symbol id="g-renglones-1" viewBox="0 0 82 32"><path d="M0 20.4C0.9 20.4 3.4 20.5 5.1 20.5C6.8 20.5 8.5 20.5 10.2 20.4C12 20.4 13.7 20.4 15.4 20.3C17.1 20.3 18.8 20.2 20.5 20.1C22.2 20.1 23.9 20 25.6 20C27.3 20 29 20 30.8 20C32.5 20 34.2 20.1 35.9 20.2C37.6 20.2 39.3 20.3 41 20.4C42.7 20.4 44.4 20.4 46.1 20.4C47.8 20.4 49.5 20.4 51.2 20.4C53 20.3 54.7 20.3 56.4 20.2C58.1 20.1 59.8 20.1 61.5 20C63.2 20 64.9 20 66.6 19.9C68.3 19.9 70 19.9 71.8 19.9C73.5 19.9 75.2 20 76.9 20.1C78.6 20.1 81.1 20.2 82 20.3" stroke-width=".36" transform="translate(0 -10.4)"/><path d="M0 20.4C0.9 20.4 3.4 20.5 5.1 20.5C6.8 20.5 8.5 20.5 10.2 20.4C12 20.4 13.7 20.4 15.4 20.3C17.1 20.3 18.8 20.2 20.5 20.1C22.2 20.1 23.9 20 25.6 20C27.3 20 29 20 30.8 20C32.5 20.1 34.2 20.1 35.9 20.2C37.6 20.2 39.3 20.3 41 20.3C42.7 20.4 44.4 20.4 46.1 20.4C47.8 20.4 49.5 20.4 51.2 20.4C53 20.3 54.7 20.3 56.4 20.2C58.1 20.1 59.8 20.1 61.5 20C63.2 20 64.9 19.9 66.6 19.9C68.3 19.9 70 19.9 71.8 20C73.5 20 75.2 20 76.9 20.1C78.6 20.1 81.1 20.2 82 20.2" stroke-width=".36"/><path d="M0 30.7C0.9 30.7 3.4 30.8 5.1 30.8C6.8 30.8 8.5 30.8 10.2 30.8C12 30.8 13.7 30.7 15.4 30.7C17.1 30.6 18.8 30.6 20.5 30.5C22.2 30.5 23.9 30.4 25.6 30.4C27.3 30.4 29 30.4 30.8 30.5C32.5 30.5 34.2 30.6 35.9 30.7C37.6 30.7 39.3 30.8 41 30.8C42.7 30.9 44.4 30.9 46.1 30.9C47.8 30.9 49.5 30.9 51.2 30.9C53 30.9 54.7 30.8 56.4 30.8C58.1 30.7 59.8 30.7 61.5 30.7C63.2 30.6 64.9 30.6 66.6 30.6C68.3 30.6 70 30.6 71.8 30.6C73.5 30.6 75.2 30.7 76.9 30.7C78.6 30.8 81.1 30.9 82 30.9" stroke-width=".36"/></symbol><symbol id="g-renglones-2" viewBox="0 0 82 32"><path d="M0 30.7C0.9 30.7 3.4 30.8 5.1 30.8C6.8 30.8 8.5 30.8 10.2 30.8C12 30.8 13.7 30.7 15.4 30.7C17.1 30.6 18.8 30.6 20.5 30.5C22.2 30.5 23.9 30.4 25.6 30.4C27.3 30.4 29 30.4 30.8 30.5C32.5 30.5 34.2 30.6 35.9 30.7C37.6 30.7 39.3 30.8 41 30.8C42.7 30.9 44.4 30.9 46.1 30.9C47.8 30.9 49.5 30.9 51.2 30.9C53 30.9 54.7 30.8 56.4 30.8C58.1 30.7 59.8 30.7 61.5 30.7C63.2 30.6 64.9 30.6 66.6 30.6C68.3 30.6 70 30.6 71.8 30.6C73.5 30.6 75.2 30.7 76.9 30.7C78.6 30.8 81.1 30.9 82 30.9" stroke-width=".36" transform="translate(0 -20.6)"/><path d="M0 20.4C0.9 20.4 3.4 20.5 5.1 20.5C6.8 20.5 8.5 20.5 10.2 20.4C12 20.4 13.7 20.4 15.4 20.3C17.1 20.3 18.8 20.2 20.5 20.1C22.2 20.1 23.9 20 25.6 20C27.3 20 29 20 30.8 20C32.5 20 34.2 20.1 35.9 20.2C37.6 20.2 39.3 20.3 41 20.4C42.7 20.4 44.4 20.4 46.1 20.4C47.8 20.4 49.5 20.4 51.2 20.4C53 20.3 54.7 20.3 56.4 20.2C58.1 20.1 59.8 20.1 61.5 20C63.2 20 64.9 20 66.6 19.9C68.3 19.9 70 19.9 71.8 19.9C73.5 19.9 75.2 20 76.9 20.1C78.6 20.1 81.1 20.2 82 20.3" stroke-width=".36"/><path d="M0 30.8C0.8 30.8 3 30.8 4.6 30.8C6.1 30.8 7.6 30.8 9.1 30.8C10.6 30.8 12.2 30.7 13.7 30.7C15.2 30.6 16.7 30.5 18.2 30.5C19.8 30.5 21.3 30.5 22.8 30.5C24.3 30.4 25.9 30.4 27.4 30.5C28.9 30.5 30.4 30.6 31.9 30.7C33.5 30.7 35 30.8 36.5 30.9C38 30.9 39.5 30.9 41.1 30.9C42.6 30.9 44.1 30.9 45.6 30.9C47.1 30.9 48.7 30.8 50.2 30.8C51.7 30.7 53.2 30.6 54.8 30.6C56.3 30.6 57.8 30.6 59.3 30.6C60.8 30.6 62.4 30.6 63.9 30.6C65.4 30.6 66.9 30.7 68.4 30.8C70 30.8 72.2 30.9 73 30.9" stroke-width=".36"/></symbol>';

  var GARABATOS = {
    comida: "g-tenedor",
    destinos: "g-avion",
    familia: "g-burbujas",
    celebrities: "g-estrella",
    dilemas: "g-bifurcacion",
    asco: "g-mosca"
  };

  var REGLAS = [
    "Alguien saca una carta y lee: <span class=\"reglas__nowrap\">«¿Qué prefieres…?»</span>",
    "Cada quien elige una de las dos opciones.",
    "No se vale responder «las dos» ni «ninguna». " + subraya("Hay que elegir."),
    "Explicar no es obligatorio, pero cualquiera puede preguntar " +
      "<span class=\"reglas__nowrap\">«<span class=\"reglas__marca\">¿POR QUÉ?" + trazo("g-ovalo", "none") + "</span>»</span> y ahí empieza la discusión.",
    "Siguiente carta."
  ];

  function mazo() {
    return window.MAZO || {};
  }

  function asegurarSimbolos() {
    if (document.getElementById("carta-simbolos")) return;
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("id", "carta-simbolos");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.style.position = "absolute";
    svg.style.overflow = "hidden";
    svg.innerHTML = "<defs>" + SIMBOLOS + "</defs>";
    (document.body || document.documentElement).appendChild(svg);
  }

  function esc(texto) {
    return String(texto == null ? "" : texto)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function limpio(texto) {
    return String(texto == null ? "" : texto).replace(/\s+/g, " ").trim();
  }

  function trazo(id, aspecto, clase) {
    return "<svg class=\"trazo" + (clase ? " " + clase : "") + "\" aria-hidden=\"true\" focusable=\"false\"" +
      (aspecto ? " preserveAspectRatio=\"" + aspecto + "\"" : "") +
      "><use href=\"#" + id + "\"/></svg>";
  }

  function subraya(texto) {
    return "<span class=\"reglas__subraya\">" + texto + trazo("g-raya2", "none") + "</span>";
  }

  function crear(html) {
    asegurarSimbolos();
    var plantilla = document.createElement("template");
    plantilla.innerHTML = html.trim();
    return plantilla.content.firstElementChild;
  }

  function papel(extra) {
    return "<div class=\"carta__papel\" aria-hidden=\"true\">" + (extra || "") + "</div>";
  }

  function codigo(id) {
    return esc(String(id || "").replace(/-/g, "·"));
  }

  // Niveles de letra. Deben coincidir con css/carta.css: t es --t en cqw y
  // o es --o. «hasta» es el largo máximo (en caracteres) que se prefiere
  // para ese nivel; si el texto no cabe, se baja al siguiente.
  var NIVELES = [
    { clase: "t-corta", t: 17, o: 23, hasta: 14 },
    { clase: "t-media", t: 10.6, o: 22, hasta: 34 },
    { clase: "t-larga", t: 7.7, o: 17, hasta: Infinity },
    { clase: "t-mini", t: 6, o: 13, hasta: Infinity }
  ];

  // Ancho aproximado de cada letra en unidades de --t: el mayor entre
  // Mansalva (A, a .95t) y Covered By Your Grace (B, a 1.14t), medidos con
  // las fuentes reales. Sirve para no elegir un nivel en el que no cabe.
  var ANCHOS = [
    [.25, "i.;'"], [.3, "l:¡"], [.35, "jí,!)"], [.46, " fkyáÍ13¿(/"],
    [.5, "abcdghnoprstuvxóú9?"], [.55, "eéL068"], [.6, "qüJYÓ247-"],
    [.65, "wñBFSÉÑ…"], [.7, "mACGIKNPQÁÚ5"], [.75, "DHUVX»"], [.8, "EOT"],
    [.85, "zWZ"], [.9, "R"], [.95, "M«"]
  ];
  var ANCHO = {};
  ANCHOS.forEach(function (par) {
    par[1].split("").forEach(function (letra) { ANCHO[letra] = par[0]; });
  });

  var ANCHO_UTIL = 77;   // cqw: 82 de la cara menos 5 de sangría de cada opción
  var ALTO_UTIL = 99.7;  // cqw: lo que queda para A, «o» y B

  function ancho(palabra) {
    var total = 0;
    for (var i = 0; i < palabra.length; i++) total += ANCHO[palabra[i]] || .7;
    return total;
  }

  // Renglones que ocupará el texto con corte voraz por palabras, o Infinity
  // si alguna palabra no cabe sola en un renglón.
  function renglones(texto, capacidad) {
    var palabras = texto ? texto.split(" ") : [""];
    var lineas = 1;
    var actual = 0;
    for (var i = 0; i < palabras.length; i++) {
      var w = ancho(palabras[i]);
      if (w > capacidad) return Infinity;
      if (actual === 0) { actual = w; continue; }
      if (actual + ANCHO[" "] + w <= capacidad) { actual += ANCHO[" "] + w; }
      else { lineas++; actual = w; }
    }
    return lineas;
  }

  function cabe(n, a, b) {
    var capacidad = ANCHO_UTIL / n.t * .99;
    var la = renglones(a, capacidad);
    var lb = renglones(b + "?", capacidad);
    var alto = la * .95 * 1.04 * n.t + lb * 1.14 * n.t + n.o + 1.2 + .15 * n.t;
    return alto <= ALTO_UTIL;
  }

  // Se prefiere el nivel según la opción más larga (como en la lámina) y se
  // baja mientras el texto no quepa a lo ancho o a lo alto.
  function nivel(a, b) {
    a = limpio(a);
    b = limpio(b);
    var largo = Math.max(a.length, b.length);
    for (var i = 0; i < NIVELES.length; i++) {
      if (largo <= NIVELES[i].hasta && cabe(NIVELES[i], a, b)) return NIVELES[i].clase;
    }
    return NIVELES[NIVELES.length - 1].clase;
  }

  function frase(a, b) {
    return "¿Qué prefieres: " + esc(limpio(a)) + " o " + esc(limpio(b)) + "?";
  }

  function caraDilema(a, b, garabato, pieIzq, pieDer) {
    return "<div class=\"carta__cara\" aria-hidden=\"true\">" +
      "<p class=\"carta__arranque\">¿Qué prefieres…</p>" +
      trazo(garabato, "", "carta__garabato") +
      "<div class=\"carta__dilema\">" +
        "<p class=\"carta__opcion carta__opcion--a\">" + esc(limpio(a)) + "</p>" +
        trazo("g-o", "", "carta__o") +
        "<p class=\"carta__opcion carta__opcion--b\">" + esc(limpio(b)) + "<span class=\"carta__cierre\">?</span></p>" +
      "</div>" +
      "<p class=\"carta__pie\"><span class=\"carta__categoria\">" + pieIzq + "</span>" +
        "<span class=\"carta__codigo\">" + pieDer + "</span></p>" +
    "</div>";
  }

  function frente(carta, categoria) {
    carta = carta || {};
    categoria = categoria || {};
    var id = String(categoria.id || "").replace(/[^a-z0-9-]/gi, "");
    var garabato = GARABATOS[id] || "g-pluma";
    return crear(
      "<article class=\"carta carta--frente carta--" + id + " " + nivel(carta.a, carta.b) + "\"" +
        " lang=\"es\" data-id=\"" + esc(carta.id) + "\" data-categoria=\"" + esc(id) + "\"" +
        (carta.estado ? " data-estado=\"" + esc(carta.estado) + "\"" : "") + ">" +
        papel() +
        "<p class=\"carta__frase\">" + frase(carta.a, carta.b) + "</p>" +
        caraDilema(carta.a, carta.b, garabato, esc(categoria.nombre), codigo(carta.id)) +
      "</article>"
    );
  }

  function propia(carta) {
    carta = carta || {};
    return crear(
      "<article class=\"carta carta--frente carta--propia " + nivel(carta.a, carta.b) + "\" lang=\"es\" data-categoria=\"propia\">" +
        papel() +
        "<p class=\"carta__frase\">" + frase(carta.a, carta.b) + " Dilema propio.</p>" +
        caraDilema(carta.a, carta.b, "g-pluma", "Dilema propio", "TÚ") +
      "</article>"
    );
  }

  function enBlanco() {
    return crear(
      "<article class=\"carta carta--blanco\" lang=\"es\" data-categoria=\"blanco\">" +
        papel() +
        "<p class=\"carta__frase\">Carta en blanco: ¿Qué prefieres…? Escribe las dos opciones. No se vale ponerlo fácil.</p>" +
        "<div class=\"carta__cara\" aria-hidden=\"true\">" +
          "<p class=\"carta__arranque\">¿Qué prefieres…</p>" +
          trazo("g-pluma", "", "carta__garabato") +
          "<div class=\"carta__dilema\">" +
            "<div class=\"carta__renglones carta__renglones--a\">" + trazo("g-renglones-1", "none") + "</div>" +
            trazo("g-o", "", "carta__o") +
            "<div class=\"carta__renglones carta__renglones--b\">" + trazo("g-renglones-2", "none") +
              "<span class=\"carta__cierre\">?</span></div>" +
          "</div>" +
          "<p class=\"carta__regla\">No se vale ponerlo fácil.</p>" +
          "<p class=\"carta__pie\"><span class=\"carta__categoria\">Tus propios dilemas</span>" +
            "<span class=\"carta__codigo\">TÚ·<i></i></span></p>" +
        "</div>" +
      "</article>"
    );
  }

  function marcaHTML(claro) {
    var nombre = limpio(mazo().nombre || "A o D");
    var partes = nombre.split(/\s+o\s+/);
    var dentro = partes.length === 2
      ? "<span class=\"logo__a\">" + esc(partes[0]) + "</span>" + trazo("g-o", "", "logo__o") +
        "<span class=\"logo__d\">" + esc(partes[1]) + "</span>"
      : "<span class=\"logo__a\">" + esc(nombre) + "</span>";
    return "<div class=\"logo__marca\" role=\"img\" aria-label=\"" + esc(nombre) + "\">" + dentro + "</div>";
  }

  function logotipoHTML(opciones) {
    opciones = opciones || {};
    var variante = opciones.variante || "marca";
    var nombre = esc(limpio(mazo().nombre || "A o D"));
    if (variante === "icono") {
      return "<div class=\"logo logo--icono\" role=\"img\" aria-label=\"" + nombre + "\">" + trazo("g-o") + "</div>";
    }
    var clases = "logo logo--" + variante + (opciones.claro ? " logo--claro" : "");
    var html = "<div class=\"" + clases + "\">" + marcaHTML();
    if (variante === "completo") {
      html += "<p class=\"logo__descriptor\">" + esc(mazo().descriptor) + "</p>" +
        "<p class=\"logo__lema\">" + esc(mazo().lema) + trazo("g-raya2", "none") + "</p>";
    }
    return html + "</div>";
  }

  function logotipo(opciones) {
    return crear(logotipoHTML(opciones));
  }

  function reverso() {
    var nombre = esc(limpio(mazo().nombre || "A o D"));
    return crear(
      "<article class=\"carta carta--reverso\" lang=\"es\">" +
        papel("<div class=\"carta__trama\"></div>") +
        "<p class=\"carta__frase\">Reverso de " + nombre + "</p>" +
        "<div class=\"carta__cara\" aria-hidden=\"true\">" +
          "<div class=\"reverso__logo reverso__logo--arriba\">" + logotipoHTML({ claro: true }) + "</div>" +
          "<div class=\"reverso__logo reverso__logo--abajo\">" + logotipoHTML({ claro: true }) + "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function edicion() {
    return "Edición " + esc(mazo().edicion || "");
  }

  function reglas() {
    var items = REGLAS.map(function (texto, i) {
      return "<li><span class=\"reglas__num\" aria-hidden=\"true\">" +
        trazo(i % 2 ? "g-circulo2" : "g-circulo") + (i + 1) + "</span><span>" + texto + "</span></li>";
    }).join("");
    return crear(
      "<article class=\"carta carta--reglas\" lang=\"es\">" +
        papel() +
        "<div class=\"carta__cara\">" +
          "<h2 class=\"reglas__titulo\">Cómo se juega</h2>" +
          "<ol class=\"reglas__lista\">" + items + "</ol>" +
          "<p class=\"reglas__cierre\">Sin puntos, sin ganadores, sin reglas complicadas.</p>" +
          "<p class=\"carta__pie\" aria-hidden=\"true\"><span class=\"carta__categoria\">Reglas</span>" +
            "<span class=\"carta__codigo\">" + edicion() + "</span></p>" +
        "</div>" +
      "</article>"
    );
  }

  function portada() {
    var m = mazo();
    var preguntas = (m.categorias || []).reduce(function (n, c) { return n + (c.cartas || []).length; }, 0);
    var giros = ["-6deg", "4deg", "-2deg", "7deg", "-5deg", "3deg"];
    var papeles = Object.keys(GARABATOS).map(function (id, i) {
      return "<i style=\"--c: var(--papel-" + id + "); --r: " + giros[i] + "\"></i>";
    }).join("");
    return crear(
      "<article class=\"carta carta--portada\" lang=\"es\">" +
        papel() +
        "<div class=\"carta__cara\">" +
          "<div class=\"portada__logo\">" + logotipoHTML({ variante: "completo" }) + "</div>" +
          "<div class=\"portada__papeles\" aria-hidden=\"true\">" + papeles + "</div>" +
          "<p class=\"carta__pie\"><span class=\"carta__categoria\">" + edicion() + "</span>" +
            "<span class=\"carta__codigo\">" + preguntas + " dilemas</span></p>" +
        "</div>" +
      "</article>"
    );
  }

  window.Carta = {
    frente: frente,
    propia: propia,
    enBlanco: enBlanco,
    reverso: reverso,
    reglas: reglas,
    portada: portada,
    logotipo: logotipo,
    nivel: nivel
  };
})();
