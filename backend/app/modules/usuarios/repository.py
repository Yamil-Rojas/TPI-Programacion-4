"""Repositorio de usuarios: solo consultas, sin reglas de negocio."""
from typing import Sequence

from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.usuarios.models import Usuario


class UsuarioRepository(BaseRepository[Usuario]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Usuario)

    def get_by_username(self, username: str) -> Usuario | None:
        statement = select(Usuario).where(Usuario.username == username)
        return self.session.exec(statement).first()

    def get_by_email(self, email: str) -> Usuario | None:
        statement = select(Usuario).where(Usuario.email == email)
        return self.session.exec(statement).first()

    def list_all(self) -> Sequence[Usuario]:
        statement = select(Usuario).order_by(Usuario.id)
        return self.session.exec(statement).all()
