import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
type Account = {
  id: number;
  holder_name: string;
  balance: number;
};

type TransferenciaForm = {
  source_account_id: string;
  destination_account_id: string;
  amount: string;
};

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api');
const API_URL = `${API_BASE}/transfers`;

const estadoInicial: TransferenciaForm = {
  source_account_id: '',
  destination_account_id: '',
  amount: ''
};

function Transferencia() {
  const [cuentas, setCuentas] = useState<Account[]>([]);
  const [formulario, setFormulario] = useState<TransferenciaForm>(estadoInicial);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const cargarCuentas = async () => {
    try {
      const respuesta = await fetch(`${API_BASE}/accounts`);
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'No se pudieron cargar las cuentas');
      }

      setCuentas(Array.isArray(datos) ? datos : datos.content || []);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado');
      }
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarCuentas();
  }, []);

  const validar = () => {
    if (!formulario.source_account_id.trim()) {
      return 'La cuenta origen es obligatoria';
    }

    if (!formulario.destination_account_id.trim()) {
      return 'La cuenta destino es obligatoria';
    }

    if (formulario.source_account_id === formulario.destination_account_id) {
      return 'La cuenta origen y destino no pueden ser iguales';
    }

    if (!formulario.amount.trim()) {
      return 'El monto es obligatorio';
    }

    if (!Number.isFinite(Number(formulario.amount)) || Number(formulario.amount) <= 0) {
      return 'El monto debe ser mayor que 0';
    }

    const cuentaOrigen = cuentas.find(
      (cuenta) => String(cuenta.id) === formulario.source_account_id
    );

    if (cuentaOrigen && Number(formulario.amount) > Number(cuentaOrigen.balance)) {
      return 'El monto supera el saldo disponible de la cuenta origen';
    }

    return '';
  };

  const actualizarCampo = (campo: keyof TransferenciaForm, valor: string) => {
    setFormulario({
      ...formulario,
      [campo]: valor
    });
  };

  const limpiarFormulario = () => {
    setFormulario({ ...estadoInicial });
  };

  const guardar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setMensaje('');
    setError('');

    const errorValidacion = validar();

    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    try {
      setCargando(true);

      const datos = {
        sourceAccountId: Number(formulario.source_account_id),
        destinationAccountId: Number(formulario.destination_account_id),
        amount: Number(formulario.amount)
      };

      const respuesta = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      });
      const resultado = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        throw new Error(
          resultado?.mensaje || resultado?.message || 'No se pudo realizar la transferencia'
        );
      }

      setMensaje('Transferencia realizada correctamente');
      limpiarFormulario();
      await cargarCuentas();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="contenedor">
      <section className="encabezado">
        <div>
          <h1>Transferencia</h1>
        </div>
      </section>

      <section className="panel">
        <h2>Nueva transferencia</h2>

        <form onSubmit={guardar} className="formulario">
          <div className="campo">
            <label>Cuenta origen</label>
            <select
              value={formulario.source_account_id}
              onChange={(e) => actualizarCampo('source_account_id', e.target.value)}
            >
              <option value="">Selecciona una cuenta</option>
              {cuentas.map((cuenta) => (
                <option key={cuenta.id} value={cuenta.id}>
                  {cuenta.id} - {cuenta.holder_name} (L. {cuenta.balance})
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label>Cuenta destino</label>
            <select
              value={formulario.destination_account_id}
              onChange={(e) => actualizarCampo('destination_account_id', e.target.value)}
            >
              <option value="">Selecciona una cuenta</option>
              {cuentas
                .filter((cuenta) => String(cuenta.id) !== formulario.source_account_id)
                .map((cuenta) => (
                  <option key={cuenta.id} value={cuenta.id}>
                    {cuenta.id} - {cuenta.holder_name} (L. {cuenta.balance})
                  </option>
                ))}
            </select>
          </div>

          <div className="campo">
            <label>Monto</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={formulario.amount}
              onChange={(e) => actualizarCampo('amount', e.target.value)}
            />
          </div>

          <div className="accionesFormulario">
            <button type="submit" disabled={cargando}>
              {cargando ? 'Procesando...' : 'Transferir'}
            </button>
            <button type="button" onClick={limpiarFormulario} disabled={cargando}>
              Limpiar
            </button>
          </div>
        </form>

        {mensaje && <p className="mensaje exito">{mensaje}</p>}
        {error && <p className="mensaje error">{error}</p>}
      </section>
    </main>
  );
}

export default Transferencia;
