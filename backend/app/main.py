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

app.include_router(api_router)
