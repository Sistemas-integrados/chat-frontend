import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { Send, Paperclip, Users, Menu, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Message, User, FileInfo } from '../types';
import { MessageBubble } from './MessageBubble';
import { UsersList } from './UsersList';
import { TypingIndicator } from './TypingIndicator';

interface ChatInterfaceProps {
  socket: Socket;
  currentUser: { username: string; avatar: string };
  onDisconnect: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  socket,
  currentUser,
  onDisconnect
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<User[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [showUsersList, setShowUsersList] = useState<boolean>(window.innerWidth > 768);
  const [isConnected, setIsConnected] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    // Listeners de Socket.IO
    socket.on('connect', () => {
      setIsConnected(true);
      toast.success('Conectado al servidor');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      toast.error('Desconectado del servidor');
    });

    // Emitir join una vez que los listeners estén listos
    socket.emit('join', currentUser);

    socket.on('recentMessages', (recentMessages: Message[]) => {
      setMessages(recentMessages);
      toast.success('¡Bienvenido al chat!');
    });

    // Evento principal: Conexión exitosa al unirse
    socket.on('joinSuccess', (data: { user: User; onlineUsers: User[]; recentMessages: Message[] }) => {
      updateOnlineUsers(data.onlineUsers);
      setMessages(data.recentMessages);
      toast.success('¡Conectado al chat exitosamente!');
    });

    // Gestión de usuarios - Lista actualizada
    socket.on('onlineUsers', (users: User[]) => {
      updateOnlineUsers(users);
    });

    socket.on('newMessage', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('userJoined', (data: { user: User; onlineUsers: User[] }) => {
      updateOnlineUsers(data.onlineUsers);
      if (data.user.username !== currentUser.username) {
        toast.success(`${data.user.username} se unió al chat`, {
          icon: '👋',
        });
      }
    });

    socket.on('userLeft', (data: { user: User; onlineUsers: User[] }) => {
      updateOnlineUsers(data.onlineUsers);
      toast(`${data.user.username} abandonó el chat`, {
        icon: '👋',
        duration: 2000
      });
    });

    socket.on('userTyping', (data: { user: User; isTyping: boolean }) => {
      setTypingUsers(prev => {
        if (data.isTyping) {
          return prev.find(u => u.id === data.user.id) ? prev : [...prev, data.user];
        } else {
          return prev.filter(u => u.id !== data.user.id);
        }
      });
    });

    socket.on('error', (error: { message: string }) => {
      toast.error(error.message);
    });

    // Eventos adicionales que el backend podría estar enviando
    socket.on('usersUpdate', (users: User[]) => {
      updateOnlineUsers(users);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('recentMessages');
      socket.off('joinSuccess');
      socket.off('onlineUsers');
      socket.off('newMessage');
      socket.off('userJoined');
      socket.off('userLeft');
      socket.off('userTyping');
      socket.off('error');
      socket.off('usersUpdate');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]); // Solo depender de socket, no de currentUser

  // Scroll automático al final
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleTyping = () => {
    socket.emit('typing', { user: currentUser, isTyping: true });
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { user: currentUser, isTyping: false });
    }, 1000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Función para deduplicar usuarios por ID
  const deduplicateUsers = (users: User[]): User[] => {
    const uniqueUsers = new Map<string, User>();
    users.forEach(user => {
      uniqueUsers.set(user.id, user);
    });
    return Array.from(uniqueUsers.values());
  };

  // Función helper para actualizar usuarios de forma segura
  const updateOnlineUsers = (users: User[]) => {
    const uniqueUsers = deduplicateUsers(users);
    setOnlineUsers(uniqueUsers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      const messageData = {
        text: newMessage.trim(),
        user: currentUser,
        timestamp: new Date(),
        id: `${currentUser.username}-${Date.now()}`
      };

      socket.emit('sendMessage', messageData);
      setNewMessage('');
      socket.emit('typing', { user: currentUser, isTyping: false });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validaciones
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('El archivo es demasiado grande. Máximo 10MB.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de archivo no permitido.');
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = () => {
        const fileData: FileInfo = {
          filename: file.name,
          originalname: file.name,
          size: file.size,
          mimetype: file.type,
          url: reader.result as string
        };

        const messageData = {
          text: `Archivo compartido: ${file.name}`,
          user: currentUser,
          timestamp: new Date(),
          id: `${currentUser.username}-${Date.now()}`,
          file: fileData
        };

        socket.emit('sendMessage', messageData);
        toast.success('Archivo enviado exitosamente');
      };

      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Error al subir el archivo');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Panel lateral de usuarios */}
      <div className={`${showUsersList ? 'w-64' : 'w-0'} transition-all duration-300 bg-white border-r border-gray-200 overflow-hidden`}>
        <UsersList 
          users={onlineUsers} 
          currentUser={currentUser}
        />
      </div>

      {/* Área principal del chat */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowUsersList(!showUsersList)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center space-x-2">
              <MessageCircle className="text-blue-600" size={24} />
              <h1 className="text-xl font-semibold text-gray-800">Chat Grupal</h1>
            </div>
            <div className={`flex items-center space-x-2 text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowUsersList(!showUsersList)}
              className="hidden lg:flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Users size={16} />
              <span className="text-sm">{onlineUsers.length}</span>
            </button>
            <button
              onClick={onDisconnect}
              className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
            >
              Salir
            </button>
          </div>
        </div>

        {/* Área de mensajes */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.user.username === currentUser.username}
              formatFileSize={formatFileSize}
            />
          ))}
          
          {/* Indicador de usuarios escribiendo */}
          <TypingIndicator users={typingUsers} />
          
          <div ref={messagesEndRef} />
        </div>

        {/* Formulario de entrada */}
        <div className="bg-white border-t border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="flex items-end space-x-4">
            <div className="flex-1">
              <div className="flex items-end space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={!isConnected}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,.pdf,.txt"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || !isConnected}
                  className="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Paperclip size={20} />
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || isUploading || !isConnected}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Send size={18} />
              <span>{isUploading ? 'Subiendo...' : 'Enviar'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;