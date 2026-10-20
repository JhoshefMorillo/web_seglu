/* ============================================
   PRODUCTOS.JS — página de catálogo.
   - Filtros, búsqueda, orden y pintado de la grilla.
   - Modal "Ver producto" (specs, tallas, cantidad).
   - Agrega al carrito vía SEGLU_CART.
   Los DATOS viven en catalog.js.
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  safeInit(initCatalogPage);
});

function initCatalogPage() {
  const gridEl = document.querySelector(".catalog-grid");
  const countEl = document.querySelector("[data-count]");
  const searchInput = document.querySelector("[data-search]");
  const sortEl = document.querySelector("[data-sort]");
  const categoryListEl = document.querySelector("[data-categories]");
  const brandListEl = document.querySelector("[data-brands]");
  const emptyStateEl = document.querySelector("[data-empty]");

  const safeData =
    typeof CATEGORIAS !== "undefined" &&
    typeof PRODUCTOS !== "undefined" &&
    typeof MARCAS !== "undefined" &&
    typeof ICONO_POR_SLUG !== "undefined";

  if (!gridEl || !safeData) return;

  const CAT = CATEGORIAS;
  const PRODS = PRODUCTOS;
  const MARCAS_LISTA = MARCAS;

  const DEFAULT_CATEGORIAS_SLUGS = [
    "todos",
    "corporal",
    "cabeza",
    "visual",
    "respiratoria",
  ];

  const DEFAULT_MARCAS = [
    "3M",
    "Honeywell",
    "UVEX",
    "Delta Plus",
    "Protector",
  ];

  const state = {
    categoria: "todos",
    marcas: new Set(),
    query: "",
    sort: "relevancia",
    page: 1,
    searchCategory: "",
    searchBrand: "",
  };

  // Grilla de 4 columnas x 3 filas = 12 por página (4 al costado, 3 para abajo)
  const porPagina = () => 12;

  const WA = window.WHATSAPP_NUMBER || "";

  const nombreCategoria = (slug) => {
    const c = CAT.find((c) => c.slug === slug);
    return c ? c.nombre : slug;
  };

  const countCategoria = (slug) =>
    slug === "todos"
      ? PRODS.length
      : PRODS.filter((p) => p.categoria === slug).length;

  const countMarca = (marca) => PRODS.filter((p) => p.marca === marca).length;

  const imagenDe = (p) => p.image || ICONO_POR_SLUG[p.categoria] || "";

  const cardHtml = (p) => {
    return `
      <article class="product-card">
        <div class="product-card__media">
          <span class="product-card__brand">${p.marca}</span>
          <img src="${imagenDe(p)}" alt="${p.name}" loading="lazy" />
        </div>
        <div class="product-card__body">
          <span class="product-card__category">${nombreCategoria(p.categoria)}</span>
          <h3 class="product-card__name">${p.name}</h3>
          <div class="product-card__actions">
            <button type="button" class="product-card__cta" data-open-product="${
              p.id
            }">
              <strong>VER PRODUCTOS</strong>
            </button>
            <button type="button" class="product-card__add-btn" data-quick-add="${
              p.id
            }" aria-label="Agregar ${p.name} al carrito">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <strong>AGREGAR AL CARRITO</strong>
            </button>
          </div>
        </div>
      </article>`;
  };

  const renderBarraFiltros = () => {
    const searchCat = state.searchCategory.trim().toLowerCase();
    let categoriasFiltradas = CAT;
    if (searchCat) {
      categoriasFiltradas = CAT.filter((c) =>
        c.nombre.toLowerCase().includes(searchCat),
      );
    } else {
      categoriasFiltradas = CAT.filter(
        (c) =>
          DEFAULT_CATEGORIAS_SLUGS.includes(c.slug) ||
          state.categoria === c.slug,
      );
    }

    categoryListEl.innerHTML = categoriasFiltradas.map(
      (c) => `
        <label>
          <input type="checkbox" name="categoria" value="${c.slug}" ${
            state.categoria === c.slug ? "checked" : ""
          } />
          <span class="catalog-filter-list__name">${c.nombre}</span>
          <span class="catalog-filter-list__count">${countCategoria(c.slug)}</span>
        </label>`,
    ).join("");

    const searchBrand = state.searchBrand.trim().toLowerCase();
    let marcasFiltradas = MARCAS_LISTA;
    if (searchBrand) {
      marcasFiltradas = MARCAS_LISTA.filter((m) =>
        m.toLowerCase().includes(searchBrand),
      );
    } else {
      marcasFiltradas = MARCAS_LISTA.filter(
        (m) => DEFAULT_MARCAS.includes(m) || state.marcas.has(m),
      );
    }

    brandListEl.innerHTML = marcasFiltradas.map(
      (m) => `
        <label>
          <input type="checkbox" name="marca" value="${m}" ${
            state.marcas.has(m) ? "checked" : ""
          } />
          <span class="catalog-filter-list__name">${m}</span>
          <span class="catalog-filter-list__count">${countMarca(m)}</span>
        </label>`,
    ).join("");
  };

  const obtenerFiltrados = () => {
    let items = PRODS.slice();

    if (state.categoria !== "todos") {
      items = items.filter((p) => p.categoria === state.categoria);
    }

    if (state.marcas.size > 0) {
      items = items.filter((p) => state.marcas.has(p.marca));
    }

    const q = state.query.trim().toLowerCase();
    if (q) {
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.marca.toLowerCase().includes(q) ||
          p.categoria.toLowerCase().includes(q),
      );
    }

    switch (state.sort) {
      case "nombre-asc":
        items.sort((a, b) => a.name.localeCompare(b.name, "es"));
        break;
      case "nombre-desc":
        items.sort((a, b) => b.name.localeCompare(a.name, "es"));
        break;
      default:
        break;
    }

    return items;
  };

  const paginationEl = document.querySelector("[data-pagination]");

  const renderPaginacion = (total, paginas) => {
    if (!paginationEl) return;
    if (total === 0 || paginas <= 1) {
      paginationEl.innerHTML = "";
      paginationEl.style.display = "none";
      return;
    }

    const partes = [];
    const irA = (n) =>
      `<button type="button" class="catalog-pagination__num ${
        n === state.page ? "is-active" : ""
      }" data-page="${n}">${n}</button>`;

    partes.push(
      `<button type="button" class="catalog-pagination__arw" data-prev aria-label="Página anterior" ${
        state.page <= 1 ? "disabled" : ""
      }>‹</button>`,
    );

    partes.push(irA(1));
    if (paginas > 7) {
      const desde = Math.max(2, state.page - 2);
      const hasta = Math.min(paginas - 1, state.page + 2);
      if (desde > 2) partes.push(`<span class="catalog-pagination__dots">…</span>`);
      for (let n = desde; n <= hasta; n++) partes.push(irA(n));
      if (hasta < paginas - 1)
        partes.push(`<span class="catalog-pagination__dots">…</span>`);
      partes.push(irA(paginas));
    } else {
      for (let n = 2; n <= paginas; n++) partes.push(irA(n));
    }

    partes.push(
      `<button type="button" class="catalog-pagination__arw" data-next aria-label="Página siguiente" ${
        state.page >= paginas ? "disabled" : ""
      }>›</button>`,
    );

    paginationEl.innerHTML = partes.join("");
    paginationEl.style.display = "flex";
  };

  const render = () => {
    const items = obtenerFiltrados();
    const pp = porPagina();
    const paginas = Math.max(1, Math.ceil(items.length / pp));
    if (state.page > paginas) state.page = paginas;

    countEl.innerHTML = `<strong>${items.length}</strong> ${
      items.length === 1 ? "producto" : "productos"
    }`;

    const inicio = (state.page - 1) * pp;
    const visibles = items.slice(inicio, inicio + pp);

    gridEl.innerHTML = visibles.map(cardHtml).join("");

    const showEmpty = items.length === 0;
    emptyStateEl.style.display = showEmpty ? "block" : "none";
    gridEl.style.display = showEmpty ? "none" : "grid";

    renderPaginacion(items.length, paginas);

    // Evitar que el usuario caiga al footer si la lista filtrada es más corta
    const catalogoEl =
      document.querySelector(".catalog-main") ||
      document.getElementById("catalogo");
    if (catalogoEl) {
      const headerOffset = 80;
      const targetY =
        window.pageYOffset +
        catalogoEl.getBoundingClientRect().top -
        headerOffset;
      if (window.scrollY > targetY + 120) {
        window.scrollTo({
          top: Math.max(0, targetY),
          behavior: "smooth",
        });
      }
    }
  };

  const irAPagina = (n) => {
    const paginas = Math.max(
      1,
      Math.ceil(obtenerFiltrados().length / porPagina()),
    );
    const destino = Math.min(Math.max(1, n), paginas);
    if (destino === state.page) return;
    state.page = destino;
    render();
    gridEl.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (paginationEl) {
    paginationEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-page]");
      const prev = e.target.closest("[data-prev]");
      const next = e.target.closest("[data-next]");
      if (btn) irAPagina(parseInt(btn.dataset.page, 10));
      else if (prev) irAPagina(state.page - 1);
      else if (next) irAPagina(state.page + 1);
    });
  }

  const normalizarSlug = (slug) =>
    CAT.some((c) => c.slug === slug) ? slug : "todos";

  // Leer parámetros de la URL: ?cat= viene del footer,
  // ?q= viene del buscador del header.
  const params = new URLSearchParams(window.location.search);
  if (params.has("cat")) state.categoria = normalizarSlug(params.get("cat"));
  if (params.has("q")) {
    state.query = params.get("q").slice(0, 80);
    if (searchInput) searchInput.value = state.query;
  }

  renderBarraFiltros();

  // Eventos de filtros
  categoryListEl.addEventListener("change", (e) => {
    if (e.target.name === "categoria") {
      if (e.target.checked) {
        state.categoria = e.target.value;
      } else {
        state.categoria = "todos";
      }
      state.page = 1;
      renderBarraFiltros();
      render();
    }
  });

  brandListEl.addEventListener("change", (e) => {
    if (e.target.name === "marca") {
      if (e.target.checked) state.marcas.add(e.target.value);
      else state.marcas.delete(e.target.value);
      state.page = 1;
      render();
    }
  });

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      state.query = searchInput.value;
      state.page = 1;
      render();
    });
  }

  if (sortEl) {
    sortEl.addEventListener("change", () => {
      state.sort = sortEl.value;
      state.page = 1;
      render();
    });
  }

  const searchCatInput = document.querySelector("[data-search-category]");
  if (searchCatInput) {
    searchCatInput.addEventListener("input", () => {
      state.searchCategory = searchCatInput.value;
      renderBarraFiltros();
    });
  }

  const searchBrandInput = document.querySelector("[data-search-brand]");
  if (searchBrandInput) {
    searchBrandInput.addEventListener("input", () => {
      state.searchBrand = searchBrandInput.value;
      renderBarraFiltros();
    });
  }

  const resetBtn = document.querySelector("[data-reset]");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      state.categoria = "todos";
      state.marcas.clear();
      state.query = "";
      state.searchCategory = "";
      state.searchBrand = "";
      state.sort = "relevancia";
      state.page = 1;
      if (searchInput) searchInput.value = "";
      if (searchCatInput) searchCatInput.value = "";
      if (searchBrandInput) searchBrandInput.value = "";
      if (sortEl) sortEl.value = "relevancia";
      renderBarraFiltros();
      render();
    });
  }

  /* ---------- Modal "Ver producto" ---------- */
  const modalEl = document.createElement("div");
  modalEl.className = "prod-modal";
  modalEl.innerHTML = `
    <div class="prod-modal__backdrop" data-modal-close></div>
    <div class="prod-modal__panel" role="dialog" aria-modal="true" aria-label="Detalle de producto">
      <div class="prod-modal__top-bar">
        <span class="prod-modal__category" data-modal-category></span>
        <button type="button" class="prod-modal__close" data-modal-close aria-label="Cerrar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="prod-modal__media">
        <div class="prod-modal__gallery-main">
          <img data-modal-img alt="" class="prod-modal__img-featured" decoding="async" />
        </div>
        <div class="prod-modal__thumbs" data-modal-thumbs></div>
      </div>
      <div class="prod-modal__info">
        <h2 class="prod-modal__title" data-modal-title></h2>
        <p class="prod-modal__desc" data-modal-desc></p>

        <div class="prod-modal__size-block" data-modal-size-block>
          <p class="prod-modal__label">Talla / Presentación</p>
          <div class="prod-modal__sizes" data-modal-sizes></div>
        </div>

        <div class="prod-modal__buy">
          <div class="prod-modal__qty">
            <button type="button" data-modal-minus aria-label="Quitar uno">−</button>
            <input type="number" data-modal-qty value="1" min="0" max="9999" inputmode="numeric" aria-label="Cantidad" />
            <button type="button" data-modal-plus aria-label="Agregar uno">+</button>
          </div>
        </div>

        <div class="prod-modal__error-msg" data-modal-error style="display: none;"></div>

        <div class="prod-modal__actions">
          <button type="button" class="prod-modal__add" data-modal-add>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Agregar al carrito
          </button>
          <button type="button" class="prod-modal__cotizar" data-modal-cotizar>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.019-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
            Cotizar producto
          </button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modalEl);

  const modalImg = modalEl.querySelector("[data-modal-img]");
  const modalThumbs = modalEl.querySelector("[data-modal-thumbs]");
  const modalCategory = modalEl.querySelector("[data-modal-category]");
  const modalTitle = modalEl.querySelector("[data-modal-title]");
  const modalDesc = modalEl.querySelector("[data-modal-desc]");
  const modalSizeBlock = modalEl.querySelector("[data-modal-size-block]");
  const modalSizes = modalEl.querySelector("[data-modal-sizes]");
  const modalQtyEl = modalEl.querySelector("[data-modal-qty]");
  const modalAdd = modalEl.querySelector("[data-modal-add]");
  const modalErrorEl = modalEl.querySelector("[data-modal-error]");

  let modalProducto = null;
  let modalTalla = "";
  let modalQty = 1;

  const mostrarErrorModal = (msg) => {
    if (!modalErrorEl) return;
    modalErrorEl.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span>${msg}</span>
    `;
    modalErrorEl.style.display = "flex";
    const qtyBox = modalEl.querySelector(".prod-modal__qty");
    if (qtyBox) {
      qtyBox.classList.add("has-error");
      setTimeout(() => qtyBox.classList.remove("has-error"), 400);
    }
  };

  const ocultarErrorModal = () => {
    if (!modalErrorEl) return;
    modalErrorEl.style.display = "none";
    const qtyBox = modalEl.querySelector(".prod-modal__qty");
    if (qtyBox) qtyBox.classList.remove("has-error");
  };

  const modalAbrir = (id) => {
    const p = PRODS.find((x) => x.id === id);
    if (!p) return;

    modalProducto = p;
    modalQty = 1;
    modalTalla = "";
    ocultarErrorModal();

    modalCategory.textContent = nombreCategoria(p.categoria);
    modalTitle.textContent = p.name;

    // Galería: foto principal + 3 adicionales (4 en total)
    const principal = imagenDe(p);
    const fotos = (Array.isArray(p.images) && p.images.length > 0)
      ? p.images.slice(0, 4)
      : (Array.isArray(p.fotos) && p.fotos.length > 0)
        ? p.fotos.slice(0, 4)
        : [principal, principal, principal, principal];
    while (fotos.length < 4) {
      fotos.push(principal);
    }

    modalImg.src = fotos[0];
    modalImg.alt = p.name;
    modalImg.classList.remove("is-switching");

    modalThumbs.innerHTML = fotos
      .map(
        (url, idx) => `
        <button type="button" class="prod-modal__thumb ${idx === 0 ? "is-selected" : ""}" data-thumb-src="${url}" aria-label="Ver imagen ${idx + 1}">
          <img src="${url}" alt="${p.name} vista ${idx + 1}" decoding="async" />
        </button>`,
      )
      .join("");

    // 5 líneas de descripción profesional integrando especificaciones técnicas
    const base = p.descripcion || "";
    const especificaciones = (p.detalles && p.detalles.length > 0)
      ? p.detalles.join(", ")
      : "Cumple con rigurosas normativas internacionales de protección";
    const garantia = "Diseñado para brindar máxima seguridad industrial, confort ergonómico y prolongada resistencia contra desgaste en labores operativas de alta exigencia.";
    modalDesc.textContent = `${base}. Características destacadas: ${especificaciones}. ${garantia}`;

    modalQtyEl.value = "1";

    // Tallas / presentaciones
    if (p.tallas && p.tallas.length > 0) {
      modalSizeBlock.style.display = "";
      modalSizes.innerHTML = p.tallas
        .map(
          (t, i) =>
            `<button type="button" class="${
              i === 0 ? "is-selected" : ""
            }" data-modal-talla="${t}">${t}</button>`,
        )
        .join("");
      modalTalla = p.tallas[0];
    } else {
      modalSizeBlock.style.display = "none";
    }

    modalEl.classList.add("is-open");
    document.body.style.overflow = "hidden";
  };

  const modalCerrar = () => {
    modalEl.classList.remove("is-open");
    document.body.style.overflow = "";
    ocultarErrorModal();
  };

  // Delegación de click en miniaturas de fotos con animación moderna y fluida
  modalThumbs.addEventListener("click", (e) => {
    const thumb = e.target.closest(".prod-modal__thumb");
    if (!thumb) return;
    const nuevaSrc = thumb.dataset.thumbSrc;
    if (modalImg.src === nuevaSrc && thumb.classList.contains("is-selected")) return;

    modalThumbs.querySelectorAll(".prod-modal__thumb").forEach((t) => t.classList.remove("is-selected"));
    thumb.classList.add("is-selected");

    modalImg.classList.add("is-switching");
    setTimeout(() => {
      modalImg.src = nuevaSrc;
      requestAnimationFrame(() => {
        modalImg.classList.remove("is-switching");
      });
    }, 140);
  });

  const modalCotizar = () => {
    if (!modalProducto || !WA) return;
    if (modalQty < 1) {
      mostrarErrorModal("Debes ingresar al menos 1 unidad para cotizar este producto.");
      return;
    }
    const p = modalProducto;
    const lineas = [
      "Hola SEGLU, me interesa cotizar el siguiente producto:",
      "",
      `• Producto: ${p.name}`,
      `• Marca: ${p.marca}`,
    ];
    if (modalProducto.tallas && modalProducto.tallas.length > 0) {
      lineas.push(`• Talla / Presentación: ${modalTalla || "-"}`);
    }
    lineas.push(`• Cantidad: ${modalQty}`, "", "Quedo atento a su respuesta. ¡Gracias!");
    const url = `https://wa.me/${WA}?text=${encodeURIComponent(lineas.join("\n"))}`;
    window.open(url, "_blank", "noopener");
  };

  // Animación de vuelo fluido con cubic-bezier hacia el ícono del carrito en el header
  const animarVueloAlCarrito = (cardEl, producto, onCompleto) => {
    const cartBtn =
      document.querySelector(".cart-btn") ||
      document.querySelector("[data-cart-open]");

    if (!cartBtn) {
      if (onCompleto) onCompleto();
      return;
    }

    const imgEl = cardEl ? cardEl.querySelector(".product-card__media img") : null;
    const srcRect = imgEl
      ? imgEl.getBoundingClientRect()
      : cardEl?.getBoundingClientRect();

    if (!srcRect || srcRect.width === 0 || srcRect.height === 0) {
      if (onCompleto) onCompleto();
      return;
    }

    const destRect = cartBtn.getBoundingClientRect();

    // Clonar la imagen del producto
    const flyingImg = document.createElement("img");
    flyingImg.src = imgEl?.src || imagenDe(producto);
    flyingImg.alt = "";
    flyingImg.className = "seglu-flying-item";

    flyingImg.style.position = "fixed";
    flyingImg.style.top = `${srcRect.top}px`;
    flyingImg.style.left = `${srcRect.left}px`;
    flyingImg.style.width = `${srcRect.width}px`;
    flyingImg.style.height = `${srcRect.height}px`;
    flyingImg.style.objectFit = "contain";
    flyingImg.style.zIndex = "999999";
    flyingImg.style.pointerEvents = "none";
    flyingImg.style.borderRadius = "12px";
    flyingImg.style.opacity = "1";
    flyingImg.style.transform = "translate3d(0, 0, 0) scale(1) rotate(0deg)";
    flyingImg.style.transition =
      "transform 0.85s cubic-bezier(0.2, 0.9, 0.25, 1), opacity 0.85s cubic-bezier(0.4, 0, 0.8, 1)";
    flyingImg.style.filter = "drop-shadow(0 10px 20px rgba(0, 0, 0, 0.22))";

    document.body.appendChild(flyingImg);

    // Forzar reflow para asegurar el punto de partida
    void flyingImg.offsetWidth;

    // Calcular desplazamiento exacto al centro del icono del carrito
    const srcCenterX = srcRect.left + srcRect.width / 2;
    const srcCenterY = srcRect.top + srcRect.height / 2;
    const destCenterX = destRect.left + destRect.width / 2;
    const destCenterY = destRect.top + destRect.height / 2;

    const deltaX = destCenterX - srcCenterX;
    const deltaY = destCenterY - srcCenterY;

    requestAnimationFrame(() => {
      flyingImg.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(0.18) rotate(-14deg)`;
      flyingImg.style.opacity = "0.2";
    });

    let terminado = false;
    const finalizar = () => {
      if (terminado) return;
      terminado = true;
      if (flyingImg.parentNode) flyingImg.parentNode.removeChild(flyingImg);
      if (onCompleto) onCompleto();
    };

    flyingImg.addEventListener("transitionend", finalizar, { once: true });
    setTimeout(finalizar, 900);
  };

  // Delegación: click en "Ver producto" y "Agregar al carrito"
  gridEl.addEventListener("click", (e) => {
    const btnVer = e.target.closest("[data-open-product]");
    if (btnVer) {
      modalAbrir(btnVer.dataset.openProduct);
      return;
    }

    const btnAdd = e.target.closest("[data-quick-add]");
    if (btnAdd) {
      if (btnAdd.disabled) return;
      const pid = btnAdd.dataset.quickAdd;
      const p = PRODS.find((item) => item.id === pid);
      if (!p) return;

      const card = btnAdd.closest(".product-card");
      btnAdd.disabled = true;

      animarVueloAlCarrito(card, p, () => {
        // Guardar producto en el carrito con su talla/presentación base si tuviera
        const defaultTalla =
          p.tallas && p.tallas.length > 0 ? p.tallas[0] : "";
        const snapshot = {
          id: p.id,
          name: p.name,
          marca: p.marca,
          categoria: p.categoria,
          image: p.image || "",
        };

        if (window.SEGLU_CART) {
          window.SEGLU_CART.add(snapshot, 1, defaultTalla);
        }

        // Animación de impacto / rebote en el carrito y badge
        const cartBtn =
          document.querySelector(".cart-btn") ||
          document.querySelector("[data-cart-open]");
        if (cartBtn) {
          cartBtn.classList.remove("cart-bump");
          void cartBtn.offsetWidth;
          cartBtn.classList.add("cart-bump");
          setTimeout(() => cartBtn.classList.remove("cart-bump"), 700);
        }

        // Feedback interactivo en el botón de la tarjeta
        const originalHtml = btnAdd.innerHTML;
        btnAdd.classList.add("is-added");
        btnAdd.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <strong>¡AGREGADO!</strong>
        `;

        setTimeout(() => {
          btnAdd.classList.remove("is-added");
          btnAdd.innerHTML = originalHtml;
          btnAdd.disabled = false;
        }, 1300);
      });
    }
  });

  modalEl.querySelectorAll("[data-modal-close]").forEach((b) =>
    b.addEventListener("click", modalCerrar),
  );

  modalSizes.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-modal-talla]");
    if (!chip) return;
    modalSizes
      .querySelectorAll("[data-modal-talla]")
      .forEach((c) => c.classList.remove("is-selected"));
    chip.classList.add("is-selected");
    modalTalla = chip.dataset.modalTalla;
  });

  modalEl.querySelector("[data-modal-minus]").addEventListener("click", () => {
    if (modalQty > 0) {
      modalQty--;
      modalQtyEl.value = modalQty;
    }
  });

  modalEl.querySelector("[data-modal-plus]").addEventListener("click", () => {
    if (modalQty < 9999) {
      modalQty++;
      modalQtyEl.value = modalQty;
      ocultarErrorModal();
    }
  });

  modalQtyEl.addEventListener("input", () => {
    const n = parseInt(modalQtyEl.value, 10);
    if (Number.isNaN(n) || n < 0) modalQty = 0;
    else if (n > 9999) modalQty = 9999;
    else modalQty = n;
    modalQtyEl.value = modalQty;
    if (modalQty > 0) ocultarErrorModal();
  });

  modalEl
    .querySelector("[data-modal-cotizar]")
    .addEventListener("click", modalCotizar);

  modalAdd.addEventListener("click", () => {
    if (!modalProducto) return;
    if (modalQty < 1) {
      mostrarErrorModal("Debes ingresar al menos 1 unidad para agregar al carrito.");
      return;
    }
    if (modalAdd.disabled) return;
    modalAdd.disabled = true;

    const snapshot = {
      id: modalProducto.id,
      name: modalProducto.name,
      marca: modalProducto.marca,
      categoria: modalProducto.categoria,
      image: modalProducto.image || "",
    };

    const originalAddHtml = modalAdd.innerHTML;
    modalAdd.classList.add("is-added");
    modalAdd.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <strong>¡AGREGADO!</strong>
    `;

    animarVueloAlCarrito(modalImg, modalProducto, () => {
      if (window.SEGLU_CART) {
        window.SEGLU_CART.add(snapshot, modalQty, modalTalla);
      }
      const cartBtn =
        document.querySelector(".cart-btn") ||
        document.querySelector("[data-cart-open]");
      if (cartBtn) {
        cartBtn.classList.remove("cart-bump");
        void cartBtn.offsetWidth;
        cartBtn.classList.add("cart-bump");
        setTimeout(() => cartBtn.classList.remove("cart-bump"), 700);
      }

      setTimeout(() => {
        modalAdd.classList.remove("is-added");
        modalAdd.innerHTML = originalAddHtml;
        modalAdd.disabled = false;
      }, 1500);
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalEl.classList.contains("is-open")) {
      modalCerrar();
    }
  });

  render();
}