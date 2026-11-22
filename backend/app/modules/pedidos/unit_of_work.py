"""Unit of Work de pedidos.

Expone los repositorios de pedidos Y de productos sobre la MISMA sesión.
Por eso crear un pedido (insertar el pedido y sus líneas) y descontar el stock
de los productos ocurren en una sola transacción: o se confirma todo, o nada.
"""
from app.core.unit_of_work import UnitOfWork
from app.modules.pedidos.repository import PedidoRepository
from app.modules.productos.repository import ProductoRepository


class PedidoUnitOfWork(UnitOfWork):
    pedidos: PedidoRepository
    productos: ProductoRepository

    def __enter__(self) -> "PedidoUnitOfWork":
        super().__enter__()
        assert self.session is not None
        self.pedidos = PedidoRepository(self.session)
        self.productos = ProductoRepository(self.session)
        return self
