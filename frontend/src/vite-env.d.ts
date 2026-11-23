/// <reference types="vite/client" />

// Tipado de las variables de entorno del frontend (archivo .env).
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
