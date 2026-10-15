/* ============================================
   CARRITO.JS — cajón lateral del carrito.
   Global: funciona en cualquier página que incluya
   este script + el markup del drawer + carrito.css.
   Guarda los ítems en localStorage y arma el
   mensaje de pedido para WhatsApp.

   Uso desde otras páginas:
     SEGLU_CART.add(producto, cantidad, talla)
     SEGLU_CART.open()
   ============================================ */

const CART_KEY = "seglu_cart_v1";
const CART_TS_KEY = CART_KEY + "_ts";
const CART_TTL_MS = 6 * 60 * 60 * 1000;
const ESCAPE_HTML = (s) =>
  String(s || "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]),
  );

const clave = (id, talla) => `${id}__${talla || "unico"}`;

const SEGLU_CART = (() => {
  let items = [];

  const load = () => {
    try {
      const now = Date.now();
      const ts = parseInt(localStorage.getItem(CART_TS_KEY), 10);
      if (Number.isFinite(ts) && now - ts > CART_TTL_MS) {
        localStorage.removeItem(CART_KEY);
        localStorage.removeItem(CART_TS_KEY);
        items = [];
        return;
      }
      const raw = localStorage.getItem(CART_KEY);
      items = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(items)) items = [];
    } catch (err) {
      console.error("No se pudo leer el carrito:", err);
      items = [];
    }
  };

  const save = () => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
      localStorage.setItem(CART_TS_KEY, String(Date.now()));
    } catch (err) {
      console.error("No se pudo guardar el carrito:", err);
    }
  };

  const encontrar = (id, talla) =>
    items.find((i) => clave(i.id, i.talla) === clave(id, talla));

  /* Núcleo público ------------------------------------------------ */

  const api = { items };
  const sincronizar = () => {
    api.items = items;
  };

  const add = (producto, cantidad = 1, talla) => {
    const qty = Math.max(1, parseInt(cantidad, 10) || 1);
    const existente = encontrar(producto.id, talla);

    if (existente) {
      existente.qty += qty;
    } else {
      items.push({
        id: producto.id,
        name: producto.name,
        marca: producto.marca,
        categoria: producto.categoria,
        image: producto.image || "",
        talla: talla || "",
        qty,
      });
    }
    save();
    emitir();
  };

  const setQty = (id, talla, qty) => {
    const item = encontrar(id, talla);
    if (!item) return;
    if (qty <= 0) {
      items = items.filter(
        (i) => clave(i.id, i.talla) !== clave(id, talla),
      );
      sincronizar();
    } else {
      item.qty = Math.min(99, qty);
    }
    save();
    emitir();
  };

  const remove = (id, talla) => {
    items = items.filter(
      (i) => clave(i.id, i.talla) !== clave(id, talla),
    );
    sincronizar();
    save();
    emitir();
  };

  const clear = () => {
    items = [];
    sincronizar();
    localStorage.removeItem(CART_TS_KEY);
    save();
  };

  /* Selectores ---------------------------------------------------- */

  const totalItems = () =>
    items.reduce((acc, i) => acc + i.qty, 0);

  /* Mensaje de pedido para WhatsApp ------------------------------ */

  const mensajePedido = () => {
    if (items.length === 0) return "";

    const lineas = items.map(
      (i, idx) =>
        `${idx + 1}. ${i.name} (${i.marca})${
          i.talla ? " — Talla " + i.talla : ""
        } — x${i.qty}`,
    );

    const cuerpo = [
      "Hola SEGLU, quiero solicitar el siguiente pedido:",
      "",
      ...lineas,
      "",
      "Quedo atento a su confirmación. ¡Gracias!",
    ]
      .filter((l) => l !== "")
      .join("\n");

    return encodeURIComponent(cuerpo);
  };

  const emitir = () => {
    if (typeof window.renderCarrito === "function") {
      try {
        window.renderCarrito(items);
      } catch (err) {
        console.error("Error al renderizar el carrito:", err);
      }
    }
  };

  load();
  sincronizar();

  api.add = add;
  api.setQty = setQty;
  api.remove = remove;
  api.clear = clear;
  api.totalItems = totalItems;
  api.mensajePedido = mensajePedido;
  api.emitir = emitir;

  return api;
})();

/* ============================================
   VISTA — conecta la API con el DOM.
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  const drawer = document.querySelector("[data-cart-drawer]");
  const bodyEl = drawer?.querySelector("[data-cart-body]");
  const countHead = drawer?.querySelector("[data-cart-count]");
  const waLink = drawer?.querySelector("[data-cart-wa]");
  const viewCartLink = drawer?.querySelector("[data-cart-page]");
  const badge = document.querySelector("[data-cart-badge]");
  const openBtns = document.querySelectorAll("[data-cart-open]");
  const closeBtns = drawer?.querySelectorAll("[data-cart-close]");

  if (!drawer || !bodyEl) return;

  const abrir = () => {
    drawer.setAttribute("data-open", "true");
    document.body.style.overflow = "hidden";
    SEGLU_CART.emitir();
  };

  const cerrar = () => {
    drawer.setAttribute("data-open", "false");
    document.body.style.overflow = "";
  };

  const imagenDe = (item) =>
    item.image ||
    (typeof ICONO_POR_SLUG !== "undefined"
      ? ICONO_POR_SLUG[item.categoria]
      : "") ||
    "";

  const itemHtml = (item) => `
      <div class="cart-item" data-key="${clave(item.id, item.talla)}">
        <img class="cart-item__img" src="${imagenDe(item)}" alt="${ESCAPE_HTML(
          item.name,
        )}" />
        <div class="cart-item__info">
          <p class="cart-item__name">${ESCAPE_HTML(item.name)}</p>
          <span class="cart-item__meta">${ESCAPE_HTML(item.marca)}${
            item.talla ? " · Talla " + ESCAPE_HTML(item.talla) : ""
          }</span>
          <div class="cart-item__row">
            <div class="cart-item__qty">
              <button type="button" data-cart-minus aria-label="Quitar uno">−</button>
              <span>${item.qty}</span>
              <button type="button" data-cart-plus aria-label="Agregar uno">+</button>
            </div>
          </div>
        </div>
        <button
          type="button"
          class="cart-item__remove"
          data-cart-remove
          aria-label="Quitar del carrito"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>`;

  const idYTallaDe = (key) => {
    const idx = key.lastIndexOf("__");
    const id = idx > -1 ? key.slice(0, idx) : key;
    const talla = idx > -1 ? key.slice(idx + 2) : "";
    return { id, talla: talla === "unico" ? "" : talla };
  };

  let _lastBodyHtml = null;
  const setBody = (html) => {
    if (html === _lastBodyHtml) return;
    bodyEl.innerHTML = html;
    _lastBodyHtml = html;
  };

  window.renderCarrito = (lista) => {
    const count = SEGLU_CART.totalItems();

    if (badge) {
      badge.hidden = count === 0;
      badge.textContent = count;
    }
    if (countHead) countHead.textContent = count;

    if (lista.length === 0) {
      setBody(`
        <div class="cart-empty">
          <svg class="cart-empty__icon" width="62" height="62" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <p class="cart-empty__text">Tu carrito está vacío</p>
          <a class="cart-empty__link" href="productos.html">Ver productos</a>
        </div>`);
      if (waLink) waLink.classList.add("is-disabled");
      if (viewCartLink) viewCartLink.classList.add("is-disabled");
      return;
    }

    setBody(lista.map(itemHtml).join(""));
    if (waLink) {
      const waNum = window.WHATSAPP_NUMBER || "51904881704";
      waLink.href = `https://wa.me/${waNum}?text=${SEGLU_CART.mensajePedido()}`;
      waLink.classList.remove("is-disabled");
    }
    if (viewCartLink) {
      viewCartLink.classList.remove("is-disabled");
    }
  };

  // Delegación: botones + / − / quitar dentro del listado y link ver productos
  bodyEl.addEventListener("click", (e) => {
    if (e.target.closest(".cart-empty__link")) {
      cerrar();
      return;
    }
    const itemEl = e.target.closest("[data-key]");
    if (!itemEl) return;

    const { id, talla } = idYTallaDe(itemEl.dataset.key);
    const actual = SEGLU_CART.items.find(
      (i) => clave(i.id, i.talla) === itemEl.dataset.key,
    );

    if (e.target.closest("[data-cart-plus]") && actual) {
      SEGLU_CART.setQty(id, talla, actual.qty + 1);
    } else if (e.target.closest("[data-cart-minus]") && actual) {
      SEGLU_CART.setQty(id, talla, actual.qty - 1);
    } else if (e.target.closest("[data-cart-remove]")) {
      // Mostrar modal de confirmación antes de eliminar
      mostrarConfirmarEliminar(actual?.name || "este producto", () => {
        SEGLU_CART.remove(id, talla);
      });
    }
  });

  openBtns.forEach((btn) => btn.addEventListener("click", abrir));
  closeBtns.forEach((btn) => btn.addEventListener("click", cerrar));

  const overlay = drawer.querySelector("[data-cart-backdrop]");
  overlay?.addEventListener("click", cerrar);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.getAttribute("data-open") === "true") {
      cerrar();
    }
  });

  SEGLU_CART.open = abrir;
  SEGLU_CART.close = cerrar;

  SEGLU_CART.emitir();
});

window.SEGLU_CART = SEGLU_CART;

/* ============================================
   MODAL DE CONFIRMACIÓN — Eliminar producto
   ============================================ */
function mostrarConfirmarEliminar(nombre, onConfirm) {
  // Si ya hay un modal abierto, no abrimos otro
  if (document.querySelector(".confirm-modal")) return;

  const overlay = document.createElement("div");
  overlay.className = "confirm-modal";
  overlay.innerHTML = `
    <div class="confirm-modal__backdrop"></div>
    <div class="confirm-modal__box">
      <p class="confirm-modal__text">¿Eliminar <strong>${ESCAPE_HTML(nombre)}</strong> de tu carrito?</p>
      <div class="confirm-modal__actions">
        <button type="button" class="confirm-modal__btn confirm-modal__btn--cancel">Cancelar</button>
        <button type="button" class="confirm-modal__btn confirm-modal__btn--confirm">Eliminar</button>
      </div>
    </div>
  `;

  const cerrarModal = () => {
    overlay.classList.add("is-closing");
    setTimeout(() => overlay.remove(), 200);
  };

  overlay.querySelector(".confirm-modal__btn--cancel").addEventListener("click", cerrarModal);
  overlay.querySelector(".confirm-modal__backdrop").addEventListener("click", cerrarModal);
  overlay.querySelector(".confirm-modal__btn--confirm").addEventListener("click", () => {
    onConfirm();
    cerrarModal();
  });

  document.body.appendChild(overlay);
}

/* Inyectar CSS del modal de confirmación (una sola vez) */
if (!document.getElementById("confirm-modal-css")) {
  const style = document.createElement("style");
  style.id = "confirm-modal-css";
  style.textContent = `
    .confirm-modal {
      position: fixed; inset: 0; z-index: 9999;
      display: grid; place-items: center;
      animation: cmodal-in .2s ease both;
    }
    .confirm-modal.is-closing { animation: cmodal-out .2s ease both; }
    .confirm-modal__backdrop {
      position: absolute; inset: 0;
      background: rgba(0,0,0,0.45);
    }
    .confirm-modal__box {
      position: relative; z-index: 1;
      background: #fff; border-radius: 18px;
      padding: 32px 28px 24px; max-width: 380px; width: 90%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.18);
      text-align: center;
    }
    .confirm-modal__text {
      font-family: var(--font-body, "Inter", sans-serif);
      font-size: 1rem; line-height: 1.5; color: #1a1a1a;
      margin: 0 0 22px;
    }
    .confirm-modal__text strong { font-weight: 800; }
    .confirm-modal__actions { display: flex; gap: 12px; }
    .confirm-modal__btn {
      flex: 1; padding: 13px 18px; border-radius: 12px;
      font-family: var(--font-body, "Inter", sans-serif);
      font-weight: 700; font-size: 0.95rem; cursor: pointer;
      border: none; transition: all .15s ease;
    }
    .confirm-modal__btn--cancel {
      background: #f0f0f0; color: #333;
    }
    .confirm-modal__btn--cancel:hover { background: #e0e0e0; }
    .confirm-modal__btn--confirm {
      background: #ff0000; color: #fff;
    }
    .confirm-modal__btn--confirm:hover { background: #d40000; }
    @keyframes cmodal-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes cmodal-out {
      from { opacity: 1; }
      to   { opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}