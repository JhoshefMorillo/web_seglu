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

  // 5. Validación de Campos Obligatorios con mensajes de texto
  const form = document.getElementById("reclamacionesForm");
  const modal = document.getElementById("lrModal");
  const modalClose = document.getElementById("lrModalClose");
  const modalCode = document.getElementById("lrModalCode");
  const modalDownload = document.getElementById("lrModalDownload");
  const modalDownloadText = document.getElementById("lrModalDownloadText");

  let lastClaimData = null; // Guardará todos los datos para generar el reclamo completo en PDF

  // Filtro en tiempo real: Nombre solo letras y espacios (sin números)
  const inputNombre = document.getElementById("lrNombre");
  if (inputNombre) {
    inputNombre.addEventListener("input", function () {
      this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "");
    });
  }

  // Filtro en tiempo real: Teléfono celular solo números (sin letras)
  const inputTelefono = document.getElementById("lrTelefono");
  if (inputTelefono) {
    inputTelefono.setAttribute("inputmode", "numeric");
    inputTelefono.setAttribute("maxlength", "15");
    inputTelefono.addEventListener("input", function () {
      this.value = this.value.replace(/\D/g, "");
    });
  }

  const requiredFields = [
    { id: "lrTipoDoc", errId: "err_lrTipoDoc", message: "Falta seleccionar el tipo de documento." },
    { id: "lrNumDoc", errId: "err_lrNumDoc", message: "Falta ingresar tu número de documento." },
    { id: "lrNombre", errId: "err_lrNombre", message: "Falta ingresar tus nombres y apellidos o razón social.", isName: true },
    { id: "lrDomicilio", errId: "err_lrDomicilio", message: "Falta ingresar tu domicilio completo (dirección, distrito y provincia)." },
    { id: "lrTelefono", errId: "err_lrTelefono", message: "Falta ingresar tu número de teléfono celular.", isPhone: true },
    { id: "lrCorreo", errId: "err_lrCorreo", message: "Falta ingresar tu correo electrónico.", isEmail: true },
    { id: "lrDescBien", errId: "err_lrDescBien", message: "Falta ingresar la descripción del producto o servicio." },
    { id: "lrDetalleReclamo", errId: "err_lrDetalleReclamo", message: "Falta detallar los hechos de tu reclamo o queja." },
    { id: "lrPedidoCliente", errId: "err_lrPedidoCliente", message: "Falta indicar la solución o requerimiento que solicitas." },
  ];

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

      // Validar campos requeridos
      requiredFields.forEach(({ id, errId, message, isName, isEmail, isPhone }) => {
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
        } else if (isName && (/\d/.test(val) || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(val))) {
          hasError = true;
          el.classList.add("is-invalid");
          errEl.textContent = "* El nombre y apellido o razón social solo debe contener letras, sin números ni símbolos.";
          errEl.classList.add("is-visible");
          if (!firstInvalidEl) firstInvalidEl = el;
        } else if (isName && val.length < 3) {
          hasError = true;
          el.classList.add("is-invalid");
          errEl.textContent = "* Por favor, ingresa un nombre o razón social completo (mínimo 3 letras).";
          errEl.classList.add("is-visible");
          if (!firstInvalidEl) firstInvalidEl = el;
        } else if (isPhone && (/\D/.test(val) || val.length < 7)) {
          hasError = true;
          el.classList.add("is-invalid");
          errEl.textContent = "* El teléfono celular solo debe contener números (mínimo 7 dígitos, ej: 904881704).";
          errEl.classList.add("is-visible");
          if (!firstInvalidEl) firstInvalidEl = el;
        } else if (isEmail && (!val.includes("@") || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))) {
          hasError = true;
          el.classList.add("is-invalid");
          errEl.textContent = "* El correo electrónico debe contener '@' y un dominio válido (ejemplo: usuario@correo.com).";
          errEl.classList.add("is-visible");
          if (!firstInvalidEl) firstInvalidEl = el;
        } else {
          el.classList.remove("is-invalid");
          errEl.textContent = "";
          errEl.classList.remove("is-visible");
        }
      });

      // Validar monto a reclamar si es Producto
      const tipoBienVal = document.querySelector('input[name="tipo_bien"]:checked')?.value || "Producto";
      const errMonto = document.getElementById("err_lrMonto");
      if (tipoBienVal === "Producto") {
        const montoVal = inputMonto ? inputMonto.value.trim() : "";
        if (!montoVal) {
          hasError = true;
          if (inputMonto) inputMonto.classList.add("is-invalid");
          if (errMonto) {
            errMonto.textContent = "* Para productos, debes ingresar el monto a reclamar.";
            errMonto.classList.add("is-visible");
          }
          if (!firstInvalidEl && inputMonto) firstInvalidEl = inputMonto;
        } else {
          if (inputMonto) inputMonto.classList.remove("is-invalid");
          if (errMonto) {
            errMonto.textContent = "";
            errMonto.classList.remove("is-visible");
          }
        }
      }

      // Validar Casilla 1
      if (check1 && !check1.checked) {
        hasError = true;
        if (errCheck1) {
          errCheck1.textContent = "* Debes declarar bajo juramento la veracidad de los datos para continuar.";
          errCheck1.classList.add("is-visible");
        }
        if (!firstInvalidEl) firstInvalidEl = check1;
      }

      // Validar Casilla 2
      if (check2 && !check2.checked) {
        hasError = true;
        if (errCheck2) {
          errCheck2.textContent = "* Debes aceptar los Términos y Condiciones y la Política de Tratamiento de Datos.";
          errCheck2.classList.add("is-visible");
        }
        if (!firstInvalidEl) firstInvalidEl = check2;
      }

      if (hasError) {
        if (firstInvalidEl) {
          firstInvalidEl.scrollIntoView({ behavior: "smooth", block: "center" });
          if (firstInvalidEl.focus) firstInvalidEl.focus();
        }
        return;
      }

      // Generar código único y guardar
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      const year = new Date().getFullYear();
      const claimCode = `REC-${year}-${randomNum}`;

      lastClaimData = {
        code: claimCode,
        fecha: fechaEl ? fechaEl.textContent : "",
        hora: horaEl ? horaEl.textContent : "",
        tipoDoc: document.getElementById("lrTipoDoc").value,
        numDoc: document.getElementById("lrNumDoc").value.trim(),
        nombre: document.getElementById("lrNombre").value.trim(),
        domicilio: document.getElementById("lrDomicilio").value.trim(),
        telefono: document.getElementById("lrTelefono").value.trim(),
        correo: document.getElementById("lrCorreo").value.trim(),
        tipoBien: tipoBienVal,
        comprobante: document.getElementById("lrComprobante")?.value.trim() || "No especificado",
        monto: inputMonto?.value.trim() || (tipoBienVal === "Servicio" ? "0.00" : "-"),
        descBien: document.getElementById("lrDescBien").value.trim(),
        tipoRequerimiento: document.querySelector('input[name="tipo_requerimiento"]:checked')?.value || "Reclamo",
        detalleReclamo: document.getElementById("lrDetalleReclamo").value.trim(),
        pedidoCliente: document.getElementById("lrPedidoCliente").value.trim(),
        archivos: selectedFiles.map((f) => f.name),
        timestamp: new Date().toISOString(),
      };

      try {
        const historico = JSON.parse(localStorage.getItem("seglu_reclamaciones_historial") || "[]");
        historico.push(lastClaimData);
        localStorage.setItem("seglu_reclamaciones_historial", JSON.stringify(historico));
      } catch (err) {
        console.warn("No se pudo guardar en localStorage", err);
      }

      if (modalCode) {
        modalCode.textContent = `HOJA DE RECLAMACIÓN N° ${claimCode}`;
      }

      if (modal) {
        modal.classList.add("is-open");
      }

      form.reset();
      selectedFiles = [];
      renderPreviews();
      handleTipoBienChange();

      textareasWithCounter.forEach(({ counterId, max }) => {
        const counter = document.getElementById(counterId);
        if (counter) counter.textContent = `0/${max}`;
      });
    });
  }

  // 6. Descarga directa en PDF de la Hoja Oficial del Reclamo (Sin pantallas ni botones intermedios)
  if (modalDownload) {
    modalDownload.addEventListener("click", function () {
      if (!lastClaimData) {
        try {
          const historico = JSON.parse(localStorage.getItem("seglu_reclamaciones_historial") || "[]");
          if (historico && historico.length > 0) {
            lastClaimData = historico[historico.length - 1];
          }
        } catch (e) {
          console.warn("Error leyendo historial", e);
        }
      }
      if (!lastClaimData) {
        alert("No se encontró información de la reclamación para descargar.");
        return;
      }
      descargarHojaReclamacionPDF(lastClaimData);
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

/**
 * Genera y descarga automáticamente el PDF de la Hoja de Reclamación con el logo oficial SVG
 */
function descargarHojaReclamacionPDF(data) {
  const btn = document.getElementById("lrModalDownload");
  const btnText = document.getElementById("lrModalDownloadText");
  const originalHtml = btn ? btn.innerHTML : "";

  if (btn) {
    btn.disabled = true;
    if (btnText) {
      btnText.textContent = "Generando PDF...";
    }
  }

  // Contenedor temporal de renderizado
  const container = document.createElement("div");
  container.id = "hoja-pdf-temp-container";
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "750px";
  container.style.padding = "20px 24px";
  container.style.background = "#ffffff";
  container.style.color = "#111111";
  container.style.fontFamily = "Arial, Helvetica, sans-serif";
  container.style.fontSize = "11.5px";
  container.style.lineHeight = "1.35";
  container.style.boxSizing = "border-box";

  container.innerHTML = generarHojaReclamacionHtml(data);
  document.body.appendChild(container);

  const opt = {
    margin: [8, 8, 8, 8],
    filename: `Hoja_Reclamacion_${data.code}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };

  if (typeof html2pdf !== "undefined") {
    html2pdf()
      .set(opt)
      .from(container)
      .save()
      .then(() => {
        finalizar();
      })
      .catch((err) => {
        console.error("Error generando PDF con html2pdf:", err);
        fallbackDescargaHtml(data);
        finalizar();
      });
  } else {
    fallbackDescargaHtml(data);
    finalizar();
  }

  function finalizar() {
    setTimeout(() => {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
      }
    }, 400);
  }
}

/**
 * Plantilla HTML con formato oficial según INDECOPI y Logo Oficial SVG de SEGLU
 */
function generarHojaReclamacionHtml(data) {
  return `
    <div style="border: 2px solid #000; padding: 12px 14px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; box-sizing: border-box;">
      <div style="flex: 1; padding-right: 12px;">
        <svg viewBox="0 0 1600 533" width="165" height="52" role="img" aria-label="SEGLU SAC" style="display:block; margin-bottom: 6px;">
          <path fill="#FF0000" d="M150,70 L1480,70 C1540,70 1585,110 1585,160 L1483,160 C1483,138 1470,128 1445,128 L160,128 C135,128 120,140 120,155 C120,168 130,175 150,178 L290,195 C340,202 372,245 372,292 C372,345 335,385 280,390 L105,390 C55,390 15,355 15,305 L15,278 L135,278 L135,293 C135,305 147,311 160,311 L228,311 C242,311 249,303 249,291 C249,278 238,270 220,268 L90,250 C45,243 18,215 18,180 C18,120 80,70 150,70 Z"/>
          <g fill="#0343B0">
            <path d="M392,175 H608 V226 H462 V253 H593 V309 H462 V337 H605 V390 H392 Z"/>
            <path d="M690,172 H820 C855,172 875,200 875,235 V258 H787 V240 C787,232 780,227 772,227 H718 C708,227 703,235 703,245 V318 C703,330 710,337 722,337 H765 C773,337 776,330 776,322 V315 H740 V278 H875 V425 L785,390 H665 C635,390 617,365 617,335 V230 C617,195 645,172 690,172 Z"/>
            <path d="M889,172 H975 V337 H1107 V390 H889 Z"/>
            <path d="M1121,172 H1213 V320 C1213,331 1220,337 1230,337 H1272 C1282,337 1287,331 1287,320 V172 H1380 V300 C1380,355 1340,390 1290,390 H1210 C1160,390 1121,355 1121,300 Z"/>
            <path d="M1420,168 H1469 C1477,168 1483,172 1483,178 V182 H1432 V188 H1483 V212 C1483,218 1477,222 1469,222 H1420 C1412,222 1406,218 1406,212 V208 H1457 V202 H1406 V178 C1406,172 1412,168 1420,168 Z"/>
            <path fill-rule="evenodd" d="M1428,245 H1462 L1482,312 H1452 L1450,303 H1436 L1434,312 H1404 Z M1442,265 L1448,285 H1438 Z"/>
            <path d="M1420,322 H1468 C1476,322 1482,328 1482,336 V345 H1453 V342 C1453,340 1451,339 1449,339 H1438 C1435,339 1433,341 1433,344 V368 C1433,371 1435,373 1438,373 H1449 C1451,373 1453,371 1453,369 V366 H1482 V376 C1482,385 1476,390 1468,390 H1420 C1411,390 1405,385 1405,377 V335 C1405,327 1411,322 1420,322 Z"/>
          </g>
        </svg>
        <p style="margin: 0; font-size: 11px;"><strong>RUC:</strong> 20609886073</p>
        <p style="margin: 0; font-size: 11px;"><strong>Dirección:</strong> Av. Argentina N° 327, Psje. 1 Principal Tda. X1-11A, C.C. La Bellota - Lima</p>
        <p style="margin: 0; font-size: 11px;"><strong>Correo:</strong> seglu.smp@gmail.com | <strong>Teléfono:</strong> +51 904 881 704</p>
      </div>
      <div style="text-align: right; border-left: 2px solid #000; padding-left: 16px; min-width: 210px;">
        <div style="font-size: 15px; font-weight: 800; color: #0343b0; margin-bottom: 2px;">HOJA DE RECLAMACIÓN</div>
        <div style="font-size: 13px; font-weight: bold; color: #000; margin-bottom: 4px;">${data.code}</div>
        <p style="margin: 0; font-size: 11px;"><strong>Fecha:</strong> ${data.fecha}</p>
        <p style="margin: 0; font-size: 11px;"><strong>Hora:</strong> ${data.hora}</p>
      </div>
    </div>

    <div style="background: #1e293b; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 8px; text-transform: uppercase; margin-top: 10px; margin-bottom: 6px; border-left: 4px solid #e30613;">
      1. Identificación del Consumidor Reclamante
    </div>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px; font-size: 11px;">
      <tr>
        <th style="border: 1px solid #cbd5e1; padding: 5px 8px; background: #f8fafc; text-align: left; width: 25%;">Nombres y Apellidos / Razón Social:</th>
        <td colspan="3" style="border: 1px solid #cbd5e1; padding: 5px 8px; text-align: left;"><strong>${escapeHtml(data.nombre)}</strong></td>
      </tr>
      <tr>
        <th style="border: 1px solid #cbd5e1; padding: 5px 8px; background: #f8fafc; text-align: left; width: 25%;">Tipo de Documento:</th>
        <td style="border: 1px solid #cbd5e1; padding: 5px 8px; text-align: left; width: 25%;">${escapeHtml(data.tipoDoc)}</td>
        <th style="border: 1px solid #cbd5e1; padding: 5px 8px; background: #f8fafc; text-align: left; width: 25%;">N° de Documento:</th>
        <td style="border: 1px solid #cbd5e1; padding: 5px 8px; text-align: left; width: 25%;"><strong>${escapeHtml(data.numDoc)}</strong></td>
      </tr>
      <tr>
        <th style="border: 1px solid #cbd5e1; padding: 5px 8px; background: #f8fafc; text-align: left;">Domicilio Completo:</th>
        <td colspan="3" style="border: 1px solid #cbd5e1; padding: 5px 8px; text-align: left;">${escapeHtml(data.domicilio)}</td>
      </tr>
      <tr>
        <th style="border: 1px solid #cbd5e1; padding: 5px 8px; background: #f8fafc; text-align: left;">Teléfono Celular:</th>
        <td style="border: 1px solid #cbd5e1; padding: 5px 8px; text-align: left;">${escapeHtml(data.telefono)}</td>
        <th style="border: 1px solid #cbd5e1; padding: 5px 8px; background: #f8fafc; text-align: left;">Correo Electrónico:</th>
        <td style="border: 1px solid #cbd5e1; padding: 5px 8px; text-align: left;">${escapeHtml(data.correo)}</td>
      </tr>
    </table>

    <div style="background: #1e293b; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 8px; text-transform: uppercase; margin-top: 10px; margin-bottom: 6px; border-left: 4px solid #e30613;">
      2. Identificación del Bien Contratado
    </div>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px; font-size: 11px;">
      <tr>
        <th style="border: 1px solid #cbd5e1; padding: 5px 8px; background: #f8fafc; text-align: left; width: 25%;">Tipo de Bien:</th>
        <td style="border: 1px solid #cbd5e1; padding: 5px 8px; text-align: left; width: 25%;"><strong>${escapeHtml(data.tipoBien)}</strong></td>
        <th style="border: 1px solid #cbd5e1; padding: 5px 8px; background: #f8fafc; text-align: left; width: 25%;">Monto Reclamado:</th>
        <td style="border: 1px solid #cbd5e1; padding: 5px 8px; text-align: left; width: 25%;"><strong>${data.monto && data.monto !== "-" ? "S/ " + escapeHtml(data.monto) : "No aplica"}</strong></td>
      </tr>
      <tr>
        <th style="border: 1px solid #cbd5e1; padding: 5px 8px; background: #f8fafc; text-align: left;">N° de Comprobante / Boleta:</th>
        <td colspan="3" style="border: 1px solid #cbd5e1; padding: 5px 8px; text-align: left;">${escapeHtml(data.comprobante)}</td>
      </tr>
    </table>
    <div style="font-weight: bold; font-size: 11px; margin: 4px 0 2px 0;">Descripción del Producto o Servicio:</div>
    <div style="border: 1px solid #cbd5e1; padding: 7px 9px; font-size: 10.5px; min-height: 38px; background: #fafafa; white-space: pre-wrap; margin-bottom: 6px;">${escapeHtml(data.descBien)}</div>

    <div style="background: #1e293b; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 8px; text-transform: uppercase; margin-top: 10px; margin-bottom: 6px; border-left: 4px solid #e30613;">
      3. Detalle de la Reclamación del Pedido
    </div>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px; font-size: 11px;">
      <tr>
        <th style="border: 1px solid #cbd5e1; padding: 5px 8px; background: #f8fafc; text-align: left; width: 25%;">Tipo de Requerimiento:</th>
        <td colspan="3" style="border: 1px solid #cbd5e1; padding: 5px 8px; text-align: left;">
          <strong style="color: #e30613; font-size: 11.5px;">${escapeHtml(data.tipoRequerimiento.toUpperCase())}</strong> 
          ${data.tipoRequerimiento === "Reclamo" ? "(Disconformidad relacionada a los productos o servicios)" : "(Disconformidad no relacionada a los productos/servicios; malestar o descontento respecto a la atención)"}
        </td>
      </tr>
    </table>
    <div style="font-weight: bold; font-size: 11px; margin: 4px 0 2px 0;">Detalle del Reclamo o Queja:</div>
    <div style="border: 1px solid #cbd5e1; padding: 7px 9px; font-size: 10.5px; min-height: 48px; background: #fafafa; white-space: pre-wrap; margin-bottom: 6px;">${escapeHtml(data.detalleReclamo)}</div>

    <div style="font-weight: bold; font-size: 11px; margin: 4px 0 2px 0;">Pedido o Solicitud Concreta del Cliente:</div>
    <div style="border: 1px solid #cbd5e1; padding: 7px 9px; font-size: 10.5px; min-height: 38px; background: #fafafa; white-space: pre-wrap; margin-bottom: 6px;">${escapeHtml(data.pedidoCliente)}</div>

    ${data.archivos && data.archivos.length > 0 ? `<p style="font-size: 10.5px; margin: 4px 0;"><strong>Archivos adjuntos reportados:</strong> ${data.archivos.join(", ")}</p>` : ""}

    <div style="background: #1e293b; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 8px; text-transform: uppercase; margin-top: 10px; margin-bottom: 6px; border-left: 4px solid #e30613;">
      4. Acciones y Respuesta Adoptadas por el Proveedor
    </div>
    <div style="border: 1px solid #cbd5e1; padding: 7px 9px; font-size: 10.5px; min-height: 32px; color: #64748b; font-style: italic; background: #fafafa; margin-bottom: 12px;">
      Espacio reservado para la constancia de atención y resolución formal por parte de SEGLU S.A.C.
    </div>

    <div style="display: flex; justify-content: space-between; margin-top: 26px; padding: 0 40px;">
      <div style="width: 220px; border-top: 1px solid #000; text-align: center; padding-top: 4px; font-size: 9.5px; font-weight: bold;">
        Firma del Consumidor<br>
        <span style="font-size: 8.5px; font-weight: normal; color: #555;">(Conformidad Digital)</span>
      </div>
      <div style="width: 220px; border-top: 1px solid #000; text-align: center; padding-top: 4px; font-size: 9.5px; font-weight: bold;">
        SEGLU S.A.C.<br>
        <span style="font-size: 8.5px; font-weight: normal; color: #555;">RUC 20609886073</span>
      </div>
    </div>

    <div style="border-top: 1px dashed #94a3b8; padding-top: 8px; margin-top: 14px; font-size: 9.5px; color: #475569; line-height: 1.35;">
      <p style="margin: 0 0 2px 0;">* La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.</p>
      <p style="margin: 0;">* Conforme a la Ley N° 29571 (Código de Protección y Defensa del Consumidor) y el D.S. 011-2011-PCM, el proveedor deberá dar respuesta al reclamo o queja en un plazo no mayor a quince (15) días hábiles improrrogables.</p>
    </div>
  `;
}

function fallbackDescargaHtml(data) {
  const fullHtml = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Hoja de Reclamación ${data.code}</title><style>body{margin:20px;font-family:Arial,sans-serif;font-size:12px;color:#111;}</style></head><body>${generarHojaReclamacionHtml(data)}</body></html>`;
  const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Hoja_Reclamacion_${data.code}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
