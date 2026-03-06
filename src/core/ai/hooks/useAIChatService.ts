import { useState, useCallback } from 'react';
import { api } from '@/core/services/api';
import { useFilixAI } from '../context/FilixAIContext'; // [NOVO] Acesso ao Cérebro Global
import { AIActionProposal } from '../types/dtos/AIActionProposal.dto';
import { AIChatRequestDto } from '../types/dtos/AIChatRequest.dto';
import { AIResponseDto } from '../types/dtos/AIResponse.dto';
import { AIMessage, AIMessageType } from '../types/state/AIState'; // [ATUALIZADO] Importando o novo Crachá (AIMessageType)
import { StorageService } from '@/core/services/StorageService';

/**
 * @interface AIChatSendMessageParams
 * @description Extensão do DTO original para uso interno do Hook.
 * Permite que a UI passe arquivos físicos (File[]), que o Hook converterá em URLs (string[]).
 */
export interface AIChatSendMessageParams extends AIChatRequestDto {
    attachments?: File[];
}

/**
 * @hook useAIChatService
 * @description Camada de Serviço responsável pela comunicação com o Orchestrator V8.
 * Agora capaz de injetar automaticamente metadados contextuais (Sniper).
 * [NOVO] Executa propostas consultivas com segurança máxima (Chave do Cofre).
 * [ATUALIZADO] Atribui o Crachá Visual (type) para garantir a renderização correta.
 * [FASE 2 ATIVA] Orquestra o upload de arquivos via StorageService antes de chamar a IA.
 */
export const useAIChatService = () => {
    // 1. Acesso ao Contexto Global para injeção automática
    const { contextMetadata: globalMetadata } = useFilixAI();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Mapper: Transforma a resposta crua da API no formato de Mensagem da UI.
     * [CORREÇÃO ARQUITETURAL]: Injeta o 'type' baseado no conteúdo do DTO.
     */
    const mapResponseToMessage = (dto: AIResponseDto): AIMessage => {
        const hasProposal = !!dto.proposal;
        
        return {
            id: dto.interactionId || Date.now().toString(),
            role: 'assistant',
            
            // ==========================================
            // O CRACHÁ VISUAL: Define o que a tela vai desenhar
            // ==========================================
            type: hasProposal ? 'PROPOSAL' : 'TEXT', 
            
            content: dto.text,
            timestamp: new Date(),
            proposal: hasProposal ? {
                type: dto.proposal!.type,
                label: dto.proposal!.label,
                actionIntent: dto.proposal!.actionIntent,
                data: dto.proposal!.data
            } : undefined,
            proposalStatus: hasProposal ? 'PENDING' : undefined
        };
    };

    /**
     * Envia uma mensagem de texto natural (e agora arquivos) para o Agente.
     */
    const sendMessage = useCallback(async ({ 
        message, 
        routineKey, 
        tenantId, 
        planId,
        metadata, // Pode vir sobrescrito pelo chamador
        attachments // [NOVO] Array de arquivos físicos vindos do Input
    }: AIChatSendMessageParams): Promise<AIMessage | null> => {
        setIsLoading(true);
        setError(null);

        // LÓGICA DE OURO: Usa o metadata passado OU o global (Sniper Automática)
        const effectiveMetadata = metadata || globalMetadata;
        let uploadedUrls: string[] = [];

        try {
            // ==========================================
            // PASSO 1: O UPLOAD FÍSICO (Se existirem arquivos)
            // ==========================================
            if (attachments && attachments.length > 0) {
                // Delegamos o trabalho pesado ao Carteiro.
                // Criamos uma subpasta organizada baseada na rotina atual.
                uploadedUrls = await StorageService.uploadFiles(attachments, `ai-${routineKey.toLowerCase()}`);
            }

            // ==========================================
            // PASSO 2: A CHAMADA REAL AO BACKEND V8
            // ==========================================
            const requestPayload: AIChatRequestDto = {
                message,
                routineKey,
                tenantId,
                planId,
                
                // [NOVO] Envia a Sniper se ela estiver montada
                metadata: effectiveMetadata,
                
                // Injetamos as URLs que acabaram de ser geradas (ou um array vazio se não houver)
                attachmentsUrls: uploadedUrls.length > 0 ? uploadedUrls : undefined
            };

            console.log("🕵️‍♂️ [DEBUG FRONTEND] Payload sendo enviado para o Backend:", JSON.stringify(requestPayload, null, 2));
            
            // Chamada real ao Backend V8
            const { data } = await api.post<AIResponseDto>('/ai/chat', requestPayload);

            return mapResponseToMessage(data);

        } catch (err: any) {
            console.error('❌ [AI Service] Erro ao enviar mensagem/arquivos:', err);
            const errorMessage = err.response?.data?.message || 'Falha de conexão com a Inteligência.';
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [globalMetadata]); // Importante: recria a função se o contexto global mudar

    /**
     * Envia uma confirmação de execução de proposta para o Agente.
     * @param proposal Os dados visuais da proposta (mantido por integridade)
     * @param interactionId [NOVO] A Chave do Cofre (O ID da mensagem no banco)
     * @param context [OPCIONAL] Mantido apenas para evitar quebras de tipagem em componentes não atualizados
     */
    const confirmAction = useCallback(async (
        proposal: AIActionProposal,
        interactionId: string, 
        context?: Omit<AIChatRequestDto, 'message'> 
    ): Promise<AIMessage | null> => {
        setIsLoading(true);
        setError(null);

        try {
            // [NOVO] Lógica Padrão Ouro: Não enviamos mais textos falsos ou o JSON da proposta.
            // Batemos direto na nossa nova rota segura passando APENAS a Chave do Cofre.
            // O Backend resolve o tenant, o usuário e a segurança através do Token JWT.
            const { data } = await api.post<AIResponseDto>('/ai/execute-proposal', {
                interactionId
            });

            return mapResponseToMessage(data);

        } catch (err: any) {
            console.error('❌ [AI Service] Erro ao confirmar ação:', err);
            const errorMessage = err.response?.data?.message || 'Não foi possível confirmar a ação. A proposta pode ter expirado.';
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

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
            const formattedHistory: AIMessage[] = data.map((msg) => {
                const role = msg.role as 'user' | 'assistant' | 'system';
                const hasProposal = !!msg.proposal;
                
                // ==========================================
                // LÓGICA DO CRACHÁ PARA O HISTÓRICO:
                // ==========================================
                let messageType: AIMessageType = 'TEXT';
                if (role === 'system') messageType = 'SYSTEM_ACTION';
                else if (hasProposal) messageType = 'PROPOSAL';

                return {
                    id: msg.id,
                    role: role,
                    type: messageType, // Injeta a tipagem rigorosa para renderização!
                    content: msg.content,
                    timestamp: new Date(msg.timestamp),
                    proposal: msg.proposal,
                    proposalStatus: msg.proposalStatus
                };
            });

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