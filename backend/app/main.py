"""Punto de entrada de la API Food Store.

Crea la aplicación FastAPI, registra CORS con credenciales (necesario para la
cookie HttpOnly) e incluye los routers de los módulos bajo el prefijo /api/v1.
La documentación queda en /docs y /redoc.
"""
from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_all_tables

# Importar los modelos registra las tablas en SQLModel.metadata.
# Hay que hacerlo ANTES de create_all_tables() para que se creen.
import app.db.base  # noqa: F401
from app.modules.auth.router import router as auth_router
from app.modules.categorias.router import router as categorias_router
from app.modules.productos.router import router as productos_router
from app.modules.usuarios.router import router as usuarios_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Al arrancar: crea las tablas si todavía no existen.
    create_all_tables()
    yield


app = FastAPI(
    title="Food Store API",
    description="Sistema de pedidos de comida - TPI Programación 4",
    version="1.0.0",
    lifespan=lifespan,
)

# allow_credentials=True exige un origen explícito (no vale "*").
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Todos los endpoints cuelgan de /api/v1. Los routers de cada módulo se
# incluyen acá a medida que los construimos (auth, usuarios, categorías...).
api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_router)
api_router.include_router(usuarios_router)
api_router.include_router(categorias_router)
api_router.include_router(productos_router)

app.include_router(api_router)
