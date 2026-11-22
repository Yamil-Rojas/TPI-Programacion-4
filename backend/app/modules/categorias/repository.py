"""Repositorio de categorías: solo consultas, sin reglas de negocio."""
from typing import Sequence

from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Categoria)

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        """Busca entre TODAS (activas e inactivas): la baja lógica no libera el nombre."""
        statement = select(Categoria).where(Categoria.nombre == nombre)
        return self.session.exec(statement).first()

    def list_activas(self) -> Sequence[Categoria]:
        statement = (
            select(Categoria).where(Categoria.activo == True).order_by(Categoria.id)  # noqa: E712
        )
        return self.session.exec(statement).all()
