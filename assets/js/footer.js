/**
 * ============================================================
 * FOOTER ÚNICO DINÁMICO (Vanilla JS)
 * Carga e inyecta la plantilla maestra: assets/partials/footer.html
 * en el contenedor <div data-footer></div> de cada página.
 * 
 * Para actualizar el pie de página en toda la web:
 * Edita únicamente el archivo "assets/partials/footer.html".
 * ============================================================
 */
(function () {
  "use strict";

  async function initFooter() {
    const mount = document.querySelector("[data-footer]");
    if (!mount) return;

    try {
      const response = await fetch("assets/partials/footer.html");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} al cargar el footer`);
      }
      const footerHtml = await response.text();
      mount.innerHTML = footerHtml;
    } catch (error) {
      console.warn(
        "[Footer] No se pudo cargar 'assets/partials/footer.html'.\n" +
        "Nota: Los navegadores restringen peticiones fetch() locales al abrir con doble clic (file://).\n" +
        "En un servidor local (Live Server en VS Code) o en tu hosting web funcionará automáticamente.",
        error
      );
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFooter);
  } else {
    initFooter();
  }
})();