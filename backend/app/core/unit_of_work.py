"""Unit of Work base.

Agrupa todo lo que ocurre en una operación de negocio en UNA transacción:

    with uow:            # __enter__: abre la sesión
        ...              # el Service trabaja con los repositorios
                         # __exit__ sin error  -> commit
                         # __exit__ con error  -> rollback
                         # siempre             -> close

REGLA: nadie más que este __exit__ llama a session.commit().
Los UoW de cada módulo heredan de esta clase y, en __enter__, crean sus
repositorios sobre la misma sesión.
"""
from typing import Callable

from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    def __init__(self, factory: Callable[[], Session] = session_factory) -> None:
        self._session_factory = factory
        self.session: Session | None = None

    def __enter__(self) -> "UnitOfWork":
        self.session = self._session_factory()
        return self

    def __exit__(self, exc_type, exc_value, traceback) -> bool:
        assert self.session is not None
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
        # False: si hubo una excepción, se vuelve a lanzar hacia el Router.
        return False
