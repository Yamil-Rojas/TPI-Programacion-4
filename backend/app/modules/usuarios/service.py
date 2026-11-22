"""Servicio de usuarios: reglas de negocio de la gestión de usuarios.

El Service abre el Unit of Work con "with self.uow as uow:" y devuelve el
schema de salida DENTRO del bloque. Nunca llama a session.commit().
Las excepciones de dominio las traduce el Router a códigos HTTP.
"""
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


# --- Excepciones de dominio (el Router las convierte en HTTPException) ---
class UsuarioNoEncontrado(Exception):
    """-> 404"""


class UsuarioDuplicado(Exception):
    """-> 409"""


class CredencialesIncorrectas(Exception):
    """-> 401"""


class CuentaDesactivada(Exception):
    """-> 400"""


class AutoDesactivacion(Exception):
    """-> 400: el admin no puede desactivarse a sí mismo."""


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.list_all()]

    def obtener_por_username(self, username: str) -> UserPublic | None:
        """Lo usa get_current_user para cargar al usuario de la sesión."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            if usuario is None:
                return None
            return UserPublic.model_validate(usuario)

    def activar(self, usuario_id: int) -> UserPublic:
        return self._cambiar_disabled(usuario_id, disabled=False)

    def desactivar(self, usuario_id: int, admin_id: int) -> UserPublic:
        if usuario_id == admin_id:
            raise AutoDesactivacion("Un administrador no puede desactivarse a sí mismo")
        return self._cambiar_disabled(usuario_id, disabled=True)

    def _cambiar_disabled(self, usuario_id: int, disabled: bool) -> UserPublic:
        # Idempotente: si ya estaba en ese estado, igual responde bien.
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise UsuarioNoEncontrado("Usuario no encontrado")
            usuario.disabled = disabled
            return UserPublic.model_validate(usuario)
