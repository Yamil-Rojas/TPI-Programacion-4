# Food Store

Trabajo Práctico Integrador · Programación 4 · Tecnicatura Universitaria en Programación (UTN)

Aplicación web para un negocio de comidas. Los clientes se registran, recorren el catálogo, arman un carrito y confirman un pedido con dirección de entrega y forma de pago. El negocio administra categorías, productos, stock, pedidos y usuarios desde un panel de administración.

- **Autor:** Maximiliano Rojas
- **Repositorio:** https://github.com/Yamil-Rojas/TPI-Programacion-4
- **Video de demostración:** https://drive.google.com/file/d/1iZkS6ImCZaP0uzxxCaTlXOuRhs_qYZwi/view?usp=drive_link
## Tecnologías

| Parte | Tecnologías |
|-------|-------------|
| Backend | Python 3.11–3.13, FastAPI, SQLModel, PostgreSQL (SQLite para desarrollo), JWT en cookie HttpOnly (python-jose), bcrypt (passlib) |
| Frontend | React 19, TypeScript (strict), Vite, Tailwind CSS 4, TanStack Query / Form / Table, React Router 7, Zustand, Axios, pnpm |

## Estructura del repositorio

```
TPI-Programacion-4/
├── backend/     API REST (FastAPI + SQLModel), arquitectura en capas con Unit of Work
├── frontend/    Aplicación React organizada por features
└── README.md
```

- **Backend:** cada dominio (`usuarios`, `categorias`, `productos`, `pedidos`, `auth`) vive en `backend/app/modules/` con la cadena Router → Service → Unit of Work → Repository → Model. La infraestructura compartida está en `backend/app/core/`. El `commit` ocurre únicamente en el `__exit__` del Unit of Work.
- **Frontend:** `frontend/src/features/` (un dominio por carpeta: pages, components, hooks, api, types), `shared/` (api, ui, components, layout), `store/` (Zustand) y `routes/`.

## Requisitos

- Python **3.11 a 3.13** (SQLModel 0.0.22 no funciona con 3.14)
- Node.js **20.19 o superior**
- pnpm **9 o superior** (`npm install -g pnpm`)
- PostgreSQL **15 o superior** (o SQLite para desarrollo local, sin instalar nada)

## Backend

Desde la carpeta `backend/`:

**1. Entorno virtual e instalación de dependencias**

```powershell
# Windows (PowerShell)
python -m venv venv
venv\Scripts\activate
python -m pip install -r requirements.txt
```

```bash
# macOS / Linux
python3 -m venv venv
source venv/bin/activate
python -m pip install -r requirements.txt
```

**2. Variables de entorno.** Copiar el ejemplo y completarlo:

```powershell
copy .env.example .env      # Windows
```

```bash
cp .env.example .env        # macOS / Linux
```

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | Conexión a la base de datos | `postgresql://user:pass@localhost:5432/foodstore_db` |
| `SECRET_KEY` | Clave para firmar el JWT (mínimo 32 caracteres) | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Vida de la cookie y del token | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS | `http://localhost:5173` |

> **PostgreSQL:** crear antes la base (por ejemplo `foodstore_db`) y poner en `DATABASE_URL` el usuario y la contraseña reales.
> **SQLite (más simple para probar):** usar `DATABASE_URL=sqlite:///./foodstore.db`.

**3. Cargar datos iniciales (seed).** Es idempotente: se puede ejecutar varias veces sin duplicar nada.

```powershell
python -m app.db.seed
```

**4. Levantar el servidor**

```powershell
uvicorn app.main:app --reload
```

- API: <http://localhost:8000/api/v1>
- Documentación interactiva: <http://localhost:8000/docs> y <http://localhost:8000/redoc>

Las tablas se crean automáticamente al arrancar.

## Frontend

Desde la carpeta `frontend/`:

```powershell
pnpm install
copy .env.example .env      # Windows  (macOS / Linux: cp .env.example .env)
pnpm dev
```

| Variable | Descripción | Valor |
|----------|-------------|-------|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

- Aplicación: <http://localhost:5173>
- `pnpm build` compila con TypeScript en modo estricto (verifica los tipos) y genera el build de producción.

> Para que el login funcione, el backend tiene que estar corriendo y `FRONTEND_ORIGIN` debe ser exactamente `http://localhost:5173`.

## Usuario de prueba (seed)

| Rol | Usuario | Contraseña |
|-----|---------|------------|
| Administrador | `admin` | `Admin1234!` |

El login usa el **nombre de usuario**, no el email. Los clientes se crean desde la pantalla **Registrarme** (`/register`). El seed también carga 4 categorías y 12 productos con stock.

## Pantallas

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/login`, `/register` | Público | Inicio de sesión y registro |
| `/` | Público | Catálogo con búsqueda, filtro por categoría y paginación |
| `/carrito` | Público | Carrito persistido en el navegador |
| `/checkout` | Sesión | Dirección, forma de pago y notas; crea el pedido |
| `/mis-pedidos` | Sesión | Pedidos propios, detalle y cancelación en PENDIENTE |
| `/admin/resumen` | admin | Indicadores del negocio |
| `/admin/categorias`, `/admin/productos` | admin | ABM, stock y disponibilidad |
| `/admin/pedidos` | admin | Cambio de estado según la máquina de estados |
| `/admin/usuarios` | admin | Activar y desactivar usuarios |
| `/unauthorized` | Público | Sin permiso |

## Reglas de negocio principales

- **Crear pedido (transaccional):** valida productos y stock, descuenta el stock y crea las líneas copiando nombre y precio. Si algo falla no se guarda nada.
- **Máquina de estados:** `PENDIENTE → EN_PREPARACION | CANCELADO`, `EN_PREPARACION → ENTREGADO | CANCELADO`. `ENTREGADO` y `CANCELADO` son terminales.
- **Cancelar:** restituye el stock en la misma transacción. El cliente solo cancela sus pedidos en `PENDIENTE`; el admin cancela desde cualquier estado no terminal.
- **Inmutabilidad:** las líneas y el total no cambian después de crear el pedido; los pedidos no se borran.
- **Baja lógica** en usuarios, categorías y productos.
- **Seguridad:** el JWT viaja en una cookie HttpOnly `access_token`; el frontend nunca lee ni guarda el token. La autorización por rol se valida en el backend con `require_role`.

## Probar el flujo completo

1. Registrarse como cliente, agregar productos al carrito y confirmar el pedido.
2. Ver en el catálogo que el stock bajó.
3. Iniciar sesión como `admin`, avanzar el pedido de estado y mirar el resumen.
4. Cancelar un pedido y comprobar que el stock se restituye.
