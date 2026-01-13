import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, HomeIcon } from 'lucide-react';
import Button from '../components/common/Button/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-100 mb-6">
            <AlertCircle className="h-10 w-10 text-primary-600" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Página no encontrada</h2>
          <p className="text-gray-600 mb-8">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
        </div>
        
        <div className="space-y-4">
          
          <Link to="/dashboard" className="text-sm text-white p-4 rounded-md inline-flex items-center bg-blue-500 hover:bg-blue-400 transition">
             Volver al Dashboard
          </Link>
        </div>
  
      </div>
    </div>
  );
};

export default NotFound;