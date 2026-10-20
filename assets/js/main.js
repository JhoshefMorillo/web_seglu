// ============================================
// MAIN.JS — interacciones globales del sitio
// ============================================

// Rastreo de dirección del scroll (compartido por initScrollReveals y initScrollFloat)
let _lastScrollY = window.scrollY;
window.addEventListener(
  "scroll",
  () => {
    _lastScrollY = window.scrollY;
  },
  { passive: true },
);

document.addEventListener("DOMContentLoaded", () => {
  // Cada init se ejecuta en su propio try/catch: si UNA función falla
  // por cualquier motivo, las demás igual se ejecutan con normalidad.
  safeInit(initMobileNav);
  safeInit(initSearchBox);
  safeInit(initHeaderGlass);
  safeInit(initBrandsMarquee);
  safeInit(initReviewsMarquee);
  safeInit(initHeroSlider);
  safeInit(initScrollReveals);
  safeInit(initScrollFloat);
  safeInit(initCustomScrollbar);
});

/**
 * Ejecuta una función de inicialización protegida: si lanza un error,
 * lo muestra en consola pero no detiene la carga del resto del sitio.
 */
function safeInit(fn) {
  try {
    fn();
  } catch (err) {
    console.error(`Error iniciando ${fn.name}:`, err);
  }
}

/**
 * Menú hamburguesa (mobile)
 */
/**
 * Menú lateral móvil ("3 rayitas")
 * Vive directamente en document.body para evitar clipping del header
 */
function initMobileNav() {
  const hamburger = document.querySelector(".hamburger");
  if (!hamburger) return;

  let drawer = document.getElementById("mobileDrawer");
  if (!drawer) {
    drawer = document.createElement("div");
    drawer.id = "mobileDrawer";
    drawer.className = "mobile-drawer";
    drawer.setAttribute("aria-hidden", "true");
    drawer.innerHTML = `
      <div class="mobile-drawer__overlay" data-drawer-close></div>
      <aside class="mobile-drawer__panel">
        <button type="button" class="mobile-drawer__close" data-drawer-close aria-label="Cerrar menú">×</button>
        <ul class="mobile-drawer__list">
          <li><a href="index.html" class="mobile-drawer__link">Inicio</a></li>
          <li><a href="productos.html" class="mobile-drawer__link">Productos</a></li>
          <li><a href="nosotros.html" class="mobile-drawer__link">Nosotros</a></li>
          <li><a href="contacto.html" class="mobile-drawer__link">Contacto</a></li>
        </ul>
        <div class="mobile-drawer__footer">
          <p class="mobile-drawer__slogan">¡SOLUCIONES EN EQUIPOS DE PROTECCIÓN PERSONAL!</p>
        </div>
      </aside>
    `;
    document.body.appendChild(drawer);
  }

  const openNav = () => {
    drawer.setAttribute("data-open", "true");
    drawer.setAttribute("aria-hidden", "false");
    hamburger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  };

  const closeNav = () => {
    drawer.setAttribute("data-open", "false");
    drawer.setAttribute("aria-hidden", "true");
    hamburger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

  hamburger.addEventListener("click", () => {
    const isOpen = drawer.getAttribute("data-open") === "true";
    if (isOpen) closeNav();
    else openNav();
  });

  drawer.querySelectorAll("[data-drawer-close]").forEach((btn) => {
    btn.addEventListener("click", closeNav);
  });

  drawer.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      closeNav();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.getAttribute("data-open") === "true") {
      closeNav();
    }
  });
}

/**
 * Buscador:
 * - En móvil: modal blanco de pantalla completa que baja desde arriba y tapa lo de atrás.
 * - En desktop: input expandible inline en la barra de navegación.
 */
function initSearchBox() {
  const searchBox = document.querySelector(".search-box");
  const searchToggle = document.querySelector(".search-toggle");
  if (!searchToggle) return;

  // Inyectar modal blanco de búsqueda móvil en body
  let searchModal = document.getElementById("mobileSearchModal");
  if (!searchModal) {
    searchModal = document.createElement("div");
    searchModal.id = "mobileSearchModal";
    searchModal.className = "mobile-search-modal";
    searchModal.setAttribute("aria-hidden", "true");
    searchModal.innerHTML = `
      <div class="mobile-search-modal__content">
        <div class="mobile-search-modal__bar">
          <svg class="mobile-search-modal__icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <form class="mobile-search-modal__form" action="productos.html" method="get">
            <input type="search" name="q" class="mobile-search-modal__input" placeholder="Buscar productos en SEGLU..." autocomplete="off" />
          </form>
          <button type="button" class="mobile-search-modal__close" aria-label="Cerrar búsqueda">×</button>
        </div>
        <div class="mobile-search-modal__body">
          <div class="mobile-search-modal__tags-wrap">
            <p class="mobile-search-modal__label">Búsquedas populares:</p>
            <div class="mobile-search-modal__tags">
              <a href="productos.html?q=casco">Cascos</a>
              <a href="productos.html?q=guantes">Guantes</a>
              <a href="productos.html?q=botas">Calzado</a>
              <a href="productos.html?q=lentes">Lentes</a>
              <a href="productos.html?q=chaleco">Chalecos</a>
              <a href="productos.html?q=arnes">Arneses</a>
              <a href="productos.html?q=3M">3M</a>
            </div>
          </div>
          <div class="mobile-search-modal__results"></div>
        </div>
      </div>
    `;
    document.body.appendChild(searchModal);
  }

  const modalInput = searchModal.querySelector(".mobile-search-modal__input");
  const modalClose = searchModal.querySelector(".mobile-search-modal__close");
  const modalResults = searchModal.querySelector(".mobile-search-modal__results");

  const openMobileSearch = () => {
    searchModal.setAttribute("data-open", "true");
    searchModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(() => modalInput?.focus(), 120);
  };

  const closeMobileSearch = () => {
    searchModal.setAttribute("data-open", "false");
    searchModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (modalInput) modalInput.value = "";
    if (modalResults) modalResults.innerHTML = "";
  };

  searchToggle.addEventListener("click", (e) => {
    if (window.innerWidth <= 960) {
      e.preventDefault();
      openMobileSearch();
      return;
    }
    // Desktop: abrir/cerrar inline
    if (searchBox) {
      const isOpen = searchBox.getAttribute("data-open") === "true";
      searchBox.setAttribute("data-open", String(!isOpen));
      searchToggle.setAttribute("aria-expanded", String(!isOpen));
      if (!isOpen) {
        setTimeout(() => searchBox.querySelector(".search-input")?.focus(), 150);
      }
    }
  });

  modalClose?.addEventListener("click", closeMobileSearch);

  // Búsqueda en vivo dentro del modal móvil
  const renderMobileResults = () => {
    const q = (modalInput?.value || "").trim();
    if (!q) {
      modalResults.innerHTML = "";
      return;
    }
    if (typeof PRODUCTOS === "undefined") return;

    const term = q.toLowerCase();
    const items = PRODUCTOS.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.marca && p.marca.toLowerCase().includes(term)) ||
        p.categoria.toLowerCase().includes(term)
    ).slice(0, 6);

    const href = `productos.html?q=${encodeURIComponent(q)}`;

    if (items.length === 0) {
      modalResults.innerHTML = `<p class="mobile-search-empty">No encontramos "<strong>${q}</strong>". Prueba con otra palabra.</p>`;
      return;
    }

    modalResults.innerHTML = `
      <p class="mobile-search-count">${items.length} productos encontrados</p>
      ${items
        .map(
          (p) => `
        <a class="mobile-search-item" href="productos.html?q=${encodeURIComponent(p.name)}">
          <img src="${p.image || ''}" alt="${p.name}" />
          <div>
            <strong>${p.name}</strong>
            <span>${p.marca || ''} · ${p.categoria}</span>
          </div>
        </a>`
        )
        .join("")}
      <a class="mobile-search-all" href="${href}">Ver todos los resultados para "${q}" →</a>
    `;
  };

  modalInput?.addEventListener("input", renderMobileResults);

  // Desktop click fuera
  document.addEventListener("click", (e) => {
    if (
      searchBox &&
      !e.target.closest(".search-box") &&
      searchBox.getAttribute("data-open") === "true"
    ) {
      searchBox.setAttribute("data-open", "false");
      searchToggle.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (searchModal.getAttribute("data-open") === "true") {
        closeMobileSearch();
      }
      if (searchBox && searchBox.getAttribute("data-open") === "true") {
        searchBox.setAttribute("data-open", "false");
        searchToggle.setAttribute("aria-expanded", "false");
      }
    }
  });
}

/**
 * Header transparente sobre el hero que se solidifica (fondo blanco)
 * al hacer scroll. En las páginas sin hero, arranca ya sólido para que
 * los enlaces sean legibles desde el primer momento.
 */
function initHeaderGlass() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const hasHero = document.querySelector(".hero") !== null;

  if (!hasHero) {
    header.classList.add("is-scrolled");
    return;
  }

  const SCROLL_THRESHOLD = 40;
  const update = () => {
    header.classList.toggle("is-scrolled", window.scrollY > SCROLL_THRESHOLD);
  };

   update();
  window.addEventListener("scroll", update, { passive: true });
}

/**
 * Core de marquee — autoscroll continuo + arrastre manual (mouse y touch).
 * El movimiento se calcula frame a frame con requestAnimationFrame y se
 * aplica como transform inline. Lo usan el marquee de marcas y el de reseñas.
 *   opts.pxPerSecond  → velocidad del autoscroll
 *   opts.pauseOnHover → pausa el autoscroll al pasar el mouse por encima
 */
function initMarquee(marquee, track, opts = {}) {
  const pxPerSecond = opts.pxPerSecond ?? 50;
  const pauseOnHover = opts.pauseOnHover ?? false;

  const originalItems = Array.from(track.children).filter(
    (el) => !el.hasAttribute("aria-hidden"),
  );
  if (originalItems.length === 0) return;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  let setWidth = 0;
  let offset = 0;
  let isDragging = false;
  let isHovering = false;
  let dragStartX = 0;
  let dragStartOffset = 0;
  let lastTimestamp = null;

  const build = () => {
    track.innerHTML = "";
    originalItems.forEach((item) => {
      item.querySelectorAll("img").forEach((img) => (img.draggable = false));
      track.appendChild(item.cloneNode(true));
    });

    const containerWidth = marquee.clientWidth;

    let setsCount = 1;
    while (track.scrollWidth < containerWidth * 2 || setsCount < 2) {
      originalItems.forEach((item) => {
        const clone = item.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        clone.querySelectorAll("img").forEach((img) => (img.draggable = false));
        track.appendChild(clone);
      });
      setsCount++;
      if (setsCount > 10) break;
    }

    setWidth = track.scrollWidth / setsCount;
  };

  const applyOffset = () => {
    if (setWidth > 0) {
      offset = offset % setWidth;
      if (offset > 0) offset -= setWidth;
    }
    track.style.transform = `translateX(${offset}px)`;
  };

  const tick = (timestamp) => {
    if (lastTimestamp === null) lastTimestamp = timestamp;
    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (!isDragging && !isHovering && !reduceMotion) {
      offset -= pxPerSecond * delta;
      applyOffset();
    }

    requestAnimationFrame(tick);
  };

  build();
  applyOffset();
  requestAnimationFrame(tick);

  window.addEventListener(
    "resize",
    debounce(() => {
      build();
      applyOffset();
    }, 250),
  );

  marquee.classList.add("is-draggable");

  if (pauseOnHover) {
    marquee.addEventListener("mouseenter", () => {
      isHovering = true;
    });
    marquee.addEventListener("mouseleave", () => {
      isHovering = false;
    });
  }

  marquee.addEventListener("mousedown", (e) => {
    isDragging = true;
    dragStartX = e.clientX;
    dragStartOffset = offset;
    marquee.classList.add("is-dragging");
    e.preventDefault();
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    offset = dragStartOffset + (e.clientX - dragStartX);
    applyOffset();
  });

  window.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    marquee.classList.remove("is-dragging");
  });

  marquee.addEventListener(
    "touchstart",
    (e) => {
      isDragging = true;
      dragStartX = e.touches[0].clientX;
      dragStartOffset = offset;
    },
    { passive: true },
  );

  marquee.addEventListener(
    "touchmove",
    (e) => {
      if (!isDragging) return;
      offset = dragStartOffset + (e.touches[0].clientX - dragStartX);
      applyOffset();
    },
    { passive: true },
  );

  marquee.addEventListener("touchend", () => {
    isDragging = false;
  });
}

/**
 * Marquee de marcas — autoscroll continuo + arrastre manual.
 */
function initBrandsMarquee() {
  const marquee = document.querySelector(".brands__marquee");
  const track = document.querySelector(".brands__track");
  if (!marquee || !track) return;
  initMarquee(marquee, track, { pxPerSecond: 50 });
}

/**
 * Carrusel de "Reseñas de nuestros clientes" — misma mecánica que el de
 * marcas, algo más lento y con pausa al pasar el mouse para poder leer.
 */
function initReviewsMarquee() {
  const marquee = document.querySelector(".reviews-marquee");
  const track = document.querySelector(".reviews-track");
  if (!marquee || !track) return;
  initMarquee(marquee, track, { pxPerSecond: 32, pauseOnHover: true });
}

/**
 * Hero deslizable premium — carrusel interactivo en LOOP INFINITO CONTINUO (sin fin).
 * Al llegar al final continúa de forma natural hacia la foto 1 sin regresar hacia atrás.
 * Permite arrastre táctil (touch) y mouse (drag) en tiempo real, paginación numérica
 * elegante (01  02  03 ───  04) y autoplay continuo pausible al hover.
 */
function initHeroSlider() {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  let track = hero.querySelector(".hero__track");
  let originalSlides = Array.from(hero.querySelectorAll(".hero__slide:not(.hero__slide--clone)"));

  // Retrocompatibilidad: si no hay track pero hay data-slides en .hero__image
  if (!track || originalSlides.length === 0) {
    const singleImg = hero.querySelector(".hero__image");
    if (!singleImg) return;
    const slideUrls = (singleImg.getAttribute("data-slides") || singleImg.getAttribute("src") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (slideUrls.length < 2) return;

    track = document.createElement("div");
    track.className = "hero__track";
    slideUrls.forEach((url, i) => {
      const slide = document.createElement("div");
      slide.className = `hero__slide ${i === 0 ? "is-active" : ""}`;
      const img = document.createElement("img");
      img.className = "hero__image";
      img.src = url;
      img.alt = singleImg.alt || "SEGLU";
      slide.appendChild(img);
      track.appendChild(slide);
    });
    singleImg.replaceWith(track);
    originalSlides = Array.from(track.querySelectorAll(".hero__slide"));
  }

  const total = originalSlides.length;
  if (total < 2) return;

  // Precarga de imágenes para transiciones impecables
  originalSlides.forEach((slide) => {
    const img = slide.querySelector("img");
    if (img && img.src) {
      const pre = new Image();
      pre.src = img.src;
    }
  });

  // --- PREPARACIÓN DEL LOOP INFINITO (CLONES TRANSPARENTES) ---
  // Limpiamos posibles clones previos
  track.querySelectorAll(".hero__slide--clone").forEach((el) => el.remove());

  // Clonamos el último slide al inicio y el primer slide al final
  const firstClone = originalSlides[0].cloneNode(true);
  firstClone.classList.add("hero__slide--clone");
  firstClone.classList.remove("is-active");
  firstClone.removeAttribute("id");

  const lastClone = originalSlides[total - 1].cloneNode(true);
  lastClone.classList.add("hero__slide--clone");
  lastClone.classList.remove("is-active");
  lastClone.removeAttribute("id");

  track.insertBefore(lastClone, originalSlides[0]);
  track.appendChild(firstClone);

  let allSlides = Array.from(track.querySelectorAll(".hero__slide"));

  // trackIndex: 0 es lastClone, 1 es el primer slide original, total es el último original, total + 1 es firstClone
  let trackIndex = 1;
  let isTransitioning = false;
  let isDragging = false;
  let startX = 0;
  let currentX = 0;
  let startY = 0;
  let isHorizontal = null;

  // Calcula el índice real (0 a total - 1) según el trackIndex
  const getRealIndex = (tIdx) => {
    if (tIdx === 0) return total - 1;
    if (tIdx === total + 1) return 0;
    return tIdx - 1;
  };

  // Paginación numérica moderna (01  02  03 ───  04)
  const paginationContainer = hero.querySelector(".hero__pagination, .hero__dots");
  let pageButtons = [];
  if (paginationContainer) {
    paginationContainer.innerHTML = "";
    for (let i = 0; i < total; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `hero__page-btn ${i === 0 ? "is-active" : ""}`;
      btn.setAttribute("aria-label", `Ir a la foto ${i + 1}`);

      const numSpan = document.createElement("span");
      numSpan.className = "hero__page-num";
      numSpan.textContent = String(i + 1).padStart(2, "0");

      const barSpan = document.createElement("span");
      barSpan.className = "hero__page-bar";

      btn.appendChild(numSpan);
      btn.appendChild(barSpan);

      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        normalizeIfOnClone();
        goTo(i + 1, true);
      });
      paginationContainer.appendChild(btn);
      pageButtons.push(btn);
    }
  }

  const updateActiveClasses = (tIdx) => {
    const realIdx = getRealIndex(tIdx);

    allSlides.forEach((slide, idx) => {
      // Activa el slide correspondiente (tanto real como su clon visual)
      const isCurrentTrack = idx === tIdx;
      slide.classList.toggle("is-active", isCurrentTrack);
    });

    pageButtons.forEach((btn, idx) => {
      btn.classList.toggle("is-active", idx === realIdx);
    });
  };

  // Reubica silenciosamente a la diapositiva real si estamos en un clon
  const normalizeIfOnClone = () => {
    if (trackIndex === total + 1) {
      track.style.transition = "none";
      trackIndex = 1;
      track.style.transform = `translateX(-${trackIndex * 100}%)`;
      void track.offsetHeight;
    } else if (trackIndex === 0) {
      track.style.transition = "none";
      trackIndex = total;
      track.style.transform = `translateX(-${trackIndex * 100}%)`;
      void track.offsetHeight;
    }
  };

  const goTo = (newTrackIndex, animate = true) => {
    if (isTransitioning) return;
    trackIndex = newTrackIndex;

    updateActiveClasses(trackIndex);

    if (animate) {
      isTransitioning = true;
      track.style.transition = "transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)";
    } else {
      track.style.transition = "none";
    }

    track.style.transform = `translateX(-${trackIndex * 100}%)`;

    if (!animate) {
      isTransitioning = false;
    }
  };

  // Reubicación instantánea sin salto visual cuando termina la transición en un clon
  track.addEventListener("transitionend", () => {
    isTransitioning = false;

    // Si terminó de deslizar hacia firstClone (foto 1 tras la última)
    if (trackIndex === total + 1) {
      track.style.transition = "none";
      trackIndex = 1;
      track.style.transform = `translateX(-${trackIndex * 100}%)`;
      void track.offsetHeight; // Forzar reflow sin transición
      updateActiveClasses(trackIndex);
    }
    // Si terminó de deslizar hacia lastClone (última foto antes de la 1)
    else if (trackIndex === 0) {
      track.style.transition = "none";
      trackIndex = total;
      track.style.transform = `translateX(-${trackIndex * 100}%)`;
      void track.offsetHeight;
      updateActiveClasses(trackIndex);
    }
  });

  // --- LÓGICA DE ARRASTRE (DRAG & TOUCH) CON SEGUIMIENTO EN VIVO ---
  const onDragStart = (x, y) => {
    normalizeIfOnClone();
    isTransitioning = false;
    isDragging = true;
    startX = x;
    currentX = x;
    startY = y;
    isHorizontal = null;
    hero.classList.add("is-dragging");
    track.style.transition = "none";
  };

  const onDragMove = (x, y) => {
    if (!isDragging) return;
    const dx = x - startX;
    const dy = y - startY;

    if (isHorizontal === null) {
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        isHorizontal = Math.abs(dx) > Math.abs(dy);
      }
    }

    if (isHorizontal) {
      currentX = x;
      track.style.transform = `translateX(calc(-${trackIndex * 100}% + ${dx}px))`;
    }
  };

  const onDragEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    hero.classList.remove("is-dragging");
    const dx = currentX - startX;
    const THRESHOLD = 50;

    if (isHorizontal && Math.abs(dx) > THRESHOLD) {
      if (dx < 0) {
        goTo(trackIndex + 1, true); // Siguiente (infinito)
      } else {
        goTo(trackIndex - 1, true); // Anterior (infinito)
      }
    } else {
      // Si el arrastre fue leve, vuelve suavemente al slide actual
      goTo(trackIndex, true);
    }

    isHorizontal = null;
  };

  // Eventos de Mouse
  hero.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    if (e.target.closest(".hero__pagination, .hero__dots")) return;
    e.preventDefault();
    onDragStart(e.clientX, e.clientY);
  });

  window.addEventListener("mousemove", (e) => {
    if (isDragging) onDragMove(e.clientX, e.clientY);
  });

  window.addEventListener("mouseup", () => {
    if (isDragging) onDragEnd();
  });

  // Eventos Táctiles (Móviles / Tablets)
  hero.addEventListener(
    "touchstart",
    (e) => {
      if (e.target.closest(".hero__pagination, .hero__dots")) return;
      const t = e.touches[0];
      onDragStart(t.clientX, t.clientY);
    },
    { passive: true },
  );

  hero.addEventListener(
    "touchmove",
    (e) => {
      if (!isDragging) return;
      const t = e.touches[0];
      onDragMove(t.clientX, t.clientY);
    },
    { passive: true },
  );

  hero.addEventListener(
    "touchend",
    () => {
      if (isDragging) onDragEnd();
    },
    { passive: true },
  );

  // Accesibilidad: Teclado
  hero.setAttribute("tabindex", "0");
  hero.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") {
      normalizeIfOnClone();
      goTo(trackIndex + 1, true);
    }
    if (e.key === "ArrowLeft") {
      normalizeIfOnClone();
      goTo(trackIndex - 1, true);
    }
  });

  // Posicionar en el primer slide real (índice 1) sin animación
  goTo(1, false);
}

/**
 * Sistema unificado de reveals al hacer scroll. Reemplaza al anterior
 * fade-a-todo-por-igual con una coreografía que responde al layout
 * real de cada sección:
 *
 * 1. LINEAR — listas verticales simples (tarjetas de "Rubros que
 *    Atendemos", "Por qué elegirnos", subtítulos, eyebrow de marcas):
 *    fade-up con stagger desacelerado, de arriba hacia abajo.
 *
 * 2. GRID DIAGONAL — la grilla de categorías EPP: el delay se calcula
 *    por diagonal (fila + columna), así el reveal cruza la grilla en
 *    onda en vez de aparecer en orden de lectura estricto. Lee el
 *    número real de columnas desde grid-template-columns, así se
 *    adapta solo cuando el grid pasa a 2 o 1 columna en responsive
 *    (y se recalcula al hacer resize).
 *
 * 3. DRAW — barras de acento (.cat-showcase__bar): se "dibujan" de
 *    izquierda a derecha en vez de hacer fade, evocando precisión,
 *    acorde a un sitio de seguridad industrial.
 *
 * Todo se repite cada vez que el elemento entra o sale del viewport.
 *
 * IMPORTANTE: si una tarjeta de este listado no anima (aparece de
 * golpe en vez de con fade-up), revisa que su clase en el CSS NO
 * redeclare "transition" sin incluir "opacity" y "transform" — eso
 * pisa la transición que necesita .fade-in-up para funcionar (ya
 * pasó una vez con .sectors__card).
 */
function initScrollReveals() {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const linearGroups = [
    { selector: ".sectors__card", stagger: 110 },
    { selector: ".sectors__subtitle", stagger: 0 },
    { selector: ".why-us__card", stagger: 110 },
    { selector: ".why-us__subtitle", stagger: 0 },
    { selector: ".brands__eyebrow", stagger: 0 },
  ];

  const applyLinear = () => {
    linearGroups.forEach(({ selector, stagger }) => {
      document.querySelectorAll(selector).forEach((item, i) => {
        item.classList.add("fade-in-up");
        const delay = stagger * (1 - Math.exp(-i * 0.6));
        item.style.transitionDelay = `${delay}ms`;
      });
    });
  };

  const gridEl = document.querySelector(".cat-showcase__grid");

  const getColumnCount = () => {
    if (!gridEl) return 1;
    const cols = getComputedStyle(gridEl)
      .gridTemplateColumns.split(" ")
      .filter(Boolean);
    return cols.length || 1;
  };

  const applyGrid = () => {
    if (!gridEl) return;
    const columns = getColumnCount();
    const cards = gridEl.querySelectorAll(".cat-showcase__card");
    cards.forEach((card, i) => {
      card.classList.add("fade-in-up");
      const row = Math.floor(i / columns);
      const col = i % columns;
      card.style.transitionDelay = `${(row + col) * 70}ms`;
    });
  };

  document
    .querySelectorAll(".cat-showcase__bar")
    .forEach((bar) => bar.classList.add("reveal-bar"));

  applyLinear();
  applyGrid();

  const revealSelector = ".fade-in-up, .reveal-bar";

  if (!("IntersectionObserver" in window) || reduceMotion) {
    document
      .querySelectorAll(revealSelector)
      .forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      // Anima cuando BAJAS o en la carga inicial. Al subir se muestran
      // sin transición para que no se vean movimientos raros.
      const down = window.scrollY + 1 > _lastScrollY;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (down) {
            entry.target.classList.remove("no-transition");
            entry.target.classList.add("is-visible");
          } else {
            entry.target.classList.add("is-visible", "no-transition");
          }
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -10% 0px" },
  );

  document
    .querySelectorAll(revealSelector)
    .forEach((el) => observer.observe(el));

  // Recalcula el stagger diagonal si cambia el número de columnas
  // del grid (resize, rotación del celular, etc.)
  window.addEventListener(
    "resize",
    debounce(() => applyGrid(), 250),
  );
}

/**
 * Efecto "Scroll Float": separa el texto de un título en spans por
 * CARACTER y cada uno flota hacia arriba con opacidad, en cascada,
 * cuando el título entra en pantalla. Reservado solo para títulos
 * (hero + section-title) para que mantenga su peso como el efecto
 * de entrada principal del sitio, sin repetirse en más textos.
 */
function initScrollFloat() {
  const targets = document.querySelectorAll(
    ".hero__title, .cat-showcase .section-title, .why-us .section-title",
  );
  if (targets.length === 0) return;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const CHAR_STAGGER_MS = 14;

  targets.forEach((el) => {
    if (el.dataset.sfInit) return;
    el.dataset.sfInit = "true";
    el.classList.add("scroll-float");

    splitIntoChars(el);

    const chars = el.querySelectorAll(".sf-char");
    chars.forEach((char, i) => {
      const delay = CHAR_STAGGER_MS * i * (1 - Math.exp(-i * 0.08));
      char.style.transitionDelay = `${delay}ms`;
    });
  });

  if (!("IntersectionObserver" in window) || reduceMotion) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      // Anima cuando BAJAS o en la carga inicial. Al subir se muestran
      // sin transición para que no se vean movimientos raros.
      const down = window.scrollY + 1 > _lastScrollY;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (down) {
            entry.target.classList.remove("no-transition");
            entry.target.classList.add("is-visible");
          } else {
            entry.target.classList.add("is-visible", "no-transition");
          }
        }
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -5% 0px" },
  );

  targets.forEach((el) => observer.observe(el));
}

/**
 * Recorre los nodos de texto dentro de un elemento y envuelve cada
 * carácter no-espacio en un <span class="sf-char">, preservando los
 * elementos hijos existentes (como <br> o spans de color) y los
 * espacios en blanco tal cual, para que el texto siga ajustándose
 * (word-wrap) con normalidad.
 */
function splitIntoChars(el) {
  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      for (const ch of node.textContent) {
        if (ch.trim() === "") {
          frag.appendChild(document.createTextNode(ch));
        } else {
          const span = document.createElement("span");
          span.className = "sf-char";
          span.textContent = ch;
          frag.appendChild(span);
        }
      }
      node.replaceWith(frag);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      Array.from(node.childNodes).forEach(walk);
    }
  };
  Array.from(el.childNodes).forEach(walk);
}

/**
 * Scrollbar personalizado — reemplaza visualmente al nativo del
 * navegador. Se puede arrastrar (mouse y touch) para hacer scroll.
 */
function initCustomScrollbar() {
  const bar = document.createElement("div");
  bar.className = "custom-scrollbar";
  bar.setAttribute("aria-hidden", "true");

  const thumb = document.createElement("div");
  thumb.className = "custom-scrollbar__thumb";

  bar.appendChild(thumb);
  document.body.appendChild(bar);

  const MIN_THUMB_HEIGHT = 40;
  const MAX_THUMB_HEIGHT = 90;

  let ticking = false;
  let isDragging = false;
  let dragStartY = 0;
  let dragStartScroll = 0;

  const getScrollableHeight = () => {
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    return docHeight - winHeight;
  };

  const showBar = () => {
    bar.classList.add("is-visible");
  };

  const updateThumb = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    const scrollableHeight = docHeight - winHeight;

    if (scrollableHeight <= 0) {
      bar.style.display = "none";
      return;
    }
    bar.style.display = "block";

    const thumbHeight = Math.min(
      Math.max((winHeight / docHeight) * winHeight, MIN_THUMB_HEIGHT),
      MAX_THUMB_HEIGHT,
    );
    const maxThumbTop = winHeight - thumbHeight;
    const thumbTop = (scrollTop / scrollableHeight) * maxThumbTop;

    thumb.style.height = `${thumbHeight}px`;
    thumb.style.transform = `translateY(${thumbTop}px)`;
  };

  const onScrollOrResize = () => {
    showBar();
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateThumb();
      ticking = false;
    });
  };

  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onScrollOrResize);

  bar.addEventListener("mouseenter", () => {
    showBar();
  });

  bar.addEventListener("mouseleave", () => {
    if (!isDragging) showBar();
  });

  thumb.addEventListener("mousedown", (e) => {
    isDragging = true;
    dragStartY = e.clientY;
    dragStartScroll = window.scrollY;
    thumb.classList.add("is-dragging");
    document.body.style.userSelect = "none";
    document.documentElement.style.scrollBehavior = "auto";
    showBar();
    e.preventDefault();
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const winHeight = window.innerHeight;
    const thumbHeight = thumb.offsetHeight;
    const maxThumbTop = winHeight - thumbHeight;
    const scrollableHeight = getScrollableHeight();

    const deltaY = e.clientY - dragStartY;
    const scrollDelta = (deltaY / maxThumbTop) * scrollableHeight;

    window.scrollTo({
      top: dragStartScroll + scrollDelta,
      behavior: "auto",
    });
  });

  window.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    thumb.classList.remove("is-dragging");
    document.body.style.userSelect = "";
    document.documentElement.style.scrollBehavior = "";
    showBar();
  });

  window.addEventListener("blur", () => {
    if (!isDragging) return;
    isDragging = false;
    thumb.classList.remove("is-dragging");
    document.body.style.userSelect = "";
    document.documentElement.style.scrollBehavior = "";
    showBar();
  });

  thumb.addEventListener(
    "touchstart",
    (e) => {
      isDragging = true;
      dragStartY = e.touches[0].clientY;
      dragStartScroll = window.scrollY;
      thumb.classList.add("is-dragging");
      document.documentElement.style.scrollBehavior = "auto";
      showBar();
    },
    { passive: true },
  );

  window.addEventListener(
    "touchmove",
    (e) => {
      if (!isDragging) return;

      const winHeight = window.innerHeight;
      const thumbHeight = thumb.offsetHeight;
      const maxThumbTop = winHeight - thumbHeight;
      const scrollableHeight = getScrollableHeight();

      const deltaY = e.touches[0].clientY - dragStartY;
      const scrollDelta = (deltaY / maxThumbTop) * scrollableHeight;

      window.scrollTo({
        top: dragStartScroll + scrollDelta,
        behavior: "auto",
      });
    },
    { passive: true },
  );

  window.addEventListener("touchend", () => {
    isDragging = false;
    thumb.classList.remove("is-dragging");
    document.documentElement.style.scrollBehavior = "";
    showBar();
  });

  window.addEventListener("load", updateThumb);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(updateThumb);
  }

  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(() => updateThumb());
    resizeObserver.observe(document.body);
  }

  updateThumb();
}

function debounce(fn, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}
