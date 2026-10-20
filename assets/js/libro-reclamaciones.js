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
  const modalPrint = document.getElementById("lrModalPrint");

  let lastClaimData = null; // Guardará todos los datos para generar el reclamo completo en PDF/Impresión

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

  // 6. Generación, Impresión y Descarga del RECLAMO EN SÍ (Documento oficial)
  if (modalPrint) {
    modalPrint.addEventListener("click", function () {
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
        alert("No se encontró información de la reclamación para imprimir o descargar.");
        return;
      }
      imprimirHojaReclamacionOficial(lastClaimData);
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
 * Genera e imprime/descarga en PDF la Hoja de Reclamación completa con formato oficial
 */
function imprimirHojaReclamacionOficial(data) {
  const printWindow = window.open("", "_blank", "width=850,height=950");
  if (!printWindow) {
    alert("Por favor habilita las ventanas emergentes (pop-ups) en tu navegador para ver y descargar tu reclamación.");
    return;
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Hoja de Reclamación - ${data.code} - SEGLU SAC</title>
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: Arial, Helvetica, sans-serif;
    }
    body {
      color: #111;
      background: #fff;
      padding: 20px;
      font-size: 12px;
      line-height: 1.4;
    }
    .header-box {
      border: 2px solid #000;
      padding: 12px 16px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header-left h1 {
      font-size: 20px;
      font-weight: 900;
      color: #e30613;
      margin-bottom: 2px;
    }
    .header-left p {
      font-size: 11px;
      color: #333;
    }
    .header-right {
      text-align: right;
      border-left: 2px solid #000;
      padding-left: 16px;
    }
    .claim-code {
      font-size: 16px;
      font-weight: 800;
      color: #0343b0;
      margin-bottom: 4px;
    }
    .section-title {
      background: #1e293b;
      color: #fff;
      font-size: 11px;
      font-weight: bold;
      padding: 5px 8px;
      text-transform: uppercase;
      margin-top: 10px;
      margin-bottom: 6px;
      border-left: 4px solid #e30613;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 6px;
    }
    table.data-table th, table.data-table td {
      border: 1px solid #cbd5e1;
      padding: 6px 8px;
      font-size: 11px;
      text-align: left;
    }
    table.data-table th {
      background: #f8fafc;
      font-weight: bold;
      width: 25%;
    }
    .content-box {
      border: 1px solid #cbd5e1;
      padding: 8px 10px;
      font-size: 11px;
      min-height: 50px;
      background: #fafafa;
      white-space: pre-wrap;
      margin-bottom: 8px;
    }
    .legal-footer {
      border-top: 1px dashed #94a3b8;
      padding-top: 10px;
      margin-top: 16px;
      font-size: 10px;
      color: #475569;
      line-height: 1.4;
    }
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
      padding: 0 40px;
    }
    .sig-line {
      width: 220px;
      border-top: 1px solid #000;
      text-align: center;
      padding-top: 4px;
      font-size: 10px;
      font-weight: bold;
    }
    .no-print-bar {
      background: #f1f5f9;
      padding: 10px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn-action {
      background: #e30613;
      color: #fff;
      border: none;
      padding: 8px 16px;
      font-weight: bold;
      font-size: 12px;
      border-radius: 6px;
      cursor: pointer;
    }
    @media print {
      .no-print-bar {
        display: none !important;
      }
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <span><strong>Hoja de Reclamación Oficial (Ley N° 29571)</strong> — Código: <strong>${data.code}</strong></span>
    <div style="display: flex; gap: 8px;">
      <button class="btn-action" onclick="window.print()">🖨️ Imprimir / Guardar en PDF</button>
      <button class="btn-action" style="background: #0f172a;" onclick="descargarHtml()">💾 Descargar Archivo</button>
    </div>
  </div>

  <div class="header-box">
    <div class="header-left">
      <h1>SEGLU S.A.C.</h1>
      <p><strong>RUC:</strong> 20609886073</p>
      <p><strong>Dirección:</strong> Av. Argentina N° 327, Psje. 1 Principal Tda. X1-11A, C.C. La Bellota - Lima</p>
      <p><strong>Correo:</strong> seglu.smp@gmail.com | <strong>Teléfono:</strong> +51 904 881 704</p>
    </div>
    <div class="header-right">
      <div class="claim-code">HOJA DE RECLAMACIÓN</div>
      <div style="font-size: 14px; font-weight: bold; color: #000; margin-bottom: 4px;">${data.code}</div>
      <p><strong>Fecha:</strong> ${data.fecha}</p>
      <p><strong>Hora:</strong> ${data.hora}</p>
    </div>
  </div>

  <div class="section-title">1. Identificación del Consumidor Reclamante</div>
  <table class="data-table">
    <tr>
      <th>Nombres y Apellidos / Razón Social:</th>
      <td colspan="3"><strong>${escapeHtml(data.nombre)}</strong></td>
    </tr>
    <tr>
      <th>Tipo de Documento:</th>
      <td>${escapeHtml(data.tipoDoc)}</td>
      <th>N° de Documento:</th>
      <td><strong>${escapeHtml(data.numDoc)}</strong></td>
    </tr>
    <tr>
      <th>Domicilio Completo:</th>
      <td colspan="3">${escapeHtml(data.domicilio)}</td>
    </tr>
    <tr>
      <th>Teléfono Celular:</th>
      <td>${escapeHtml(data.telefono)}</td>
      <th>Correo Electrónico:</th>
      <td>${escapeHtml(data.correo)}</td>
    </tr>
  </table>

  <div class="section-title">2. Identificación del Bien Contratado</div>
  <table class="data-table">
    <tr>
      <th>Tipo de Bien:</th>
      <td><strong>${escapeHtml(data.tipoBien)}</strong></td>
      <th>Monto Reclamado:</th>
      <td><strong>S/ ${escapeHtml(data.monto)}</strong></td>
    </tr>
    <tr>
      <th>N° de Comprobante / Boleta:</th>
      <td colspan="3">${escapeHtml(data.comprobante)}</td>
    </tr>
  </table>
  <div style="font-weight: bold; font-size: 11px; margin: 4px 0 2px 0;">Descripción del Producto o Servicio:</div>
  <div class="content-box">${escapeHtml(data.descBien)}</div>

  <div class="section-title">3. Detalle de la Reclamación del Pedido</div>
  <table class="data-table">
    <tr>
      <th>Tipo de Requerimiento:</th>
      <td colspan="3"><strong style="color: #e30613; font-size: 12px;">${escapeHtml(data.tipoRequerimiento.toUpperCase())}</strong> 
      ${data.tipoRequerimiento === "Reclamo" ? "(Disconformidad relacionada a los productos o servicios)" : "(Disconformidad no relacionada a los productos/servicios; malestar o descontento respecto a la atención)"}</td>
    </tr>
  </table>
  <div style="font-weight: bold; font-size: 11px; margin: 4px 0 2px 0;">Detalle del Reclamo o Queja:</div>
  <div class="content-box">${escapeHtml(data.detalleReclamo)}</div>

  <div style="font-weight: bold; font-size: 11px; margin: 4px 0 2px 0;">Pedido o Solicitud Concreta del Cliente:</div>
  <div class="content-box">${escapeHtml(data.pedidoCliente)}</div>

  ${data.archivos && data.archivos.length > 0 ? `<p style="font-size: 11px; margin-top: 4px;"><strong>Archivos adjuntos reportados:</strong> ${data.archivos.join(", ")}</p>` : ""}

  <div class="section-title">4. Acciones y Respuesta Adoptadas por el Proveedor</div>
  <div class="content-box" style="min-height: 40px; color: #64748b; font-style: italic;">
    Espacio reservado para la constancia de atención y resolución formal por parte de SEGLU S.A.C.
  </div>

  <div class="signatures">
    <div class="sig-line">
      Firma del Consumidor<br>
      <span style="font-size: 9px; font-weight: normal; color: #555;">(Conformidad Digital)</span>
    </div>
    <div class="sig-line">
      SEGLU S.A.C.<br>
      <span style="font-size: 9px; font-weight: normal; color: #555;">RUC 20609886073</span>
    </div>
  </div>

  <div class="legal-footer">
    <p>* La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.</p>
    <p>* Conforme a la Ley N° 29571 (Código de Protección y Defensa del Consumidor) y el D.S. 011-2011-PCM, el proveedor deberá dar respuesta al reclamo o queja en un plazo no mayor a quince (15) días hábiles improrrogables.</p>
  </div>

  <script>
    function descargarHtml() {
      var blob = new Blob([document.documentElement.outerHTML], { type: "text/html;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "Hoja_Reclamacion_${data.code}.html";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    window.onload = function() {
      // Abre diálogo de impresión automáticamente
      setTimeout(function() {
        window.print();
      }, 500);
    };
  <\/script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
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
