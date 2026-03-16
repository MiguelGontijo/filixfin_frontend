import { useState, useEffect, useCallback } from 'react';
import { api } from '@/core/services/api';

// --- Contratos de Domínio (CRM) ---
import { CRMDeal, DealStatus } from '../types';

// --- Contratos Globais (Shared Kernel) ---
import { PaginatedResponse } from '@/core/types/api';

/**
 * ============================================================================
 * 📊 HOOK: useDeals (Padrão CQRS - Camada de Query/Leitura)
 * @description Responsável estritamente por buscar, tipar e derivar o estado 
 * das Oportunidades (Deals) para a UI.
 * * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Enterprise Grade):
 * 1. Segregação CQRS: Nenhuma mutação (POST/PATCH/DELETE) existe aqui. 
 * O hook é leve, focado na leitura e renderização.
 * 2. Type-Safety Resiliente (Anti-Crash): Utiliza o contrato genérico 
 * `PaginatedResponse<T>` aliado ao `CRMDeal[]`. Isso ensina o TypeScript a 
 * lidar tanto com listas simples quanto com respostas paginadas do NestJS, 
 * blindando o frontend contra o erro fatal `data.map is not a function`.
 * ============================================================================
 */
export function useDeals(pipelineId?: string) {
    
    // Estado principal fortemente tipado com a nossa Entidade
    const [deals, setDeals] = useState<CRMDeal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ========================================================================
    // 📡 FETCHING (Motor de Busca de Dados)
    // ========================================================================
    const fetchDeals = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            // 💡 O CONTRATO DE OURO: 
            // Avisamos ao Axios e ao TypeScript que o Backend pode devolver 
            // ou a lista direta (CRMDeal[]) ou o objeto paginado (PaginatedResponse).
            const response = await api.get<PaginatedResponse<CRMDeal> | CRMDeal[]>('/crm/deals', {
                params: {
                    pipelineId: pipelineId 
                }
            });

            // 🛡️ A VACINA DE EXTRAÇÃO SEGURA:
            // Como o TypeScript agora conhece a interface PaginatedResponse, 
            // ele entende perfeitamente a leitura da propriedade '.data' abaixo.
            const fetchedData = Array.isArray(response.data) 
                ? response.data 
                : response.data?.data || [];

            // Salvamos apenas o Array puro no estado, protegendo a CrudTable
            setDeals(fetchedData);
            
        } catch (err: any) {
            console.error("❌ [useDeals] Falha na sincronização de oportunidades:", err);
            // Extração padronizada de mensagem de erro da API
            const msg = err.response?.data?.message || 'Não foi possível carregar a lista de oportunidades.';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    }, [pipelineId]); // O hook reage e refaz a busca se o ID do funil mudar

    // ========================================================================
    // 🔄 CICLO DE VIDA (Lifecycle)
    // ========================================================================
    useEffect(() => {
        fetchDeals();
    }, [fetchDeals]);

    // ========================================================================
    // 🧮 HELPERS (Derivação de Dados em Memória)
    // ========================================================================

    /**
     * @method getDealsByStatus
     * @description Isola os negócios por coluna (status). 
     * Envolvido em useCallback para otimização de renderização no Kanban (evita re-renders).
     */
    const getDealsByStatus = useCallback((status: DealStatus) => {
        return deals.filter(deal => deal.status === status);
    }, [deals]);

    /**
     * @method getColumnTotal
     * @description Motor matemático que soma a previsão financeira de uma coluna específica.
     */
    const getColumnTotal = useCallback((status: DealStatus) => {
        return deals
            .filter(deal => deal.status === status)
            .reduce((sum, deal) => sum + Number(deal.value || 0), 0);
    }, [deals]);

    return {
        // 1. Estados Expostos
        deals,
        isLoading,
        error,
        
        // 2. Gatilhos de Sincronização
        refreshDeals: fetchDeals, 
        
        // 3. Funções Derivadas (Helpers para a UI)
        getDealsByStatus,
        getColumnTotal,

        // 💡 4. A PONTE DO KANBAN (Optimistic UI):
        // Expor a função nativa do setState permite que o Kanban mova os cards 
        // visualmente na mesma hora, enquanto o `useDealMutation` salva no backend em background.
        setDeals
    };
}