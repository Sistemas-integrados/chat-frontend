import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useSocket } from './hooks/useSocket';
import { LoginScreen, ChatInterface } from './components';

const BACKEND_URL = 'https://chat-app-backend-1-qylz.onrender.com';
const CONNECTION_TIMEOUT = 8000; // Reducido a 8 segundos

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ username: string; avatar: string } | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [connectionError, setConnectionError] = useState<string>('');
  const socket = useSocket(BACKEND_URL);

  useEffect(() => {
    if (socket) {
      socket.on('connect', () => {
        setConnectionStatus('connected');
        setConnectionError('');
      });

      socket.on('disconnect', (reason) => {
        setConnectionStatus('disconnected');
        setConnectionError(`Conexión perdida: ${reason}`);
        
        if (isLoggedIn) {
          setTimeout(() => {
            setIsLoggedIn(false);
            setCurrentUser(null);
          }, 5000);
        }
      });

      socket.on('connect_error', (error) => {
        setConnectionStatus('disconnected');
        setConnectionError(`Error de conexión: ${error.message}`);
      });

      // Establecer estado inicial basado en el estado actual del socket
      if (socket.connected) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('connecting');
      }

      return () => {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
      };
    }
  }, [socket, isLoggedIn]);

  // Timeout para conexión
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (connectionStatus === 'connecting') {
      timeout = setTimeout(() => {
        if (connectionStatus === 'connecting') {
          setConnectionStatus('disconnected');
          setConnectionError('Timeout de conexión - El servidor no responde');
        }
      }, CONNECTION_TIMEOUT);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [connectionStatus]);

  const handleJoin = (username: string, avatar: string) => {
    if (socket && connectionStatus === 'connected') {
      const userData = { username, avatar };
      setCurrentUser(userData);
      // NO emitir join aquí - lo haremos desde ChatInterface
      setIsLoggedIn(true);
    }
  };

  const handleDisconnect = () => {
    if (socket) {
      socket.disconnect();
    }
    setIsLoggedIn(false);
    setCurrentUser(null);
    setConnectionStatus('connecting');
    setConnectionError('');
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleRetryConnection = () => {
    setConnectionStatus('connecting');
    setConnectionError('');
    window.location.reload();
  };

  if (!socket) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center text-gray-700 max-w-md px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Inicializando...</h2>
          <p className="text-gray-600 mb-4">Configurando conexión</p>
        </div>
      </div>
    );
  }

  if (connectionStatus === 'connecting') {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center text-gray-700 max-w-md px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Conectando al chat...</h2>
          <p className="text-gray-600 mb-4">Por favor espera un momento</p>
          <button 
            onClick={handleRetryConnection}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  if (connectionStatus === 'disconnected' && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-red-200">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Sin conexión</h2>
          <p className="text-gray-600 mb-4">No se pudo conectar al servidor de chat</p>
          {connectionError && (
            <p className="text-sm text-gray-500 mb-4 p-3 bg-gray-50 rounded-lg border">
              {connectionError}
            </p>
          )}
          <button 
            onClick={handleRetryConnection}
            className="w-full bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            Reintentar conexión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '10px',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      {!isLoggedIn || !currentUser ? (
        <LoginScreen 
          onJoin={handleJoin} 
          isConnected={connectionStatus === 'connected'} 
        />
      ) : (
        <ChatInterface 
          socket={socket} 
          currentUser={currentUser}
          onDisconnect={handleDisconnect}
        />
      )}
    </div>
  );
}

export default App;