"""Conexión a la base de datos.

- engine: conexión con PostgreSQL (o SQLite en desarrollo, cambiando DATABASE_URL).
- session_factory: crea una sesión nueva; la usa el Unit of Work.
- create_all_tables: crea las tablas que estén declaradas como SQLModel (table=True).
"""
from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

# SQLite necesita este argumento extra porque FastAPI usa varios hilos.
_connect_args = (
    {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
)

engine = create_engine(settings.DATABASE_URL, connect_args=_connect_args)


def session_factory() -> Session:
    return Session(engine)


def create_all_tables() -> None:
    SQLModel.metadata.create_all(engine)
