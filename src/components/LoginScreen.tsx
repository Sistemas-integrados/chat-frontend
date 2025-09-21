import React, { useState } from 'react';
import { MessageCircle, Users, Send, Wifi } from 'lucide-react';

interface LoginScreenProps {
  onJoin: (username: string, avatar: string) => void;
  isConnected: boolean;
}

const avatars = ['👤', '😊', '🚀', '🎨', '🎵', '⚡', '🌟', '🎯', '🔥', '💎', '🦄', '🎭'];

export const LoginScreen: React.FC<LoginScreenProps> = ({ onJoin, isConnected }) => {
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('👤');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !isConnected) return;

    setIsLoading(true);
    try {
      await onJoin(username.trim(), selectedAvatar);
    } catch (error) {
      console.error('Error joining chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-slate-200">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <MessageCircle className="h-10 w-10 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-800">ChatApp</h1>
          </div>
          <p className="text-gray-600">Únete a la conversación</p>
          
          <div className={`flex items-center justify-center mt-3 text-sm ${
            isConnected ? 'text-green-600' : 'text-amber-600'
          }`}>
            <Wifi className={`h-4 w-4 mr-1 ${isConnected ? '' : 'animate-pulse'}`} />
            {isConnected ? 'Conectado' : 'Conectando...'}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Ingresa tu nombre"
              maxLength={20}
              required
              disabled={!isConnected || isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Elige tu avatar
            </label>
            <div className="grid grid-cols-6 gap-2">
              {avatars.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  disabled={!isConnected || isLoading}
                  className={`p-3 text-2xl rounded-lg border-2 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedAvatar === avatar
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!username.trim() || !isConnected || isLoading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Conectando...</span>
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span>Entrar al Chat</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <Users className="h-4 w-4 inline mr-1" />
          Conecta con personas de todo el mundo
        </div>
      </div>
    </div>
  );
};