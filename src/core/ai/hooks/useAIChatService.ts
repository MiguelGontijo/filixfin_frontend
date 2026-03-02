import { useState, useCallback } from 'react';
import { api } from '@/core/services/api';
import { useFilixAI } from '../context/FilixAIContext'; // [NOVO] Acesso ao Cérebro Global
import { AIActionProposal } from '../types/dtos/AIActionProposal.dto';
import { AIChatRequestDto } from '../types/dtos/AIChatRequest.dto';
import { AIResponseDto } from '../types/dtos/AIResponse.dto';
import { AIMessage } from '../types/state/AIState';



/**
 * @hook useAIChatService
 * @description Camada de Serviço responsável pela comunicação com o Orchestrator V8.
 * Agora capaz de injetar automaticamente metadados contextuais (Sniper).
 */
export const useAIChatService = () => {
    // 1. Acesso ao Contexto Global para injeção automática
    const { contextMetadata: globalMetadata } = useFilixAI();

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
            proposal: dto.proposal ? {
                type: dto.proposal.type,
                label: dto.proposal.label,
                actionIntent: dto.proposal.actionIntent,
                data: dto.proposal.data
            } : undefined,
            proposalStatus: dto.proposal ? 'PENDING' : undefined
        };
    };

    /**
     * Envia uma mensagem de texto natural para o Agente.
     */
    const sendMessage = useCallback(async ({ 
        message, 
        routineKey, 
        tenantId, 
        planId,
        metadata // Pode vir sobrescrito pelo chamador
    }: AIChatRequestDto): Promise<AIMessage | null> => {
        setIsLoading(true);
        setError(null);

        // LÓGICA DE OURO: Usa o metadata passado OU o global (Sniper Automática)
        const effectiveMetadata = metadata || globalMetadata;

        try {
            // Chamada real ao Backend V8
            const { data } = await api.post<AIResponseDto>('/ai/chat', {
                message,
                routineKey,
                tenantId,
                planId,
                
                // [NOVO] Envia a Sniper se ela estiver montada
                metadata: effectiveMetadata 
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
    }, [globalMetadata]); // Importante: recria a função se o contexto global mudar

    /**
     * Envia uma confirmação de execução.
     */
    const confirmAction = useCallback(async (
        proposal: AIActionProposal,
        context: Omit<AIChatRequestDto, 'message'>
    ): Promise<AIMessage | null> => {
        setIsLoading(true);
        setError(null);

        // Lógica de Ouro também na confirmação
        const effectiveMetadata = context.metadata || globalMetadata;

        try {
            const commandMessage = `[SYSTEM_CONFIRMATION]: O usuário APROVOU a execução da ferramenta '${proposal.actionIntent}'. Prossiga com a execução.`;

            const { data } = await api.post<AIResponseDto>('/ai/chat', {
                message: commandMessage,
                routineKey: context.routineKey,
                tenantId: context.tenantId,
                planId: context.planId,
                metadata: effectiveMetadata, // Mantém o contexto durante a execução
                overrides: {
                    mode: 'AUTONOMOUS'
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
    }, [globalMetadata]);

    /**
     * Busca o histórico de conversas da rotina atual no banco de dados.
     * @param routineKey A chave da rotina (ex: AI_SALES_AGENT)
     */
    const loadHistory = useCallback(async (routineKey: string): Promise<AIMessage[]> => {
        setIsLoading(true);
        setError(null);

        try {
            // Chama a nova rota GET que criamos no Backend
            const { data } = await api.get<any[]>(`/ai/history/${routineKey}`);

            // Mapeia o JSON bruto do Backend para a tipagem rigorosa do Frontend (AIMessage)
            const formattedHistory: AIMessage[] = data.map((msg) => ({
                id: msg.id,
                role: msg.role as 'user' | 'assistant',
                content: msg.content,
                timestamp: new Date(msg.timestamp)
            }));

            return formattedHistory;

        } catch (err: any) {
            console.error('❌ [AI Service] Erro ao carregar histórico:', err);
            // Não estouramos erro na tela para não travar o usuário, apenas retornamos vazio
            return [];
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        sendMessage,
        confirmAction,
        loadHistory,
        isLoading,
        error
    };
  
};