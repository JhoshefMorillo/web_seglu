document.addEventListener("DOMContentLoaded", () => {
  const wrap = document.querySelector("[data-legal-accordion]");
  if (!wrap) return;

  const buttons = wrap.querySelectorAll(".legal-accordion__navitem");
  const blocks = wrap.querySelectorAll(".legal-accordion__panel .legal-block");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;

      buttons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      blocks.forEach((block) => {
        block.hidden = block.id !== targetId;
      });
    });
  });
});
