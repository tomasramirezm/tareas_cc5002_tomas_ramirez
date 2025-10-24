// Obtenemos los elementos del DOM
const fotoContainer = document.getElementById('foto-container');
const btnAgregarFoto = document.getElementById('btn-agregar-foto');
const mensajeError = document.getElementById('mensaje-error');

// Contador para el número de fotos
let contadorFotos = 1;

// Función para agregar un nuevo campo de foto
function agregarOtraFoto() {
    if (contadorFotos >= 5) {
        mensajeError.style.display = 'block';
        return;
    }

    // Creamos un nuevo input de tipo file
    const nuevoInput = document.createElement('input');
    nuevoInput.type = 'file';
    nuevoInput.classList.add('foto-input');
    nuevoInput.name = 'foto';
    nuevoInput.accept = 'image/*,.pdf';
    fotoContainer.appendChild(nuevoInput);

    // Incrementamos el contador de fotos
    contadorFotos++;
    mensajeError.style.display = 'none';
}

// Evento para el botón de agregar foto
btnAgregarFoto.addEventListener('click', agregarOtraFoto);