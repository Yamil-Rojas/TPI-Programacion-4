"""Repositorio genérico.

BaseRepository[T] ofrece las operaciones comunes para cualquier modelo.
Los repositorios de cada módulo heredan de acá y agregan sus consultas propias.
Un repositorio solo consulta y guarda: NO contiene reglas de negocio ni hace commit.
"""
from typing import Generic, Sequence, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    def __init__(self, session: Session, model: type[T]) -> None:
        self.session = session
        self.model = model

    def get_by_id(self, id: int) -> T | None:
        return self.session.get(self.model, id)

    def get_all(self, skip: int = 0, limit: int = 100) -> Sequence[T]:
        statement = select(self.model).offset(skip).limit(limit)
        return self.session.exec(statement).all()

    def add(self, entity: T) -> T:
        self.session.add(entity)
        # flush envía el INSERT (así obtenemos el id) pero NO confirma la transacción.
        self.session.flush()
        self.session.refresh(entity)
        return entity

    def delete(self, entity: T) -> None:
        self.session.delete(entity)
        self.session.flush()
