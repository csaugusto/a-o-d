// A o D · Juego digital
//
// Una pantalla: el mazo barajado, una carta a la vez. Necesita js/cartas.js
// (window.MAZO) y js/carta.js (window.Carta) cargados antes.
//
// El archivo tiene dos partes:
//   1. AoDLogica: funciones puras (barajar, filtrar, avanzar, regresar, sanear
//      lo guardado). No tocan el DOM; se prueban con Node.
//   2. La aplicación: pinta, escucha gestos y teclas, guarda en localStorage.
//
// La partida se guarda como {vistas, pendientes, pos}:
//   vistas      ids que ya salieron, en orden
//   pendientes  ids que faltan, ya barajados (todas las cartas, aunque su
//               categoría esté apagada: así vuelven si la enciendes)
//   pos         -1 = mazo boca abajo; 0..vistas.length-1 = carta en la mesa;
//               vistas.length = se acabó el mazo

(function (global) {
  "use strict";

  // =====================================================================
  // 1. Lógica pura
  // =====================================================================

  var MAX_OPCION = 60;
  var VEREDICTOS = ["queda", "facil", "fuera"];

  function barajar(lista, azar) {
    azar = azar || Math.random;
    var r = lista.slice();
    for (var i = r.length - 1; i > 0; i--) {
      var j = Math.floor(azar() * (i + 1));
      var t = r[i];
      r[i] = r[j];
      r[j] = t;
    }
    return r;
  }

  function limpio(texto) {
    return String(texto == null ? "" : texto).replace(/\s+/g, " ").trim();
  }

  function catalogo(mazo, propios) {
    var porId = {};
    var ids = [];
    var categorias = [];
    var categoriaPorId = {};
    ((mazo && mazo.categorias) || []).forEach(function (c) {
      if (!c || !c.id) return;
      var cuenta = 0;
      (c.cartas || []).forEach(function (carta) {
        if (!carta || !carta.id || porId[carta.id]) return;
        porId[carta.id] = { id: carta.id, a: carta.a, b: carta.b, estado: carta.estado, categoria: c.id };
        ids.push(carta.id);
        cuenta++;
      });
      var cat = { id: c.id, codigo: c.codigo, nombre: c.nombre, total: cuenta };
      categorias.push(cat);
      categoriaPorId[c.id] = cat;
    });
    (propios || []).forEach(function (p) {
      if (!p || !p.id || porId[p.id]) return;
      porId[p.id] = { id: p.id, a: p.a, b: p.b, propia: true, categoria: "propia" };
      ids.push(p.id);
    });
    return { porId: porId, ids: ids, categorias: categorias, categoriaPorId: categoriaPorId };
  }

  function elegible(cat, ajustes, id) {
    var c = cat.porId[id];
    if (!c) return false;
    if (c.propia) return !!ajustes.propios;
    return ajustes.inactivas.indexOf(c.categoria) === -1;
  }

  function copiaPartida(p) {
    return { vistas: p.vistas.slice(), pendientes: p.pendientes.slice(), pos: p.pos };
  }

  function nueva(cat, azar) {
    return { vistas: [], pendientes: barajar(cat.ids, azar), pos: -1 };
  }

  function estadoDe(p) {
    if (p.pos < 0) return "inicio";
    if (p.pos >= p.vistas.length) return "fin";
    return "carta";
  }

  function actual(p) {
    return estadoDe(p) === "carta" ? p.vistas[p.pos] : null;
  }

  // Siguiente carta: primero lo que ya salió más adelante (si regresaste),
  // luego la primera pendiente que esté en juego. Si no hay, se acabó.
  function avanzar(p, cat, ajustes) {
    p = copiaPartida(p);
    for (var i = Math.max(p.pos + 1, 0); i < p.vistas.length; i++) {
      if (elegible(cat, ajustes, p.vistas[i])) { p.pos = i; return p; }
    }
    for (var j = 0; j < p.pendientes.length; j++) {
      if (elegible(cat, ajustes, p.pendientes[j])) {
        p.vistas.push(p.pendientes.splice(j, 1)[0]);
        p.pos = p.vistas.length - 1;
        return p;
      }
    }
    p.pos = p.vistas.length;
    return p;
  }

  function anteriorIndice(p, cat, ajustes) {
    for (var i = Math.min(p.pos, p.vistas.length) - 1; i >= 0; i--) {
      if (elegible(cat, ajustes, p.vistas[i])) return i;
    }
    return -1;
  }

  function puedeRegresar(p, cat, ajustes) {
    return anteriorIndice(p, cat, ajustes) !== -1;
  }

  // En la primera carta no hay a dónde regresar: la partida no cambia.
  function regresar(p, cat, ajustes) {
    var i = anteriorIndice(p, cat, ajustes);
    p = copiaPartida(p);
    if (i !== -1) p.pos = i;
    return p;
  }

  function conteo(p, cat, ajustes) {
    var vistas = 0;
    var hasta = 0;
    p.vistas.forEach(function (id, i) {
      if (!elegible(cat, ajustes, id)) return;
      vistas++;
      if (i <= p.pos) hasta++;
    });
    var pendientes = p.pendientes.filter(function (id) { return elegible(cat, ajustes, id); }).length;
    return { numero: hasta, total: vistas + pendientes, restantes: pendientes + (vistas - hasta) };
  }

  // Ajusta la partida al catálogo actual: quita ids que ya no existen (una
  // carta borrada de cartas.js o un dilema propio borrado) y mete en un lugar
  // al azar de las pendientes los que nunca se barajaron (cartas nuevas).
  function reconciliar(p, cat, azar) {
    azar = azar || Math.random;
    var visto = {};
    var estado = estadoDe(p);
    var cur = actual(p);
    var vistas = [];
    var antes = 0;
    var perdio = false;
    p.vistas.forEach(function (id, i) {
      if (!cat.porId[id] || visto[id]) {
        if (i === p.pos) perdio = true;
        return;
      }
      visto[id] = true;
      vistas.push(id);
      if (i < p.pos) antes++;
    });
    var pendientes = [];
    p.pendientes.forEach(function (id) {
      if (!cat.porId[id] || visto[id]) return;
      visto[id] = true;
      pendientes.push(id);
    });
    cat.ids.forEach(function (id) {
      if (visto[id]) return;
      visto[id] = true;
      pendientes.splice(Math.floor(azar() * (pendientes.length + 1)), 0, id);
    });
    var pos;
    if (estado === "inicio") pos = -1;
    else if (estado === "fin") pos = vistas.length;
    else if (perdio) pos = antes - 1;
    else pos = vistas.indexOf(cur);
    return { partida: { vistas: vistas, pendientes: pendientes, pos: pos }, perdioActual: perdio };
  }

  // Después de cualquier cambio de ajustes o de dilemas: si la carta en la
  // mesa ya no juega (se borró o se apagó su categoría), sale la siguiente; si
  // el mazo estaba acabado y ahora hay cartas nuevas, también.
  function corregir(p, cat, ajustes, azar) {
    var r = reconciliar(p, cat, azar);
    var q = r.partida;
    var estado = estadoDe(q);
    if (r.perdioActual ||
        (estado === "carta" && !elegible(cat, ajustes, q.vistas[q.pos])) ||
        (estado === "fin" && conteo(q, cat, ajustes).restantes > 0)) {
      q = avanzar(q, cat, ajustes);
    }
    return q;
  }

  function ajustesPorOmision() {
    return { inactivas: [], propios: true, prueba: false };
  }

  function sanearAjustes(aj, cat) {
    var r = ajustesPorOmision();
    if (!aj || typeof aj !== "object") return r;
    if (Array.isArray(aj.inactivas)) {
      r.inactivas = aj.inactivas.filter(function (id, i, lista) {
        return typeof id === "string" && cat.categoriaPorId[id] && lista.indexOf(id) === i;
      });
    }
    if (cat.categorias.length && r.inactivas.length >= cat.categorias.length) r.inactivas = [];
    if (typeof aj.propios === "boolean") r.propios = aj.propios;
    if (typeof aj.prueba === "boolean") r.prueba = aj.prueba;
    return r;
  }

  // Siempre queda al menos una categoría encendida: si apagar esta dejaría el
  // mazo sin categorías, los ajustes no cambian.
  function alternarCategoria(aj, cat, id, activa) {
    var r = { inactivas: aj.inactivas.slice(), propios: aj.propios, prueba: aj.prueba };
    var i = r.inactivas.indexOf(id);
    if (activa) {
      if (i !== -1) r.inactivas.splice(i, 1);
      return r;
    }
    if (i !== -1 || !cat.categoriaPorId[id]) return r;
    if (cat.categorias.length - r.inactivas.length <= 1) return r;
    r.inactivas.push(id);
    return r;
  }

  function validarDilema(a, b) {
    a = limpio(a);
    b = limpio(b);
    if (!a || !b) return { ok: false, error: "Escribe las dos opciones." };
    if (a.length > MAX_OPCION || b.length > MAX_OPCION) {
      return { ok: false, error: "Cada opción cabe en " + MAX_OPCION + " caracteres." };
    }
    if (a.toLocaleLowerCase("es") === b.toLocaleLowerCase("es")) {
      return { ok: false, error: "Las dos opciones son iguales: así no hay que elegir." };
    }
    return { ok: true, a: a, b: b };
  }

  function sanearPropios(lista) {
    var vistos = {};
    if (!Array.isArray(lista)) return [];
    return lista.reduce(function (r, p) {
      if (!p || typeof p.id !== "string" || !/^TU-\d+$/.test(p.id) || vistos[p.id]) return r;
      var v = validarDilema(p.a, p.b);
      if (!v.ok) return r;
      vistos[p.id] = true;
      r.push({ id: p.id, a: v.a, b: v.b });
      return r;
    }, []);
  }

  function sanearPartida(p) {
    if (!p || typeof p !== "object" || !Array.isArray(p.vistas) || !Array.isArray(p.pendientes)) return null;
    var esTexto = function (x) { return typeof x === "string"; };
    if (!p.vistas.every(esTexto) || !p.pendientes.every(esTexto)) return null;
    var pos = typeof p.pos === "number" && isFinite(p.pos) ? Math.floor(p.pos) : -1;
    pos = Math.max(-1, Math.min(pos, p.vistas.length));
    return { vistas: p.vistas.slice(), pendientes: p.pendientes.slice(), pos: pos };
  }

  // Convierte lo que venga de localStorage (o nada) en un estado completo y
  // coherente con el mazo actual.
  function sanear(datos, mazo, azar) {
    datos = datos && typeof datos === "object" ? datos : {};
    var propios = sanearPropios(datos.propios);
    var cat = catalogo(mazo, propios);
    var ajustes = sanearAjustes(datos.ajustes, cat);
    var mayor = propios.reduce(function (n, p) { return Math.max(n, parseInt(p.id.slice(3), 10)); }, 0);
    var siguiente = typeof datos.siguiente === "number" && datos.siguiente > mayor ? Math.floor(datos.siguiente) : mayor + 1;
    var marcas = {};
    if (datos.marcas && typeof datos.marcas === "object") {
      Object.keys(datos.marcas).forEach(function (id) {
        if (cat.porId[id] && VEREDICTOS.indexOf(datos.marcas[id]) !== -1) marcas[id] = datos.marcas[id];
      });
    }
    var partida = sanearPartida(datos.partida) || nueva(cat, azar);
    partida = corregir(partida, cat, ajustes, azar);
    return { ajustes: ajustes, propios: propios, siguiente: siguiente, marcas: marcas, partida: partida };
  }

  function textoDilemas(propios) {
    return propios.map(function (p) { return p.a + " | " + p.b; }).join("\n");
  }

  function agruparMarcas(marcas, cat) {
    var grupos = { queda: [], facil: [], fuera: [] };
    cat.ids.forEach(function (id) {
      var v = marcas[id];
      if (grupos[v]) grupos[v].push(cat.porId[id]);
    });
    return grupos;
  }

  var NOMBRE_VEREDICTO = { queda: "Se queda", facil: "Muy fácil", fuera: "Fuera" };

  function textoResultados(marcas, cat, titulo) {
    var grupos = agruparMarcas(marcas, cat);
    var partes = [titulo || "Resultados de la prueba"];
    VEREDICTOS.forEach(function (v) {
      partes.push("");
      partes.push(NOMBRE_VEREDICTO[v] + " (" + grupos[v].length + ")");
      grupos[v].forEach(function (c) { partes.push(c.id + " | " + c.a + " | " + c.b); });
    });
    return partes.join("\n");
  }

  var Logica = {
    MAX_OPCION: MAX_OPCION,
    VEREDICTOS: VEREDICTOS,
    NOMBRE_VEREDICTO: NOMBRE_VEREDICTO,
    barajar: barajar,
    catalogo: catalogo,
    elegible: elegible,
    nueva: nueva,
    estadoDe: estadoDe,
    actual: actual,
    avanzar: avanzar,
    regresar: regresar,
    puedeRegresar: puedeRegresar,
    conteo: conteo,
    reconciliar: reconciliar,
    corregir: corregir,
    sanearAjustes: sanearAjustes,
    alternarCategoria: alternarCategoria,
    validarDilema: validarDilema,
    sanear: sanear,
    textoDilemas: textoDilemas,
    agruparMarcas: agruparMarcas,
    textoResultados: textoResultados
  };

  global.AoDLogica = Logica;

  // En Node solo se usa la lógica.
  if (typeof document === "undefined" || !global.Carta || !global.MAZO) return;

  // =====================================================================
  // 2. Aplicación
  // =====================================================================

  var CLAVE = "aod-juego-v1";
  var MAZO = global.MAZO;
  var Carta = global.Carta;

  var Almacen = {
    leer: function () {
      try {
        var texto = global.localStorage.getItem(CLAVE);
        return texto ? JSON.parse(texto) : null;
      } catch (e) {
        return null;
      }
    },
    guardar: function (datos) {
      try {
        global.localStorage.setItem(CLAVE, JSON.stringify(datos));
      } catch (e) { /* sin guardar: el juego sigue igual */ }
    }
  };

  var E;     // estado: {ajustes, propios, siguiente, marcas, partida}
  var cat;   // catálogo con los dilemas propios actuales
  var $ = function (id) { return document.getElementById(id); };
  var el = {};

  function guardar() {
    Almacen.guardar({
      v: 1,
      ajustes: E.ajustes,
      propios: E.propios,
      siguiente: E.siguiente,
      marcas: E.marcas,
      partida: E.partida
    });
  }

  function rehacerCatalogo() {
    cat = Logica.catalogo(MAZO, E.propios);
  }

  function corregirPartida() {
    E.partida = Logica.corregir(E.partida, cat, E.ajustes);
  }

  function plural(n, uno, varios) {
    return n + " " + (n === 1 ? uno : varios);
  }

  function crear(etiqueta, clase, texto) {
    var nodo = document.createElement(etiqueta);
    if (clase) nodo.className = clase;
    if (texto != null) nodo.textContent = texto;
    return nodo;
  }

  // ---------- Movimiento ----------

  var reducir = global.matchMedia ? global.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var animaciones = [];

  function quieto() {
    return (reducir && reducir.matches) || typeof Element.prototype.animate !== "function";
  }

  function animar(nodo, cuadros, opciones, alTerminar) {
    var anim = nodo.animate(cuadros, opciones);
    animaciones.push(anim);
    var listo = false;
    function fin() {
      if (listo) return;
      listo = true;
      animaciones = animaciones.filter(function (a) { return a !== anim; });
      if (alTerminar) alTerminar();
    }
    anim.onfinish = fin;
    anim.oncancel = fin;
    // Una animación no arranca hasta que se pinta un cuadro, y «finish» se
    // despacha con el cuadro siguiente. Si la página no pinta (pestaña oculta,
    // marco sin ventana), la carta nueva se quedaría invisible en su primer
    // cuadro: el reloj la termina de todos modos.
    global.setTimeout(function () {
      if (listo) return;
      try { anim.finish(); } catch (e) { /* ya terminó */ }
      fin();
    }, (opciones.duration || 0) + (opciones.delay || 0) + 120);
    return anim;
  }

  // La carta que cuenta es siempre la última que se puso en la mesa; las
  // demás solo están saliendo.
  var vigente = null;

  // Una transición nueva no espera a la anterior: la termina de golpe. El
  // evento «finish» llega después (es asíncrono), así que aquí se quita a
  // mano todo lo que no sea la carta vigente.
  function terminarTransiciones() {
    animaciones.slice().forEach(function (a) {
      try { a.finish(); } catch (e) { a.cancel(); }
    });
    animaciones = [];
    el.hueco.querySelectorAll(".naipe").forEach(function (n) {
      if (n !== vigente) n.remove();
    });
    if (vigente) vigente.style.transform = "";
  }

  // ---------- Pintar la mesa ----------

  function naipeDe(estado) {
    var naipe = crear("div", "naipe");
    if (estado === "inicio") {
      naipe.classList.add("naipe--reverso");
      naipe.appendChild(Carta.reverso());
      return naipe;
    }
    if (estado === "fin") {
      var c = Logica.conteo(E.partida, cat, E.ajustes);
      naipe.classList.add("naipe--fin");
      var fin = crear("div", "fin");
      fin.appendChild(crear("p", "fin__titulo", "Se acabó el mazo."));
      fin.appendChild(crear("p", "fin__texto", c.total
        ? "Salieron " + (c.total === 1 ? "la única carta" : "las " + c.total + " cartas") + ". ¿Otra vuelta?"
        : "No hay cartas en juego."));
      naipe.appendChild(fin);
      return naipe;
    }
    var carta = cat.porId[Logica.actual(E.partida)];
    naipe.appendChild(carta.propia
      ? Carta.propia({ a: carta.a, b: carta.b })
      : Carta.frente(carta, cat.categoriaPorId[carta.categoria]));
    return naipe;
  }

  function pintarMonton(estado, c) {
    var capas = 0;
    if (estado === "inicio") capas = Math.min(2, Math.max(0, c.restantes - 1));
    else if (estado === "carta") capas = Math.min(2, c.restantes);
    el.monton.dataset.capas = String(capas);
    el.hueco.dataset.estado = estado;
  }

  // tipo: "siguiente", "voltear", "anterior", "barajar" o nada (sin transición).
  // desde: transformación en la que quedó la carta si se venía arrastrando.
  function pintarMesa(tipo, desde) {
    terminarTransiciones();
    var estado = Logica.estadoDe(E.partida);
    var c = Logica.conteo(E.partida, cat, E.ajustes);
    var viejo = vigente;
    var nuevo = naipeDe(estado);
    vigente = nuevo;
    pintarMonton(estado, c);

    if (!viejo || !tipo || quieto()) {
      if (viejo) viejo.remove();
      el.hueco.appendChild(nuevo);
      return;
    }

    viejo.classList.add("naipe--sale");
    el.hueco.insertBefore(nuevo, viejo);
    var inicioViejo = desde || viejo.style.transform || "none";
    viejo.style.transform = "";
    var quitar = function () { viejo.remove(); };

    if (tipo === "voltear") {
      animar(viejo, [
        { transform: "perspective(1600px) rotateY(0deg)" },
        { transform: "perspective(1600px) rotateY(90deg)" }
      ], { duration: 150, easing: "cubic-bezier(.5, 0, .9, .5)", fill: "forwards" }, quitar);
      animar(nuevo, [
        { transform: "perspective(1600px) rotateY(-90deg)" },
        { transform: "perspective(1600px) rotateY(0deg)" }
      ], { duration: 190, delay: 150, easing: "cubic-bezier(.15, .6, .25, 1)", fill: "backwards" });
      return;
    }

    if (tipo === "barajar") {
      animar(viejo, [{ opacity: 1 }, { opacity: 0 }], { duration: 140, fill: "forwards" }, quitar);
      animar(nuevo, [
        { transform: "translateY(-5%) scale(1.03) rotate(-2deg)", opacity: 0 },
        { transform: "none", opacity: 1 }
      ], { duration: 320, delay: 80, easing: "cubic-bezier(.2, .7, .2, 1)", fill: "backwards" });
      return;
    }

    // Siguiente: la carta se va a la izquierda y la nueva sale del mazo.
    // Anterior: se va a la derecha y la de antes reaparece debajo.
    var lado = tipo === "anterior" ? 1 : -1;
    animar(viejo, [
      { transform: inicioViejo, opacity: 1 },
      { transform: "translate(" + (lado * 118) + "%, 3%) rotate(" + (lado * 11) + "deg)", opacity: 0 }
    ], { duration: 260, easing: "cubic-bezier(.4, 0, .8, .4)", fill: "forwards" }, quitar);
    if (tipo === "anterior" || estado === "fin") {
      animar(nuevo, [
        { transform: "scale(.96)", opacity: 0 },
        { transform: "none", opacity: 1 }
      ], { duration: 240, delay: 60, easing: "cubic-bezier(.2, .7, .2, 1)", fill: "backwards" });
    } else {
      animar(nuevo, [
        { transform: "perspective(1600px) rotateY(-70deg) scale(.96)", opacity: 0 },
        { transform: "perspective(1600px) rotateY(0deg) scale(1)", opacity: 1 }
      ], { duration: 280, delay: 70, easing: "cubic-bezier(.15, .6, .25, 1)", fill: "backwards" });
    }
  }

  function pintarControles() {
    var estado = Logica.estadoDe(E.partida);
    var c = Logica.conteo(E.partida, cat, E.ajustes);
    el.app.dataset.vista = estado;

    if (estado === "inicio") el.cuenta.textContent = plural(c.restantes, "carta", "cartas");
    else el.cuenta.textContent = c.numero + " de " + c.total;

    el.siguienteTexto.textContent = estado === "inicio" ? "Sacar la primera carta"
      : estado === "fin" ? "Barajar de nuevo" : "Siguiente carta";
    el.siguiente.classList.toggle("boton--barajar", estado === "fin");

    var atras = Logica.puedeRegresar(E.partida, cat, E.ajustes);
    el.anterior.setAttribute("aria-disabled", atras ? "false" : "true");

    var enPrueba = E.ajustes.prueba;
    var marcadas = Object.keys(E.marcas).length;
    el.chipPrueba.hidden = !enPrueba;
    el.marcadas.textContent = String(marcadas);
    el.chipPrueba.setAttribute("aria-label", "Resultados de la prueba: " + plural(marcadas, "carta marcada", "cartas marcadas"));
    // La fila de prueba ocupa su lugar en todos los estados para que la
    // carta no cambie de tamaño al pasar del mazo a la primera carta.
    el.pie.hidden = !enPrueba;
    el.veredictos.hidden = estado !== "carta";
    var id = Logica.actual(E.partida);
    el.veredictos.querySelectorAll("[data-veredicto]").forEach(function (b) {
      b.setAttribute("aria-pressed", id && E.marcas[id] === b.dataset.veredicto ? "true" : "false");
    });
    el.finPrueba.hidden = estado !== "fin";
  }

  function anunciar() {
    var estado = Logica.estadoDe(E.partida);
    var c = Logica.conteo(E.partida, cat, E.ajustes);
    var texto;
    if (estado === "inicio") {
      texto = "Mazo barajado: " + plural(c.restantes, "carta", "cartas") + ".";
    } else if (estado === "fin") {
      texto = "Se acabó el mazo. Puedes barajar de nuevo.";
    } else {
      var carta = cat.porId[Logica.actual(E.partida)];
      var nombre = carta.propia ? "Dilema propio" : cat.categoriaPorId[carta.categoria].nombre;
      texto = "Carta " + c.numero + " de " + c.total + ". " + nombre + ". ¿Qué prefieres: " +
        limpio(carta.a) + " o " + limpio(carta.b) + "?";
    }
    // Vaciar y volver a escribir hace que el lector repita aunque el texto sea igual.
    el.anuncio.textContent = "";
    global.setTimeout(function () { el.anuncio.textContent = texto; }, 60);
  }

  function pintar(tipo, desde, decir) {
    pintarMesa(tipo, desde);
    pintarControles();
    if (decir) anunciar();
  }

  // ---------- Jugar ----------

  function siguiente(desde) {
    var antes = Logica.estadoDe(E.partida);
    if (antes === "fin") { barajarDeNuevo(); return; }
    E.partida = Logica.avanzar(E.partida, cat, E.ajustes);
    guardar();
    pedirPantalla();
    pintar(antes === "inicio" ? "voltear" : "siguiente", desde, true);
  }

  function anterior(desde) {
    if (!Logica.puedeRegresar(E.partida, cat, E.ajustes)) return false;
    E.partida = Logica.regresar(E.partida, cat, E.ajustes);
    guardar();
    pintar("anterior", desde, true);
    return true;
  }

  function barajarDeNuevo() {
    E.partida = Logica.nueva(cat);
    guardar();
    pintar("barajar", null, true);
  }

  function marcar(veredicto) {
    var id = Logica.actual(E.partida);
    if (!id) return;
    if (E.marcas[id] === veredicto) delete E.marcas[id];
    else E.marcas[id] = veredicto;
    guardar();
    pintarControles();
  }

  // ---------- Gestos sobre la carta ----------

  var gesto = null;

  function alPresionar(ev) {
    if (ev.pointerType === "mouse" && ev.button !== 0) return;
    if (document.querySelector("dialog[open]")) return;
    terminarTransiciones();
    gesto = {
      id: ev.pointerId, x: ev.clientX, y: ev.clientY, dx: 0, arrastra: false,
      naipe: vigente, enCarta: el.hueco.contains(ev.target)
    };
  }

  function alMover(ev) {
    if (!gesto || ev.pointerId !== gesto.id) return;
    var dx = ev.clientX - gesto.x;
    var dy = ev.clientY - gesto.y;
    if (!gesto.arrastra) {
      if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy)) return;
      gesto.arrastra = true;
      try { el.escenario.setPointerCapture(ev.pointerId); } catch (e) { /* no importa */ }
    }
    var estado = Logica.estadoDe(E.partida);
    // Hacia donde no hay carta (a la derecha sin anterior, a la izquierda
    // con el mazo acabado), la carta se resiste: se mueve poco y regresa.
    var libre = dx < 0 ? estado !== "fin" : Logica.puedeRegresar(E.partida, cat, E.ajustes);
    gesto.dx = libre ? dx : dx * 0.25;
    gesto.libre = libre;
    if (gesto.naipe) {
      gesto.naipe.style.transform = "translateX(" + gesto.dx + "px) rotate(" + (gesto.dx * 0.035) + "deg)";
    }
  }

  function regresarAlLugar(naipe) {
    if (!naipe) return;
    var desde = naipe.style.transform;
    naipe.style.transform = "";
    if (!desde || quieto()) return;
    animar(naipe, [{ transform: desde }, { transform: "none" }], { duration: 200, easing: "cubic-bezier(.2, .7, .2, 1)" });
  }

  function alSoltar(ev) {
    if (!gesto || ev.pointerId !== gesto.id) return;
    var g = gesto;
    gesto = null;
    if (!g.arrastra) {
      var movio = Math.abs(ev.clientX - g.x) > 10 || Math.abs(ev.clientY - g.y) > 10;
      // Tocar la carta saca la siguiente; tocar el aviso de fin no baraja
      // (un toque distraído no debería reiniciar la partida).
      if (!movio && g.enCarta && Logica.estadoDe(E.partida) !== "fin") siguiente();
      return;
    }
    var umbral = Math.min(80, el.hueco.offsetWidth * 0.22);
    var desde = g.naipe ? g.naipe.style.transform : "";
    if (g.libre && g.dx <= -umbral) { siguiente(desde); return; }
    if (g.libre && g.dx >= umbral && anterior(desde)) return;
    regresarAlLugar(g.naipe);
  }

  function alCancelar(ev) {
    if (!gesto || ev.pointerId !== gesto.id) return;
    regresarAlLugar(gesto.naipe);
    gesto = null;
  }

  function alTeclear(ev) {
    if (ev.defaultPrevented || ev.altKey || ev.ctrlKey || ev.metaKey) return;
    if (document.querySelector("dialog[open]")) return;
    var t = ev.target;
    if (t && t.closest && t.closest("input, textarea, select, [contenteditable]")) return;
    var enBoton = t && t.closest && t.closest("button, a, summary");
    if (ev.key === "ArrowRight" || ((ev.key === " " || ev.key === "Spacebar") && !enBoton)) {
      ev.preventDefault();
      siguiente();
    } else if (ev.key === "ArrowLeft") {
      ev.preventDefault();
      anterior();
    }
  }

  // ---------- Pantalla encendida ----------

  var candado = null;

  function pedirPantalla() {
    if (candado || !global.navigator || !navigator.wakeLock || document.visibilityState !== "visible") return;
    try {
      navigator.wakeLock.request("screen").then(function (c) {
        candado = c;
        c.addEventListener("release", function () { candado = null; });
      }).catch(function () { /* el navegador dijo que no: se juega igual */ });
    } catch (e) { /* sin wake lock */ }
  }

  // ---------- Hojas ----------

  var abridor = null;

  function abrir(hoja, desde) {
    abridor = desde || document.activeElement;
    var abiertas = document.querySelectorAll("dialog[open]");
    abiertas.forEach(function (d) { if (d !== hoja) cerrarSinFoco(d); });
    if (hoja.id === "hoja-mazo") pintarHojaMazo();
    if (hoja.id === "hoja-dilemas") pintarHojaDilemas();
    if (hoja.id === "hoja-resultados") pintarResultados();
    if (hoja.open) return;
    if (typeof hoja.showModal === "function") {
      try { hoja.showModal(); } catch (e) { hoja.setAttribute("open", ""); }
    } else {
      hoja.setAttribute("open", "");
    }
    hoja.scrollTop = 0;
    var primero = hoja.querySelector("[data-enfoque]") || hoja.querySelector(".hoja__titulo");
    if (primero) {
      if (!primero.hasAttribute("tabindex") && primero.matches(".hoja__titulo")) primero.setAttribute("tabindex", "-1");
      primero.focus({ preventScroll: true });
    }
  }

  function cerrarSinFoco(hoja) {
    hoja.dataset.sinFoco = "si";
    if (typeof hoja.close === "function") hoja.close();
    else { hoja.removeAttribute("open"); alCerrar(hoja); }
  }

  function cerrar(hoja) {
    if (typeof hoja.close === "function") hoja.close();
    else { hoja.removeAttribute("open"); alCerrar(hoja); }
  }

  function alCerrar(hoja) {
    var sinFoco = hoja.dataset.sinFoco === "si";
    delete hoja.dataset.sinFoco;
    hoja.querySelectorAll(".confirmar").forEach(function (c) { c.hidden = true; });
    hoja.querySelectorAll("[data-pide-confirmar]").forEach(function (b) { b.hidden = false; });
    if (sinFoco) return;
    var destino = abridor && document.contains(abridor) && !abridor.closest("dialog") ? abridor : el.siguiente;
    abridor = null;
    try { destino.focus({ preventScroll: true }); } catch (e) { /* nada */ }
  }

  // ---------- Hoja «Mazo» ----------

  function marcaCasilla() {
    return '<svg class="casilla__marca" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path d="M4.6 12.8C6.4 14.2 8 15.9 9.4 18.1 12.2 12.6 15.6 8.1 20.1 4.4"/></svg>';
  }

  function construirCategorias() {
    var lista = el.listaCategorias;
    lista.textContent = "";
    cat.categorias.forEach(function (c) {
      var fila = crear("label", "casilla");
      fila.setAttribute("for", "cat-" + c.id);
      var input = document.createElement("input");
      input.type = "checkbox";
      input.id = "cat-" + c.id;
      input.dataset.categoria = c.id;
      fila.appendChild(input);
      fila.insertAdjacentHTML("beforeend", marcaCasilla());
      var papel = crear("span", "casilla__papel");
      papel.style.setProperty("--c", "var(--papel-" + c.id.replace(/[^a-z0-9-]/gi, "") + ", var(--servilleta))");
      papel.setAttribute("aria-hidden", "true");
      fila.appendChild(papel);
      fila.appendChild(crear("span", "casilla__texto", c.nombre));
      var n = crear("span", "casilla__cuenta", String(c.total));
      n.setAttribute("aria-label", plural(c.total, "carta", "cartas"));
      fila.appendChild(n);
      lista.appendChild(fila);
    });
  }

  function pintarHojaMazo() {
    var activas = cat.categorias.length - E.ajustes.inactivas.length;
    el.listaCategorias.querySelectorAll("input[data-categoria]").forEach(function (input) {
      var activa = E.ajustes.inactivas.indexOf(input.dataset.categoria) === -1;
      input.checked = activa;
      input.closest(".casilla").classList.toggle("casilla--ultima", activa && activas === 1);
    });
    el.incluirPropios.checked = E.ajustes.propios;
    var n = E.propios.length;
    el.cuantosPropios.textContent = n ? String(n) : "";
    el.cuantosPropios.setAttribute("aria-label", plural(n, "dilema", "dilemas"));
    el.sinPropios.hidden = n > 0;
    el.modoPrueba.checked = E.ajustes.prueba;
    el.irAResultados.hidden = !E.ajustes.prueba;
    var c = Logica.conteo(E.partida, cat, E.ajustes);
    el.resumenMazo.textContent = "En juego: " + plural(c.total, "carta", "cartas") +
      ". Faltan " + c.restantes + " por salir.";
  }

  function cambiarAjustes(nuevos) {
    E.ajustes = nuevos;
    corregirPartida();
    guardar();
    pintarMesa(null);
    pintarControles();
    pintarHojaMazo();
  }

  function alCambiarCategoria(ev) {
    var input = ev.target;
    if (!input.dataset || !input.dataset.categoria) return;
    var nuevos = Logica.alternarCategoria(E.ajustes, cat, input.dataset.categoria, input.checked);
    if (!input.checked && nuevos.inactivas.indexOf(input.dataset.categoria) === -1) {
      input.checked = true;
      el.notaCategorias.textContent = "";
      global.setTimeout(function () {
        el.notaCategorias.textContent = "Al menos una categoría se queda en el mazo.";
      }, 30);
      return;
    }
    el.notaCategorias.textContent = "";
    cambiarAjustes(nuevos);
  }

  // ---------- Hoja «Tus dilemas» ----------

  var editando = null;

  function vistaPrevia() {
    var a = limpio(el.dilemaA.value);
    var b = limpio(el.dilemaB.value);
    var carta = Carta.propia({ a: a || "algo difícil", b: b || "algo igual de difícil" });
    carta.classList.toggle("vista--sin-a", !a);
    carta.classList.toggle("vista--sin-b", !b);
    el.vistaDilema.textContent = "";
    el.vistaDilema.appendChild(carta);
    el.contadorA.textContent = el.dilemaA.value.length + "/" + Logica.MAX_OPCION;
    el.contadorB.textContent = el.dilemaB.value.length + "/" + Logica.MAX_OPCION;
  }

  function limpiarFormulario() {
    editando = null;
    el.dilemaA.value = "";
    el.dilemaB.value = "";
    el.errorDilema.textContent = "";
    el.guardarDilema.textContent = "Guardar dilema";
    el.cancelarEdicion.hidden = true;
    el.formDilema.classList.remove("editor--editando");
    vistaPrevia();
  }

  function pintarHojaDilemas() {
    var lista = el.listaDilemas;
    lista.textContent = "";
    E.propios.forEach(function (p) {
      var li = crear("li", "dilema");
      li.dataset.id = p.id;
      var texto = crear("p", "dilema__texto");
      texto.appendChild(crear("span", "dilema__a", p.a));
      texto.appendChild(crear("span", "dilema__o", " o "));
      texto.appendChild(crear("span", "dilema__b", p.b));
      li.appendChild(texto);

      var acciones = crear("div", "dilema__acciones");
      var editar = crear("button", "boton boton--chico", "Editar");
      editar.type = "button";
      editar.dataset.accion = "editar";
      editar.setAttribute("aria-label", "Editar: " + p.a + " o " + p.b);
      var borrar = crear("button", "boton boton--chico", "Borrar");
      borrar.type = "button";
      borrar.dataset.accion = "borrar";
      borrar.dataset.pideConfirmar = "";
      borrar.setAttribute("aria-label", "Borrar: " + p.a + " o " + p.b);
      acciones.appendChild(editar);
      acciones.appendChild(borrar);
      li.appendChild(acciones);

      var confirmar = crear("div", "confirmar");
      confirmar.hidden = true;
      confirmar.setAttribute("role", "group");
      confirmar.setAttribute("aria-label", "Confirmar borrado");
      confirmar.appendChild(crear("p", "confirmar__pregunta", "¿Borrar este dilema?"));
      var si = crear("button", "boton boton--chico boton--fuerte", "Sí, borrar");
      si.type = "button";
      si.dataset.accion = "si-borrar";
      var no = crear("button", "boton boton--chico", "No");
      no.type = "button";
      no.dataset.accion = "no-borrar";
      confirmar.appendChild(si);
      confirmar.appendChild(no);
      li.appendChild(confirmar);
      lista.appendChild(li);
    });
    var n = E.propios.length;
    el.cuantosGuardados.textContent = n ? "(" + n + ")" : "";
    el.sinDilemas.hidden = n > 0;
    el.copiarDilemas.hidden = n === 0;
    el.propiosApagados.hidden = !(n > 0 && !E.ajustes.propios);
    if (n === 0) {
      el.copiaDilemas.hidden = true;
      el.estadoCopiaDilemas.textContent = "";
    }
    if (editando && !E.propios.some(function (p) { return p.id === editando; })) limpiarFormulario();
    vistaPrevia();
  }

  function alGuardarDilema(ev) {
    ev.preventDefault();
    var v = Logica.validarDilema(el.dilemaA.value, el.dilemaB.value);
    if (!v.ok) {
      el.errorDilema.textContent = v.error;
      (limpio(el.dilemaA.value) ? el.dilemaB : el.dilemaA).focus();
      return;
    }
    var nuevo = !editando;
    if (editando) {
      E.propios = E.propios.map(function (p) { return p.id === editando ? { id: p.id, a: v.a, b: v.b } : p; });
    } else {
      E.propios = E.propios.concat([{ id: "TU-" + E.siguiente, a: v.a, b: v.b }]);
      E.siguiente++;
    }
    rehacerCatalogo();
    corregirPartida();
    guardar();
    limpiarFormulario();
    pintarHojaDilemas();
    pintarMesa(null);
    pintarControles();
    el.estadoDilema.textContent = "";
    var aviso = nuevo
      ? (E.ajustes.propios ? "Guardado. Ya está en el mazo." : "Guardado. Para que salga, enciende «Mezclar tus dilemas» en Mazo.")
      : "Cambios guardados.";
    global.setTimeout(function () { el.estadoDilema.textContent = aviso; }, 30);
    el.dilemaA.focus();
  }

  function editarDilema(id) {
    var p = E.propios.filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    editando = id;
    el.dilemaA.value = p.a;
    el.dilemaB.value = p.b;
    el.errorDilema.textContent = "";
    el.estadoDilema.textContent = "";
    el.guardarDilema.textContent = "Guardar cambios";
    el.cancelarEdicion.hidden = false;
    el.formDilema.classList.add("editor--editando");
    vistaPrevia();
    el.formDilema.scrollIntoView({ block: "start", behavior: quieto() ? "auto" : "smooth" });
    el.dilemaA.focus({ preventScroll: true });
  }

  function borrarDilema(id) {
    E.propios = E.propios.filter(function (p) { return p.id !== id; });
    delete E.marcas[id];
    if (editando === id) limpiarFormulario();
    rehacerCatalogo();
    corregirPartida();
    guardar();
    pintarHojaDilemas();
    pintarMesa(null);
    pintarControles();
    el.estadoDilema.textContent = "";
    global.setTimeout(function () { el.estadoDilema.textContent = "Dilema borrado."; }, 30);
    var primero = el.listaDilemas.querySelector("button");
    (primero || el.dilemaA).focus({ preventScroll: true });
  }

  function alClicEnLista(ev) {
    var boton = ev.target.closest("button[data-accion]");
    if (!boton) return;
    var fila = boton.closest(".dilema");
    var id = fila && fila.dataset.id;
    var confirmar = fila.querySelector(".confirmar");
    var accion = boton.dataset.accion;
    if (accion === "editar") editarDilema(id);
    else if (accion === "borrar") {
      confirmar.hidden = false;
      boton.hidden = true;
      confirmar.querySelector("[data-accion='no-borrar']").focus();
    } else if (accion === "no-borrar") {
      confirmar.hidden = true;
      var borrar = fila.querySelector("[data-accion='borrar']");
      borrar.hidden = false;
      borrar.focus();
    } else if (accion === "si-borrar") borrarDilema(id);
  }

  // ---------- Copiar ----------

  function copiar(texto, estado, caja) {
    caja.hidden = true;
    estado.textContent = "";
    var listo = false;
    var espera = 0;
    function falla() {
      if (listo) return;
      listo = true;
      global.clearTimeout(espera);
      caja.value = texto;
      caja.hidden = false;
      caja.focus();
      caja.select();
      estado.textContent = "No se pudo copiar directo. Aquí está el texto: selecciónalo y cópialo.";
    }
    function bien() {
      global.clearTimeout(espera);
      caja.hidden = true;
      estado.textContent = "Copiado.";
      listo = true;
    }
    try {
      if (!global.navigator || !navigator.clipboard || !navigator.clipboard.writeText) { falla(); return; }
      // Hay navegadores incrustados que dejan la promesa pendiente sin
      // contestar: si tarda, se muestra el texto de todos modos.
      espera = global.setTimeout(falla, 1200);
      navigator.clipboard.writeText(texto).then(bien, falla);
    } catch (e) {
      falla();
    }
  }

  // ---------- Resultados de la prueba ----------

  function pintarResultados() {
    var grupos = Logica.agruparMarcas(E.marcas, cat);
    var total = Logica.VEREDICTOS.reduce(function (n, v) { return n + grupos[v].length; }, 0);
    el.resumenResultados.textContent = plural(total, "carta marcada", "cartas marcadas") +
      " de " + cat.ids.length + ".";
    el.listaResultados.textContent = "";
    Logica.VEREDICTOS.forEach(function (v) {
      var seccion = crear("section", "veredicto veredicto--" + v);
      var titulo = crear("h3", "veredicto__titulo", Logica.NOMBRE_VEREDICTO[v] + " ");
      titulo.appendChild(crear("span", "veredicto__cuenta", "(" + grupos[v].length + ")"));
      seccion.appendChild(titulo);
      if (grupos[v].length) {
        var ul = crear("ul", "veredicto__lista");
        grupos[v].forEach(function (c) {
          var li = crear("li");
          li.appendChild(crear("span", "veredicto__id", c.id));
          var t = crear("span", "veredicto__texto");
          t.appendChild(document.createTextNode(c.a));
          t.appendChild(crear("span", "dilema__o", " o "));
          t.appendChild(document.createTextNode(c.b));
          li.appendChild(t);
          ul.appendChild(li);
        });
        seccion.appendChild(ul);
      } else {
        seccion.appendChild(crear("p", "nota", "Ninguna."));
      }
      el.listaResultados.appendChild(seccion);
    });
    el.sinMarcas.hidden = total > 0;
    el.accionesResultados.hidden = total === 0;
    el.listaResultados.hidden = total === 0;
    el.preguntaBorrarMarcas.textContent = "¿Borrar " + (total === 1 ? "la marca" : "las " + total + " marcas") + "? No se puede deshacer.";
    if (total === 0) {
      el.copiaResultados.hidden = true;
      el.estadoCopiaResultados.textContent = "";
    }
  }

  // ---------- Arranque ----------

  function referencias() {
    [
      "app", "logo", "cuenta", "chip-prueba", "marcadas", "escenario", "hueco", "monton", "anuncio",
      "pie", "veredictos", "anterior", "siguiente", "siguiente-texto", "fin-prueba",
      "hoja-mazo", "hoja-dilemas", "hoja-reglas", "hoja-resultados",
      "lista-categorias", "nota-categorias", "incluir-propios", "cuantos-propios", "sin-propios",
      "resumen-mazo", "barajar", "modo-prueba", "ir-a-resultados", "ir-a-dilemas",
      "form-dilema", "dilema-a", "dilema-b", "contador-a", "contador-b", "vista-dilema", "error-dilema",
      "estado-dilema", "guardar-dilema", "cancelar-edicion", "lista-dilemas", "cuantos-guardados",
      "sin-dilemas", "propios-apagados", "copiar-dilemas", "estado-copia-dilemas", "copia-dilemas",
      "reglas-carta", "resumen-resultados", "lista-resultados", "sin-marcas", "acciones-resultados",
      "copiar-resultados", "estado-copia-resultados", "copia-resultados", "borrar-marcas",
      "confirmar-marcas", "pregunta-borrar-marcas", "si-borrar-marcas", "no-borrar-marcas"
    ].forEach(function (id) {
      var nombre = id.replace(/-([a-z])/g, function (m, l) { return l.toUpperCase(); });
      el[nombre] = $(id);
    });
  }

  function escuchar() {
    el.escenario.addEventListener("pointerdown", alPresionar);
    el.escenario.addEventListener("pointermove", alMover);
    el.escenario.addEventListener("pointerup", alSoltar);
    el.escenario.addEventListener("pointercancel", alCancelar);
    el.escenario.addEventListener("lostpointercapture", alCancelar);
    document.addEventListener("keydown", alTeclear);

    el.siguiente.addEventListener("click", function () { siguiente(); });
    el.anterior.addEventListener("click", function () { anterior(); });
    el.veredictos.addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-veredicto]");
      if (b) marcar(b.dataset.veredicto);
    });

    document.querySelectorAll("[data-abre]").forEach(function (b) {
      b.addEventListener("click", function () {
        var hoja = $(b.dataset.abre);
        var dentro = b.closest("dialog");
        abrir(hoja, dentro ? abridor : b);
      });
    });

    document.querySelectorAll("dialog.hoja").forEach(function (hoja) {
      hoja.addEventListener("close", function () { alCerrar(hoja); });
      // Un clic fuera del papel cae en el propio <dialog> (su fondo).
      hoja.addEventListener("click", function (ev) { if (ev.target === hoja) cerrar(hoja); });
      hoja.querySelectorAll("[data-cerrar]").forEach(function (b) {
        b.addEventListener("click", function () { cerrar(hoja); });
      });
    });

    el.listaCategorias.addEventListener("change", alCambiarCategoria);
    el.incluirPropios.addEventListener("change", function () {
      cambiarAjustes({ inactivas: E.ajustes.inactivas.slice(), propios: el.incluirPropios.checked, prueba: E.ajustes.prueba });
    });
    el.modoPrueba.addEventListener("change", function () {
      cambiarAjustes({ inactivas: E.ajustes.inactivas.slice(), propios: E.ajustes.propios, prueba: el.modoPrueba.checked });
    });
    el.barajar.addEventListener("click", function () {
      cerrarSinFoco(el.hojaMazo);
      barajarDeNuevo();
      el.siguiente.focus({ preventScroll: true });
    });

    el.formDilema.addEventListener("submit", alGuardarDilema);
    el.dilemaA.addEventListener("input", function () { el.errorDilema.textContent = ""; vistaPrevia(); });
    el.dilemaB.addEventListener("input", function () { el.errorDilema.textContent = ""; vistaPrevia(); });
    el.cancelarEdicion.addEventListener("click", function () { limpiarFormulario(); el.dilemaA.focus(); });
    el.listaDilemas.addEventListener("click", alClicEnLista);
    el.copiarDilemas.addEventListener("click", function () {
      copiar(Logica.textoDilemas(E.propios), el.estadoCopiaDilemas, el.copiaDilemas);
    });

    el.copiarResultados.addEventListener("click", function () {
      copiar(Logica.textoResultados(E.marcas, cat, "Resultados de la prueba · " + (MAZO.nombre || "A o D")),
        el.estadoCopiaResultados, el.copiaResultados);
    });
    el.borrarMarcas.addEventListener("click", function () {
      el.confirmarMarcas.hidden = false;
      el.borrarMarcas.hidden = true;
      el.noBorrarMarcas.focus();
    });
    el.noBorrarMarcas.addEventListener("click", function () {
      el.confirmarMarcas.hidden = true;
      el.borrarMarcas.hidden = false;
      el.borrarMarcas.focus();
    });
    el.siBorrarMarcas.addEventListener("click", function () {
      E.marcas = {};
      guardar();
      el.confirmarMarcas.hidden = true;
      el.borrarMarcas.hidden = false;
      pintarResultados();
      pintarControles();
      el.sinMarcas.focus();
    });

    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible" && Logica.estadoDe(E.partida) !== "inicio") pedirPantalla();
    });
  }

  function iniciar() {
    if (!document.documentElement.lang) document.documentElement.lang = "es";
    referencias();
    if (!el.app) return;
    E = Logica.sanear(Almacen.leer(), MAZO);
    rehacerCatalogo();
    guardar();
    el.logo.appendChild(Carta.logotipo({ variante: "marca" }));
    el.reglasCarta.appendChild(Carta.reglas());
    construirCategorias();
    escuchar();
    pintar(null, null, false);
    vistaPrevia();
  }

  global.AoD = {
    // Para páginas de prueba: el estado actual sin tocar nada.
    estado: function () { return JSON.parse(JSON.stringify(E)); },
    siguiente: function () { siguiente(); },
    anterior: function () { anterior(); },
    barajar: barajarDeNuevo
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})(typeof window !== "undefined" ? window : globalThis);
