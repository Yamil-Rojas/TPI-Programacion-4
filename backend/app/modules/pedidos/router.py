"""Endpoints de pedidos.

El Router valida el cuerpo con schemas, resuelve sesión y rol con Depends,
delega al Service y traduce las excepciones de dominio a HTTPException.
NUNCA abre el Unit of Work.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ReglaDeNegocio,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])

ERRORES_DE_DOMINIO = (PedidoNoEncontrado, ProductoNoEncontrado, PedidoAjeno, ReglaDeNegocio)


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


def _a_http(error: Exception) -> HTTPException:
    """Traduce una excepción de dominio a su código HTTP."""
    if isinstance(error, (PedidoNoEncontrado, ProductoNoEncontrado)):
        return HTTPException(status.HTTP_404_NOT_FOUND, detail=str(error))
    if isinstance(error, PedidoAjeno):
        return HTTPException(status.HTTP_403_FORBIDDEN, detail=str(error))
    return HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(error))  # ReglaDeNegocio


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(
    data: PedidoCreate,
    service: PedidoService = Depends(get_pedido_service),
    usuario: UserPublic = Depends(get_current_active_user),
):
    try:
        return service.crear(data, usuario_id=usuario.id)
    except ERRORES_DE_DOMINIO as e:
        raise _a_http(e)


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    estado: EstadoPedido | None = None,
    service: PedidoService = Depends(get_pedido_service),
    usuario: UserPublic = Depends(get_current_active_user),
):
    return service.listar(usuario, skip, limit, estado)


# IMPORTANTE: /resumen se declara ANTES de /{pedido_id}. Si no, FastAPI intentaría
# interpretar la palabra "resumen" como un id numérico y respondería 422.
@router.get("/resumen", response_model=ResumenPedidos)
def resumen_pedidos(
    service: PedidoService = Depends(get_pedido_service),
    _admin: UserPublic = Depends(require_role(["admin"])),
):
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(
    pedido_id: int,
    service: PedidoService = Depends(get_pedido_service),
    usuario: UserPublic = Depends(get_current_active_user),
):
    try:
        return service.obtener(pedido_id, usuario)
    except ERRORES_DE_DOMINIO as e:
        raise _a_http(e)


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def cambiar_estado_pedido(
    pedido_id: int,
    data: CambioEstado,
    service: PedidoService = Depends(get_pedido_service),
    _admin: UserPublic = Depends(require_role(["admin"])),
):
    try:
        return service.cambiar_estado(pedido_id, data.estado)
    except ERRORES_DE_DOMINIO as e:
        raise _a_http(e)


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(
    pedido_id: int,
    service: PedidoService = Depends(get_pedido_service),
    usuario: UserPublic = Depends(get_current_active_user),
):
    try:
        return service.cancelar(pedido_id, usuario)
    except ERRORES_DE_DOMINIO as e:
        raise _a_http(e)
