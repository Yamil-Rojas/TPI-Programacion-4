"""Modelo Producto.

Pertenece a UNA categoría. Baja lógica: activo = False.
Solo se vende si está activo, disponible y con stock suficiente.
precio_base >= 0 y stock >= 0 se validan en los schemas y el Service
(no se exigen CHECK en la base).
"""
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.categorias.models import Categoria
    from app.modules.pedidos.models import DetallePedido


class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    categoria_id: int = Field(foreign_key="categoria.id")
    nombre: str
    descripcion: Optional[str] = Field(default=None)
    precio_base: float
    imagen_url: Optional[str] = Field(default=None)
    stock: int = Field(default=0)
    disponible: bool = Field(default=True)
    activo: bool = Field(default=True)

    # Categoria 1:N Producto
    categoria: Optional["Categoria"] = Relationship(back_populates="productos")
    # Producto 1:N DetallePedido
    detalles: list["DetallePedido"] = Relationship(back_populates="producto")
