export interface User {
  id: string;
  username: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: Date | string; // Puede ser Date o string
  createdAt?: Date | string; // Puede ser Date o string
  socketId?: string; // Añadido para coincidir con el backend
}

export interface Message {
  id: string;
  content: string;
  type: 'text' | 'file' | 'image';
  userId: string;
  user: User;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileMimeType?: string;
  createdAt: string;
}

export interface FileInfo {
  filename: string;
  originalname: string;
  size: number;
  mimetype: string;
  url: string;
}

export interface SocketUser extends User {
  socketId: string;
}