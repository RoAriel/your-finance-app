import { useEffect } from 'react';
import { logger } from './utils/appLogger';
import { api } from './lib/axios';

function App() {
  useEffect(() => {
    logger.info('Aplicación montada');
    
    // Usamos 'api' en un log para que el linter no se queje de que no la usamos
    // y de paso verificamos que la URL base se leyó bien del .env
    logger.debug('Configuración de Axios cargada', { 
      baseURL: api.defaults.baseURL 
    });

  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-primary mb-4">
          Your Finance App
        </h1>
        <p className="text-muted mb-6">
          Frontend inicializado correctamente 🚀
        </p>
        
        {/* Aquí están los botones que se habían perdido */}
        <div className="flex justify-center gap-4">
          <button className="px-4 py-2 bg-success text-white rounded hover:opacity-90 cursor-pointer font-medium transition-colors">
            Ingresos
          </button>
          <button className="px-4 py-2 bg-danger text-white rounded hover:opacity-90 cursor-pointer font-medium transition-colors">
            Gastos
          </button>
        </div>

      </div>
    </div>
  )
}

export default App;