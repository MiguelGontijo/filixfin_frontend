import { useState } from 'react';
import { api } from '@/core/services/api';

// --- Contratos de Domínio (Mundo 2) ---
import { IPipeline, ICreatePipelineDTO, IUpdatePipelineDTO } from '../../domain/types/pipeline.types';

/**
 * ============================================================================
 * 🛠️ HOOK: usePipelineMutation (CQRS - Command)
 * @description Hook especializado em operações de escrita (Mutação) para Funis.
 * Centraliza a lógica de criação, atualização e tratamento de erros globais.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Enterprise Grade):
 * 1. Fail-Fast Strategy: Lança exceções (throw) para que o Motor CRUD impeça o 
 * fechamento do formulário em caso de erro na API.
 * 2. Backend Sync: Extrai mensagens de erro complexas vindas do NestJS para 
 * exibição amigável na UI.
 * 3. Type Consistency: Garante que os retornos sejam compatíveis com CrudHooks.
 * ============================================================================
 */
export function usePipelineMutation() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * @helper extractError
     * @description Tradutor de falhas da API. Converte objetos de erro complexos
     * em mensagens legíveis pelo usuário final.
     */
    const extractError = (err: any, fallback: string): string => {
        console.error("❌ [usePipelineMutation] Falha na operação:", err);
        const backendMessage = err.response?.data?.message;
        
        if (Array.isArray(backendMessage)) return backendMessage[0];
        return backendMessage || fallback;
    };

    /**
     * @method createPipeline
     * @description Dispara a persistência de um novo funil com suas etapas.
     */
    const createPipeline = async (data: ICreatePipelineDTO): Promise<IPipeline> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post<IPipeline>('/crm/pipelines', data);
            return response.data;
        } catch (err: any) {
            const msg = extractError(err, 'Não foi possível criar o novo funil de vendas.');
            setError(msg);
            throw err; // Propaga para o formulário permanecer aberto
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * @method updatePipeline
     * @description Atualiza dados estruturais ou ordens das etapas de um funil existente.
     */
    const updatePipeline = async (id: string, data: IUpdatePipelineDTO): Promise<IPipeline> => {
        setIsLoading(true);
        setError(null);
        try {
            // Garantimos que o ID do parâmetro prevalece sobre o corpo para integridade RESTful
            const response = await api.put<IPipeline>(`/crm/pipelines/${id}`, { ...data, id });
            return response.data;
        } catch (err: any) {
            const msg = extractError(err, 'Falha ao atualizar a configuração do funil.');
            setError(msg);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * @method deletePipeline
     * @description Remove o funil do sistema (Implementar Soft Delete no Backend se possível).
     */
    const deletePipeline = async (id: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            await api.delete(`/crm/pipelines/${id}`);
            return true;
        } catch (err: any) {
            const msg = extractError(err, 'Erro ao tentar excluir o funil.');
            setError(msg);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        createPipeline,
        updatePipeline,
        deletePipeline,
        isLoading,
        error
    };
}