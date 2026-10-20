// ============================================================
// LIBRO DE RECLAMACIONES — Lógica interactiva
// ============================================================

document.addEventListener("DOMContentLoaded", function () {
  // 1. Fecha y Hora automática en la tarjeta
  const fechaEl = document.getElementById("lrFecha");
  const horaEl = document.getElementById("lrHora");

  function updateDateTime() {
    const now = new Date();
    if (fechaEl) {
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      fechaEl.textContent = `${day}/${month}/${year}`;
    }
    if (horaEl) {
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // Si es 0, poner 12
      horaEl.textContent = `${hours}:${minutes} ${ampm}`;
    }
  }

  updateDateTime();

  // 2. Contadores de caracteres
  const textareasWithCounter = [
    { id: "lrDescBien", counterId: "counterDescBien", max: 500 },
    { id: "lrDetalleReclamo", counterId: "counterDetalle", max: 1000 },
    { id: "lrPedidoCliente", counterId: "counterPedido", max: 1000 },
  ];

  textareasWithCounter.forEach(({ id, counterId, max }) => {
    const textarea = document.getElementById(id);
    const counter = document.getElementById(counterId);
    if (textarea && counter) {
      const updateCounter = () => {
        const length = textarea.value.length;
        counter.textContent = `${length}/${max}`;
      };
      textarea.addEventListener("input", updateCounter);
      updateCounter();
    }
  });

  // 3. Manejo de archivo adjunto
  const fileInput = document.getElementById("lrArchivo");
  const fileText = document.getElementById("lrFileText");

  if (fileInput && fileText) {
    fileInput.addEventListener("change", function () {
      if (this.files && this.files.length > 0) {
        const fileName = this.files[0].name;
        fileText.innerHTML = `<strong>Archivo seleccionado:</strong> ${fileName}`;
      } else {
        fileText.innerHTML = `<strong>Seleccionar archivo</strong> o arrastra tus archivos aquí`;
      }
    });
  }

  // 4. Envío del Formulario y Modal de Éxito
  const form = document.getElementById("reclamacionesForm");
  const modal = document.getElementById("lrModal");
  const modalClose = document.getElementById("lrModalClose");
  const modalCode = document.getElementById("lrModalCode");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Generar código único de reclamación (ej: REC-2026-00418)
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      const year = new Date().getFullYear();
      const claimCode = `REC-${year}-${randomNum}`;

      if (modalCode) {
        modalCode.textContent = `HOJA DE RECLAMACIÓN N° ${claimCode}`;
      }

      if (modal) {
        modal.classList.add("is-open");
      }

      form.reset();

      // Reset contadores
      textareasWithCounter.forEach(({ counterId, max }) => {
        const counter = document.getElementById(counterId);
        if (counter) counter.textContent = `0/${max}`;
      });

      if (fileText) {
        fileText.innerHTML = `<strong>Seleccionar archivo</strong> o arrastra tus archivos aquí`;
      }
    });
  }

  if (modalClose && modal) {
    modalClose.addEventListener("click", function () {
      modal.classList.remove("is-open");
    });

    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        modal.classList.remove("is-open");
      }
    });
  }
});
