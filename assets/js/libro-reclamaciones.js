document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("reclamacionesForm");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Lógica de envío simulada (operación exitosa)
      alert("¡Reclamo o queja registrado con éxito! Operación exitosa.");

      form.reset();
    });
  }
});
