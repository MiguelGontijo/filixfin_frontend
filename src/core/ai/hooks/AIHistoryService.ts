import { api } from '@/core/services/api';
import { AIMessage, AIMessageType } from '../types/state/AIState';

/**
 * @class AIHistoryService
 * @description Serviço Puro de Leitura (Read-Only).
 * Faz a chamada HTTP e traduz o DTO do Backend para o formato visual do Frontend.
 * NÃO guarda estado local (Stateless), evitando conflitos com o Contexto Global.
 */
export const fetchAIHistory = async (routineKey: string): Promise<AIMessage[]> => {
    
    // console.log('FRONT [1]: Disparando fetchAIHistory (Serviço Puro) para a rotina:', routineKey);
    
    if (!routineKey) return [];

    try {
        const response = await api.get<any[]>(`/ai/history/${routineKey}`);
        
        // console.log('FRONT [2]: Resposta da API recebida. Mapeando crachás...');

        const formattedHistory: AIMessage[] = response.data.map((msg: any) => {
            const role = msg.role as 'user' | 'assistant' | 'system';
            const hasProposal = !!msg.proposal;
            
            // Lógica do Crachá Visual
            let messageType: AIMessageType = 'TEXT';
            if (role === 'system') messageType = 'SYSTEM_ACTION';
            else if (hasProposal) messageType = 'PROPOSAL';

            return {
                id: msg.id,
                role: role,
                type: messageType,
                content: msg.content,
                timestamp: new Date(msg.timestamp),
                toolUsed: msg.toolUsed,
                proposal: msg.proposal,
                proposalStatus: msg.proposalStatus
            };
        });

        return formattedHistory;

    } catch (err: any) {
        console.error(`❌ [AIHistoryService] Erro ao carregar histórico:`, err);
        throw err; // Repassa o erro para quem chamou (O Contexto) lidar com ele
    }
};