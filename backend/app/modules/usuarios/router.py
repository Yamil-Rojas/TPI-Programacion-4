"""Endpoints de gestión de usuarios (solo admin).

El Router obtiene el Service con Depends, traduce las excepciones de dominio
a HTTPException y NUNCA abre el Unit of Work.
"""
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import require_role
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import (
    AutoDesactivacion,
    UsuarioNoEncontrado,
    UsuarioService,
)
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["Usuarios (admin)"])


def get_usuarios_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


@router.get("", response_model=list[UserPublic])
def listar_usuarios(
    service: UsuarioService = Depends(get_usuarios_service),
    _admin: UserPublic = Depends(require_role(["admin"])),
):
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar_usuario(
    usuario_id: int,
    service: UsuarioService = Depends(get_usuarios_service),
    _admin: UserPublic = Depends(require_role(["admin"])),
):
    try:
        return service.activar(usuario_id)
    except UsuarioNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(
    usuario_id: int,
    service: UsuarioService = Depends(get_usuarios_service),
    admin: UserPublic = Depends(require_role(["admin"])),
):
    try:
        return service.desactivar(usuario_id, admin_id=admin.id)
    except UsuarioNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(e))
    except AutoDesactivacion as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(e))
