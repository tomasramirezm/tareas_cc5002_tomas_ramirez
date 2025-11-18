# Importamos librerías y módulos necesarios
import os, uuid, pathlib, datetime
import re
from flask import Flask, request, render_template, redirect, url_for, jsonify, send_from_directory
from .database.db import db
from .database.models import Region, Comuna, AvisoAdopcion, Foto, ContactarPor, Comentario
from datetime import date, datetime
from sqlalchemy import func

# Creamos la app y configuramosos parámetros básicos
app = Flask(__name__, static_folder="static", template_folder="templates")
app.secret_key = os.getenv("SECRET_KEY", "dev-secret")
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16MB

# Definimos carpeta de uploads (dentro de static/)
UPLOAD_FOLDER_ABS = os.path.join(app.root_path, "static", "uploads")
os.makedirs(UPLOAD_FOLDER_ABS, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER_ABS

# Configuración de base de datos (MySQL)
DB_HOST = "localhost"
DB_PORT = "3306"
DB_NAME = "tarea2"
DB_USER = "cc5002"
DB_PASSWORD = "programacionweb"

app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

with app.app_context():
    db.create_all()

# Extensiones permitidas y funciones auxiliares
ALLOWED_EXT = {"png","jpg","jpeg"}

def ext_ok(filename: str) -> bool:
    ext = pathlib.Path(filename).suffix.lower().lstrip(".")
    return ext in ALLOWED_EXT

def save_upload(f) -> str:
    ext = pathlib.Path(f.filename).suffix.lower()
    name = f"{uuid.uuid4().hex}{ext}"
    f.save(os.path.join(app.config["UPLOAD_FOLDER"], name))
    return name

# Definimos rutas y vistas
@app.get("/")
def index():
    return render_template("index.html")

@app.get("/agregar")
def agregar_aviso():
    return render_template("agregar_aviso.html")

@app.get("/listado")
def listado_page():
    return render_template("listado.html")

@app.get("/estadisticas")
def estadisticas_page():
    return render_template("estadisticas.html")

# Función para procesar formulario de creación de aviso
@app.post("/avisos")
def crear_aviso():
    form = request.form
    files = request.files.getlist("foto")
    
    # Definimos un mensaje de error para mostrar
    errors = []
    def add_error(msg):
        errors.append(msg)

    # Validamos la comuna y región
    region_nombre = (form.get("select-region") or "").strip()
    comuna_nombre = (form.get("select-comuna") or "").strip()

    comuna = (
        Comuna.query.join(Region)
        .filter(Comuna.nombre == comuna_nombre, Region.nombre == region_nombre)
        .first()
    )
    if not comuna:
        add_error("Comuna no válida para la región indicada")
        
    # Validamos el nombre
    nombre = (form.get("nombre") or "").strip()
    if not (3 <= len(nombre) <= 200):
        add_error("El nombre debe tener entre 3 y 200 caracteres")
        
    # Validamos el email
    email = (form.get("email") or "").strip()
    if len(email) > 100:
        add_error("El email no debe superar 100 caracteres")
    email_re = re.compile(r'^[\w\.-]+@[A-Za-z0-9\.-]+\.[A-Za-z]{2,3}$')
    if not email_re.match(email):
        add_error("Formato de email inválido")

    # Validamos el celular
    celular = (form.get("telefono") or "").strip()
    # opcional; si viene, validar +NNN.NNNNNNNN
    if celular:
        if not re.match(r'^\+\d{3}\.\d{8}$', celular):
            add_error("El teléfono debe tener formato +NNN.NNNNNNNN")

    # Validamos el sector
    sector = (form.get("sector") or "").strip()
    if sector and len(sector) > 100:
        add_error("El sector no debe superar 100 caracteres")

    # Validamos el tipo de mascota
    tipo_txt = (form.get("select-tipo-mascota") or "").strip().lower()
    if tipo_txt not in {"gato", "perro"}:
        add_error("Tipo de mascota debe ser 'Gato' o 'Perro'")
        
    # Validamos la cantidad y la edad
    def parse_int(name):
        raw = form.get(name)
        try:
            val = int(raw)
            if val < 1:
                raise ValueError()
            return val
        except Exception:
            add_error(f"'{name}' debe ser un entero mayor o igual a 1")
            return None

    cantidad = parse_int("cantidad")
    edad = parse_int("edad")

    # Validamos la unidad de medida de la edad
    unidad_txt = (form.get("select-unidad-edad") or "").strip().lower()
    unidad = "a" if unidad_txt.startswith("a") else ("m" if unidad_txt.startswith("m") else None)
    if not unidad:
        add_error("Unidad de edad debe ser 'Años' o 'Meses'")

    # Validamos la fecha de entrega (formato ISO de <input type="datetime-local">)
    fecha_entrega = (form.get("fecha-entrega") or "").strip()

    if not fecha_entrega:
        add_error("La fecha de entrega es obligatoria")
    else:
        try:
            dt_entrega = datetime.fromisoformat(fecha_entrega)   # ej: "2025-10-24T15:30"
        except ValueError:
            add_error("Formato de fecha-entrega inválido")
        else:
            # Comparamos solo la fecha para permitir "hoy" a cualquier hora
            if dt_entrega.date() < date.today():
                add_error("La fecha de entrega debe ser hoy o futura")

    # Validamos los medios de contacto
    medios_cfg = {
        "whatsapp": 50,
        "telegram": 50,
        "X":        50,  # ojo mayúscula coincide con tu Enum
        "instagram":50,
        "tiktok":   100,
        "otra":     100,
    }
    medios_recibidos = {
        "whatsapp":  form.get("whatsapp", "").strip(),
        "telegram":  form.get("telegram", "").strip(),
        "X":         form.get("x", "").strip(),     # del form 'x' -> Enum 'X'
        "instagram": form.get("instagram", "").strip(),
        "tiktok":    form.get("tiktok", "").strip(),
        "otra":      form.get("otro", "").strip(),
    }

    no_vacios = [(k, v) for k, v in medios_recibidos.items() if v]
    if len(no_vacios) > 5:
        add_error("Puedes ingresar como máximo 5 medios de contacto")

    for nombre_medio, ident in no_vacios:
        if len(ident) < 4:
            add_error(f"'{nombre_medio}': el identificador debe tener al menos 4 caracteres")
        maxlen = medios_cfg[nombre_medio]
        if len(ident) > maxlen:
            add_error(f"'{nombre_medio}': el identificador no puede exceder {maxlen} caracteres")

    # Validamos los archivos subidos
    uploaded = [f for f in files if f and f.filename]
    if len(uploaded) == 0:
        add_error("Debes adjuntar al menos 1 archivo (imagen)")
    if len(uploaded) > 5:
        add_error("No puedes adjuntar más de 5 archivos")

    ALLOWED_EXT = {"png","jpg","jpeg"}
    for f in uploaded:
        ext = pathlib.Path(f.filename).suffix.lower().lstrip(".")
        if ext not in ALLOWED_EXT:
            add_error(f"Extensión no permitida: {f.filename}")

    # Si hubo errores, cortar aquí
    if errors:
        return jsonify({"errors": errors}), 400

    # Si no hay errores, insertamos en la base de datos
    a = AvisoAdopcion(
        fecha_ingreso = datetime.now(),
        comuna_id = comuna.id,
        sector = sector or None,
        nombre = nombre,
        email = email,
        celular = celular or None,
        tipo = tipo_txt,
        cantidad = cantidad,
        edad = edad,
        unidad_medida = unidad,
        fecha_entrega = fecha_entrega,
        descripcion = (form.get("descripcion") or None)
    )
    db.session.add(a)
    db.session.flush()

    # Medios de contacto (solo los no vacíos, hasta 5)
    for nombre_medio, ident in no_vacios[:5]:
        db.session.add(ContactarPor(nombre=nombre_medio, identificador=ident, actividad_id=a.id))

    # Guardar archivos
    for f in uploaded[:5]:
        saved = save_upload(f)
        db.session.add(Foto(ruta_archivo="uploads", nombre_archivo=saved, actividad_id=a.id))

    db.session.commit()

    # Redirigimos a inicio
    return redirect(url_for("index"), code=303)

# Función para listar avisos (paginado)
@app.get("/avisos")
def listar():
    # Definimos parámetros de paginación
    page = request.args.get("page", default=1, type=int)
    per_page = request.args.get("per_page", default=5, type=int)

    # Obtenemos los avisos desde la base de datos
    base_q = db.session.query(AvisoAdopcion).join(Comuna).join(Region)
    total = base_q.count()

    avisos = (
        base_q.order_by(AvisoAdopcion.fecha_ingreso.desc())
              .limit(per_page)
              .offset((page - 1) * per_page)
              .all()
    )

    # Obtenermos los datos a mostrar
    items = []
    for a in avisos:
        items.append({
            "id": a.id,
            "fecha_ingreso": a.fecha_ingreso.isoformat(sep=" "),
            "fecha_entrega": a.fecha_entrega.isoformat(sep=" "),
            "region": a.comuna.region.nombre,
            "comuna": a.comuna.nombre,
            "sector": a.sector or "",
            "cantidad": a.cantidad,
            "tipo": a.tipo,
            "edad": a.edad,
            "unidad": a.unidad_medida,
            "nombre_contacto": a.nombre,
            "total_fotos": len(a.fotos),
            "foto": (a.fotos[0].nombre_archivo if a.fotos else None),
        })

    # Mostramos los primeros 5 avisos en formato JSON
    return jsonify({
        "page": page,
        "per_page": per_page,
        "total": total,
        "items": items,
    })

# Función para obtener detalles de un aviso específico (cuando hacemos click)
@app.get("/avisos/<int:aviso_id>")
def detalle_aviso(aviso_id):
    # Obtenemos el aviso desde la base de datos
    a = (
        db.session.query(AvisoAdopcion)
        .join(Comuna).join(Region)
        .filter(AvisoAdopcion.id == aviso_id)
        .first()
    )
    if not a:
        return {"error": "Aviso no encontrado"}, 404

    # Obtenemos los medios de contacto y las fotos
    contactos = [{"nombre": c.nombre, "identificador": c.identificador} for c in a.contactos]
    fotos = [f.nombre_archivo for f in a.fotos]

    # Retornamos los datos en formato JSON
    return jsonify({
        "id": a.id,
        "fecha_ingreso": a.fecha_ingreso.isoformat(sep=" "),
        "fecha_entrega": a.fecha_entrega.isoformat(sep=" "),
        "region": a.comuna.region.nombre,
        "comuna": a.comuna.nombre,
        "sector": a.sector or "",
        "nombre": a.nombre,
        "email": a.email,
        "celular": a.celular or "",
        "tipo": a.tipo,
        "cantidad": a.cantidad,
        "edad": a.edad,
        "unidad": a.unidad_medida,
        "descripcion": a.descripcion or "",
        "contactos": contactos,
        "fotos": fotos,
    })
    
@app.route('/estadisticas/linea')
def estadisticas_linea():
    # Consulta para obtener la cantidad de avisos por fecha de ingreso:
    resultados = db.session.query(
        func.date(AvisoAdopcion.fecha_ingreso).label('fecha'), # Tomamos la fecha (solo día) de fecha_ingreso
        func.count(AvisoAdopcion.id).label('cantidad') # Contamos cuántos avisos hay por cada fecha
    ).group_by(func.date(AvisoAdopcion.fecha_ingreso)).all() # Agrupamos por fecha
    
    # Preparamos los datos para el JSON
    data = []
    for fila in resultados:
        fecha = fila[0] # Obtenemos la fecha de ingreso
        cantidad = int(fila[1]) # Obtenemos la cantidad de avisos en esa fecha
        fecha_str = fecha.strftime('%Y-%m-%d') # Convertimos la fecha a string formato 'YYYY-MM-DD'
        data.append({
            'fecha': fecha_str, 
            'cantidad': cantidad
        })
        
    # Devolvemos el JSON
    return jsonify(data)

@app.route('/estadisticas/torta')
def estadisticas_torta():
    # Consulta para obtener la cantidad de avisos por tipo de mascota
    resultados = db.session.query(
        AvisoAdopcion.tipo, # Tipo de mascota (gato o perro)
        func.count(AvisoAdopcion.id).label('cantidad') # Contamos cuántos avisos hay por tipo
    ).group_by(AvisoAdopcion.tipo).all() # Agrupamos por tipo de mascota
    
    # Preparamos los datos para el JSON
    data = []
    for fila in resultados:
        tipo = fila[0] # Tipo de mascota
        cantidad = int(fila[1]) # Cantidad de avisos para ese tipo
        data.append({
            'tipo': tipo,
            'cantidad': cantidad
        })
    return jsonify(data)

@app.route('/estadisticas/barras')
# 
def estadisticas_barras():
    # Consulta para obtener la cantidad de avisos por mes y tipo de mascota
    resultados = db.session.query(
        func.extract('year', AvisoAdopcion.fecha_ingreso).label('anio'), # Año de ingreso
        func.extract('month', AvisoAdopcion.fecha_ingreso).label('mes'), # Mes de ingreso
        AvisoAdopcion.tipo, # Tipo de mascota
        func.count(AvisoAdopcion.id).label('cantidad') # Cantidad de avisos
    ).group_by('anio', 'mes', AvisoAdopcion.tipo).all() # Agrupamos por año, mes y tipo de mascota
    
    # Organizamos los resultados para enviar al frontend
    barras = {'gato': {}, 'perro': {}}
    
    # Llenamos el diccionario con los datos obtenidos
    for r in resultados:
        barras[r[2]][f"{int(r[0])}-{int(r[1]):02}"] = r[3]
        
    # Devolvemos el JSON
    return jsonify(barras)

# Función para obtener comentarios de un aviso específico
@app.route("/avisos/<int:aviso_id>/comentarios", methods=["GET"])
def listar_comentarios(aviso_id):
    # Obtenemos el aviso desde la base de datos
    aviso = AvisoAdopcion.query.get_or_404(aviso_id)
    
    # Preparamos la lista de comentarios
    data = []
    
    # Recorremos los comentarios asociados al aviso
    for c in aviso.comentarios:  # Ya hicimos que viniera ordenado de forma descendente
        data.append({
            "id": c.id, # ID del comentario
            "fecha": c.fecha.strftime("%Y-%m-%d %H:%M"), # Formateamos la fecha
            "nombre": c.nombre, # Nombre del autor del comentario
            "texto": c.texto # Texto del comentario
        })
    return jsonify(data), 200

# Función para agregar un comentario a un aviso específico
@app.route("/avisos/<int:aviso_id>/comentarios", methods=["POST"])
# Definimos la función para crear un comentario
def crear_comentario(aviso_id):
    # Verificamos que el aviso exista
    AvisoAdopcion.query.get_or_404(aviso_id)

    # Obtenemos los datos del comentario desde JSON o form-data
    if request.is_json: # JSON
        payload = request.get_json(silent=True) or {} # Evitamos error si JSON inválido
        nombre = (payload.get("nombre") or "").strip() # Nombre del autor
        texto  = (payload.get("texto") or "").strip() # Texto del comentario
    else: # form-data
        nombre = (request.form.get("nombre") or "").strip() # Nombre del autor
        texto  = (request.form.get("texto") or "").strip() # Texto del comentario

    # Validamos los datos recibidos
    errores = []
    if not (3 <= len(nombre) <= 80):
        errores.append("El nombre debe tener entre 3 y 80 caracteres.")
    if len(texto) < 5:
        errores.append("El comentario debe tener al menos 5 caracteres.")
    if len(texto) > 300:
        errores.append("El comentario no puede superar 300 caracteres.")

    # Si hay un error de validación, respondemos con error 400
    if errores:
        return jsonify({"ok": False, "errores": errores}), 400

    # Si todo está bien, creamos el comentario en la base de datos
    c = Comentario(
        nombre=nombre,
        texto=texto,
        fecha=datetime.utcnow(),
        aviso_id=aviso_id
    )
    
    # Insertamos el comentario en la base de datos
    db.session.add(c)
    db.session.commit()

    # Respondemos con el comentario creado
    return jsonify({
        "ok": True,
        "comentario": {
            "id": c.id,
            "fecha": c.fecha.strftime("%Y-%m-%d %H:%M"),
            "nombre": c.nombre,
            "texto": c.texto
        }
    }), 201

# Servimos archivos estáticos de uploads
@app.get("/uploads/<path:name>")
def serve_upload(name):
    return send_from_directory(app.config["UPLOAD_FOLDER"], name)

if __name__ == "__main__":
    app.run(debug=True)

