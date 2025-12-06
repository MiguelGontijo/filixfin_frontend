// src/core/ui/layout/TopNavigation.tsx

'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { FaBell } from 'react-icons/fa';
// IMPORTAÇÃO DOS COMPONENTES
import { TenantSelector } from '@/core/components/tenant/TenantSelector';
import { UserMenu } from '@/core/ui/layout/UserMenu'; // --- NOVO ---

/**
 * @component TopNavigation
 * @description Cabeçalho global da área do Dashboard.
 * @update Integrado com TenantSelector e UserMenu para ações de conta.
 */
export const TopNavigation: React.FC = () => {
    
    const params = useParams();
    
    // Captura o ID do tenant da URL para o Seletor
    const currentTenantId = params?.tenantId as string;

    return (
        // Adicionado z-20 para garantir hierarquia visual correta com o conteúdo abaixo
        <header className="h-16 bg-base-metallic border-b border-gray-700 flex items-center justify-between px-6 shadow-md relative z-20">
            
            {/* Lado Esquerdo: Seletor de Contexto (Tenant) */}
            <div className="flex items-center">
                {/* Agora usamos o componente inteligente.
                    Passamos o ID atual para que ele saiba qual opção pré-selecionar.
                */}
                {currentTenantId && (
                    <TenantSelector currentTenantId={currentTenantId} />
                )}
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

                {/* Perfil do Usuário e Menu Dropdown */}
                <UserMenu />
            </div>
        </header>
    );
};