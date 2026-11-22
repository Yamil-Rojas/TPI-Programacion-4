"""Schemas del módulo auth.

Los schemas de usuario (UserCreate, UserPublic) viven en usuarios/schemas.py
porque auth usa el modelo Usuario. Acá solo va la respuesta del login/logout.
"""
from sqlmodel import SQLModel


class MessageResponse(SQLModel):
    message: str
