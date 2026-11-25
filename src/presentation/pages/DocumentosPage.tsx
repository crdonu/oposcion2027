import { Link } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { DocumentosConsulta } from '../components/DocumentosConsulta';

export function DocumentosPage() {
  return (
    <div className="page page-narrow">
      <Link to="/programacion" className="back-link"><Icon name="left" size={16} />Programación</Link>
      <div className="page-header">
        <h1>Documentos de consulta</h1>
      </div>
      <DocumentosConsulta conTitulo={false} />
    </div>
  );
}
