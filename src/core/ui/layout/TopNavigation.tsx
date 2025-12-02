// src/core/ui/layout/TopNavigation.tsx

'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { FaBuilding, FaUserCircle, FaBell } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';

/**
 * @component TopNavigation
 * @description Cabeçalho global da área do Dashboard.
 * PORQUÊ: Exibe o contexto atual (Tenant) e perfil do usuário, preparando para o Seletor de Tenant.
 */
export const TopNavigation: React.FC = () => {
    
    const { user } = useAuth();
    const params = useParams();
    
    // Captura o ID do tenant da URL para exibição visual
    // FUTURO: Buscar o Nome Fantasia do Tenant via hook useTenant(id)
    const currentTenantId = params?.tenantId as string;

    return (
        <header className="h-16 bg-base-metallic border-b border-gray-700 flex items-center justify-between px-6 shadow-md">
            
            {/* Lado Esquerdo: Contexto do Tenant */}
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-700 rounded-lg text-accent-primary">
                    <FaBuilding className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-white leading-tight">
                        Contexto da Empresa
                    </h2>
                    <p className="text-xs text-gray-400 font-mono">
                        ID: {currentTenantId || 'Carregando...'}
                    </p>
                </div>
            </div>

            {/* Lado Direito: Ações e Perfil */}
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