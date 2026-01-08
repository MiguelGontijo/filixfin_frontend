// src/modules/crm/hooks/useDeals.ts

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/core/services/api';
import { CRMDeal, DealStatus } from '../types';
// Importamos tipos genéricos, assumindo que o DTO de update seja um Partial do Create ou similar
// Ajuste conforme sua estrutura real de DTOs no frontend se tiver definido interfaces específicas

export function useDeals(pipelineId?: string) {
    
    const [deals, setDeals] = useState<CRMDeal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- FETCHING ---
    const fetchDeals = useCallback(async () => {
        // Se a lógica exigir que SÓ busque se tiver pipelineId, descomente abaixo:
        // if (!pipelineId) return; 

        setIsLoading(true);
        try {
            // 2. Passamos o pipelineId como parâmetro query string (?pipelineId=...)
            const response = await api.get<CRMDeal[]>('/crm/deals', {
                params: {
                    pipelineId: pipelineId 
                }
            });
            setDeals(response.data);
        } catch (err: any) {
            // setError(err);
            console.error("Erro ao buscar negócios:", err);
        } finally {
            setIsLoading(false);
        }
    }, [pipelineId]); // 3. pipelineId entra na dependência (se mudar o ID, busca de novo)

    // Carrega na montagem
    useEffect(() => {
        fetchDeals();
    }, [fetchDeals]);

    // --- ACTIONS (MUTAÇÕES) ---

    /**
     * @method updateDealStatus
     * @description Move um card de uma coluna para outra (Atualiza Stage/Status).
     * Aplica Optimistic Update para sensação de instantaneidade.
     */
    const updateDealStatus = async (dealId: string, newStageId: string, newStatus?: DealStatus) => {
        // 1. Snapshot do estado anterior (para rollback em caso de erro)
        const previousDeals = [...deals];

        // 2. Atualização Otimista (Frontend reflete mudança na hora)
        setDeals(currentDeals => currentDeals.map(deal => {
            if (deal.id === dealId) {
                return { 
                    ...deal, 
                    currentStageId: newStageId, // Atualiza a coluna visual (Dinâmico)
                    status: newStatus || deal.status // Atualiza o status lógico (Compatibilidade)
                };
            }
            return deal;
        }));

        // 3. Chamada API
        try {
            // Enviamos tanto o stageId (novo) quanto o status (legado/derivado)
            await api.patch(`/crm/deals/${dealId}`, { 
                currentStageId: newStageId,
                status: newStatus
            });
        } catch (err) {
            console.error("Falha ao atualizar status do deal:", err);
            // Rollback silencioso ou com toast (aqui apenas revertemos a lista)
            setDeals(previousDeals);
            // Opcional: setar um erro temporário
            alert("Não foi possível mover o card. Tente novamente.");
        }
    };

    /**
     * @method updateDeal
     * @description Atualização completa dos dados do negócio (Edição via Modal).
     */
    const updateDeal = async (dealId: string, data: any): Promise<CRMDeal> => {
        try {
            const response = await api.patch<CRMDeal>(`/crm/deals/${dealId}`, data);
            const updatedDeal = response.data;

            // Atualiza a lista local com os dados novos vindos do servidor
            setDeals(prev => prev.map(d => d.id === dealId ? updatedDeal : d));
            
            return updatedDeal;
        } catch (err: any) {
            console.error("Erro ao atualizar negócio:", err);
            throw err;
        }
    };

    /**
     * @method createDeal
     * @description Cria um novo negócio e o adiciona à lista local.
     */
    const createDeal = async (data: any): Promise<void> => {
        try {
            const response = await api.post<CRMDeal>('/crm/deals', data);
            const newDeal = response.data;
            
            // Adiciona à lista local
            setDeals(prev => [newDeal, ...prev]);
            return;
        } catch (err: any) {
            console.error("Erro ao criar negócio:", err);
            throw err;
        }
    };

    // --- HELPERS ---

    const getDealsByStatus = (status: DealStatus) => {
        return deals.filter(deal => deal.status === status);
    };

    const getColumnTotal = (status: DealStatus) => {
        return deals
            .filter(deal => deal.status === status)
            .reduce((sum, deal) => sum + Number(deal.value), 0);
    };

    return {
        deals,
        isLoading,
        error,
        refreshDeals: fetchDeals,
        updateDealStatus,
        updateDeal, // <--- NOVO EXPORT
        createDeal,
        getDealsByStatus,
        getColumnTotal
    };
}