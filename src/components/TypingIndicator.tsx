import React from 'react';
import { User } from '../types';

interface TypingIndicatorProps {
  users: User[];
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ users }) => {
  if (users.length === 0) return null;

  const getUsersText = () => {
    if (users.length === 1) {
      return `${users[0].username} está escribiendo`;
    } else if (users.length === 2) {
      return `${users[0].username} y ${users[1].username} están escribiendo`;
    } else {
      return `${users.length} usuarios están escribiendo`;
    }
  };

  return (
    <div className="flex items-center space-x-3 px-4 py-2">
      <div className="flex space-x-1">
        {users.slice(0, 3).map((user, index) => (
          <div key={user.id} className="text-lg">
            {user.avatar}
          </div>
        ))}
      </div>
      
      <div className="flex items-center space-x-2 text-gray-500 text-sm italic">
        <span>{getUsersText()}...</span>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};