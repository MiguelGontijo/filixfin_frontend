
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { FaBell, FaRobot } from 'react-icons/fa'; // Importado o ícone do Robô
import { TenantSelector } from '@/core/components/tenant/TenantSelector';
import { UserMenu } from '@/core/ui/layout/UserMenu';
import { useFilixAI } from '@/core/ai/context/FilixAIContext'; // [NOVO] Import do Cérebro da IA
import { AppModule, AppModules } from '@/core/ai/types/enums/AIEnums';

/**
 * @component TopNavigation
 * @description Cabeçalho global da área do Dashboard.
 * @update Integrado com Gatilho da Inteligência Artificial (Drawer).
 */
export const TopNavigation: React.FC = () => {
    
    const params = useParams();
    const currentTenantId = params?.tenantId as string;

    // --- Hooks da IA ---
    // Puxamos o estado visual e semântico para o botão refletir o momento atual
    const { toggleVisibility, contextMetadata, isEnabled, mode } = useFilixAI();

    // Helper para definir a cor do botão da IA baseado no módulo onde o usuário está
    const getAIBtnColor = () => {
        if (!isEnabled) return 'text-gray-600 bg-gray-800 cursor-not-allowed'; // Desligado
        
        // Se estiver aberto, mantemos uma cor sólida neutra para não ofuscar
        if (mode === 'EXPANDED') return 'text-white bg-accent-primary shadow-lg shadow-accent-primary/20';

        switch (contextMetadata?.module) {
            case AppModules.ESTOQUE: return 'text-orange-400 hover:bg-orange-400/10 hover:text-orange-300';
            case AppModules.CRM: return 'text-blue-400 hover:bg-blue-400/10 hover:text-blue-300';
            case AppModules.FINANCEIRO: return 'text-emerald-400 hover:bg-emerald-400/10 hover:text-emerald-300';
            default: return 'text-purple-400 hover:bg-purple-400/10 hover:text-purple-300'; // Geral
        }
    };

    return (
        <header className="h-16 bg-base-metallic border-b border-gray-700 flex items-center justify-between px-6 shadow-md relative z-20">
            
            {/* Lado Esquerdo: Seletor de Contexto (Tenant) */}
            <div className="flex items-center">
                {currentTenantId && (
                    <TenantSelector currentTenantId={currentTenantId} />
                )}
            </div>

            {/* Lado Direito: Ações e Perfil */}
            <div className="flex items-center space-x-6">
                
                {/* --- [NOVO] GATILHO DA INTELIGÊNCIA ARTIFICIAL --- */}
                <button 
                    onClick={toggleVisibility}
                    disabled={!isEnabled}
                    className={`
                        relative p-2 rounded-lg transition-all duration-300 flex items-center gap-2
                        ${getAIBtnColor()}
                    `}
                    title={mode === 'EXPANDED' ? "Fechar Assistente" : "Abrir Assistente Inteligente"}
                >
                    <FaRobot className="w-5 h-5" />
                    
                    {/* Animação de "Pulso" discreta quando a IA está atenta (minimizada) e ligada */}
                    {isEnabled && mode === 'MINIMIZED' && (
                        <span className="absolute top-1 right-1.5 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-40"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                        </span>
                    )}
                </button>

                {/* Notificações Clássicas */}
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