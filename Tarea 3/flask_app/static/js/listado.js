// Esperamos a que el DOM esté listo para asegurarnos de que existan los elementos.
document.addEventListener("DOMContentLoaded", function () {
  var tbody = document.querySelector("#tabla-adopciones tbody");
  var btnPrev = document.getElementById("btn-prev");
  var btnNext = document.getElementById("btn-next");
  var pageInfo = document.getElementById("page-info");

  var modal = document.getElementById("detalle-modal");
  var modalBody = document.getElementById("detalle-body");
  var modalClose = document.getElementById("detalle-close");

  // Modal de imagen (overlay independiente del modal de detalle)
  var imgModal, imgModalImg, imgModalClose;

  function ensureImageModal() {
    // Overlay oscuro (#modal)
    imgModal = document.getElementById("modal");
    if (!imgModal) {
      imgModal = document.createElement("div");
      imgModal.id = "modal";              // estilos en CSS
      // sin estilos inline: la visibilidad la controla la clase .open en CSS
      document.body.appendChild(imgModal);
    }

    // Contenedor centrado (#modal-content) con imagen y botón
    var content = document.getElementById("modal-content");
    if (!content) {
      content = document.createElement("div");
      content.id = "modal-content";       // estilos en CSS
      content.innerHTML =
        '<img id="modal-img" alt="Imagen de aviso" />' +
        '<button id="close-btn" class="close-btn">Cerrar</button>';
      imgModal.appendChild(content);
    }

    imgModalImg = document.getElementById("modal-img");
    imgModalClose = document.getElementById("close-btn");

    // Listeners una sola vez
    if (!imgModal.dataset.listeners) {
      // Cerrar al hacer click fuera del contenido
      imgModal.addEventListener("click", function (e) {
        if (e.target === imgModal) hideImageModal();
      });
      // Botón cerrar
      imgModalClose.addEventListener("click", hideImageModal);
      // Tecla Escape
      document.addEventListener("keydown", function (e) {
        if (imgModal.classList.contains("open") && e.key === "Escape") hideImageModal();
      });
      // Cerrar si haces click en la imagen grande
      imgModalImg.addEventListener("click", hideImageModal);

      imgModal.dataset.listeners = "true";
    }
  }

  function showImageModal(src) {
    ensureImageModal();
    imgModalImg.src = src;
    imgModal.classList.add("open");
  }

  function hideImageModal() {
    if (imgModal) imgModal.classList.remove("open");
  }

  // Definimos una función para renderizar los comentarios
  function renderComentarios(items) {
    // Obtenemos los comentarios asociados a un aviso
    var ul = document.getElementById("comentarios-list");
    ul.innerHTML = "";

    // Si no hay comentarios, generamos un mensaje diciendo que aún no hay comentarios
    if (!items || items.length === 0) {
      var li = document.createElement("li");
      li.className = "comentario-item";
      var card = document.createElement("article");
      card.className = "comentario-card";
      var p = document.createElement("p");
      p.className = "comentario-texto";
      p.textContent = "Sin comentarios aún.";
      card.appendChild(p);
      li.appendChild(card);
      ul.appendChild(li);
      return;
    }

    // Si hay comentarios los mostramos todos del más nuevo al más antiguo
    items.forEach(function (c) {
      var li = document.createElement("li");
      li.className = "comentario-item";

      var card = document.createElement("article");
      card.className = "comentario-card";

      var header = document.createElement("div");
      header.className = "comentario-header";

      var autor = document.createElement("span");
      autor.className = "comentario-autor";
      autor.textContent = c.nombre;

      var fecha = document.createElement("time");
      fecha.className = "comentario-fecha";
      fecha.textContent = "· " + c.fecha;

      header.appendChild(autor);
      header.appendChild(fecha);

      var texto = document.createElement("p");
      texto.className = "comentario-texto";
      texto.textContent = c.texto;

      card.appendChild(header);
      card.appendChild(texto);
      li.appendChild(card);
      ul.appendChild(li);
    });
  }

  // Función para decir si hay un error en el comentario
  function setComentarioError(msg) {
    var e = document.getElementById("comentario-error");
    if (!e) return;
    if (msg) {
      e.textContent = msg;
    } else {
      e.textContent = "";
    }
  }

  // Función para cargar todos los comentarios asociados a un aviso
  function cargarComentarios(avisoId) {
    fetch("/avisos/" + avisoId + "/comentarios")
      .then(function (res) { return res.json(); })
      .then(function (data) { renderComentarios(data); })
      .catch(function () { setComentarioError("No se pudieron cargar los comentarios."); });
  }

  // Función principal para asociar un comentario a un aviso
  function enviarComentario(avisoId) {
    var nombre = document.getElementById("comentario-nombre").value.trim();
    var texto  = document.getElementById("comentario-texto").value.trim();

    // Validación cliente alineada con servidor
    if (nombre.length < 3 || nombre.length > 80) {
      setComentarioError("El nombre debe tener entre 3 y 80 caracteres.");
      return;
    }
    if (texto.length < 5) {
      setComentarioError("El comentario debe tener al menos 5 caracteres.");
      return;
    }
    if (texto.length > 300) {
      setComentarioError("El comentario no puede superar 300 caracteres.");
      return;
    }
    setComentarioError("");

    // Enviamos el comentario al servidor
    var formData = new URLSearchParams();
    formData.append("nombre", nombre);
    formData.append("texto", texto);

    // Hacemos el fetch para enviar el comentario
    fetch("/avisos/" + avisoId + "/comentarios", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString()
    })
      .then(function (res) {
        if (!res.ok) return res.json().then(function (d) {throw d;});
        return res.json();
      })
      .then(function () {
        document.getElementById("comentario-nombre").value = "";
        document.getElementById("comentario-texto").value = "";
        cargarComentarios(avisoId);
      })
      .catch(function (err) {
        if (err && err.errores && err.errores.length) {
          setComentarioError(err.errores.join(" "));
        } else {
          setComentarioError("No se pudo agregar el comentario.");
        }
      });
  }


  var currentPage = 1;
  var perPage = 5;
  var total = 0;
  var totalPages = 1;

  // Función para poner la primera letra en mayúscula
  function mayusInicial(s) {
    if (!s || s.length === 0) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // Función que asocia a a años y m a meses
  function textoUnidad(u) {
    return u === "a" ? "años" : "meses";
  }

  // Función que carga una sola página del backend
  function loadPage(page) {
    fetch("/avisos?page=" + page + "&per_page=" + perPage)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        // Actualizamos el estado de paginación
        currentPage = data.page;
        perPage = data.per_page;
        total = data.total;
        totalPages = Math.max(1, Math.ceil(total / perPage));

        // Dibujamos las filas de la tabla
        renderRows(data.items);

        // Actualizamos controles de paginación
        pageInfo.textContent = "Página " + currentPage + " de " + totalPages;
        btnPrev.disabled = currentPage <= 1;
        btnNext.disabled = currentPage >= totalPages;
      });
  }

  // Función que dibuja las filas de la tabla y asocia el click a cada fila
  function renderRows(items) {
    tbody.innerHTML = "";

    // Si no hay avisos para mostrar, mostramos un mensaje indicándolo
    if (!items || items.length === 0) {
      var tr = document.createElement("tr");
      var td = document.createElement("td");
      td.colSpan = 7;
      td.textContent = "No hay avisos para mostrar.";
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    // Si hay avisos, recorremos cada uno y creamos su fila
    for (var i = 0; i < items.length; i++) {
      var a = items[i];
      var tr = document.createElement("tr");
      tr.className = "adoption-row";
      tr.dataset.id = String(a.id);

      // Fecha de publicación
      var td1 = document.createElement("td");
      td1.textContent = a.fecha_ingreso;
      tr.appendChild(td1);

      // Fecha de Entrega
      var td2 = document.createElement("td");
      td2.textContent = a.fecha_entrega;
      tr.appendChild(td2);

      // Comuna
      var td3 = document.createElement("td");
      td3.textContent = a.comuna;
      tr.appendChild(td3);

      // Sector
      var td4 = document.createElement("td");
      td4.textContent = a.sector || "";
      tr.appendChild(td4);

      // Cantidad, Tipo y Edad
      var td5 = document.createElement("td");
      var tipo = mayusInicial(a.tipo);
      var unidad = textoUnidad(a.unidad);
      td5.textContent = String(a.cantidad) + " " + tipo + ", " + String(a.edad) + " " + unidad;
      tr.appendChild(td5);

      // Nombre Contacto
      var td6 = document.createElement("td");
      td6.textContent = a.nombre_contacto;
      tr.appendChild(td6);

      // Número total de Fotos
      var td7 = document.createElement("td");
      td7.textContent = String(a.total_fotos || 0);
      tr.appendChild(td7);

      // Al hacer click en la fila se abre el modal con el detalle del aviso
      tr.addEventListener("click", function (ev) {
        var id = ev.currentTarget.dataset.id;
        abrirDetalle(id);
      });

      tbody.appendChild(tr);
    }
  }

  // Trae el detalle de un aviso y abre el modal
  function abrirDetalle(id) {
    fetch("/avisos/" + id)
      .then(function (res) { return res.json(); })
      .then(function (a) {
        // Construimos el HTML con el mismo estilo de la Tarea 1
        var unidad = textoUnidad(a.unidad);
        var tipo = mayusInicial(a.tipo);

        var contactosAdicionales = "";
        if (a.contactos && a.contactos.length > 0) {
          var partes = a.contactos.map(function (c) { return mayusInicial(c.nombre) + ": " + c.identificador; });
          contactosAdicionales = "<br>" + partes.join("<br>");
        }

        var infoHtml =
        '<div class="detalle-info">' +
          '<p><strong>Información de la localidad</strong><br> Región: ' + a.region + '.<br> Comuna: ' + a.comuna + '.<br> Sector: ' + (a.sector || 'No especificado') + '.</p>' +
          '<p><strong>Información de contacto</strong><br> Nombre: ' + a.nombre + '.<br> Email: ' + a.email + '.<br> Teléfono: ' + (a.celular || 'No especificado') + '.' + contactosAdicionales + '</p>' +
          '<p><strong>Información de la mascota</strong><br> Tipo: ' + tipo + '.<br> Cantidad: ' + a.cantidad + '.<br> Edad: ' + a.edad + ' ' + unidad + '.</p>' +
          '<p><strong>Fecha de entrega</strong><br> ' + a.fecha_entrega + '.</p>' +
          '<p><strong>Descripción</strong><br> ' + (a.descripcion || '') + '</p>' +
        '</div>';

        var fotosRow = '<div class="fotos-row">';
        if (a.fotos && a.fotos.length > 0) {
          for (var i = 0; i < a.fotos.length; i++) {
            var src = "/uploads/" + a.fotos[i];
            fotosRow += '<img class="foto-detalle" src="' + src + '" alt="Foto">';
          }
        } else {
          fotosRow += '<em>Sin fotos</em>';
        }
        fotosRow += '</div>';

        // Info arriba + fotos debajo
        modalBody.innerHTML = infoHtml + fotosRow;

        // Sección de Comentarios
        var comentariosSection = document.createElement("section");
        comentariosSection.className = "comentarios-section";
        comentariosSection.innerHTML = `
          <h3>Comentarios</h3>
          <ul id="comentarios-list" class="comentarios-list"></ul>
          <form id="comentario-form" class="comentario-form" autocomplete="off">
            <div>
              <label for="comentario-nombre">Nombre</label><br/>
              <input type="text" id="comentario-nombre" name="nombre" minlength="3" maxlength="80" required />
            </div>
            <div>
              <label for="comentario-texto">Comentario</label><br/>
              <textarea id="comentario-texto" name="texto" rows="4" cols="50" minlength="5" maxlength="300" required></textarea>
            </div>
            <div>
              <button type="submit" id="comentario-agregar">Agregar comentario</button>
              <span id="comentario-error" class="comentario-error" aria-live="polite"></span>
            </div>
          </form>
        `;
        modalBody.appendChild(comentariosSection);

        // cargar lista inicial
        cargarComentarios(id);

        // submit nuevo comentario
        var comentarioForm = document.getElementById("comentario-form");
        comentarioForm.addEventListener("submit", function (e) {
          e.preventDefault();
          enviarComentario(id);
        });


        // Abrir modal de detalle
        modal.style.display = "flex";
      });
  }

  // Delegación: abrir imagen en grande al hacer click en cualquier .foto-detalle
  modalBody.addEventListener("click", function (ev) {
    var t = ev.target;
    if (t && t.matches("img.foto-detalle")) {
      showImageModal(t.src);
    }
  });

  // Cerrar modal de detalle
  modalClose.addEventListener("click", function () {
    modal.style.display = "none";
  });
  window.addEventListener("click", function (ev) {
    if (ev.target === modal) {
      modal.style.display = "none";
    }
  });

  // Paginación
  btnPrev.addEventListener("click", function () {
    if (currentPage > 1) {
      loadPage(currentPage - 1);
    }
  });
  btnNext.addEventListener("click", function () {
    if (currentPage < totalPages) {
      loadPage(currentPage + 1);
    }
  });

  // Carga inicial
  loadPage(1);
});

