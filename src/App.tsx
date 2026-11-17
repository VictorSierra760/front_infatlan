import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Cuentas from './pages/Cuentas';
import Transferencia from './pages/Transferencia';

function App() {
  return <BrowserRouter>
    <nav>
      <ul>
        <li><Link to="/cuentas">Cuentas</Link></li>
        <li><Link to="/transferencias">Transferencia</Link></li>
      </ul>
    </nav>
    <hr />
    <Routes>
      <Route path="/" element={<Navigate to="/cuentas" replace />} />
      <Route path="/cuentas" element={<Cuentas />} />
      <Route path="/transferencias" element={<Transferencia />} />
    </Routes>
  </BrowserRouter>;
}
export default App;
