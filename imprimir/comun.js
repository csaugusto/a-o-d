// A o D · Lo que comparten las hojas de impresión
//
// Necesita js/cartas.js y js/carta.js.
//
//   Impresion.parametros()      URLSearchParams de la página
//   Impresion.mazo()            frentes en el orden impreso: portada, reglas,
//                               preguntas por categoría y cartas en blanco
//   Impresion.crear(clave)      una carta por su clave: "portada", "reglas",
//                               "reverso", "blanco" o el id de una pregunta
//   Impresion.tamanoPagina(w, h)  fija @page; ?pagina=ANCHOxALTO (pulgadas) lo
//                               reemplaza, para compensar el redondeo de Chrome
//   Impresion.fuentes()         promesa: espera las tres familias y dice cuáles cargaron
//   Impresion.prepararParaPdf() promesa: cambia grano y trama por equivalentes
//                               que Chrome escribe bien en PDF (ver abajo)
//   Impresion.zonaSegura(carta) distancia mínima (mm) de la tinta al corte
//   Impresion.informe(datos)    con ?revisar=si deja el resultado en <pre id="informe">

(function () {
  "use strict";

  var ANCHO_CARTA_MM = 63.5;
  var FAMILIAS = ["Mansalva", "Covered By Your Grace", "Archivo"];

  function parametros() {
    return new URLSearchParams(location.search);
  }

  function mazo() {
    var M = window.MAZO;
    var lista = [{ clave: "portada" }, { clave: "reglas" }];
    M.categorias.forEach(function (cat) {
      cat.cartas.forEach(function (c) { lista.push({ clave: c.id }); });
    });
    for (var i = 0; i < (M.cartasEnBlanco || 0); i++) lista.push({ clave: "blanco" });
    return lista;
  }

  function crear(clave) {
    if (clave === "portada") return Carta.portada();
    if (clave === "reglas") return Carta.reglas();
    if (clave === "reverso") return Carta.reverso();
    if (clave === "blanco") return Carta.enBlanco();
    var hallada = null;
    window.MAZO.categorias.some(function (cat) {
      return cat.cartas.some(function (c) {
        if (c.id === clave) hallada = Carta.frente(c, cat);
        return hallada;
      });
    });
    return hallada;
  }

  function tamanoPagina(ancho, alto) {
    var forzado = /^(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)$/.exec(parametros().get("pagina") || "");
    var size = forzado ? forzado[1] + "in " + forzado[2] + "in" : ancho + " " + alto;
    var estilo = document.createElement("style");
    estilo.textContent = "@page { size: " + size + "; margin: 0; }";
    document.head.appendChild(estilo);
  }

  function fuentes() {
    var muestra = "¿Qué prefieres… ñ á é í ó ú ü « » · ABCÑ 0123";
    var pedidas = [
      "20px Mansalva",
      "20px \"Covered By Your Grace\"",
      "650 20px Archivo"
    ].map(function (f) { return document.fonts.load(f, muestra); });
    return Promise.all(pedidas).catch(function () {}).then(function () {
      return document.fonts.ready;
    }).then(function () {
      // document.fonts.check() da verdadero también cuando la familia no
      // existe; por eso se busca una cara realmente cargada.
      var cargadas = {};
      FAMILIAS.forEach(function (nombre) {
        cargadas[nombre] = false;
        document.fonts.forEach(function (cara) {
          if (cara.family.replace(/["']/g, "") === nombre && cara.status === "loaded") cargadas[nombre] = true;
        });
      });
      return cargadas;
    });
  }

  // ---------- Zona segura ----------

  // Las cajas de texto del navegador miden el alto de la fuente, no la tinta;
  // con letra a mano sobra mucho arriba. Se recorta cada renglón a la tinta
  // con las métricas del lienzo (el mismo criterio del muestrario).
  var lienzo = document.createElement("canvas").getContext("2d");

  function deCabeza(el, tope) {
    var grados = 0;
    for (var n = el; n && n !== tope; n = n.parentElement) {
      var t = getComputedStyle(n).transform;
      if (t && t !== "none") {
        var m = new DOMMatrix(t);
        grados += Math.atan2(m.b, m.a) * 180 / Math.PI;
      }
    }
    return Math.abs(((grados % 360) + 540) % 360 - 180) < 90;
  }

  function tinta(nodo, carta) {
    var el = nodo.parentElement;
    var s = getComputedStyle(el);
    var texto = s.textTransform === "uppercase" ? nodo.textContent.toUpperCase() : nodo.textContent;
    lienzo.font = s.fontStyle + " " + s.fontWeight + " " + s.fontSize + " " + s.fontFamily;
    var m = lienzo.measureText(texto.trim());
    var contorno = (parseFloat(s.webkitTextStrokeWidth) || 0) / 2;
    var arriba = m.fontBoundingBoxAscent - m.actualBoundingBoxAscent - contorno;
    var abajo = m.fontBoundingBoxAscent + m.actualBoundingBoxDescent + contorno;
    var alto = m.fontBoundingBoxAscent + m.fontBoundingBoxDescent;
    var izq = Math.max(0, m.actualBoundingBoxLeft) + contorno;
    var der = Math.max(0, m.actualBoundingBoxRight - m.width) + contorno;
    var girado = deCabeza(el, carta);
    var rango = document.createRange();
    rango.selectNodeContents(nodo);
    return Array.prototype.map.call(rango.getClientRects(), function (r) {
      if (r.width <= 0) return null;
      return {
        left: r.left - izq,
        right: r.right + der,
        top: girado ? r.top + (alto - abajo) : r.top + arriba,
        bottom: girado ? r.top + (alto - arriba) : r.top + abajo
      };
    }).filter(Boolean);
  }

  function zonaSegura(carta) {
    var c = carta.getBoundingClientRect();
    var mm = c.width / ANCHO_CARTA_MM;
    var resultado = { texto: Infinity, piezaTexto: "", trazos: Infinity, piezaTrazo: "" };

    function distancia(r) {
      return Math.min(r.left - c.left, c.right - r.right, r.top - c.top, c.bottom - r.bottom) / mm;
    }
    function nombre(el) {
      return (el.getAttribute("class") || el.tagName.toLowerCase()).split(" ").pop();
    }

    var paseo = document.createTreeWalker(carta, NodeFilter.SHOW_TEXT);
    var nodo;
    while ((nodo = paseo.nextNode())) {
      if (!nodo.textContent.trim() || nodo.parentElement.closest(".carta__frase")) continue;
      tinta(nodo, carta).forEach(function (r) {
        var d = distancia(r);
        if (d < resultado.texto) { resultado.texto = d; resultado.piezaTexto = nombre(nodo.parentElement); }
      });
    }
    // Garabatos y renglones (no la trama del fondo, que vive en el papel).
    carta.querySelectorAll(".carta__cara use").forEach(function (u) {
      var d = distancia(u.getBoundingClientRect());
      if (d < resultado.trazos) { resultado.trazos = d; resultado.piezaTrazo = nombre(u.closest("svg")); }
    });
    return resultado;
  }

  // ---------- Ajustes para PDF ----------
  //
  // Dos cosas de css/carta.css salen mal al imprimir a PDF con Chrome, y aquí
  // se reemplazan por equivalentes que se ven igual:
  //
  // 1. El grano del papel es un SVG con feTurbulence. Chrome lo rasteriza de
  //    nuevo en cada página (unos 1.9 MB por carta: 230 MB el mazo). Dibujado
  //    una sola vez en un PNG, el PDF guarda una sola copia.
  // 2. La trama del reverso usa mask-image. Chrome la escribe como máscara
  //    suave que Vista Previa y Quartz dibujan en la esquina, a un cuarto de
  //    tamaño. Como imagen de fondo con el trazo ya del color, sale bien.
  var GRANO_PX = [825, 1125]; // el papel con sangrado a 300 dpi

  function urlDe(valor) {
    var m = /url\("?(.*?)"?\)$/.exec(valor || "");
    return m ? m[1] : null;
  }

  function hex(color) {
    var n = (color.match(/[\d.]+/g) || []).slice(0, 3).map(function (v) {
      return ("0" + Math.round(+v).toString(16)).slice(-2);
    });
    return "#" + n.join("");
  }

  function granoPng(papel) {
    var origen = urlDe(getComputedStyle(papel, "::before").backgroundImage);
    if (!origen) return Promise.resolve(null);
    return new Promise(function (listo) {
      var img = new Image();
      img.onload = function () {
        var lienzo = document.createElement("canvas");
        lienzo.width = GRANO_PX[0];
        lienzo.height = GRANO_PX[1];
        lienzo.getContext("2d").drawImage(img, 0, 0, GRANO_PX[0], GRANO_PX[1]);
        try { listo(lienzo.toDataURL("image/png")); } catch (e) { listo(null); }
      };
      img.onerror = function () { listo(null); };
      img.src = origen;
    });
  }

  function prepararParaPdf() {
    document.querySelectorAll(".carta__trama").forEach(function (trama) {
      var s = getComputedStyle(trama);
      var mascara = urlDe(s.webkitMaskImage || s.maskImage);
      if (!mascara) return;
      var color = encodeURIComponent(hex(s.color));
      trama.style.webkitMask = "none";
      trama.style.mask = "none";
      trama.style.background = "url(\"" + mascara.replace(/stroke='%23000'/g, "stroke='" + color + "'") +
        "\") center / 110cqw 150cqw no-repeat";
    });
    var papel = document.querySelector(".carta:not(.carta--ahorro) .carta__papel");
    if (!papel) return Promise.resolve();
    return granoPng(papel).then(function (png) {
      if (!png) return;
      var estilo = document.createElement("style");
      estilo.textContent = ".carta__papel::before { background-image: url(\"" + png + "\"); }";
      document.head.appendChild(estilo);
    });
  }

  function informe(datos) {
    if (parametros().get("revisar") !== "si") return;
    var pre = document.createElement("pre");
    pre.id = "informe";
    pre.textContent = JSON.stringify(datos);
    document.body.appendChild(pre);
  }

  window.Impresion = {
    parametros: parametros,
    mazo: mazo,
    crear: crear,
    tamanoPagina: tamanoPagina,
    fuentes: fuentes,
    zonaSegura: zonaSegura,
    informe: informe,
    prepararParaPdf: prepararParaPdf,
    MM: 96 / 25.4
  };
})();
