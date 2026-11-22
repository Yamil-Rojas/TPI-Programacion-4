"""Dependencias de seguridad para los endpoints.

- get_current_user:        lee la cookie, valida el JWT y carga al usuario (401 si falla).
- get_current_active_user: además rechaza cuentas desactivadas (400).
- require_role:            verifica que el rol esté permitido (403 si no).

Devuelven un UserPublic (schema), nunca el modelo de tabla.
"""
from fastapi import Depends, HTTPException, Request, status

from app.core.security import decode_access_token
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

ACCESS_TOKEN_COOKIE = "access_token"


def get_current_user(request: Request) -> UserPublic:
    token = request.cookies.get(ACCESS_TOKEN_COOKIE)
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="No autenticado")

    payload = decode_access_token(token)  # None si la firma es inválida o venció
    username = payload.get("sub") if payload else None
    if not username:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED, detail="Sesión inválida o vencida"
        )

    usuario = UsuarioService(UsuarioUnitOfWork()).obtener_por_username(username)
    if usuario is None:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED, detail="Sesión inválida o vencida"
        )
    return usuario


def get_current_active_user(
    usuario: UserPublic = Depends(get_current_user),
) -> UserPublic:
    if usuario.disabled:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, detail="Cuenta de usuario desactivada"
        )
    return usuario


def require_role(roles: list[str]):
    """Uso: Depends(require_role(["admin"]))"""

    def verificar_rol(
        usuario: UserPublic = Depends(get_current_active_user),
    ) -> UserPublic:
        if usuario.role not in roles:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN,
                detail="No tenés permisos para realizar esta acción",
            )
        return usuario

    return verificar_rol
