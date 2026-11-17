import { useEffect, useState } from 'react';

type Cuenta = {
  id: number;
  holder_name: string;
  balance: number;
};

const API_URL =  'http://localhost:8080/api';

function Cuentas() {
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const cargarCuentas = async () => {
    try {
      setCargando(true);
      setError('');

      const respuesta = await fetch(`${API_URL}/accounts`);
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'No se pudo cargar el listado');
      }

      setCuentas(Array.isArray(datos) ? datos : datos.content || []);
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarCuentas();
  }, []);

  const formatoSaldo = (saldo: number) =>
    new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL'
    }).format(Number(saldo));

  return (
    <main className="contenedor">
      <section className="panel">
        <h2>Listado de cuentas</h2>
        {cargando && <p>Cargando cuentas...</p>}
        {error && <p className="mensaje error">{error}</p>}
        <div className="tabla">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Titular</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {cuentas.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.holder_name}</td>
                  <td>{formatoSaldo(item.balance)}</td>
                </tr>
              ))}
              {!cargando && !cuentas.length && !error && (
                <tr>
                  <td colSpan={3} className="vacio">No hay cuentas registradas</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default Cuentas;
