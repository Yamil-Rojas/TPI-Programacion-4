"""Repositorio de pedidos: solo consultas, sin reglas de negocio."""
from datetime import datetime
from typing import Sequence

from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def list_by_usuario(
        self, usuario_id: int, skip: int, limit: int, estado: str | None = None
    ) -> tuple[Sequence[Pedido], int]:
        """Pedidos de UN usuario (lo que ve un cliente). Devuelve (items, total)."""
        return self._listar([Pedido.usuario_id == usuario_id], skip, limit, estado)

    def list_todos(
        self, skip: int, limit: int, estado: str | None = None
    ) -> tuple[Sequence[Pedido], int]:
        """Todos los pedidos (lo que ve el admin). Devuelve (items, total)."""
        return self._listar([], skip, limit, estado)

    def count_by_estado(self, estado: str) -> int:
        statement = select(func.count()).select_from(Pedido).where(Pedido.estado == estado)
        return self.session.exec(statement).one()

    def count_desde(self, desde: datetime) -> int:
        statement = (
            select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)
        )
        return self.session.exec(statement).one()

    def sum_total_by_estado(self, estado: str) -> float:
        statement = select(func.coalesce(func.sum(Pedido.total), 0.0)).where(
            Pedido.estado == estado
        )
        return float(self.session.exec(statement).one())

    # --- auxiliar ---
    def _listar(
        self, filtros: list, skip: int, limit: int, estado: str | None
    ) -> tuple[Sequence[Pedido], int]:
        filtros = list(filtros)
        if estado is not None:
            filtros.append(Pedido.estado == estado)

        total = self.session.exec(
            select(func.count()).select_from(Pedido).where(*filtros)
        ).one()
        items = self.session.exec(
            select(Pedido)
            .where(*filtros)
            .options(selectinload(Pedido.items))  # trae las líneas de una vez
            .order_by(col(Pedido.id).desc())  # los más nuevos primero
            .offset(skip)
            .limit(limit)
        ).all()
        return items, total
