// Función que maneja el evento de cambio en los checkboxes
function manejarCheckbox(checkboxes) {
    // Contamos cuántos checkboxes están marcados
    const marcados = Array.from(checkboxes).filter(cb => cb.checked).length;

    // Si hay 5 o más checkboxes marcados, desactivamos los checkboxes no seleccionados
    if (marcados >= 5) {
        checkboxes.forEach(cb => {
            if (!cb.checked) {
                cb.disabled = true;
            }
        });
    } else {
        // Si hay menos de 5 checkboxes marcados, habilitamos todos los checkboxes
        checkboxes.forEach(cb => {
            cb.disabled = false;
        });
    }
}

// Obtenemos todos los checkboxes de medios de contacto
const checkboxesMedios = document.querySelectorAll('#medio-contacto input[type="checkbox"]');

// Añadimos un evento 'change' a cada checkbox para manejar los cambios
checkboxesMedios.forEach(checkbox => {
    checkbox.addEventListener('change', () => manejarCheckbox(checkboxesMedios));
});