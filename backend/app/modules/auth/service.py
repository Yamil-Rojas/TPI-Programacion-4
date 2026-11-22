"""Servicio de autenticación: registro y login.

Usa el modelo Usuario a través del UsuarioUnitOfWork. El login devuelve el JWT;
poner el token en la cookie HttpOnly es trabajo del Router (es algo de HTTP).
"""
from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.service import (
    CredencialesIncorrectas,
    CuentaDesactivada,
    UsuarioDuplicado,
)
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def registrar(self, data: UserCreate) -> UserPublic:
        """Registro público: siempre crea un usuario con rol 'user'."""
        with self.uow as uow:
            if uow.usuarios.get_by_username(data.username) is not None:
                raise UsuarioDuplicado("El username ya está registrado")
            if uow.usuarios.get_by_email(data.email) is not None:
                raise UsuarioDuplicado("El email ya está registrado")

            usuario = Usuario(
                username=data.username,
                full_name=data.full_name,
                email=data.email,
                hashed_password=hash_password(data.password),
                role="user",
            )
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def login(self, username: str, password: str) -> str:
        """Devuelve el JWT. Primero se validan las credenciales y recién después
        el estado de la cuenta, así no se revela si un usuario existe."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            if usuario is None or not verify_password(password, usuario.hashed_password):
                raise CredencialesIncorrectas("Credenciales incorrectas")
            if usuario.disabled:
                raise CuentaDesactivada("Cuenta de usuario desactivada")
            return create_access_token(usuario.username)
