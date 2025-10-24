// Esperamos a que el DOM esté listo para asegurarnos de que existan los elementos.
document.addEventListener("DOMContentLoaded", function () {
  var btnAgregar = document.getElementById("btn-agregar");
  var btnVer = document.getElementById("btn-ver");
  var btnEstadisticas = document.getElementById("btn-estadisticas");

  // Si el botón existe, le asignamos su evento de click.
  if (btnAgregar) {
    btnAgregar.addEventListener("click", function () {
      // Vamos a la página para agregar un aviso
      window.location.href = "/agregar";
    });
  }

  if (btnVer) {
    btnVer.addEventListener("click", function () {
      // Vamos al listado completo
      window.location.href = "/listado";
    });
  }

  if (btnEstadisticas) {
    btnEstadisticas.addEventListener("click", function () {
      // Vamos a las estadísticas
      window.location.href = "/estadisticas";
    });
  }

  // Función para poner la primera letra en mayúscula
  function mayusInicial(s) {
    if (!s || s.length === 0) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // Función que asocia a a años y m a meses
  function textoUnidad(u) {
    return u === "a" ? "año" : "mes";
  }

  // Buscamos el <tbody> de la tabla donde van a quedar los avisos.
  var tbody = document.querySelector("#tabla-adopciones tbody");

  // Pedimos al backend los avisos (solo los primeros 5 más recientes).
  fetch("/avisos?page=1&per_page=5")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {

      // Usamos data.items si existe, si no usamos data tal cual
      var avisos = data.items ? data.items : data;

      // Limpiamos el cuerpo de la tabla antes de rellenar.
      tbody.innerHTML = "";

      // Si no vino nada, mostramos un mensaje diciendo que no hay avisos aún.
      if (!avisos || avisos.length === 0) {
        var filaVacia = document.createElement("tr");
        var celdaVacia = document.createElement("td");
        celdaVacia.colSpan = 5;
        celdaVacia.textContent = "Aún no hay avisos publicados.";
        filaVacia.appendChild(celdaVacia);
        tbody.appendChild(filaVacia);
        return;
      }

      // Ordenamos los avisos de más nuevo a más antiguo.
      avisos.sort(function (a, b) {
        var fechaA = new Date(a.fecha_ingreso.replace(" ", "T"));
        var fechaB = new Date(b.fecha_ingreso.replace(" ", "T"));
        return fechaB - fechaA;
      });

      // Tomamos solo los primeros 5 (los más recientes).
      var top5 = avisos.slice(0, 5);

      // Recorremos esos 5 avisos y vamos creando fila por fila.
      for (var i = 0; i < top5.length; i++) {
        var aviso = top5[i];

        // Creamos la fila <tr>
        var fila = document.createElement("tr");

        // Fecha de publicación
        var tdFecha = document.createElement("td");
        tdFecha.textContent = aviso.fecha_ingreso;
        fila.appendChild(tdFecha);

        // Comuna
        var tdComuna = document.createElement("td");
        tdComuna.textContent = aviso.comuna;
        fila.appendChild(tdComuna);

        // Sector (si no viene, ponemos texto vacío)
        var tdSector = document.createElement("td");
        if (aviso.sector) {
          tdSector.textContent = aviso.sector;
        } else {
          tdSector.textContent = "";
        }
        fila.appendChild(tdSector);

        // Cantidad, Tipo y Edad
        var tdDetalle = document.createElement("td");

        // Ponemos la primera letra del tipo en mayúscula y pluralizamos si corresponde
        var tipo = mayusInicial(aviso.tipo);
        if (aviso.cantidad && aviso.cantidad > 1) {
          tipo +="s";
        } 

        // Ponemos la unidad de edad completa y pluralizamos si corresponde
        var unidad = textoUnidad(aviso.unidad);
        if (aviso.edad && aviso.edad > 1) {
          if (unidad === "año") {
            unidad = "años";
          }
          else {
            unidad = "meses";
          }
        }

        // Armamos el texto final final a mostrar "X Gatos/Perros, Y años/meses"
        tdDetalle.textContent = String(aviso.cantidad) + " " + tipo + ", " + String(aviso.edad) + " " + unidad;
        fila.appendChild(tdDetalle);

        // Fotos
        var tdFoto = document.createElement("td");
        var img = document.createElement("img");

        img.src = "/uploads/" + aviso.foto;

        img.alt = "Mascota";
        img.width = 200;

        tdFoto.appendChild(img);
        fila.appendChild(tdFoto);

        // Finalmente, agregamos la fila a la tabla.
        tbody.appendChild(fila);
      }
    });

});
