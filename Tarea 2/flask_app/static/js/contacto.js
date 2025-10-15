// Obtenemos los elementos del DOM
const contactoForm = document.getElementById('medio-contacto');

const cbWhatsApp = document.getElementById('cb-whatsapp');
const contWhatsapp = document.getElementById('whatsapp-nombre');

const cbTelegram = document.getElementById('cb-telegram');
const contTelegram = document.getElementById('telegram-nombre');

const cbX = document.getElementById('cb-x');
const contX = document.getElementById('x-nombre');

const cbInstagram = document.getElementById('cb-instagram');
const contInstagram = document.getElementById('instagram-nombre');

const cbTikTok = document.getElementById('cb-tiktok');
const contTikTok = document.getElementById('tiktok-nombre');

const cbOtro = document.getElementById('cb-otro');
const contOtro = document.getElementById('otro-nombre');

// Función para mostrar u ocultar un bloque según el estado del checkbox
function mostrarSiMarcado(checkbox, contenedor) {
  // Verificamos si los elementos checkbox y contenedor están definidos
  if (!checkbox || !contenedor) {
    return; // Si alguno de los dos no está presente, terminamos la función
  }

  // Creamos una variable para verificar el estado del checkbox
  const estaMarcado = checkbox.checked;

  // Si el checkbox está marcado, mostramos el contenedor. Si no, lo ocultamos
  if (estaMarcado) {
    contenedor.style.display = 'block';
  } else {
    contenedor.style.display = 'none'; 
  }
}


// Eventos: cuando cambie el checkbox, aplicamos la función
if (cbWhatsApp) {
    cbWhatsApp.addEventListener('change', () => mostrarSiMarcado(cbWhatsApp, contWhatsapp))
};

if (cbTelegram) {
    cbTelegram.addEventListener('change', () => mostrarSiMarcado(cbTelegram, contTelegram))
};

if (cbX) {
    cbX.addEventListener('change', () => mostrarSiMarcado(cbX, contX))
};

if (cbInstagram) { 
    cbInstagram.addEventListener('change',() => mostrarSiMarcado(cbInstagram, contInstagram))
};

if (cbTikTok) {
    cbTikTok.addEventListener('change', () => mostrarSiMarcado(cbTikTok, contTikTok))
};

if (cbOtro) {
    cbOtro.addEventListener('change', () => mostrarSiMarcado(cbOtro, contOtro))
};
