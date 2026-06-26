// ───────────────────────────────────────────────────────────
//  app.js — Lógica de interfaz del panel.
//  Solo consume los endpoints existentes (api.js) según los
//  descriptores de entities.js. No define ni altera lógica de
//  negocio: arma vistas, formularios y maneja eventos.
// ───────────────────────────────────────────────────────────

// ─── Utilidades DOM ───
function el(tag, props = {}, hijos = []) {
  const nodo = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") nodo.className = v;
    else if (k === "html") nodo.innerHTML = v;
    else if (k === "text") nodo.textContent = v;
    else if (k.startsWith("on") && typeof v === "function") {
      nodo.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (v !== null && v !== undefined && v !== false) {
      nodo.setAttribute(k, v);
    }
  }
  for (const h of [].concat(hijos)) {
    if (h == null || h === false) continue;
    nodo.appendChild(typeof h === "string" ? document.createTextNode(h) : h);
  }
  return nodo;
}

function icono(id, clase = "ico") {
  return `<svg class="${clase}" aria-hidden="true"><use href="#${id}"></use></svg>`;
}

// ─── Concordancia de género (es) ───
// Cada entidad trae `genero: "m" | "f"` en entities.js.
const esFem = (entidad) => (entidad && entidad.genero === "f");
const gNuevo = (entidad) => (esFem(entidad) ? "Nueva" : "Nuevo");
const gCreado = (entidad) => (esFem(entidad) ? "creada" : "creado");
const gActualizado = (entidad) => (esFem(entidad) ? "actualizada" : "actualizado");
const gEliminado = (entidad) => (esFem(entidad) ? "eliminada" : "eliminado");
const gArticulo = (entidad) => (esFem(entidad) ? "la" : "el");
const gPrimer = (entidad) => (esFem(entidad) ? "primera" : "primer");

const $vista = () => document.getElementById("vista");

// ─── Avisos (toasts) ───
function aviso(mensaje, tipo = "ok") {
  const cont = document.getElementById("toasts");
  const t = el("div", { class: "toast toast--" + tipo, role: "status" }, [
    el("span", { html: icono(tipo === "error" ? "icon-alert" : "icon-check", "ico") }),
    el("span", { text: mensaje }),
  ]);
  cont.appendChild(t);
  setTimeout(() => t.classList.add("toast--out"), 3200);
  setTimeout(() => t.remove(), 3600);
}

// ─── Diálogo de confirmación ───
function confirmar({ titulo, mensaje, etiqueta = "Confirmar", peligro = false }) {
  return new Promise((resolve) => {
    const fondo = el("div", { class: "overlay" });
    const cerrar = (valor) => {
      fondo.classList.add("overlay--out");
      setTimeout(() => fondo.remove(), 180);
      resolve(valor);
    };
    const caja = el("div", { class: "dialog dialog--sm" }, [
      el("h3", { class: "dialog__title", text: titulo }),
      el("p", { class: "dialog__text", text: mensaje }),
      el("div", { class: "dialog__actions" }, [
        el("button", { class: "btn btn--ghost", onClick: () => cerrar(false), text: "Cancelar" }),
        el("button", {
          class: "btn " + (peligro ? "btn--danger" : "btn--primary"),
          onClick: () => cerrar(true),
          text: etiqueta,
        }),
      ]),
    ]);
    fondo.addEventListener("click", (e) => { if (e.target === fondo) cerrar(false); });
    fondo.appendChild(caja);
    document.body.appendChild(fondo);
  });
}

// ─── Helpers de estado de cita ───
function pillEstado(valor) {
  const v = String(valor ?? "").toLowerCase();
  return `<span class="pill pill--${v}"><span class="pill__dot"></span>${valor ?? "—"}</span>`;
}

// Caché simple para poblar selects de llaves foráneas.
const cacheFK = {};
async function listaPara(recurso) {
  if (!cacheFK[recurso]) cacheFK[recurso] = await Api.listar(recurso);
  return cacheFK[recurso];
}
function invalidarCache(recurso) {
  delete cacheFK[recurso];
}

// ─── Render de tabla de una entidad ───
function celdaValor(col, fila) {
  const valor = fila[col.name];
  if (col.type === "estado") return pillEstado(valor);
  if (valor === null || valor === undefined || valor === "") return "—";
  return String(valor);
}

function tablaEntidad(entidad, filas, terminoBusqueda) {
  if (!filas.length) {
    return el("div", { class: "empty" }, [
      el("div", { class: "empty__art", html: icono(entidad.icon, "ico-xl") }),
      el("p", { class: "empty__title", text: "Sin registros todavía" }),
      el("p", { class: "empty__text", text: `Crea ${gArticulo(entidad)} ${gPrimer(entidad)} ${entidad.singular} con el botón “${gNuevo(entidad)} ${entidad.singular}”.` }),
    ]);
  }

  const q = (terminoBusqueda || "").trim().toLowerCase();
  const visibles = q
    ? filas.filter((f) =>
        entidad.columns.some((c) =>
          String(f[c.name] ?? "").toLowerCase().includes(q)
        )
      )
    : filas;

  if (!visibles.length) {
    return el("div", { class: "empty" }, [
      el("p", { class: "empty__title", text: "Nada coincide con tu búsqueda" }),
      el("p", { class: "empty__text", text: `No hay ${entidad.plural.toLowerCase()} que contengan “${terminoBusqueda}”.` }),
    ]);
  }

  const thead = el("thead", {}, [
    el("tr", {}, [
      ...entidad.columns.map((c) => el("th", { text: c.label })),
      el("th", { class: "col-acciones", text: "Acciones" }),
    ]),
  ]);

  const tbody = el("tbody", {}, visibles.map((fila) =>
    el("tr", {}, [
      ...entidad.columns.map((c) =>
        el("td", { "data-label": c.label, html: celdaValor(c, fila) })
      ),
      el("td", { class: "col-acciones" }, [
        el("button", {
          class: "btn-ico", title: "Editar",
          html: icono("icon-edit", "ico"),
          onClick: () => abrirFormulario(entidad, fila),
        }),
        el("button", {
          class: "btn-ico btn-ico--danger", title: "Eliminar",
          html: icono("icon-trash", "ico"),
          onClick: () => eliminarRegistro(entidad, fila),
        }),
      ]),
    ])
  ));

  return el("div", { class: "tabla-wrap" }, [el("table", { class: "tabla" }, [thead, tbody])]);
}

// ─── Vista de una entidad ───
async function vistaEntidad(clave) {
  const entidad = ENTITIES[clave];
  const cont = $vista();
  cont.innerHTML = "";

  const header = el("div", { class: "vista__head" }, [
    el("div", {}, [
      el("p", { class: "eyebrow", text: "Gestión" }),
      el("h1", { class: "vista__title", text: entidad.plural }),
    ]),
    el("div", { class: "vista__tools" }, [
      el("div", { class: "buscador" }, [
        el("span", { class: "buscador__ico", html: icono("icon-search", "ico") }),
        el("input", {
          type: "search", placeholder: `Buscar en ${entidad.plural.toLowerCase()}…`,
          oninput: (e) => repintar(e.target.value),
        }),
      ]),
      el("button", {
        class: "btn btn--primary",
        html: icono("icon-plus", "ico") + `<span>${gNuevo(entidad)} ${entidad.singular}</span>`,
        onClick: () => abrirFormulario(entidad, null),
      }),
    ]),
  ]);

  const meta = el("div", { class: "vista__meta" });
  const zonaTabla = el("div", { id: "zona-tabla" }, [el("div", { class: "cargando", text: "Cargando…" })]);

  cont.append(header, meta, zonaTabla);

  let filas = [];
  function repintar(termino = "") {
    zonaTabla.innerHTML = "";
    zonaTabla.appendChild(tablaEntidad(entidad, filas, termino));
  }

  try {
    filas = await Api.listar(entidad.recurso);
    cacheFK[entidad.recurso] = filas; // aprovechamos para la caché de FK
    meta.textContent = `${filas.length} ${filas.length === 1 ? "registro" : "registros"}`;
    repintar();
  } catch (e) {
    zonaTabla.innerHTML = "";
    zonaTabla.appendChild(bloqueError(e.message));
  }
}

function bloqueError(mensaje) {
  return el("div", { class: "error-box" }, [
    el("span", { html: icono("icon-alert", "ico") }),
    el("div", {}, [
      el("p", { class: "error-box__title", text: "No se pudo completar la operación" }),
      el("p", { class: "error-box__text", text: mensaje }),
    ]),
  ]);
}

// ─── Formulario crear / editar ───
async function abrirFormulario(entidad, registro) {
  const esEdicion = !!registro;
  const fondo = el("div", { class: "overlay" });
  const cerrar = () => {
    fondo.classList.add("overlay--out");
    setTimeout(() => fondo.remove(), 180);
  };
  fondo.addEventListener("click", (e) => { if (e.target === fondo) cerrar(); });

  const campos = el("div", { class: "form-grid" });
  const dialog = el("div", { class: "dialog" }, [
    el("div", { class: "dialog__head" }, [
      el("h3", {
        class: "dialog__title",
        text: (esEdicion ? "Editar " : gNuevo(entidad) + " ") + entidad.singular,
      }),
      el("button", { class: "btn-ico", html: icono("icon-x", "ico"), onClick: cerrar, title: "Cerrar" }),
    ]),
    campos,
    el("div", { class: "dialog__actions" }, [
      el("button", { class: "btn btn--ghost", onClick: cerrar, text: "Cancelar" }),
      el("button", {
        class: "btn btn--primary", id: "btn-guardar",
        text: esEdicion ? "Guardar cambios" : "Crear " + entidad.singular,
      }),
    ]),
  ]);
  fondo.appendChild(dialog);
  document.body.appendChild(fondo);

  // Construimos los controles de cada campo.
  const controles = {};
  for (const f of entidad.fields) {
    const idCtrl = "f_" + f.name;
    const bloqueado = esEdicion && f.lockedOnEdit;

    const grupo = el("div", { class: "campo" });
    grupo.appendChild(
      el("label", { for: idCtrl, class: "campo__label" }, [
        f.label,
        f.required ? el("span", { class: "req", text: " *" }) : null,
      ])
    );

    let control;
    if (f.type === "select") {
      control = el("select", { id: idCtrl, class: "input" }, [
        el("option", { value: "", text: "Selecciona…", disabled: "disabled" }),
        ...f.options.map((op) => el("option", { value: op, text: op })),
      ]);
    } else if (f.type === "fk") {
      control = el("select", { id: idCtrl, class: "input" }, [
        el("option", { value: "", text: "Cargando…", disabled: "disabled", selected: "selected" }),
      ]);
      // Poblamos asíncronamente desde el GET real de la entidad referenciada.
      listaPara(f.fk.recurso)
        .then((lista) => {
          control.innerHTML = "";
          control.appendChild(el("option", { value: "", text: "Selecciona…" }));
          for (const item of lista) {
            control.appendChild(el("option", { value: item.id, text: f.fk.labelFn(item) }));
          }
          if (registro && registro[f.name] != null) control.value = String(registro[f.name]);
        })
        .catch(() => {
          control.innerHTML = "";
          control.appendChild(el("option", { value: "", text: "Error al cargar opciones" }));
        });
    } else {
      const tipoInput = f.type === "email" ? "email"
        : f.type === "number" ? "number"
        : f.type === "date" ? "date"
        : f.type === "time" ? "time" : "text";
      control = el("input", { id: idCtrl, class: "input", type: tipoInput });
    }

    // Valor inicial.
    if (registro && registro[f.name] != null && f.type !== "fk") {
      control.value = f.type === "date"
        ? String(registro[f.name]).slice(0, 10)
        : String(registro[f.name]);
    } else if (!registro && f.default) {
      control.value = f.default();
    }

    if (bloqueado) {
      control.setAttribute("disabled", "disabled");
      control.classList.add("input--locked");
    }

    grupo.appendChild(control);
    if (f.hint) grupo.appendChild(el("p", { class: "campo__hint", text: f.hint }));
    if (bloqueado) grupo.appendChild(el("p", { class: "campo__hint", text: "No editable: el backend no actualiza este campo." }));

    campos.appendChild(grupo);
    controles[f.name] = control;
  }

  // Guardar.
  dialog.querySelector("#btn-guardar").addEventListener("click", async () => {
    const payload = {};
    for (const f of entidad.fields) {
      // En edición, omitimos los campos bloqueados (el PUT del backend no los toca).
      if (esEdicion && f.lockedOnEdit) continue;
      let valor = controles[f.name].value;

      if (f.required && (valor === "" || valor === null)) {
        aviso(`El campo “${f.label}” es obligatorio.`, "error");
        controles[f.name].focus();
        return;
      }
      // Conversión de tipos según lo que espera el backend.
      if (f.type === "number" || f.type === "fk") {
        valor = valor === "" ? null : Number(valor);
      }
      payload[f.name] = valor;
    }
    if (esEdicion) payload.id = registro.id; // el backend toma el id desde el body

    const btn = dialog.querySelector("#btn-guardar");
    btn.disabled = true;
    btn.textContent = "Guardando…";
    try {
      if (esEdicion) await Api.actualizar(entidad.recurso, payload);
      else await Api.crear(entidad.recurso, payload);
      invalidarCache(entidad.recurso);
      aviso(esEdicion ? `${entidad.singular} ${gActualizado(entidad)}.` : `${entidad.singular} ${gCreado(entidad)}.`);
      cerrar();
      router(); // recargar vista actual
    } catch (e) {
      aviso(e.message, "error");
      btn.disabled = false;
      btn.textContent = esEdicion ? "Guardar cambios" : "Crear " + entidad.singular;
    }
  });

  // Foco al primer control.
  const primero = campos.querySelector(".input");
  if (primero) primero.focus();
}

// ─── Eliminar ───
async function eliminarRegistro(entidad, registro) {
  const ok = await confirmar({
    titulo: `Eliminar ${entidad.singular}`,
    mensaje: `Se eliminará ${gArticulo(entidad)} ${entidad.singular} #${registro.id}. Esta acción no se puede deshacer.`,
    etiqueta: "Eliminar",
    peligro: true,
  });
  if (!ok) return;
  try {
    await Api.eliminar(entidad.recurso, registro.id);
    invalidarCache(entidad.recurso);
    aviso(`${entidad.singular} #${registro.id} ${gEliminado(entidad)}.`);
    router();
  } catch (e) {
    aviso(e.message, "error");
  }
}

// ─── Tabla genérica (para consultas de forma arbitraria) ───
function tablaGenerica(filas) {
  if (!Array.isArray(filas) || !filas.length) {
    return el("p", { class: "consulta__vacio", text: "La consulta no devolvió resultados." });
  }
  const cols = Object.keys(filas[0]);
  const thead = el("thead", {}, [el("tr", {}, cols.map((c) => el("th", { text: c })))]);
  const tbody = el("tbody", {}, filas.map((fila) =>
    el("tr", {}, cols.map((c) =>
      el("td", { "data-label": c, text: fila[c] === null || fila[c] === undefined ? "—" : String(fila[c]) })
    ))
  ));
  return el("div", { class: "tabla-wrap" }, [el("table", { class: "tabla tabla--compacta" }, [thead, tbody])]);
}

// ─── Vista de consultas especiales ───
function vistaConsultas() {
  const cont = $vista();
  cont.innerHTML = "";
  cont.appendChild(
    el("div", { class: "vista__head" }, [
      el("div", {}, [
        el("p", { class: "eyebrow", text: "Analítica" }),
        el("h1", { class: "vista__title", text: "Consultas" }),
        el("p", { class: "vista__sub", text: "Reportes de solo lectura provistos por el backend." }),
      ]),
    ])
  );

  const grid = el("div", { class: "consultas-grid" });
  for (const c of CONSULTAS) {
    const resultado = el("div", { class: "consulta__resultado" });
    const btn = el("button", { class: "btn btn--ghost btn--sm", text: "Ejecutar" });
    btn.addEventListener("click", async () => {
      btn.disabled = true; btn.textContent = "Ejecutando…";
      resultado.innerHTML = "";
      try {
        const filas = await c.fn();
        resultado.appendChild(tablaGenerica(filas));
      } catch (e) {
        resultado.appendChild(bloqueError(e.message));
      } finally {
        btn.disabled = false; btn.textContent = "Actualizar";
      }
    });
    grid.appendChild(
      el("div", { class: "consulta" }, [
        el("div", { class: "consulta__head" }, [
          el("div", {}, [
            el("h3", { class: "consulta__titulo", text: c.titulo }),
            el("p", { class: "consulta__desc", text: c.descripcion }),
          ]),
          btn,
        ]),
        resultado,
      ])
    );
  }

  // Acción destructiva del backend.
  const danger = el("div", { class: "consulta consulta--danger" }, [
    el("div", { class: "consulta__head" }, [
      el("div", {}, [
        el("h3", { class: "consulta__titulo", text: "Eliminar recetas de citas canceladas" }),
        el("p", { class: "consulta__desc", text: "Borra todas las recetas asociadas a citas en estado cancelada." }),
      ]),
      el("button", {
        class: "btn btn--danger btn--sm", text: "Ejecutar limpieza",
        onClick: async () => {
          const ok = await confirmar({
            titulo: "Eliminar recetas de citas canceladas",
            mensaje: "Se eliminarán de forma permanente todas las recetas ligadas a citas canceladas. ¿Continuar?",
            etiqueta: "Eliminar", peligro: true,
          });
          if (!ok) return;
          try {
            const filas = await Api.consultas.eliminarRecetasCitasCanceladas();
            const n = Array.isArray(filas) ? filas.length : 0;
            aviso(`Recetas eliminadas: ${n}.`);
            invalidarCache("receta");
          } catch (e) {
            aviso(e.message, "error");
          }
        },
      }),
    ]),
  ]);

  cont.append(grid, danger);
}

// ─── Dashboard ───
async function vistaDashboard() {
  const cont = $vista();
  cont.innerHTML = "";
  cont.appendChild(
    el("div", { class: "vista__head" }, [
      el("div", {}, [
        el("p", { class: "eyebrow", text: "Resumen" }),
        el("h1", { class: "vista__title", text: "Panel de la clínica" }),
        el("p", { class: "vista__sub", text: "Una mirada rápida al estado de los registros." }),
      ]),
    ])
  );

  const stats = el("div", { class: "stats" });
  cont.appendChild(stats);
  for (const clave of ENTIDADES_ORDEN) {
    const e = ENTITIES[clave];
    const card = el("a", { class: "stat", href: "#/e/" + clave }, [
      el("span", { class: "stat__ico", html: icono(e.icon, "ico") }),
      el("div", {}, [
        el("span", { class: "stat__num", text: "…" }),
        el("span", { class: "stat__label", text: e.plural }),
      ]),
    ]);
    stats.appendChild(card);
    Api.listar(clave)
      .then((filas) => { card.querySelector(".stat__num").textContent = filas.length; })
      .catch(() => { card.querySelector(".stat__num").textContent = "!"; });
  }

  // Dos widgets útiles.
  const widgets = el("div", { class: "widgets" });
  cont.appendChild(widgets);
  widgets.append(
    widgetConsulta("Citas pendientes", () => Api.consultas.citasPendientes()),
    widgetConsulta("Pacientes sin cita", () => Api.consultas.pacientesSinCita())
  );
}

function widgetConsulta(titulo, fn) {
  const cuerpo = el("div", { class: "widget__body", text: "Cargando…" });
  fn()
    .then((filas) => {
      cuerpo.innerHTML = "";
      cuerpo.appendChild(tablaGenerica(filas));
    })
    .catch((e) => { cuerpo.innerHTML = ""; cuerpo.appendChild(bloqueError(e.message)); });
  return el("section", { class: "widget" }, [
    el("h3", { class: "widget__title", text: titulo }),
    cuerpo,
  ]);
}

// ─── Router por hash ───
function router() {
  const hash = location.hash || "#/dashboard";
  document.querySelectorAll(".nav__link").forEach((a) =>
    a.classList.toggle("is-active", a.getAttribute("href") === hash)
  );
  cerrarSidebarMovil();

  if (hash === "#/dashboard") return vistaDashboard();
  if (hash === "#/consultas") return vistaConsultas();
  const m = hash.match(/^#\/e\/(\w+)$/);
  if (m && ENTITIES[m[1]]) return vistaEntidad(m[1]);
  location.hash = "#/dashboard";
}

// ─── Barra de conexión ───
async function verificarConexion() {
  const banner = document.getElementById("conexion");
  const punto = document.getElementById("estado-punto");
  try {
    await Api.ping();
    banner.classList.add("oculto");
    punto.className = "punto punto--ok";
    punto.title = "Conectado a " + getApiBase();
    return true;
  } catch (e) {
    banner.classList.remove("oculto");
    document.getElementById("conexion-msg").textContent = e.message;
    punto.className = "punto punto--off";
    punto.title = "Sin conexión";
    return false;
  }
}

// ─── Construcción de la barra lateral ───
function construirNav() {
  const nav = document.getElementById("nav-entidades");
  for (const clave of ENTIDADES_ORDEN) {
    const e = ENTITIES[clave];
    nav.appendChild(
      el("a", { class: "nav__link", href: "#/e/" + clave }, [
        el("span", { class: "nav__ico", html: icono(e.icon, "ico") }),
        el("span", { text: e.plural }),
      ])
    );
  }
}

// ─── Sidebar en móvil ───
function abrirSidebarMovil() { document.body.classList.add("sidebar-abierto"); }
function cerrarSidebarMovil() { document.body.classList.remove("sidebar-abierto"); }

// ─── Inicio ───
function init() {
  construirNav();

  document.getElementById("menu-toggle").addEventListener("click", abrirSidebarMovil);
  document.getElementById("backdrop").addEventListener("click", cerrarSidebarMovil);

  // Barra de conexión: permitir cambiar la URL del backend en caliente.
  document.getElementById("conexion-base").value = getApiBase();
  document.getElementById("conexion-retry").addEventListener("click", async () => {
    setApiBase(document.getElementById("conexion-base").value || "http://localhost:3000");
    for (const k of Object.keys(cacheFK)) delete cacheFK[k];
    if (await verificarConexion()) { aviso("Conexión restablecida."); router(); }
  });

  window.addEventListener("hashchange", router);
  verificarConexion();
  router();
}

document.addEventListener("DOMContentLoaded", init);
