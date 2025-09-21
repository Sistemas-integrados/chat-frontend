import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (serverUrl: string) => {
  const socketRef = useRef<Socket | null>(null);

  // Crear el socket inmediatamente si no existe
  if (!socketRef.current) {
    socketRef.current = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      reconnection: true,
      reconnectionAttempts: 2,
      reconnectionDelay: 500,
      forceNew: true,
      autoConnect: true
    });
  }

  useEffect(() => {
    const socket = socketRef.current!;

    // Eventos básicos
    socket.on('connect', () => {
      // Conectado al servidor
    });

    socket.on('connect_error', (error) => {
      console.error('Error de conexión:', error.message);
    });

    socket.on('disconnect', (reason) => {
      console.warn('Desconectado:', reason);
    });

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
    };
  }, [serverUrl]);

  // Siempre devolver el socket
  return socketRef.current;
};