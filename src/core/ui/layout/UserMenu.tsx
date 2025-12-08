// src/core/ui/layout/UserMenu.tsx

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FaUserCircle, FaCog, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/core/hooks/useNavigation';

/**
 * @component UserMenu
 * @description Componente de menu dropdown do usuário no cabeçalho.
 * @update Correção de fundo sólido (bg-gray-900) e rota dinâmica.
 */
export const UserMenu: React.FC = () => {
    
    const { user, logout } = useAuth();
    const { toLogin } = useNavigation();
    
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Handler para fechar o menu ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout(); 
        toLogin(); 
    };

    // Link dinâmico para configurações
    const settingsLink = user?.tenantId 
        ? `/${user.tenantId}/dashboard/settings`
        : '/admin/settings';

    return (
        <div className="relative" ref={menuRef}>
            
            {/* Gatilho do Menu (Avatar + Nome) */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-3 focus:outline-none hover:bg-gray-800 p-2 rounded-lg transition duration-200 border border-transparent hover:border-gray-700"
            >
                <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium text-white">
                        {user?.email}
                    </div>
                    <div className="text-xs text-gray-500 uppercase flex items-center justify-end gap-1">
                        {user?.role?.replace('_', ' ')}
                    </div>
                </div>
                
                <div className="relative">
                    <div className="h-9 w-9 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 border border-gray-600 shadow-sm">
                        <FaUserCircle className="w-6 h-6" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-gray-900 rounded-full p-0.5">
                        <FaChevronDown className={`w-2.5 h-2.5 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
                    </div>
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                // CORREÇÃO AQUI: Alterado de bg-base-metallic para bg-gray-900 (Sólido Escuro)
                <div className="absolute right-0 mt-2 w-56 bg-gray-900 rounded-xl shadow-2xl border border-gray-700 py-2 z-50 animate-fade-in origin-top-right">
                    
                    <div className="px-4 py-3 border-b border-gray-700 sm:hidden">
                        <p className="text-sm text-white font-bold truncate">{user?.email}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.role}</p>
                    </div>

                    {/* Itens do Menu */}
                    <div className="py-1">
                        <Link 
                            href={settingsLink} 
                            className="flex items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors group"
                            onClick={() => setIsOpen(false)}
                        >
                            <FaCog className="mr-3 text-gray-500 group-hover:text-accent-secondary transition-colors" />
                            Configurações
                        </Link>
                    </div>

                    <div className="border-t border-gray-700 my-1"></div>

                    <div className="py-1">
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors group"
                        >
                            <FaSignOutAlt className="mr-3 text-red-500/70 group-hover:text-red-400 transition-colors" />
                            Sair da Conta
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};