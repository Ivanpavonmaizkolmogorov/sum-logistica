import React, { useState } from 'react';
import { Truck } from 'lucide-react';
import Card from '../components/ui/Card';

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!onLogin(username, password)) {
      setError('Usuario o contraseña incorrectos.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <Truck size={32} className="text-blue-500" />
          <h1 className="text-2xl font-bold text-white">SUM Logística</h1>
        </div>
        <h2 className="text-xl font-semibold text-center text-white mb-6">Iniciar Sesión</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <div className="pt-2">
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
              Entrar
            </button>
          </div>
        </form>
      </Card>
      <footer className="text-center mt-12 text-gray-500 text-sm"><p>© {new Date().getFullYear()} SUM Logística</p></footer>
    </div>
  );
};

export default LoginScreen;