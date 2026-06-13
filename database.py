import os
from urllib.parse import quote_plus

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


def build_database_url():
    if os.environ.get("DATABASE_URL"):
        return os.environ["DATABASE_URL"]

    user = os.environ.get("DB_USER", "cc5002")
    password = os.environ.get("DB_PASSWORD", "")
    host = os.environ.get("DB_HOST", "localhost")
    port = os.environ.get("DB_PORT", "3306")
    name = os.environ.get("DB_NAME", "tarea2")

    credentials = quote_plus(user)
    if password:
        credentials = f"{credentials}:{quote_plus(password)}"

    return f"mysql+pymysql://{credentials}@{host}:{port}/{name}?charset=utf8mb4"


DATABASE_URL = build_database_url()

engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(bind=engine)


def get_session():
    return SessionLocal()
