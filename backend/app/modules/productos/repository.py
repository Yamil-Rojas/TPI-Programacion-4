"""Repositorio de productos: solo consultas, sin reglas de negocio."""
from typing import Sequence

from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def search(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> tuple[Sequence[Producto], int]:
        """Productos ACTIVOS filtrados y paginados. Devuelve (items, total)."""
        filtros = [col(Producto.activo).is_(True)]
        if search:
            # ilike: no distingue mayúsculas de minúsculas
            filtros.append(col(Producto.nombre).ilike(f"%{search}%"))
        if categoria_id is not None:
            filtros.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            filtros.append(Producto.disponible == disponible)

        total = self.session.exec(
            select(func.count()).select_from(Producto).where(*filtros)
        ).one()
        items = self.session.exec(
            select(Producto)
            .where(*filtros)
            .options(selectinload(Producto.categoria))  # evita una consulta por producto
            .order_by(Producto.id)
            .offset(skip)
            .limit(limit)
        ).all()
        return items, total
