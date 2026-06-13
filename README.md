# CC5002 - Tarea 3

Aplicacion Flask para registrar miembros de la comunidad DCC, sus actividades, comentarios asociados y estadisticas.

## Requisitos

- Python 3
- MySQL
- Base de datos `tarea2`
- Usuario local de MySQL para la aplicacion, por defecto `cc5002`

## Instalacion

Instalar dependencias:

```bash
pip install -r requirements.txt
```

Crear usuario, iniciar MariaDB y cargar la base de datos:

```bash
bash scripts/setup-db.sh
```

El script pedira la clave de `sudo` para iniciar MariaDB y una clave para el usuario local de
MySQL que usara la aplicacion. Luego carga:

- `sql/tarea2.sql`
- `sql/region-comuna.sql`
- `sql/tabla-comentario.sql`

Ejecutar:

```bash
export DB_PASSWORD="clave_que_usaste_en_setup"
python app.py
```

La aplicacion queda disponible en `http://127.0.0.1:5000`.

Por defecto la aplicacion usa `DB_USER=cc5002`, `DB_HOST=localhost`, `DB_PORT=3306` y
`DB_NAME=tarea2`. Si necesita otra conexion, puede definir esas variables o definir
`DATABASE_URL` antes de ejecutar Flask.

## Decisiones

- Se uso Flask con templates Jinja, como en el material del curso.
- Se uso SQLAlchemy ORM para trabajar con las tablas entregadas en `tarea2.sql`.
- El formulario mantiene validaciones en JavaScript y tambien valida en Flask antes de guardar.
- Los archivos subidos se guardan en `static/uploads` y en la base de datos se guarda su ruta.
- Los campos extra de la tarea 1 se guardan dentro de la descripcion de la actividad para no cambiar el modelo entregado.
- La tabla `comentario` se crea con `sql/tabla-comentario.sql`, que corresponde al script adjunto al enunciado.
- Los comentarios se listan y agregan con llamadas asincronas `fetch` a `/api/actividades/<id>/comentarios`.
- Las estadisticas se obtienen con `fetch` desde `/api/estadisticas`.
- Los graficos se dibujan con JavaScript puro sobre `canvas`, sin bibliotecas externas.

## Solucion de problemas

Si aparece un mensaje como `no se pudo cargar la base de datos`, `no se pudo cargar el listado`,
`no se pudo completar la operacion` o `no se pudieron cargar las estadisticas`, la aplicacion no
esta pudiendo consultar MySQL. Revise que el servicio MariaDB/MySQL este activo, que exista la base
`tarea2`, que se hayan cargado los tres scripts SQL y que el usuario/clave coincidan con
`database.py` o con la variable `DATABASE_URL`. En un entorno local nuevo, ejecute:

```bash
bash scripts/setup-db.sh
export DB_PASSWORD="clave_que_usaste_en_setup"
```
