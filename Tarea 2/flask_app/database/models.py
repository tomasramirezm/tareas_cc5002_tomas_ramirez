from .db import db

class Region(db.Model):
    __tablename__ = 'region'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(200), nullable=False)
    
class Comuna(db.Model):
    __tablename__ = 'comuna'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(200), nullable=False)
    region_id = db.Column(db.Integer, db.ForeignKey('region.id'), nullable=False)
    region = db.relationship('Region')
    
class AvisoAdopcion(db.Model):
    __tablename__ = "aviso_adopcion"
    id = db.Column(db.Integer, primary_key=True)
    fecha_ingreso = db.Column(db.DateTime, nullable=False)
    comuna_id = db.Column(db.Integer, db.ForeignKey("comuna.id"), nullable=False)
    comuna = db.relationship("Comuna")
    sector = db.Column(db.String(100))
    nombre = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    celular = db.Column(db.String(15))
    tipo = db.Column(db.Enum("gato","perro"), nullable=False)
    cantidad = db.Column(db.Integer, nullable=False)
    edad = db.Column(db.Integer, nullable=False)
    unidad_medida = db.Column(db.Enum("a","m"), nullable=False)
    fecha_entrega = db.Column(db.DateTime, nullable=False)
    descripcion = db.Column(db.Text)

    fotos = db.relationship("Foto", backref="aviso", cascade="all, delete-orphan")
    contactos = db.relationship("ContactarPor", backref="aviso", cascade="all, delete-orphan")

class Foto(db.Model):
    __tablename__ = "foto"
    id = db.Column(db.Integer, primary_key=True)
    ruta_archivo = db.Column(db.String(300), nullable=False)
    nombre_archivo = db.Column(db.String(300), nullable=False)
    actividad_id = db.Column(db.Integer, db.ForeignKey("aviso_adopcion.id"), nullable=False)

class ContactarPor(db.Model):
    __tablename__ = "contactar_por"
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.Enum("whatsapp","telegram","X","instagram","tiktok","otra"), nullable=False)
    identificador = db.Column(db.String(150), nullable=False)
    actividad_id = db.Column(db.Integer, db.ForeignKey("aviso_adopcion.id"), nullable=False)