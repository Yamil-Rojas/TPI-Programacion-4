"""Schemas de usuario (entrada y salida). Son SQLModel SIN table=True.

Nunca se devuelve el modelo de tabla: UserPublic no incluye hashed_password.
"""
from datetime import datetime

from pydantic import EmailStr
from sqlmodel import Field, SQLModel


class UserCreate(SQLModel):
    username: str = Field(min_length=1)
    full_name: str = Field(min_length=1)
    email: EmailStr
    password: str = Field(min_length=8)  # mínimo 8 caracteres


class UserPublic(SQLModel):
    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime
