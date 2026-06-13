from datetime import datetime

from flask import Flask, flash, jsonify, redirect, render_template, request, url_for
from sqlalchemy import func, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import joinedload, selectinload

from database import get_session
from models import Actividad, Comentario, Comuna, Foto, Miembro, Region
from storage import save_uploads
from validators import validate_comment, validate_registration


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


def serialize_comment(comment):
    return {
        "id": comment.id,
        "fecha": comment.fecha.strftime("%d-%m-%Y %H:%M"),
        "nombre": comment.nombre,
        "texto": comment.texto,
    }


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


@app.route("/api/estadisticas")
def stats_data():
    session = get_session()
    try:
        registration_day = func.date(Miembro.fecha_registro)
        members_stmt = (
            select(registration_day.label("dia"), func.count(Miembro.id).label("total"))
            .group_by(registration_day)
            .order_by(registration_day)
        )
        members_by_day = [
            {"dia": day.isoformat() if hasattr(day, "isoformat") else str(day), "total": int(total)}
            for day, total in session.execute(members_stmt).all()
        ]

        activities_type_stmt = (
            select(Actividad.tipo, func.count(Actividad.id).label("total"))
            .group_by(Actividad.tipo)
            .order_by(Actividad.tipo)
        )
        activities_by_type = [
            {"tipo": activity_type, "total": int(total)}
            for activity_type, total in session.execute(activities_type_stmt).all()
        ]

        activities_comuna_stmt = (
            select(Comuna.nombre, func.count(Actividad.id).label("total"))
            .join(Miembro, Miembro.comuna_id == Comuna.id)
            .join(Actividad, Actividad.miembro_id == Miembro.id)
            .group_by(Comuna.id, Comuna.nombre)
            .order_by(Comuna.nombre)
        )
        activities_by_comuna = [
            {"comuna": comuna, "total": int(total)}
            for comuna, total in session.execute(activities_comuna_stmt).all()
        ]

        return jsonify(
            {
                "miembros_por_dia": members_by_day,
                "actividades_por_tipo": activities_by_type,
                "actividades_por_comuna": activities_by_comuna,
            }
        )
    except SQLAlchemyError:
        return jsonify({"error": "no se pudieron cargar las estadisticas."}), 500
    finally:
        session.close()


@app.route("/api/actividades/<int:activity_id>/comentarios", methods=["GET", "POST"])
def activity_comments(activity_id):
    session = get_session()
    try:
        if request.method == "GET":
            if session.get(Actividad, activity_id) is None:
                return jsonify({"error": "actividad no encontrada."}), 404

            stmt = (
                select(Comentario)
                .where(Comentario.actividad_id == activity_id)
                .order_by(Comentario.fecha.asc())
            )
            comments = session.scalars(stmt).all()
            return jsonify({"comentarios": [serialize_comment(comment) for comment in comments]})

        payload = request.get_json(silent=True)
        if not isinstance(payload, dict):
            payload = request.form

        errors, data = validate_comment(payload, session, activity_id)
        if errors:
            return jsonify({"errors": errors}), 400

        comment = Comentario(
            nombre=data["nombre"],
            texto=data["texto"],
            fecha=datetime.now(),
            actividad_id=activity_id,
        )
        session.add(comment)
        session.flush()
        serialized = serialize_comment(comment)
        session.commit()
        return jsonify({"comentario": serialized}), 201
    except SQLAlchemyError:
        session.rollback()
        return jsonify({"error": "no se pudo procesar el comentario."}), 500
    finally:
        session.close()


if __name__ == "__main__":
    app.run(debug=True)
