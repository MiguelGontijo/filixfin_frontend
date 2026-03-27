import { useState } from 'react';
import { api } from '@/core/services/api';
import { CRMDeal, DealStatus } from '../../domain/types';

/**
 * ============================================================================
 * 🛠️ HOOK: useDealMutation (CQRS - Command)
 * @description Hook de Mutação exclusivo para Operações de Escrita em Oportunidades.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Enterprise Grade):
 * 1. Fail-Fast: Lança erros (throw err) imediatamente para bloquear o fechamento 
 * prematuro de modais (CrudForm) caso a transação falhe.
 * 2. Error Extraction: Intercepta respostas de erro HTTP (ex: 400 Bad Request do NestJS) 
 * e formata para o motor visual exibir tarjas vermelhas elegantes.
 * 3. Restful Alignment: Separação estrita de rotas (POST, PATCH, DELETE).
 * ============================================================================
 */
export function useDealMutation() {
    const [isLoading, setIsLoading] = useState(false);
    
    // Estado de erro capturado (O motor CrudLayout escuta ativamente isso)
    const [error, setError] = useState<string | null>(null);

    /**
     * @helper extractError
     * @description Tradutor de Erros. Vasculha as camadas do Axios e do NestJS 
     * para encontrar o real motivo da falha (ex: regras de negócio violadas).
     */
    const extractError = (err: any, fallbackMessage: string): string => {
        console.error(`❌ [useDealMutation] Erro Crítico:`, err);
        
        // Padrão de exceção do NestJS: { message: '...', statusCode: 400 }
        const backendMessage = err.response?.data?.message;
        
        // Se for um erro de validação (class-validator), o Nest retorna um array de strings
        if (Array.isArray(backendMessage)) {
            return backendMessage[0];
        }
        
        return backendMessage || fallbackMessage;
    };

    /**
     * @method createDeal
     * @description Insere uma nova Oportunidade no banco de dados.
     */
    const createDeal = async (data: Partial<CRMDeal>): Promise<CRMDeal> => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await api.post<CRMDeal>('/crm/deals', data);
            return response.data;
        } catch (err: any) {
            const msg = extractError(err, 'Falha de conexão ao tentar criar a oportunidade.');
            setError(msg);
            throw err; // Re-lançamos para o CrudForm saber que o form "quebrou"
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * @method updateDeal
     * @description Atualiza parcialmente os dados de uma oportunidade (Edição Completa).
     */
    const updateDeal = async (id: string, data: Partial<CRMDeal>): Promise<CRMDeal> => {
        setIsLoading(true);
        setError(null);
        
        try {
            // Utilizamos PATCH pois estamos enviando apenas o que mudou
            const response = await api.patch<CRMDeal>(`/crm/deals/${id}`, data);
            return response.data;
        } catch (err: any) {
            const msg = extractError(err, 'Falha ao atualizar os dados da oportunidade.');
            setError(msg);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * @method updateDealStatus
     * @description Rota rápida exclusiva para o Kanban. Atualiza apenas o posicionamento 
     * (Funil/Etapa) e Status sem precisar enviar o payload inteiro da Oportunidade.
     */
    const updateDealStatus = async (id: string, newStageId: string, newStatus?: DealStatus): Promise<CRMDeal> => {
        setIsLoading(true);
        setError(null);

        try {
            const payload = { currentStageId: newStageId, ...(newStatus && { status: newStatus }) };
            const response = await api.patch<CRMDeal>(`/crm/deals/${id}/status`, payload);
            return response.data;
        } catch (err: any) {
            const msg = extractError(err, 'Não foi possível mover a oportunidade de coluna.');
            setError(msg);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * @method deleteDeal
     * @description Exclusão da oportunidade. (Recomendado o uso de Soft Delete no Backend).
     */
    const deleteDeal = async (id: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        
        try {
            await api.delete(`/crm/deals/${id}`);
            return true;
        } catch (err: any) {
            const msg = extractError(err, 'Erro ao tentar inativar ou excluir a oportunidade.');
            setError(msg);
            throw err; 
        } finally {
            setIsLoading(false);
        }
    };

    return {
        createDeal,
        updateDeal,
        updateDealStatus,
        deleteDeal,
        isLoading,
        error // O Motor Visual (CrudLayout) fará o binding aqui
    };
}