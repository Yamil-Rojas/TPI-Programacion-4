"""Endpoints de autenticación: registro, login, logout y perfil.

El JWT viaja en una cookie HttpOnly: el JavaScript del navegador no puede
leerla y el cuerpo de la respuesta NO incluye el token.
"""
from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import ACCESS_TOKEN_COOKIE, get_current_active_user
from app.modules.auth.schemas import MessageResponse
from app.modules.auth.service import AuthService
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.service import (
    CredencialesIncorrectas,
    CuentaDesactivada,
    UsuarioDuplicado,
)
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/auth", tags=["Auth"])


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, service: AuthService = Depends(get_auth_service)):
    try:
        return service.registrar(data)
    except UsuarioDuplicado as e:
        raise HTTPException(status.HTTP_409_CONFLICT, detail=str(e))


@router.post("/token", response_model=MessageResponse)
def login(
    response: Response,
    form: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(get_auth_service),
):
    try:
        token = service.login(form.username, form.password)
    except CredencialesIncorrectas as e:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except CuentaDesactivada as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(e))

    response.set_cookie(
        key=ACCESS_TOKEN_COOKIE,
        value=token,
        httponly=True,  # JavaScript no puede leerla
        samesite="lax",
        secure=False,  # en producción con HTTPS: True
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    return {"message": "Login exitoso"}


@router.post("/logout", response_model=MessageResponse)
def logout(response: Response):
    response.delete_cookie(
        key=ACCESS_TOKEN_COOKIE, path="/", httponly=True, samesite="lax"
    )
    return {"message": "Logout exitoso"}


@router.get("/me", response_model=UserPublic)
def me(usuario: UserPublic = Depends(get_current_active_user)):
    return usuario
