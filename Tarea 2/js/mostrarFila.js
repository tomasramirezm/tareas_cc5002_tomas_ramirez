// Obtener todas las filas de la tabla
const rows = document.querySelectorAll(".adoption-row");

// Obtener todos los modales
const modals = document.querySelectorAll(".modal-adoption");

// Función para ocultar todos los modales
function ocultarModales() {
    modals.forEach(modal => {
        modal.style.display = "none";
    });
}

// Añadir evento de clic a cada fila
rows.forEach((row, index) => {
    row.addEventListener("click", () => {
        ocultarModales();  // Ocultamos cualquier modal visible
        const modal = modals[index];  // Obtener el modal correspondiente
        modal.style.display = "flex";  // Mostrar el modal correspondiente
    });
});

// Función para cerrar el modal
const closeBtns = document.querySelectorAll(".close-btn");
closeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        ocultarModales();  // Ocultar el modal al hacer clic en "Cerrar"
    });
});



