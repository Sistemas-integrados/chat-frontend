import React from 'react';
import { Download, Image, File, FileText, Music, Video, Archive } from 'lucide-react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  formatFileSize: (bytes: number) => string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isOwn, 
  formatFileSize 
}) => {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return File;
    
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.startsWith('video/')) return Video;
    if (mimeType.startsWith('audio/')) return Music;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return FileText;
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return Archive;
    
    return File;
  };

  const getFileIconColor = (mimeType?: string) => {
    if (!mimeType) return 'text-gray-500';
    
    if (mimeType.startsWith('image/')) return 'text-green-500';
    if (mimeType.startsWith('video/')) return 'text-red-500';
    if (mimeType.startsWith('audio/')) return 'text-purple-500';
    if (mimeType.includes('pdf')) return 'text-red-600';
    if (mimeType.includes('document')) return 'text-blue-500';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return 'text-yellow-500';
    
    return 'text-gray-500';
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {!isOwn && (
          <div className="flex-shrink-0 text-2xl">
            {message.user.avatar}
          </div>
        )}
        
        <div className={`rounded-2xl px-4 py-2 shadow-sm ${
          isOwn 
            ? 'bg-blue-600 text-white' 
            : 'bg-white text-gray-800 border border-gray-200'
        }`}>
          {!isOwn && (
            <div className="text-xs font-medium text-gray-500 mb-1">
              {message.user.username}
            </div>
          )}
          
          <div className="text-sm break-words">
            {message.content}
          </div>

          {message.fileUrl && (
            <div className="mt-2">
              {message.type === 'image' ? (
                <div className="relative group">
                  <img
                    src={message.fileUrl}
                    alt={message.fileName}
                    className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(message.fileUrl, '_blank')}
                    style={{ maxHeight: '300px', objectFit: 'cover' }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200 flex items-center justify-center">
                    <Download className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ) : (
                <a
                  href={message.fileUrl}
                  download={message.fileName}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors hover:scale-105 transform duration-200 ${
                    isOwn 
                      ? 'bg-blue-700 hover:bg-blue-800' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {React.createElement(getFileIcon(message.fileMimeType), { 
                    className: `h-5 w-5 ${isOwn ? 'text-blue-200' : getFileIconColor(message.fileMimeType)}` 
                  })}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {message.fileName}
                    </div>
                    {message.fileSize && (
                      <div className={`text-xs ${isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
                        {formatFileSize(message.fileSize)}
                      </div>
                    )}
                  </div>
                  <Download className={`h-4 w-4 ${isOwn ? 'text-blue-200' : 'text-gray-400'}`} />
                </a>
              )}
            </div>
          )}

          <div className={`text-xs mt-1 ${
            isOwn ? 'text-blue-200' : 'text-gray-500'
          }`}>
            {formatTime(message.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
};