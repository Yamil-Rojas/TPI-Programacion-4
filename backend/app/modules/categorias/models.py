"""Modelo Categoria.

El nombre es único (2 a 100 caracteres: se valida en los schemas y el Service).
Baja lógica: activo = False. La baja NO libera el nombre ni oculta sus productos.
"""
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto


class Categoria(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(unique=True, index=True)
    descripcion: Optional[str] = Field(default=None)
    activo: bool = Field(default=True)

    # Categoria 1:N Producto
    productos: list["Producto"] = Relationship(back_populates="categoria")
