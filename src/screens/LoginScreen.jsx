import React, { useState } from 'react';
import { Truck, User, UserCog, UserSquare } from 'lucide-react';
import Card from '../components/ui/Card';

const LoginScreen = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState('driver'); // 'admin', 'driver', 'client'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setUsername('');
    setPassword('');
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!onLogin(username, password, activeTab)) {
      setError('Usuario o contraseña incorrectos.');
    }
  };

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'admin':
        return 'Usuario Admin';
      case 'driver':
        return 'Nombre del Repartidor';
      case 'client':
        return 'Email del Cliente';
      default:
        return 'Usuario';
    }
  };

  const TabButton = ({ tab, label, icon: Icon }) => (
    <button
      type="button"
      onClick={() => handleTabChange(tab)}
      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-semibold transition-colors ${
        activeTab === tab
          ? 'bg-blue-600 text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      <Icon size={20} />
      {label}
    </button>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-sm overflow-hidden p-0 shadow-2xl">
        <div className="p-6 bg-gray-800">
            <div className="flex items-center justify-center space-x-3 mb-6">
            <Truck size={32} className="text-blue-500" />
            <h1 className="text-3xl font-bold text-white">SUM Logística</h1>
            </div>
        </div>

        <div className="flex">
          <TabButton tab="driver" label="Repartidor" icon={User} />
          <TabButton tab="client" label="Cliente" icon={UserSquare} />
          <TabButton tab="admin" label="Admin" icon={UserCog} />
        </div>

        <div className="p-6 bg-gray-800">
            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                {activeTab === 'client' ? 'Email' : 'Usuario'}
                </label>
                <input
                type={activeTab === 'client' ? 'email' : 'text'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={getPlaceholder()}
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
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">Entrar</button>
            </div>
            </form>
        </div>
      </Card>
      <footer className="text-center mt-12 text-gray-500 text-sm"><p>© {new Date().getFullYear()} SUM Logística</p></footer>
    </div>
  );
};

export default LoginScreen;