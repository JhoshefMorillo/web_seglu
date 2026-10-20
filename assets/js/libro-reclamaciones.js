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

  // 3. Manejo de archivos adjuntos (Máximo 3 fotos o 1 solo PDF) con previsualización arribita
  const fileInput = document.getElementById("lrArchivo");
  const previewsContainer = document.getElementById("lrPreviews");
  const fileErrorMsg = document.getElementById("err_lrArchivo");
  let selectedFiles = []; // Almacena archivos válidos seleccionados

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

    // Eventos para eliminar archivos individuales
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

        // Regla: 1 solo PDF o hasta 3 fotos
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

      this.value = ""; // Limpiar input para permitir seleccionar de nuevo si se borra
      renderPreviews();
    });
  }

  function showFileError(msg) {
    if (fileErrorMsg) {
      fileErrorMsg.textContent = `* ${msg}`;
      fileErrorMsg.classList.add("is-visible");
    }
  }

  // 4. Validación de Campos Obligatorios con mensajes de texto
  const form = document.getElementById("reclamacionesForm");
  const modal = document.getElementById("lrModal");
  const modalClose = document.getElementById("lrModalClose");
  const modalCode = document.getElementById("lrModalCode");
  const modalWa = document.getElementById("lrModalWa");
  const modalPrint = document.getElementById("lrModalPrint");

  const requiredFields = [
    { id: "lrTipoDoc", errId: "err_lrTipoDoc", message: "Falta seleccionar el tipo de documento." },
    { id: "lrNumDoc", errId: "err_lrNumDoc", message: "Falta ingresar tu número de documento." },
    { id: "lrNombre", errId: "err_lrNombre", message: "Falta ingresar tus nombres y apellidos o razón social." },
    { id: "lrDomicilio", errId: "err_lrDomicilio", message: "Falta ingresar tu domicilio completo (dirección, distrito y provincia)." },
    { id: "lrTelefono", errId: "err_lrTelefono", message: "Falta ingresar tu número de teléfono celular.", isPhone: true },
    { id: "lrCorreo", errId: "err_lrCorreo", message: "Falta ingresar tu correo electrónico.", isEmail: true },
    { id: "lrDescBien", errId: "err_lrDescBien", message: "Falta ingresar la descripción del producto o servicio." },
    { id: "lrDetalleReclamo", errId: "err_lrDetalleReclamo", message: "Falta detallar los hechos de tu reclamo o queja." },
    { id: "lrPedidoCliente", errId: "err_lrPedidoCliente", message: "Falta indicar la solución o requerimiento que solicitas." },
  ];

  // Limpiar errores en tiempo real al escribir
  requiredFields.forEach(({ id, errId }) => {
    const el = document.getElementById(id);
    const errEl = document.getElementById(errId);
    if (el && errEl) {
      const clearError = () => {
        el.classList.remove("is-invalid");
        errEl.textContent = "";
        errEl.classList.remove("is-visible");
      };
      el.addEventListener("input", clearError);
      el.addEventListener("change", clearError);
    }
  });

  const check1 = document.getElementById("lrCheck1");
  const errCheck1 = document.getElementById("err_lrCheck1");
  if (check1 && errCheck1) {
    check1.addEventListener("change", () => {
      if (check1.checked) {
        errCheck1.textContent = "";
        errCheck1.classList.remove("is-visible");
      }
    });
  }

  const check2 = document.getElementById("lrCheck2");
  const errCheck2 = document.getElementById("err_lrCheck2");
  if (check2 && errCheck2) {
    check2.addEventListener("change", () => {
      if (check2.checked) {
        errCheck2.textContent = "";
        errCheck2.classList.remove("is-visible");
      }
    });
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      let hasError = false;
      let firstInvalidEl = null;

      // Validar cada campo requerido
      requiredFields.forEach(({ id, errId, message, isEmail, isPhone }) => {
        const el = document.getElementById(id);
        const errEl = document.getElementById(errId);
        if (!el || !errEl) return;

        const val = el.value.trim();

        if (!val) {
          hasError = true;
          el.classList.add("is-invalid");
          errEl.textContent = `* ${message}`;
          errEl.classList.add("is-visible");
          if (!firstInvalidEl) firstInvalidEl = el;
        } else if (isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          hasError = true;
          el.classList.add("is-invalid");
          errEl.textContent = "* Por favor, ingresa un correo electrónico válido (ej: tu_nombre@correo.com).";
          errEl.classList.add("is-visible");
          if (!firstInvalidEl) firstInvalidEl = el;
        } else if (isPhone && val.replace(/\D/g, "").length < 7) {
          hasError = true;
          el.classList.add("is-invalid");
          errEl.textContent = "* Por favor, ingresa un número telefónico celular válido de contacto.";
          errEl.classList.add("is-visible");
          if (!firstInvalidEl) firstInvalidEl = el;
        } else {
          el.classList.remove("is-invalid");
          errEl.textContent = "";
          errEl.classList.remove("is-visible");
        }
      });

      // Validar Casilla 1 (Declaración bajo juramento)
      if (check1 && !check1.checked) {
        hasError = true;
        if (errCheck1) {
          errCheck1.textContent = "* Debes declarar bajo juramento la veracidad de los datos para continuar.";
          errCheck1.classList.add("is-visible");
        }
        if (!firstInvalidEl) firstInvalidEl = check1;
      }

      // Validar Casilla 2 (Aceptación de Términos y Política)
      if (check2 && !check2.checked) {
        hasError = true;
        if (errCheck2) {
          errCheck2.textContent = "* Debes aceptar los Términos y Condiciones y la Política de Tratamiento de Datos.";
          errCheck2.classList.add("is-visible");
        }
        if (!firstInvalidEl) firstInvalidEl = check2;
      }

      // Si hay errores, hacer scroll hacia el primer campo faltante
      if (hasError) {
        if (firstInvalidEl) {
          firstInvalidEl.scrollIntoView({ behavior: "smooth", block: "center" });
          if (firstInvalidEl.focus) firstInvalidEl.focus();
        }
        return;
      }

      // Generar código único y guardar datos
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      const year = new Date().getFullYear();
      const claimCode = `REC-${year}-${randomNum}`;

      const claimData = {
        code: claimCode,
        fecha: fechaEl ? fechaEl.textContent : "",
        hora: horaEl ? horaEl.textContent : "",
        tipoDoc: document.getElementById("lrTipoDoc").value,
        numDoc: document.getElementById("lrNumDoc").value.trim(),
        nombre: document.getElementById("lrNombre").value.trim(),
        domicilio: document.getElementById("lrDomicilio").value.trim(),
        telefono: document.getElementById("lrTelefono").value.trim(),
        correo: document.getElementById("lrCorreo").value.trim(),
        tipoBien: document.querySelector('input[name="tipo_bien"]:checked')?.value || "Producto",
        comprobante: document.getElementById("lrComprobante")?.value.trim() || "-",
        monto: document.getElementById("lrMonto")?.value.trim() || "-",
        descBien: document.getElementById("lrDescBien").value.trim(),
        tipoRequerimiento: document.querySelector('input[name="tipo_requerimiento"]:checked')?.value || "Reclamo",
        detalleReclamo: document.getElementById("lrDetalleReclamo").value.trim(),
        pedidoCliente: document.getElementById("lrPedidoCliente").value.trim(),
        archivos: selectedFiles.map((f) => f.name),
        timestamp: new Date().toISOString(),
      };

      // Guardar en almacenamiento local para constancia del usuario
      try {
        const historico = JSON.parse(localStorage.getItem("seglu_reclamaciones_historial") || "[]");
        historico.push(claimData);
        localStorage.setItem("seglu_reclamaciones_historial", JSON.stringify(historico));
      } catch (err) {
        console.warn("No se pudo guardar en localStorage", err);
      }

      // Mostrar Modal
      if (modalCode) {
        modalCode.textContent = `HOJA DE RECLAMACIÓN N° ${claimCode}`;
      }

      // Enlace para enviar aviso directo por WhatsApp de SEGLU
      if (modalWa) {
        const waMsg = encodeURIComponent(
          `Hola SEGLU SAC. He registrado la Hoja de Reclamación Virtual *N° ${claimCode}* en su página web a nombre de *${claimData.nombre}* (DNI/Doc: ${claimData.numDoc}). Tipo: *${claimData.tipoRequerimiento}*. Solicito la confirmación de recepción. ¡Muchas gracias!`
        );
        modalWa.href = `https://wa.me/51904881704?text=${waMsg}`;
      }

      if (modal) {
        modal.classList.add("is-open");
      }

      // Limpiar formulario y estado de archivos
      form.reset();
      selectedFiles = [];
      renderPreviews();

      textareasWithCounter.forEach(({ counterId, max }) => {
        const counter = document.getElementById(counterId);
        if (counter) counter.textContent = `0/${max}`;
      });
    });
  }

  // Descargar / Imprimir Hoja de Reclamación
  if (modalPrint) {
    modalPrint.addEventListener("click", function () {
      window.print();
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
