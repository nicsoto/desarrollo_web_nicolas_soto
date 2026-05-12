import re
from pathlib import Path
from urllib.parse import urlparse

from models import Comuna


DAYS = {"lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"}
MEMBER_TYPES = {"pregrado", "postgrado", "funcionario", "academico"}
ACTIVITY_TYPES = {"arte", "deporte", "tecnología", "social", "recreación", "otra"}
MEDIA_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp4", ".mov", ".webm"}


def valid_email(email):
    return re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", email) is not None


def valid_phone(phone):
    return re.match(r"^[0-9+\s-]{8,15}$", phone) is not None


def valid_time(value):
    if re.match(r"^[0-9]{2}:[0-9]{2}$", value) is None:
        return False

    hour, minute = value.split(":")
    return 0 <= int(hour) <= 23 and 0 <= int(minute) <= 59


def valid_url(value):
    parsed = urlparse(value)
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def has_file(file):
    return file and file.filename


def valid_media_file(file):
    suffix = Path(file.filename).suffix.lower()
    family = (file.content_type or "").split("/")[0]
    return suffix in MEDIA_EXTENSIONS and family in {"image", "video"}


def activity_has_data(form, files, number):
    keys = [
        f"tipo_actividad_{number}",
        f"nombre_actividad_{number}",
        f"dia_{number}",
        f"hora_inicio_{number}",
        f"duracion_{number}",
        f"descripcion_{number}",
        f"enlace_{number}",
    ]
    has_text = any(form.get(key, "").strip() for key in keys)
    has_upload = any(has_file(file) for file in files.getlist(f"fotos_{number}"))
    return has_text or has_upload


def validate_activity(form, files, number, required):
    errors = []
    data = {}

    if not required and not activity_has_data(form, files, number):
        return errors, None

    activity_type = form.get(f"tipo_actividad_{number}", "").strip()
    name = form.get(f"nombre_actividad_{number}", "").strip()
    day = form.get(f"dia_{number}", "").strip()
    start = form.get(f"hora_inicio_{number}", "").strip()
    duration = form.get(f"duracion_{number}", "").strip()
    description = form.get(f"descripcion_{number}", "").strip()
    link = form.get(f"enlace_{number}", "").strip()
    upload_files = [file for file in files.getlist(f"fotos_{number}") if has_file(file)]

    if activity_type not in ACTIVITY_TYPES:
        errors.append(f"actividad {number}: tipo invalido.")
    if len(name) < 3 or len(name) > 45:
        errors.append(f"actividad {number}: nombre invalido.")
    if day not in DAYS:
        errors.append(f"actividad {number}: dia invalido.")
    if not valid_time(start):
        errors.append(f"actividad {number}: hora de inicio invalida.")
    if not valid_time(duration):
        errors.append(f"actividad {number}: duracion invalida.")
    if len(description) > 300:
        errors.append(f"actividad {number}: descripcion demasiado larga.")
    if not valid_url(link):
        errors.append(f"actividad {number}: enlace invalido.")
    if not upload_files:
        errors.append(f"actividad {number}: debe adjuntar al menos un archivo.")

    for file in upload_files:
        if not valid_media_file(file):
            errors.append(f"actividad {number}: archivos deben ser imagen o video.")
            break

    data.update(
        {
            "tipo": activity_type,
            "nombre": name,
            "dia": day,
            "hora_inicio": start,
            "duracion": duration,
            "descripcion": description,
            "enlace": link,
            "files": upload_files,
        }
    )
    return errors, data


def validate_registration(form, files, session):
    errors = []
    activities = []

    name = form.get("nombre", "").strip()
    member_type = form.get("tipo_miembro", "").strip()
    email = form.get("email", "").strip()
    phone = form.get("telefono", "").strip()
    unit = form.get("unidad", "").strip()
    specific = form.get("dato_especifico", "").strip()
    comment = form.get("comentario", "").strip()
    region_id = form.get("region", "").strip()
    comuna_id = form.get("comuna_id", "").strip()

    if len(name) < 4 or len(name) > 255:
        errors.append("nombre completo invalido.")
    if member_type not in MEMBER_TYPES:
        errors.append("tipo de miembro invalido.")
    if not valid_email(email) or len(email) > 80:
        errors.append("correo invalido.")
    if not valid_phone(phone) or len(phone) > 15:
        errors.append("telefono invalido.")
    if len(unit) < 3:
        errors.append("carrera, programa o unidad es obligatorio.")
    if len(specific) < 2:
        errors.append("dato segun tipo es obligatorio.")
    if len(comment) > 120:
        errors.append("comentario demasiado largo.")

    try:
        region_id_int = int(region_id)
        comuna_id_int = int(comuna_id)
    except ValueError:
        region_id_int = None
        comuna_id_int = None
        errors.append("region y comuna son obligatorias.")

    if comuna_id_int:
        comuna = session.get(Comuna, comuna_id_int)
        if not comuna or comuna.region_id != region_id_int:
            errors.append("comuna invalida para la region seleccionada.")

    for number in (1, 2):
        activity_errors, activity = validate_activity(form, files, number, number == 1)
        errors.extend(activity_errors)
        if activity:
            activities.append(activity)

    return errors, {
        "nombre": name,
        "tipo_miembro": member_type,
        "email": email,
        "telefono": phone,
        "unidad": unit,
        "dato_especifico": specific,
        "comentario": comment,
        "comuna_id": comuna_id_int,
        "activities": activities,
    }
