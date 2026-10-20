// ============================================================
// LIBRO DE RECLAMACIONES — Lógica interactiva completa
// ============================================================

document.addEventListener("DOMContentLoaded", function () {
  // 1. Fecha actual y Reloj en Vivo (avanza en tiempo real cada segundo)
  const fechaEl = document.getElementById("lrFecha");
  const horaEl = document.getElementById("lrHora");

  function updateClock() {
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
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      horaEl.textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
    }
  }

  updateClock();
  setInterval(updateClock, 1000);

  // 2. Lógica dinámica: Tipo de Bien (Producto vs Servicio)
  const radioBien = document.querySelectorAll('input[name="tipo_bien"]');
  const labelMonto = document.getElementById("labelMonto");
  const inputMonto = document.getElementById("lrMonto");
  const inputComprobante = document.getElementById("lrComprobante");

  function handleTipoBienChange() {
    const selected = document.querySelector('input[name="tipo_bien"]:checked')?.value || "Producto";
    if (selected === "Producto") {
      if (labelMonto) {
        labelMonto.innerHTML = 'MONTO A RECLAMAR (S/) <span class="req">*</span>';
      }
      if (inputMonto) {
        inputMonto.placeholder = "0.00";
        inputMonto.setAttribute("required", "required");
      }
      if (inputComprobante) {
        inputComprobante.placeholder = "N° de Boleta o Factura";
      }
    } else {
      // Servicio
      if (labelMonto) {
        labelMonto.innerHTML = 'MONTO A RECLAMAR (S/) <span style="font-size: 0.72rem; color: #64748b; font-weight: normal;">(Opcional en servicios)</span>';
      }
      if (inputMonto) {
        inputMonto.placeholder = "0.00 (Opcional si no hubo cobro monetario)";
        inputMonto.removeAttribute("required");
        inputMonto.classList.remove("is-invalid");
      }
      if (inputComprobante) {
        inputComprobante.placeholder = "N° de comprobante o ticket (Opcional)";
      }
      const errMonto = document.getElementById("err_lrMonto");
      if (errMonto) {
        errMonto.textContent = "";
        errMonto.classList.remove("is-visible");
      }
    }
  }

  radioBien.forEach((r) => r.addEventListener("change", handleTipoBienChange));
  handleTipoBienChange();

  // 3. Contadores de caracteres
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

  // 4. Manejo de archivos adjuntos (Máximo 3 fotos o 1 solo PDF) con previsualización arribita
  const fileInput = document.getElementById("lrArchivo");
  const previewsContainer = document.getElementById("lrPreviews");
  const fileErrorMsg = document.getElementById("err_lrArchivo");
  let selectedFiles = [];

  function renderPreviews() {
    if (!previewsContainer) return;
    previewsContainer.innerHTML = "";

    if (selectedFiles.length === 0) {
      previewsContainer.classList.remove("has-files");
      return;
    }

    previewsContainer.classList.add("has-files");

    selectedFiles.forEach((file, index) => {
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

      if (isPdf) {
        const pdfCard = document.createElement("div");
        pdfCard.className = "lr-preview-pdf-card";
        pdfCard.innerHTML = `
          <div class="lr-preview-pdf-info">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span class="lr-preview-pdf-name" title="${file.name}">${file.name}</span>
          </div>
          <button type="button" class="lr-preview-remove" data-index="${index}" aria-label="Eliminar archivo">×</button>
        `;
        previewsContainer.appendChild(pdfCard);
      } else {
        const item = document.createElement("div");
        item.className = "lr-preview-item";

        const img = document.createElement("img");
        img.alt = file.name;
        img.src = URL.createObjectURL(file);

        const btnRemove = document.createElement("button");
        btnRemove.type = "button";
        btnRemove.className = "lr-preview-remove";
        btnRemove.innerHTML = "×";
        btnRemove.dataset.index = index;
        btnRemove.setAttribute("aria-label", "Eliminar archivo");

        item.appendChild(img);
        item.appendChild(btnRemove);
        previewsContainer.appendChild(item);
      }
    });

    previewsContainer.querySelectorAll(".lr-preview-remove").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        const idx = parseInt(this.dataset.index, 10);
        selectedFiles.splice(idx, 1);
        renderPreviews();
        if (fileErrorMsg) {
          fileErrorMsg.textContent = "";
          fileErrorMsg.classList.remove("is-visible");
        }
      });
    });
  }

  if (fileInput) {
    fileInput.addEventListener("change", function () {
      if (!this.files || this.files.length === 0) return;

      const newFiles = Array.from(this.files);
      if (fileErrorMsg) {
        fileErrorMsg.textContent = "";
        fileErrorMsg.classList.remove("is-visible");
      }

      for (const file of newFiles) {
        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        const isImage = file.type.startsWith("image/") || /\.(png|jpe?g)$/i.test(file.name);

        if (!isPdf && !isImage) {
          showFileError("Solo se permiten formatos PNG, JPG o PDF.");
          return;
        }

        if (isPdf) {
          if (selectedFiles.length > 0) {
            showFileError("Si adjuntas un documento PDF, solo puedes subir 1 archivo PDF (sin fotos adicionales).");
            return;
          }
          selectedFiles = [file];
          break;
        } else if (isImage) {
          const hasPdf = selectedFiles.some((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
          if (hasPdf) {
            showFileError("No puedes combinar fotos con un archivo PDF. Elige hasta 3 fotos o 1 solo PDF.");
            return;
          }
          if (selectedFiles.length >= 3) {
            showFileError("Solo puedes subir un máximo de 3 fotos.");
            return;
          }
          selectedFiles.push(file);
        }
      }

      this.value = "";
      renderPreviews();
    });
  }

  function showFileError(msg) {
    if (fileErrorMsg) {
      fileErrorMsg.textContent = `* ${msg}`;
      fileErrorMsg.classList.add("is-visible");
    }
  }

  // 5. Filtros de entrada en tiempo real
  // Nombre: solo letras y espacios (sin números)
  const inputNombre = document.getElementById("lrNombre");
  if (inputNombre) {
    inputNombre.addEventListener("input", function () {
      this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "");
    });
  }

  // Teléfono celular: solo números (sin letras)
  const inputTelefono = document.getElementById("lrTelefono");
  if (inputTelefono) {
    inputTelefono.setAttribute("inputmode", "numeric");
    inputTelefono.setAttribute("maxlength", "15");
    inputTelefono.addEventListener("input", function () {
      this.value = this.value.replace(/\D/g, "");
    });
  }

  // Por ahora el botón Enviar Reclamación no tiene función activa (se integrará con EmailJS más adelante)
  const form = document.getElementById("reclamacionesForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });
  }
});
