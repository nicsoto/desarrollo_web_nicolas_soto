from datetime import datetime

from flask import Flask, flash, redirect, render_template, request, url_for
from sqlalchemy import func, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import joinedload, selectinload

from database import get_session
from models import Actividad, Comuna, Foto, Miembro, Region
from storage import save_uploads
from validators import validate_registration


app = Flask(__name__)
app.secret_key = "tarea2-dev"
app.config["UPLOAD_FOLDER"] = "static/uploads"

PAGE_SIZE = 5


def member_place():
    return joinedload(Miembro.comuna).joinedload(Comuna.region)


def make_description(data, activity):
    parts = [
        f"tipo miembro: {data['tipo_miembro']}",
        f"unidad: {data['unidad']}",
        f"dato: {data['dato_especifico']}",
        f"enlace: {activity['enlace']}",
    ]
    if data["comentario"]:
        parts.append(f"comentario: {data['comentario']}")
    if activity["descripcion"]:
        parts.append(activity["descripcion"])

    return "\n".join(parts)[:500]


@app.route("/")
def index():
    members = []
    session = get_session()
    try:
        stmt = (
            select(Miembro)
            .options(member_place())
            .order_by(Miembro.fecha_registro.desc())
            .limit(5)
        )
        members = session.scalars(stmt).all()
    except SQLAlchemyError:
        flash("no se pudo cargar la base de datos.")
    finally:
        session.close()

    return render_template("index.html", members=members)


@app.route("/registrar", methods=["GET", "POST"])
def register():
    regions = []
    errors = []
    session = get_session()
    try:
        stmt = select(Region).options(selectinload(Region.comunas)).order_by(Region.id)
        regions = session.scalars(stmt).all()

        if request.method == "POST":
            errors, data = validate_registration(request.form, request.files, session)
            if not errors:
                member = Miembro(
                    nombre=data["nombre"],
                    email=data["email"],
                    telefono=data["telefono"],
                    fecha_registro=datetime.now(),
                    comuna_id=data["comuna_id"],
                )
                session.add(member)
                session.flush()

                for activity_data in data["activities"]:
                    activity = Actividad(
                        miembro_id=member.id,
                        dia=activity_data["dia"],
                        hora_inicio=activity_data["hora_inicio"],
                        duracion=activity_data["duracion"],
                        tipo=activity_data["tipo"],
                        nombre=activity_data["nombre"],
                        descripcion=make_description(data, activity_data),
                    )
                    session.add(activity)
                    session.flush()

                    for saved_file in save_uploads(activity_data["files"], app.config["UPLOAD_FOLDER"]):
                        session.add(Foto(actividad_id=activity.id, **saved_file))

                session.commit()
                flash("miembro registrado correctamente.")
                return redirect(url_for("index"))
    except SQLAlchemyError:
        session.rollback()
        flash("no se pudo completar la operacion.")
    finally:
        session.close()

    return render_template("register.html", regions=regions, errors=errors)


@app.route("/miembros")
def members():
    page = request.args.get("page", 1, type=int)
    page = max(page, 1)
    total = 0
    members_list = []

    session = get_session()
    try:
        total = session.scalar(select(func.count()).select_from(Miembro)) or 0
        total_pages = max(1, (total + PAGE_SIZE - 1) // PAGE_SIZE)
        page = min(page, total_pages)
        stmt = (
            select(Miembro)
            .options(member_place())
            .order_by(Miembro.nombre)
            .offset((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
        )
        members_list = session.scalars(stmt).all()
    except SQLAlchemyError:
        flash("no se pudo cargar el listado.")
        total_pages = 1
    finally:
        session.close()

    return render_template(
        "members.html",
        members=members_list,
        page=page,
        total_pages=total_pages,
        has_prev=page > 1,
        has_next=page * PAGE_SIZE < total,
    )


@app.route("/miembros/<int:member_id>")
def member_detail(member_id):
    member = None
    session = get_session()
    try:
        stmt = (
            select(Miembro)
            .where(Miembro.id == member_id)
            .options(
                member_place(),
                selectinload(Miembro.actividades).selectinload(Actividad.fotos),
            )
        )
        member = session.scalars(stmt).first()
    except SQLAlchemyError:
        flash("no se pudo cargar el detalle.")
    finally:
        session.close()

    return render_template("member_detail.html", member=member)


@app.route("/estadisticas")
def stats():
    return render_template("stats.html")


if __name__ == "__main__":
    app.run(debug=True)
