# CC5002 - Tarea 2

Aplicacion Flask para registrar miembros de la comunidad DCC y las actividades que realizan.

## Requisitos

- Python 3
- MySQL
- Base de datos `tarea2`
- Usuario `cc5002`
- Password `programacionweb`

## Instalacion

Crear y cargar la base de datos:

```bash
mysql -u cc5002 -p < sql/tarea2.sql
mysql -u cc5002 -p tarea2 < sql/region-comuna.sql
```

Instalar dependencias:

```bash
pip install -r requirements.txt
```

Ejecutar:

```bash
python app.py
```

La aplicacion queda disponible en `http://127.0.0.1:5000`.

## Decisiones

- Se uso Flask con templates Jinja, como en el material del curso.
- Se uso SQLAlchemy ORM para trabajar con las tablas entregadas en `tarea2.sql`.
- El formulario mantiene validaciones en JavaScript y tambien valida en Flask antes de guardar.
- Los archivos subidos se guardan en `static/uploads` y en la base de datos se guarda su ruta.
- Los campos extra de la tarea 1 se guardan dentro de la descripcion de la actividad para no cambiar el modelo entregado.
- Las estadisticas quedan como pagina pendiente, tal como indica el enunciado.

