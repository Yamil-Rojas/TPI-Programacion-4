"""Servicio de pedidos: las reglas de negocio más importantes del sistema.

RN-01 Crear pedido (transaccional: se crea completo o no se crea).
RN-02 Máquina de estados (diccionario TRANSICIONES).
RN-03 Cancelar restituye el stock en la misma transacción.
RN-04 Permisos: el cliente solo ve y cancela lo suyo; el admin ve todo.
RN-05 Inmutabilidad: no hay edición ni borrado de pedidos ni de sus líneas.
RN-06 forma_pago y direccion_entrega se validan en el schema (PedidoCreate).

El Service abre "with self.uow as uow:" y devuelve el schema DENTRO del bloque.
Nunca llama a session.commit(): si algo falla, el __exit__ del Unit of Work
hace rollback y no se persiste nada (tampoco el descuento de stock).
"""
from datetime import datetime

from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.schemas import UserPublic

# RN-02: estado actual -> estados a los que puede pasar. Los terminales no admiten cambios.
TRANSICIONES: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


# --- Excepciones de dominio ---
class PedidoNoEncontrado(Exception):
    """-> 404"""


class PedidoAjeno(Exception):
    """-> 403: el pedido es de otro usuario."""


class ReglaDeNegocio(Exception):
    """Base de las reglas de negocio incumplidas -> 400"""


class StockInsuficiente(ReglaDeNegocio):
    pass


class ProductoNoDisponible(ReglaDeNegocio):
    pass


class ProductoRepetido(ReglaDeNegocio):
    pass


class TransicionInvalida(ReglaDeNegocio):
    pass


class CancelacionNoPermitida(ReglaDeNegocio):
    pass


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    # ------------------------------------------------------------------ RN-01
    def crear(self, data: PedidoCreate, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            # Ningún producto repetido entre los ítems.
            ids = [item.producto_id for item in data.items]
            if len(ids) != len(set(ids)):
                raise ProductoRepetido("Hay productos repetidos en el pedido")

            # El pedido nace en PENDIENTE con total = 0; el total se calcula abajo.
            pedido = Pedido(
                usuario_id=usuario_id,
                estado="PENDIENTE",
                forma_pago=data.forma_pago,
                direccion_entrega=data.direccion_entrega,
                notas=data.notas,
                total=0.0,
            )
            uow.pedidos.add(pedido)

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(
                        f"Producto {item.producto_id} no encontrado"
                    )
                if not producto.disponible:
                    raise ProductoNoDisponible(
                        f"El producto '{producto.nombre}' no está disponible"
                    )
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para '{producto.nombre}': "
                        f"hay {producto.stock} y se pidieron {item.cantidad}"
                    )

                # En la misma iteración: se descuenta el stock y se crea la línea
                # copiando nombre y precio del producto (RN-05).
                producto.stock -= item.cantidad
                subtotal = round(producto.precio_base * item.cantidad, 2)
                pedido.items.append(
                    DetallePedido(
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            return PedidoRead.model_validate(pedido)

    # ----------------------------------------------------------------- lecturas
    def listar(
        self, usuario: UserPublic, skip: int, limit: int, estado: str | None
    ) -> PedidosPaginados:
        """RN-04: el cliente ve solo los suyos; el admin ve todos."""
        with self.uow as uow:
            if usuario.role == "admin":
                items, total = uow.pedidos.list_todos(skip, limit, estado)
            else:
                items, total = uow.pedidos.list_by_usuario(
                    usuario.id, skip, limit, estado
                )
            return PedidosPaginados(
                total=total, items=[PedidoRead.model_validate(p) for p in items]
            )

    def obtener(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._get(uow, pedido_id)
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            return PedidoRead.model_validate(pedido)

    # ------------------------------------------------------------ RN-02 y RN-03
    def cambiar_estado(self, pedido_id: int, nuevo_estado: str) -> PedidoRead:
        """Solo admin. Avanza o cancela según la máquina de estados."""
        with self.uow as uow:
            pedido = self._get(uow, pedido_id)
            self._aplicar_transicion(uow, pedido, nuevo_estado)
            return PedidoRead.model_validate(pedido)

    def cancelar(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        """Solo el dueño, y solo desde PENDIENTE (RN-04)."""
        with self.uow as uow:
            pedido = self._get(uow, pedido_id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            if pedido.estado != "PENDIENTE":
                raise CancelacionNoPermitida(
                    "Solo se puede cancelar un pedido en estado PENDIENTE"
                )
            self._aplicar_transicion(uow, pedido, "CANCELADO")
            return PedidoRead.model_validate(pedido)

    # ------------------------------------------------------------------ resumen
    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            inicio_de_hoy = datetime.now().replace(
                hour=0, minute=0, second=0, microsecond=0
            )
            return ResumenPedidos(
                pendientes=uow.pedidos.count_by_estado("PENDIENTE"),
                en_preparacion=uow.pedidos.count_by_estado("EN_PREPARACION"),
                entregados=uow.pedidos.count_by_estado("ENTREGADO"),
                cancelados=uow.pedidos.count_by_estado("CANCELADO"),
                pedidos_hoy=uow.pedidos.count_desde(inicio_de_hoy),
                ingresos_entregados=uow.pedidos.sum_total_by_estado("ENTREGADO"),
            )

    # --------------------------------------------------------------- auxiliares
    @staticmethod
    def _get(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado("Pedido no encontrado")
        return pedido

    @staticmethod
    def _aplicar_transicion(
        uow: PedidoUnitOfWork, pedido: Pedido, nuevo_estado: str
    ) -> None:
        # RN-02: toda transición se valida ANTES de modificar el pedido.
        if nuevo_estado not in TRANSICIONES[pedido.estado]:
            raise TransicionInvalida(
                f"No se puede pasar de {pedido.estado} a {nuevo_estado}"
            )

        # RN-03: al cancelar se restituye el stock de cada línea, en la misma
        # transacción que cambia el estado.
        if nuevo_estado == "CANCELADO":
            for linea in pedido.items:
                producto = uow.productos.get_by_id(linea.producto_id)
                if producto is not None:
                    producto.stock += linea.cantidad

        pedido.estado = nuevo_estado
        pedido.updated_at = datetime.now()
