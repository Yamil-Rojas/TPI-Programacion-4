"""Seed: carga datos iniciales. Es idempotente (se puede correr varias veces).

Uso, desde la carpeta backend:
    python -m app.db.seed

Crea (solo si no existen):
- el usuario admin  ->  admin / Admin1234!
- 4 categorías
- 12 productos con stock

Usa el UnitOfWork base: el commit lo hace su __exit__, igual que en el resto
del proyecto.
"""
from sqlmodel import select

import app.db.base  # noqa: F401  (registra los 5 modelos y sus relaciones)
from app.core.database import create_all_tables
from app.core.security import hash_password
from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

ADMIN = {
    "username": "admin",
    "full_name": "Administrador",
    "email": "admin@foodstore.com",
    "password": "Admin1234!",
}

CATEGORIAS = {
    "Hamburguesas": "Hamburguesas artesanales con papas",
    "Pizzas": "Pizzas al horno de piedra",
    "Bebidas": "Gaseosas, aguas y jugos",
    "Postres": "Dulces para cerrar la comida",
}

# (categoría, nombre, descripción, precio, stock)
PRODUCTOS = [
    ("Hamburguesas", "Hamburguesa Clásica", "Carne, lechuga, tomate y queso", 6500.0, 20),
    ("Hamburguesas", "Hamburguesa Doble", "Doble carne, cheddar y panceta", 8200.0, 15),
    ("Hamburguesas", "Hamburguesa Veggie", "Medallón de lentejas y vegetales", 6900.0, 10),
    ("Pizzas", "Pizza Muzzarella", "Salsa de tomate y muzzarella", 7000.0, 12),
    ("Pizzas", "Pizza Napolitana", "Muzzarella, tomate fresco y ajo", 7800.0, 12),
    ("Pizzas", "Pizza Fugazzeta", "Cebolla y muzzarella", 8000.0, 8),
    ("Bebidas", "Gaseosa Cola 500ml", "Botella individual", 1800.0, 40),
    ("Bebidas", "Agua Mineral 500ml", "Sin gas", 1200.0, 50),
    ("Bebidas", "Jugo de Naranja", "Exprimido, vaso grande", 2200.0, 25),
    ("Postres", "Flan con Dulce de Leche", "Porción casera", 3000.0, 15),
    ("Postres", "Brownie con Helado", "Brownie tibio y helado de crema", 4200.0, 10),
    ("Postres", "Tiramisú", "Porción individual", 4500.0, 8),
]


def run() -> None:
    create_all_tables()

    with UnitOfWork() as uow:
        session = uow.session

        # Admin
        admin = session.exec(
            select(Usuario).where(Usuario.username == ADMIN["username"])
        ).first()
        if admin is None:
            session.add(
                Usuario(
                    username=ADMIN["username"],
                    full_name=ADMIN["full_name"],
                    email=ADMIN["email"],
                    hashed_password=hash_password(ADMIN["password"]),
                    role="admin",
                )
            )

        # Categorías
        categorias: dict[str, Categoria] = {}
        for nombre, descripcion in CATEGORIAS.items():
            cat = session.exec(
                select(Categoria).where(Categoria.nombre == nombre)
            ).first()
            if cat is None:
                cat = Categoria(nombre=nombre, descripcion=descripcion)
                session.add(cat)
                session.flush()  # para obtener el id sin confirmar todavía
            categorias[nombre] = cat

        # Productos
        for cat_nombre, nombre, descripcion, precio, stock in PRODUCTOS:
            existe = session.exec(
                select(Producto).where(Producto.nombre == nombre)
            ).first()
            if existe is None:
                session.add(
                    Producto(
                        categoria_id=categorias[cat_nombre].id,
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        stock=stock,
                    )
                )

    print("Seed completado.")


if __name__ == "__main__":
    run()
