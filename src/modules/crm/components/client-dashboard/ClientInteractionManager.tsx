import React, { useEffect } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa'; // Ícone para erro

// 1. Importa a Lógica (Hook)
import { useClientTimeline } from '../../hooks/useClientTimeline';

// 2. Importa a Visualização (Timeline)
import { InteractionTimeline } from './InteractionTimeline';

// 3. Importa a Entrada Unificada (que já criamos)
import { AgentInput } from '@/core/ai/components/AgentInput';

// 4. Importa Tipos necessários
import { InteractionType } from '../../types';

interface ClientInteractionManagerProps {
    clientId: string;
}

export const ClientInteractionManager: React.FC<ClientInteractionManagerProps> = ({ clientId }) => {
    // Inicializa o Hook
    const { 
        interactions, 
        loading, 
        analyzing, 
        error, 
        fetchTimeline, 
        registerInteraction 
    } = useClientTimeline(clientId);

    // Carrega os dados ao montar o componente
    useEffect(() => {
        fetchTimeline();
    }, [fetchTimeline]);

    /**
     * Handler para quando o usuário envia algo pelo AgentInput.
     * Aqui fazemos a ponte entre o componente genérico de Input e a lógica específica do CRM.
     */
    const handleAgentSend = async (text: string, attachments?: File[]) => {
        // Por padrão, enviamos como NOTE.
        // O Backend/IA que se vire para reclassificar se for um 'Compromisso' ou 'Ligação'.
        // Isso simplifica a vida do usuário (ele só digita).
        await registerInteraction(text, InteractionType.NOTE);
    };

    return (
        <div className="flex flex-col h-full space-y-6">
            
            {/* --- ÁREA DE INPUT (O AGENTE) --- */}
            <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50">
                <h3 className="text-sm font-medium text-gray-400 mb-3 ml-1">
                    Novo Registro / Comando para IA
                </h3>
                
                {/* Reusando o componente AgentInput no modo 'compose' (bloco de notas) */}
                <AgentInput 
                    mode="compose"
                    placeholder="Ex: Liguei para o cliente e ele pediu para retornar terça..."
                    onSend={handleAgentSend}
                    isLoading={analyzing} // Trava o input enquanto a IA processa
                />
                
                {/* Feedback visual se a IA estiver pensando */}
                {analyzing && (
                    <div className="mt-2 text-xs text-accent-primary animate-pulse ml-1">
                        ✨ A IA está analisando sua nota e atualizando o cliente...
                    </div>
                )}
            </div>

            {/* --- TRATAMENTO DE ERRO --- */}
            {error && (
                <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400">
                    <FaExclamationTriangle />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            {/* --- LINHA DO TEMPO --- */}
            <div className="flex-1 min-h-0">
                <InteractionTimeline 
                    interactions={interactions} 
                    loading={loading} 
                />
            </div>
        </div>
    );
};