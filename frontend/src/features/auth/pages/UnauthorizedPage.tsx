import { Link } from "react-router-dom";

import { Card } from "../../../shared/ui/Card";

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto mt-16 max-w-md px-4">
      <Card className="text-center">
        <h1 className="mb-2 text-xl font-semibold text-slate-800">Sin permiso</h1>
        <p className="mb-4 text-sm text-slate-600">
          No tenés permisos para ver esta página.
        </p>
        <Link to="/" className="text-orange-600 hover:underline">
          Volver al inicio
        </Link>
      </Card>
    </div>
  );
}
