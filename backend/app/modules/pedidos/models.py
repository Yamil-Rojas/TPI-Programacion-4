"""Modelos Pedido y DetallePedido.

Pedido: nunca se borra, se cancela. El total es la suma de los subtotales de
sus líneas y queda fijo desde la creación (RN-05).

DetallePedido: línea inmutable. Guarda una COPIA del nombre y del precio del
producto (nombre_producto, precio_unitario), así el pedido no cambia aunque
después se modifique el producto. subtotal = precio_unitario x cantidad.
"""
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto
    from app.modules.usuarios.models import Usuario


def _now() -> datetime:
    # Hora local sin zona horaria: se guarda igual en SQLite y PostgreSQL.
    return datetime.now()


class Pedido(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    estado: str = Field(default="PENDIENTE")
    forma_pago: str  # "EFECTIVO" | "TRANSFERENCIA"
    direccion_entrega: str  # 5 a 200 caracteres (se valida en el schema)
    notas: Optional[str] = Field(default=None)
    total: float = Field(default=0.0)
    created_at: datetime = Field(default_factory=_now)
    updated_at: datetime = Field(
        default_factory=_now, sa_column_kwargs={"onupdate": _now}
    )

    # Usuario 1:N Pedido
    usuario: Optional["Usuario"] = Relationship(back_populates="pedidos")
    # Pedido 1:N DetallePedido
    items: list["DetallePedido"] = Relationship(back_populates="pedido")


class DetallePedido(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int  # >= 1 (se valida en el schema)
    nombre_producto: str  # copia del nombre al momento de comprar
    precio_unitario: float  # copia del precio al momento de comprar
    subtotal: float

    # Pedido 1:N DetallePedido
    pedido: Optional["Pedido"] = Relationship(back_populates="items")
    # Producto 1:N DetallePedido
    producto: Optional["Producto"] = Relationship(back_populates="detalles")
