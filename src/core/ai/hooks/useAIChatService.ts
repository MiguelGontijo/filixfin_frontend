// ===== FILE: src/core/ai/hooks/useAIChatService.ts =====

import { useState, useCallback } from 'react';
import { api } from '@/core/services/api'; // Ajuste o path conforme sua estrutura de services
import { 
    AIMessage, 
    AIActionProposal, 
    AIContextScope, 
    UIActionType 
} from '../types/AITypes';

// --- DTOs do Backend (Espelho do que vem da API) ---
// Definimos aqui localmente ou em um arquivo de DTOs compartilhados
interface AIResponseDto {
    text: string;
    interactionId?: string;
    toolUsed?: string;
    proposal?: {
        ui_action: UIActionType;
        label: string;
        actionIntent: string;
        data: any;
    };
}

interface SendMessageParams {
    message: string;
    scope: AIContextScope;
    // IDs contextuais necessários para a validação V8 no backend
    tenantId: string;
    planId: string; 
}

/**
 * @hook useAIChatService
 * @description Camada de Serviço responsável pela comunicação com o Orchestrator V8.
 * Realiza o transporte, tratamento de erros e mapeamento de DTOs -> Domain Objects.
 */
export const useAIChatService = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Mapper: Transforma a resposta crua da API no formato de Mensagem da UI.
     */
    const mapResponseToMessage = (dto: AIResponseDto): AIMessage => {
        return {
            id: dto.interactionId || Date.now().toString(),
            role: 'assistant',
            content: dto.text,
            timestamp: new Date(),
            // Se vier proposta, acoplamos ela na mensagem
            proposal: dto.proposal ? {
                ui_action: dto.proposal.ui_action,
                label: dto.proposal.label,
                actionIntent: dto.proposal.actionIntent,
                data: dto.proposal.data
            } : undefined,
            // Se tiver proposta, o status inicial é PENDING
            proposalStatus: dto.proposal ? 'PENDING' : undefined
        };
    };

    /**
     * Envia uma mensagem de texto natural para o Agente.
     */
    const sendMessage = useCallback(async ({ 
        message, 
        scope, 
        tenantId, 
        planId 
    }: SendMessageParams): Promise<AIMessage | null> => {
        setIsLoading(true);
        setError(null);

        try {
            // Chamada real ao Backend V8
            const { data } = await api.post<AIResponseDto>('/ai/chat', {
                message,
                routineKey: scope, // Mapeamos scope -> routineKey
                tenantId,
                planId // Injeção de dependência para evitar queries extras no backend
            });

            return mapResponseToMessage(data);

        } catch (err: any) {
            console.error('❌ [AI Service] Erro ao enviar mensagem:', err);
            const errorMessage = err.response?.data?.message || 'Falha de conexão com a Inteligência.';
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Envia uma confirmação de execução (Quando o usuário clica em APROVAR no Card).
     * @param proposal A proposta que foi aprovada.
     * @param context Os dados de contexto (tenant, scope) para manter a sessão.
     */
    const confirmAction = useCallback(async (
        proposal: AIActionProposal,
        context: Omit<SendMessageParams, 'message'>
    ): Promise<AIMessage | null> => {
        setIsLoading(true);
        setError(null);

        try {
            // Estratégia V8:
            // Enviamos uma mensagem imperativa oculta para forçar a execução no modo autônomo
            // ou confirmar a intenção no modo consultivo.
            const commandMessage = `[SYSTEM_CONFIRMATION]: O usuário APROVOU a execução da ferramenta '${proposal.actionIntent}'. Prossiga com a execução usando os dados fornecidos anteriormente.`;

            const { data } = await api.post<AIResponseDto>('/ai/chat', {
                message: commandMessage,
                routineKey: context.scope,
                tenantId: context.tenantId,
                planId: context.planId,
                // Opcional: Flag para avisar o backend que é uma confirmação explícita
                overrides: {
                    mode: 'AUTONOMOUS' // Forçamos autonomia neste request específico para ele executar
                }
            });

            return mapResponseToMessage(data);

        } catch (err: any) {
            console.error('❌ [AI Service] Erro ao confirmar ação:', err);
            setError('Não foi possível processar a confirmação.');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        sendMessage,
        confirmAction,
        isLoading,
        error
    };
};