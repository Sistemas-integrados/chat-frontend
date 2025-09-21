import React from "react";
import { X, Crown } from "lucide-react";
import { User } from "../types";

interface UsersListProps {
    users: User[];
    currentUser: { username: string; avatar: string };
    onClose?: () => void;
}

export const UsersList: React.FC<UsersListProps> = ({
    users,
    currentUser,
    onClose,
}) => {
    return (
        <div className="h-full flex flex-col">
            <div className="bg-slate-700 text-white p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold">Usuarios en línea</h3>
                        <p className="text-sm text-slate-300">
                            {users.length} conectados
                        </p>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors md:hidden"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {users.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                        <p className="text-sm">No hay usuarios conectados</p>
                    </div>
                ) : (
                    users.map((user, index) => (
                        <div
                            key={`${user.id}-${index}`}
                            className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-gray-50 ${
                                user.username === currentUser.username
                                    ? "bg-blue-50 border border-blue-200 shadow-sm"
                                    : ""
                            }`}
                        >
                            <div className="relative">
                                <div className="text-xl">{user.avatar}</div>
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                    <div className="font-medium text-gray-900 truncate">
                                        {user.username}
                                    </div>
                                    {index === 0 && (
                                        <div title="Primer usuario">
                                            <Crown className="h-3 w-3 text-yellow-500" />
                                        </div>
                                    )}
                                    {user.username === currentUser.username && (
                                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                            Tú
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500">
                                    En línea
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="text-xs text-gray-500 text-center">
                    💬 Chat en tiempo real
                </div>
            </div>
        </div>
    );
};
