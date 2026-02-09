import { Loader2 } from 'lucide-react';

import { useGoogleCallback } from '../hooks/useGoogleCallback';

export const OAuthCallbackPage = () => {
  useGoogleCallback();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
        <h2 className="text-xl font-semibold text-gray-800">Autenticando...</h2>
        <p className="text-gray-500">
          Estamos validando tus credenciales de Google.
        </p>
      </div>
    </div>
  );
};
