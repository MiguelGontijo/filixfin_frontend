// ===== FILE: src/modules/crm/components/kanban/EmptyPipelineState.tsx =====

import React from 'react';
import { FaMagic, FaStream, FaArrowRight } from 'react-icons/fa';

interface EmptyPipelineStateProps {
    /**
     * Ação para acionar o Agente de IA com o prompt de criação padrão.
     */
    onGenerateWithAI: () => void;

    /**
     * Ação para abrir o Drawer de configuração manual.
     */
    onManualConfig: () => void;
}

/**
 * @component EmptyPipelineState
 * @description Estado zero do Kanban. Exibido quando não há funis ou estágios configurados.
 * Oferece dois caminhos: Geração Automática (IA) ou Configuração Manual.
 */
export const EmptyPipelineState: React.FC<EmptyPipelineStateProps> = ({ 
    onGenerateWithAI, 
    onManualConfig 
}) => {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 animate-fade-in">
            
            {/* Ícone Central Destacado */}
            <div className="relative mb-8 group cursor-default">
                <div className="absolute inset-0 bg-accent-primary/20 blur-xl rounded-full opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
                <div className="relative bg-gradient-to-br from-gray-800 to-base-dark p-6 rounded-2xl border border-gray-700 shadow-2xl">
                    <FaStream className="w-12 h-12 text-gray-400 group-hover:text-accent-secondary transition-colors duration-300" />
                    
                    {/* Badge flutuante indicando IA */}
                    <div className="absolute -top-2 -right-2 bg-accent-primary text-white p-1.5 rounded-lg shadow-lg border border-orange-400/50 animate-bounce-slow">
                        <FaMagic size={12} />
                    </div>
                </div>
            </div>

            {/* Texto de Boas-vindas */}
            <h2 className="text-2xl font-bold text-white mb-3 text-center tracking-tight">
                Vamos organizar suas vendas?
            </h2>
            <p className="text-gray-400 text-center max-w-md mb-10 leading-relaxed text-sm">
                Você ainda não tem um funil configurado. O CRM precisa de etapas (ex: Novo, Negociação) para organizar seus negócios.
            </p>

            {/* Área de Ações */}
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                
                {/* AÇÃO PRINCIPAL: IA MAGIC */}
                <button 
                    onClick={onGenerateWithAI}
                    className="flex-1 group relative overflow-hidden rounded-xl bg-accent-primary hover:bg-orange-600 transition-all duration-300 shadow-lg shadow-orange-900/20 p-1"
                >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <div className="relative flex items-center justify-center gap-3 px-4 py-3 h-full">
                        <FaMagic className="text-white animate-pulse" />
                        <div className="text-left">
                            <span className="block text-xs font-bold text-orange-200 uppercase tracking-wider">Recomendado</span>
                            <span className="block text-sm font-bold text-white">Criar Funil com IA</span>
                        </div>
                        <FaArrowRight className="ml-auto text-white/50 group-hover:translate-x-1 transition-transform" />
                    </div>
                </button>

                {/* AÇÃO SECUNDÁRIA: MANUAL */}
                <button 
                    onClick={onManualConfig}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-700 hover:border-gray-500 bg-gray-800/50 hover:bg-gray-800 text-gray-300 hover:text-white transition-all font-medium text-sm group"
                >
                    <FaStream className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                    Configurar Manualmente
                </button>
            </div>

            {/* Dica de Rodapé */}
            <div className="mt-8 text-xs text-gray-600 text-center">
                <p>A Inteligência Artificial pode criar um fluxo padrão de vendas em segundos.</p>
            </div>

        </div>
    );
};