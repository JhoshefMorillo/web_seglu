/* ============================================
   SEARCH.JS — resultados en vivo del buscador.
   Lee PRODUCTOS (catalog.js) y muestra sugerencias
   al escribir; cada resultado lleva a productos.html?q=
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  safeInit(initHeaderSearch);
});

function initHeaderSearch() {
  const box = document.querySelector(".search-box");
  const form = box?.querySelector(".search-form");
  const input = form?.querySelector(".search-input");
  if (!box || !form || !input) return;

  const drop = document.createElement("div");
  drop.className = "search-drop";
  box.appendChild(drop);

  const tieneCatalogo =
    typeof PRODUCTOS !== "undefined" && typeof ICONO_POR_SLUG !== "undefined";

  const nombreMarca = (p) => p.marca || "";
  const nombreCategoria = (slug) => {
    if (typeof CATEGORIAS === "undefined") return "";
    const c = CATEGORIAS.find((c) => c.slug === slug);
    return c ? c.nombre : "";
  };

  const render = () => {
    const q = input.value.trim();

    if (!q || !tieneCatalogo) {
      drop.classList.remove("is-open");
      return;
    }

    const term = q.toLowerCase();
    const items = PRODUCTOS.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        nombreMarca(p).toLowerCase().includes(term) ||
        p.categoria.toLowerCase().includes(term),
    ).slice(0, 6);

    const href = `productos.html?q=${encodeURIComponent(q)}`;

    const itemsHtml = items.length
      ? items
          .map(
            (p) => `
        <a class="search-drop__item" href="${href}">
          <img src="${p.image || ICONO_POR_SLUG[p.categoria] || ""}" alt="${p.name}" />
          <span class="search-drop__info">
            <span class="search-drop__name">${p.name}</span>
            <span class="search-drop__meta">${nombreMarca(p)} · ${nombreCategoria(
              p.categoria,
            )}</span>
          </span>
        </a>`,
          )
          .join("")
      : `<p class="search-drop__empty">No encontramos "<strong>${q}</strong>".<br />Prueba con otra palabra.</p>`;

    drop.innerHTML = `
      <div class="search-drop__head">${
        items.length === 0
          ? "Sin resultados"
          : `${items.length} ${items.length === 1 ? "resultado" : "resultados"}`
      }</div>
      ${itemsHtml}
      ${
        items.length
          ? `<a class="search-drop__all" href="${href}">Ver todos los resultados →</a>`
          : ""
      }`;

    drop.classList.add("is-open");
  };

  input.addEventListener("input", render);
  input.addEventListener("focus", render);

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-box")) drop.classList.remove("is-open");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") drop.classList.remove("is-open");
  });
}