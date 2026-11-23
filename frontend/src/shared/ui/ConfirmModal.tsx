import { Button } from "./Button";
import { Modal } from "./Modal";

interface ConfirmModalProps {
  abierto: boolean;
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  cargando?: boolean;
  error?: string | null;
  onConfirmar: () => void;
  onCerrar: () => void;
}

// Diálogo "¿Estás seguro?" para acciones destructivas (baja de un registro, etc.).
export function ConfirmModal({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = "Confirmar",
  cargando = false,
  error,
  onConfirmar,
  onCerrar,
}: ConfirmModalProps) {
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo={titulo}>
      <p className="text-sm text-slate-600">{mensaje}</p>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="mt-4 flex justify-end gap-2">
        <Button variante="secondary" onClick={onCerrar}>
          Cancelar
        </Button>
        <Button variante="danger" cargando={cargando} onClick={onConfirmar}>
          {textoConfirmar}
        </Button>
      </div>
    </Modal>
  );
}
