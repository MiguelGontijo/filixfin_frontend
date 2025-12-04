// src/core/ui/layout/TopNavigation.tsx

'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { FaUserCircle, FaBell } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
// IMPORTAÇÃO DO NOVO COMPONENTE
import { TenantSelector } from '@/core/components/tenant/TenantSelector';

/**
 * @component TopNavigation
 * @description Cabeçalho global da área do Dashboard.
 * @update Integrado com TenantSelector para troca de contexto.
 */
export const TopNavigation: React.FC = () => {
    
    const { user } = useAuth();
    const params = useParams();
    
    // Captura o ID do tenant da URL para o Seletor
    const currentTenantId = params?.tenantId as string;

    return (
        <header className="h-16 bg-base-metallic border-b border-gray-700 flex items-center justify-between px-6 shadow-md">
            
            {/* Lado Esquerdo: Seletor de Contexto (Tenant) */}
            <div className="flex items-center">
                {/* Agora usamos o componente inteligente.
                    Passamos o ID atual para que ele saiba qual opção pré-selecionar.
                */}
                {currentTenantId && (
                    <TenantSelector currentTenantId={currentTenantId} />
                )}
            </div>

            {/* Lado Direito: Ações e Perfil (Mantido) */}
            <div className="flex items-center space-x-6">
                
                {/* Notificações (Placeholder) */}
                <button className="relative text-gray-400 hover:text-white transition">
                    <FaBell className="w-5 h-5" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-gray-800 bg-accent-primary transform translate-x-1/2 -translate-y-1/2"></span>
                </button>

                {/* Divisor Vertical */}
                <div className="h-6 w-px bg-gray-700"></div>

                {/* Perfil do Usuário */}
                <div className="flex items-center space-x-3">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-medium text-white">
                            {user?.email}
                        </div>
                        <div className="text-xs text-gray-500 uppercase">
                            {user?.role?.replace('_', ' ')}
                        </div>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 border border-gray-600">
                        <FaUserCircle className="w-6 h-6" />
                    </div>
                </div>
            </div>
        </header>
    );
};