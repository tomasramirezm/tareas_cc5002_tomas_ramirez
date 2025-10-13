// Seleccionar las imágenes y el modal del DOM
const img1 = document.getElementById("image-2gatos");
const img2 = document.getElementById("image-gato-fran");
const img3 = document.getElementById("image-dominga");
const img4 = document.getElementById("image-gato-francia");
const img5 = document.getElementById("image-consu");
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modal-img");
const closeBtn = document.getElementById("close-btn");

// Funciones para abrir el modal con las imagenes agrandadas
img1.addEventListener("click", function() {
    modalImg.src = img1.src;
    modal.style.display = "flex";
});
img2.addEventListener("click", function() {
    modalImg.src = img2.src;
    modal.style.display = "flex";
});
img3.addEventListener("click", function() {
    modalImg.src = img3.src;
    modal.style.display = "flex";
});
img4.addEventListener("click", function() {
    modalImg.src = img4.src;
    modal.style.display = "flex";
});
img5.addEventListener("click", function() {
    modalImg.src = img5.src;
    modal.style.display = "flex";
});

// Función para cerrar el modal cuando se hace clic en el botón de cerrar
closeBtn.addEventListener("click", function() {
    modal.style.display = "none";
});

// Cerrar el modal si se hace clic fuera de la imagen (en el fondo oscuro)
window.addEventListener("click", function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});
