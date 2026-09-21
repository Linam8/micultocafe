/* ============================================================
   CULTO CAFÉ — main.js  (compartido ES / EN)
   ============================================================ */
(function () {
  "use strict";
  var LANG = (document.documentElement.lang || "es").slice(0, 2);
  var EN = LANG === "en";

  var T = {
    es: {
      distancia: "a ", metros: " m", km: " km", cerca: "Más cerca de ti",
      comoLlegar: "Cómo llegar", verInsta: "Ver en Instagram", webOficial: "Web oficial",
      todas: "Todas", sinResultados: "Ninguna cafetería con esos filtros",
      quitaFiltro: "Prueba a quitar alguno para ver más opciones.",
      count1: " cafeterías", countMid: " de ", ubicando: "Buscando tu ubicación…",
      permiso: "Activa la ubicación para ordenar por cercanía", tuUbic: "Estás aquí",
      tranquilo: "Tranquilo", medio: "Ambiente medio", animado: "Animado",
      wifi: "Wi-Fi", enchufes: "Enchufes", dir: "Dirección", horario: "Horario",
      precios: "Precios", desde: "Desde", metodos: "Métodos", tostador: "Café / tostador",
      elSitio: "El sitio", ambiente: "Ambiente", terraza: "Terraza", portatil: "Para portátil",
      petfr: "Pet-friendly", tam: "Ambiente", si: "Sí", no: "No", parcial: "Parcial", probable: "Probable"
    },
    en: {
      distancia: "", metros: " m away", km: " km away", cerca: "Closest to you",
      comoLlegar: "Directions", verInsta: "View on Instagram", webOficial: "Official site",
      todas: "All", sinResultados: "No cafés match those filters",
      quitaFiltro: "Try removing one to see more options.",
      count1: " cafés", countMid: " of ", ubicando: "Finding your location…",
      permiso: "Turn on location to sort by distance", tuUbic: "You are here",
      tranquilo: "Quiet", medio: "Moderate", animado: "Lively",
      wifi: "Wi-Fi", enchufes: "Sockets", dir: "Address", horario: "Hours",
      precios: "Prices", desde: "From", metodos: "Methods", tostador: "Coffee / roaster",
      elSitio: "About", ambiente: "Vibe", terraza: "Terrace", portatil: "Laptop-friendly",
      petfr: "Pet-friendly", tam: "Space", si: "Yes", no: "No", parcial: "Partly", probable: "Likely"
    }
  }[EN ? "en" : "es"];

  var BARRIO_LABEL = {
    malasana: "Malasaña",
    letras: EN ? "Las Letras" : "Barrio de las Letras",
    lavapies: "Lavapiés"
  };
  var BRAND = { malasana: "#3B82F6", letras: "#BB7CF6", lavapies: "#A7C957" };

  /* ---------- Header ---------- */
  var header = document.getElementById("header");
  if (header) {
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    var navToggle = document.getElementById("navToggle");
    if (navToggle) {
      navToggle.addEventListener("click", function () {
        var open = header.classList.toggle("nav-open");
        navToggle.setAttribute("aria-expanded", String(open));
      });
      header.querySelectorAll(".nav a").forEach(function (a) {
        a.addEventListener("click", function () { header.classList.remove("nav-open"); navToggle.setAttribute("aria-expanded", "false"); });
      });
    }
  }

  /* ---------- Datos ---------- */
  var CAFES = window.CULTO_CAFES || [];
  var textos = EN ? (window.CULTO_CAFES_EN || {}) : {};
  CAFES.forEach(function (c) {
    if (EN && textos[c.n]) { c.descLoc = textos[c.n].desc; c.actsLoc = textos[c.n].acts; }
    else { c.descLoc = c.desc; c.actsLoc = c.acts; }
  });

  var grid = document.getElementById("grid");
  if (!grid) return;
  var countEl = document.getElementById("count");
  var geoNote = document.getElementById("geoNote");

  /* ---------- Utilidades ---------- */
  function truthy(v) { return /^s[íi]|^y/i.test((v || "").trim()); }
  function ruidoTxt(r) { return r <= 2 ? T.tranquilo : (r === 3 ? T.medio : T.animado); }
  function actMatch(c, act) {
    return c.acts.some(function (a) {
      a = a.toLowerCase();
      if (act === "quedar") return a.indexOf("socializar") === 0 || a.indexOf("reunirse") === 0;
      return a.indexOf(act) === 0;
    });
  }
  function haversine(a, b, c, d) {
    var R = 6371e3, p = Math.PI / 180;
    var dLat = (c - a) * p, dLng = (d - b) * p;
    var s = Math.sin(dLat / 2) ** 2 + Math.cos(a * p) * Math.cos(c * p) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s));
  }
  function fmtDist(m) {
    if (m == null) return "";
    return m < 1000 ? T.distancia + Math.round(m / 10) * 10 + T.metros
                    : T.distancia + (m / 1000).toFixed(1).replace(".", EN ? "." : ",") + T.km;
  }
  var BASE = EN ? "../" : "";
  function img(name) { return BASE + "assets/img/" + name; }
  function dirUrl(c) { return "https://www.google.com/maps/dir/?api=1&destination=" + c.lat + "," + c.lng; }

  /* ---------- Estado / filtros ---------- */
  var state = { barrio: "todas", act: "todas", flags: {}, user: null };

  function matches(c) {
    if (state.barrio !== "todas" && c.bz !== state.barrio) return false;
    if (state.act !== "todas" && !actMatch(c, state.act)) return false;
    var f = state.flags;
    if (f.wifi && !truthy(c.wifi)) return false;
    if (f.terraza && !truthy(c.terraza)) return false;
    if (f.pet && !(truthy(c.pet) || /probable/i.test(c.pet))) return false;
    if (f["e"] && c.nivel !== "€") return false;
    if (f["ee"] && c.nivel !== "€€") return false;
    if (f["eee"] && c.nivel !== "€€€") return false;
    return true;
  }

  function sorted(list) {
    if (state.user) {
      return list.slice().sort(function (a, b) { return a._d - b._d; });
    }
    var order = { malasana: 0, letras: 1, lavapies: 2 };
    return list.slice().sort(function (a, b) {
      return (order[a.bz] - order[b.bz]) || a.n.localeCompare(b.n);
    });
  }

  /* ---------- Mapa (Leaflet + OSM) ---------- */
  var map, markers = {}, userMarker = null;
  function centroid() {
    if (!CAFES.length) return [40.4255, -3.7045];
    var lat = 0, lng = 0;
    CAFES.forEach(function (c) { lat += c.lat; lng += c.lng; });
    return [lat / CAFES.length, lng / CAFES.length];
  }
  function initMap() {
    if (typeof L === "undefined") { document.getElementById("map").style.display = "none"; return; }
    map = L.map("map", { scrollWheelZoom: false }).setView(centroid(), 15);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19, attribution: "© OpenStreetMap"
    }).addTo(map);
    CAFES.forEach(function (c) {
      var icon = L.divIcon({
        className: "pin", html: '<span style="--pc:' + BRAND[c.bz] + '"></span>',
        iconSize: [20, 20], iconAnchor: [10, 10]
      });
      var m = L.marker([c.lat, c.lng], { icon: icon, title: c.n }).addTo(map);
      m.bindPopup(
        '<strong>' + c.n + '</strong><br>' + BARRIO_LABEL[c.bz] + ' · ' + c.nivel +
        '<br><a href="' + dirUrl(c) + '" target="_blank" rel="noopener">' + T.comoLlegar + ' →</a>'
      );
      m.on("click", function () { highlightCard(c.n); });
      markers[c.n] = m;
    });
  }
  function highlightCard(name) {
    var el = grid.querySelector('[data-name="' + CSS.escape(name) + '"]');
    if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.classList.add("flash"); setTimeout(function () { el.classList.remove("flash"); }, 1200); }
  }

  /* ---------- Geolocalización ---------- */
  function askLocation() {
    if (!navigator.geolocation) return;
    geoNote.textContent = T.ubicando;
    navigator.geolocation.getCurrentPosition(function (pos) {
      state.user = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      CAFES.forEach(function (c) { c._d = haversine(state.user.lat, state.user.lng, c.lat, c.lng); });
      geoNote.textContent = "";
      if (map) {
        userMarker && map.removeLayer(userMarker);
        userMarker = L.marker([state.user.lat, state.user.lng], {
          icon: L.divIcon({ className: "pin pin-user", html: "<span></span>", iconSize: [22, 22], iconAnchor: [11, 11] }),
          title: T.tuUbic, zIndexOffset: 1000
        }).addTo(map).bindPopup(T.tuUbic);
        map.setView([state.user.lat, state.user.lng], 15);
      }
      render();
    }, function () {
      geoNote.textContent = T.permiso;
    }, { enableHighAccuracy: true, timeout: 8000 });
  }

  /* ---------- Render ---------- */
  function chip(txt) { return '<span class="cafe-chip">' + txt + '</span>'; }

  function render() {
    var list = sorted(CAFES.filter(matches));
    if (countEl) countEl.textContent = list.length === CAFES.length
      ? list.length + T.count1
      : list.length + T.countMid + CAFES.length + T.count1;
    grid.innerHTML = "";
    if (!list.length) {
      grid.innerHTML = '<div class="cafe-empty"><strong>' + T.sinResultados + '</strong>' + T.quitaFiltro + '</div>';
      return;
    }
    list.forEach(function (c, i) {
      var nearest = state.user && i === 0;
      var card = document.createElement("article");
      card.className = "cafe-card" + (nearest ? " is-near" : "");
      card.setAttribute("data-name", c.n);
      card.setAttribute("data-zona", c.bz);
      var dist = state.user ? '<span class="cafe-dist">' + fmtDist(c._d) + '</span>' : "";
      var nearTag = nearest ? '<span class="cafe-neartag">' + T.cerca + '</span>' : "";
      card.innerHTML =
        '<button class="cafe-open" aria-label="' + c.n + '">' +
          '<div class="cafe-thumb">' +
            '<img class="cafe-foto" src="' + img(c.foto) + '" alt="" loading="lazy">' +
            nearTag +
            '<span class="cafe-zona">' + BARRIO_LABEL[c.bz] + '</span>' +
          '</div>' +
          '<div class="cafe-info">' +
            '<span class="cafe-nombre">' + c.n + '</span>' +
            '<span class="cafe-meta"><span>' + c.barrio.replace("Barrio de las Letras", BARRIO_LABEL.letras) + '</span>' +
              '<span class="punto"></span><span class="precio">' + T.desde.toLowerCase() + ' ' + c.desde + ' €</span>' +
              (dist ? '<span class="punto"></span>' + dist : '') + '</span>' +
            '<span class="cafe-chips">' + [
              truthy(c.wifi) ? chip(T.wifi) : "",
              chip(T.enchufes + ": " + (EN ? enEnch(c.ench) : c.ench.split(" ")[0])),
              chip(ruidoTxt(c.ruido))
            ].join("") + '</span>' +
            '<p class="cafe-blurb">' + firstSentence(c.descLoc) + '</p>' +
          '</div>' +
        '</button>' +
        '<a class="cafe-go" href="' + dirUrl(c) + '" target="_blank" rel="noopener">' + T.comoLlegar + ' →</a>';
      card.querySelector(".cafe-open").addEventListener("click", function () { openDialog(c); });
      grid.appendChild(card);
    });
    if (state.user && list[0] && markers[list[0].n]) {
      Object.values(markers).forEach(function (m) { m._icon && m._icon.classList.remove("pin-near"); });
      markers[list[0].n]._icon && markers[list[0].n]._icon.classList.add("pin-near");
    }
  }
  function enEnch(s) { s = s.toLowerCase(); if (s.indexOf("much") === 0) return "many"; if (s.indexOf("medi") === 0) return "some"; if (s.indexOf("sí") === 0) return "yes"; return "few"; }
  function firstSentence(t) { var p = t.split(". "); return p[0] + (p.length > 1 ? "." : ""); }

  /* ---------- Ficha ---------- */
  var dlg = document.getElementById("dlg");
  var dlgMedia = document.getElementById("dlgMedia");
  var dlgBody = document.getElementById("dlgBody");
  document.getElementById("dlgClose").addEventListener("click", function () { dlg.close(); });
  dlg.addEventListener("click", function (e) {
    var r = dlg.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dlg.close();
  });

  function openDialog(c) {
    dlgMedia.innerHTML = '<img src="' + img(c.foto) + '" alt="' + c.n + '">';
    var rows = [
      [T.dir, c.dir],
      [T.horario, c.hor],
      [T.precios, T.desde + " <strong>" + c.desde + " €</strong> · " + c.prref],
      [T.tostador, c.tost],
      [T.metodos, c.met],
      [T.elSitio, c.descLoc]
    ].map(function (r) { return '<div class="dlg-row"><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join("");
    var yn = function (v) { return truthy(v) ? T.si : /parcial|solo|limitad/i.test(v) ? T.parcial : /probable/i.test(v) ? T.probable : T.no; };
    var attrs = [
      [T.portatil, yn(c.laptop)], [T.ambiente, ruidoTxt(c.ruido)],
      [T.wifi, truthy(c.wifi) ? T.si : T.no], [T.enchufes, EN ? enEnch(c.ench) : c.ench.split(" ")[0]],
      [T.terraza, yn(c.terraza)], [T.petfr, yn(c.pet)]
    ].map(function (a) { return '<div class="dlg-attr"><b>' + a[0] + '</b>' + a[1] + '</div>'; }).join("");
    var links = '<a class="btn" href="' + dirUrl(c) + '" target="_blank" rel="noopener">' + T.comoLlegar + '</a>' +
      (c.web ? '<a class="btn btn-ghost" href="https://' + c.web + '" target="_blank" rel="noopener">' + T.webOficial + '</a>' : '') +
      '<a class="btn btn-ghost" href="https://instagram.com/' + c.ig + '" target="_blank" rel="noopener">Instagram</a>';
    dlgBody.innerHTML =
      '<h2 id="dlg-name">' + c.n + '</h2>' +
      '<p class="dlg-sub">' + c.barrio.replace("Barrio de las Letras", BARRIO_LABEL.letras) +
        (state.user && c._d != null ? ' · ' + fmtDist(c._d).trim() : '') + '</p>' +
      '<dl>' + rows + '</dl>' +
      '<div class="dlg-attrs">' + attrs + '</div>' +
      '<div class="dlg-actions">' + links + '</div>';
    dlg.showModal();
  }

  /* ---------- Wiring de filtros ---------- */
  document.querySelectorAll(".fchip[data-barrio]").forEach(function (ch) {
    ch.addEventListener("click", function () {
      state.barrio = ch.getAttribute("data-barrio");
      setGroup("data-barrio", ch); render();
    });
  });
  document.querySelectorAll(".fchip[data-act]").forEach(function (ch) {
    ch.addEventListener("click", function () {
      state.act = ch.getAttribute("data-act");
      setGroup("data-act", ch); render();
    });
  });
  document.querySelectorAll(".fchip[data-flag]").forEach(function (ch) {
    ch.addEventListener("click", function () {
      var f = ch.getAttribute("data-flag");
      state.flags[f] = !state.flags[f];
      ch.setAttribute("aria-pressed", String(!!state.flags[f]));
      render();
    });
  });
  function setGroup(attr, active) {
    document.querySelectorAll(".fchip[" + attr + "]").forEach(function (o) {
      o.setAttribute("aria-pressed", String(o === active));
    });
  }
  var geoBtn = document.getElementById("geoBtn");
  if (geoBtn) geoBtn.addEventListener("click", askLocation);

  // Oculta el filtro de barrio si todas las cafeterías están en la misma zona
  var zonas = {}; CAFES.forEach(function (c) { zonas[c.bz] = true; });
  if (Object.keys(zonas).length <= 1) {
    var gb = document.getElementById("grupoBarrio");
    if (gb) gb.hidden = true;
  }

  initMap();
  render();
})();
