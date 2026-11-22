"""Registro de modelos.

Importa los 5 modelos en un solo lugar. Hace falta porque las relaciones se
declaran con nombres de clase en texto (ej. "DetallePedido"): SQLAlchemy solo
puede resolverlas si TODAS las clases ya fueron importadas.

Quien necesite las tablas (main.py, seed.py, scripts) importa este módulo:

    import app.db.base  # noqa: F401
"""
from app.modules.categorias.models import Categoria  # noqa: F401
from app.modules.pedidos.models import DetallePedido, Pedido  # noqa: F401
from app.modules.productos.models import Producto  # noqa: F401
from app.modules.usuarios.models import Usuario  # noqa: F401
