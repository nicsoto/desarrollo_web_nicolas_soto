from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


DATABASE_URL = "mysql+pymysql://cc5002:programacionweb@localhost:3306/tarea2?charset=utf8mb4"

engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(bind=engine)


def get_session():
    return SessionLocal()

