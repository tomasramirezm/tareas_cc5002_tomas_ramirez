const validateName = (name) => {
    if(!name) return false;
    let lengthValid = name.trim().length >= 3 && name.trim().length <= 200;
    return lengthValid;
}

const validateEmail = (email) => {
    if(!email) return false;
    let lengthValid = email.trim().length <= 100;

    // validamos el formato
    let re = /^[\w.-]+@[a-zA-Z_0-9.-]+?\.[a-zA-Z]{2,3}$/;
    let formatValid = re.test(email);

    // devolvemos la lógica AND de las validaciones
    return lengthValid && formatValid;
}

const validatePhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return false;
  
  // Validación del formato utilizando una expresión regular
  let re = /^\+(\d{3})(\d{8})$/;

  return re.test(phoneNumber);
};

const validateMedioContacto = (checkbox, medio) => {
    if (!checkbox) return true; // si no está marcado, no es inválido
    if (!medio) return false; // si está marcado pero no hay valor, es inválido
    let lengthValid = medio.trim().length >= 4 && medio.trim().length <= 50;
    return lengthValid;
}

const validateNumeroEntero = (num) => {
    if(!num) return false;
    let numero = parseInt(num);
    return Number.isInteger(numero) && numero > 0;
}

const validateFechaEntrega = (fecha) => {
    if(!fecha) return false;
    let fechaDate = new Date(fecha);
    let hoy = new Date();
    hoy.setHours(0,0,0,0);
    return fechaDate >= hoy;
}

const validateFiles = (files) => {
  if (!files) return false;

  // validación del número de archivos
  let lengthValid = files.length <= 5;

  // validación del tipo de archivo
  let typeValid = true;

  for (const file of files) {
    // el tipo de archivo debe ser "image/<foo>" o "application/pdf"
    let fileFamily = file.type.split("/")[0];
    typeValid &&= fileFamily == "image" || file.type == "application/pdf";
  }

  // devolvemos la lógica AND de las validaciones.
  return lengthValid && typeValid;
};

const validateSelect = (select) => {
    if(!select) return false;
    return true;
}

const validateForm = () => {
    // Obtenemos los elementos del DOM usando el nombre del formulario
    const form = document.forms["agregar-aviso"];
    const nombre = form.elements["nombre"].value;
    const email = form.elements["email"].value;
    const telefono = form.elements["telefono"].value;
    const checkboxWhatsapp = form.elements["cb-whatsapp"].checked;
    const checkboxTelegram = form.elements["cb-telegram"].checked;
    const checkboxX = form.elements["cb-x"].checked;
    const checkboxInstagram = form.elements["cb-instagram"].checked;
    const checkboxTikTok = form.elements["cb-tiktok"].checked;
    const checkboxOtro = form.elements["cb-otro"].checked;
    const tipoDeMascota = form.elements["select-tipo-mascota"].value;
    const cantidad = form.elements["cantidad"].value;
    const edad = form.elements["edad"].value;
    const unidadEdad = form.elements["select-unidad-edad"].value;
    const fechaEntrega = form.elements["fecha-entrega"].value;
    const region = form.elements["select-region"].value;
    const comuna = form.elements["select-comuna"].value;
    const archivos = form.elements["foto"].files;

    // Obtenemos los valores de los medios de contacto solo si están marcados
    const medioWhatsapp = form.elements["cb-whatsapp"].checked ? document.getElementById("whatsapp-nombre").value : "";
    const medioTelegram = form.elements["cb-telegram"].checked ? document.getElementById("telegram-nombre").value : "";
    const medioX = form.elements["cb-x"].checked ? document.getElementById("x-nombre").value : "";
    const medioInstagram = form.elements["cb-instagram"].checked ? document.getElementById("instagram-nombre").value : "";
    const medioTikTok = form.elements["cb-tiktok"].checked ? document.getElementById("tiktok-nombre").value : "";
    const medioOtro = form.elements["cb-otro"].checked ? document.getElementById("otro-nombre").value : "";

    // Variables auxiliares de validación y función
    let invalidInputs = [];
    let isValid = true;
    const setInvalidInput = (inputName) => {
        invalidInputs.push(inputName);
        isValid &&= false;
    };

    // Lógica de validación
    if (!validateSelect(region)) setInvalidInput('Región');
    if (!validateSelect(comuna)) setInvalidInput('Comuna');
    if (!validateName(nombre)) setInvalidInput('Nombre de contacto');
    if (!validateEmail(email)) setInvalidInput('Correo electrónico');
    if (!validatePhoneNumber(telefono)) setInvalidInput('Número de teléfono');
    if (!validateMedioContacto(checkboxWhatsapp, medioWhatsapp)) setInvalidInput('Medio de contacto WhatsApp');
    if (!validateMedioContacto(checkboxTelegram, medioTelegram)) setInvalidInput('Medio de contacto Telegram');
    if (!validateMedioContacto(checkboxX, medioX)) setInvalidInput('Medio de contacto X');
    if (!validateMedioContacto(checkboxInstagram, medioInstagram)) setInvalidInput('Medio de contacto Instagram');
    if (!validateMedioContacto(checkboxTikTok, medioTikTok)) setInvalidInput('Medio de contacto TikTok');
    if (!validateMedioContacto(checkboxOtro, medioOtro)) setInvalidInput('Medio de contacto Otro');
    if (!validateSelect(tipoDeMascota)) setInvalidInput('Tipo de mascota');
    if (!validateNumeroEntero(cantidad)) setInvalidInput('Cantidad');
    if (!validateNumeroEntero(edad)) setInvalidInput('Edad');
    if (!validateSelect(unidadEdad)) setInvalidInput('Unidad de edad');
    if (!validateFechaEntrega(fechaEntrega)) setInvalidInput('Fecha disponible para entrega');
    if (!validateFiles(archivos)) setInvalidInput('Fotos de la mascota');

    // Finalmente mostrar la validación
    let validationBox = document.getElementById("val-box");
    let validationMessageElem = document.getElementById("val-msg");
    let validationListElem = document.getElementById("val-list");
    let formContainer = document.querySelector(".main-container");

    if (!isValid) {
        validationListElem.textContent = "";
        // agregar elementos inválidos al elemento val-list.
        for (input of invalidInputs) {
            let listElement = document.createElement("li");
            listElement.innerText = input;
            validationListElem.append(listElement);
        }
        // establecer val-msg
        validationMessageElem.innerText = "Los siguientes campos son inválidos:";

        // aplicar estilos de error
        validationBox.style.backgroundColor = "#ffdddd";
        validationBox.style.borderLeftColor = "#f44336";

        // hacer visible el mensaje de validación
        validationBox.hidden = false;
    } else {
        // Ocultar el formulario
        form.style.display = "none";

        // establecer mensaje de éxito
        validationMessageElem.innerText = "¿Está seguro que desea agregar este aviso de adopción?";
        validationListElem.textContent = "";

        // aplicar estilos de éxito
        validationBox.style.backgroundColor = "#ddffdd";
        validationBox.style.borderLeftColor = "#4CAF50";

        // Agregar botones para enviar el formulario o volver
        let submitButton = document.createElement("button");
        submitButton.innerText = "Si, estoy seguro";
        submitButton.style.marginRight = "10px";
        submitButton.addEventListener("click", () => {
            // myForm.submit();
            // no tenemos un backend al cual enviarle los datos
            formContainer.innerHTML = "<h2>Hemos recibido la información de adopción, muchas gracias y suerte!</h2>";
            let volverButton = document.createElement("button");
            volverButton.innerText = "Volver al inicio";
            volverButton.addEventListener("click", () => {
                window.location.href = "index.html";
            });
            formContainer.appendChild(volverButton);
        });

        let backButton = document.createElement("button");
        backButton.innerText = "No, no estoy seguro, quiero volver al formulario";
        backButton.addEventListener("click", () => {
            // Mostrar el formulario nuevamente
            form.style.display = "block";
            validationBox.hidden = true;
        });

        validationListElem.appendChild(submitButton);
        validationListElem.appendChild(backButton);

        // hacer visible el mensaje de validación
        validationBox.hidden = false;
    }
}

let submitBtn = document.getElementById("btn-enviar");
submitBtn.addEventListener("click", validateForm);