// src/hooks/usePlanRules.ts

import { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { PlanFeatureRule, FeatureKey } from '@/types/acl';

// Tipagem da resposta do Backend para PlanFeature
interface PlanRuleResponse {
    id: string;
    planoId: string;
    featureId: string;
    limitValue: number;
    // Adicionamos a feature aqui se a API retornar a relação,
    // mas por enquanto, buscaremos a FeatureKey separadamente para simplificar o backend.
}

/**
 * @function usePlanRules
 * @description Hook customizado para buscar e gerenciar o estado das regras (PlanFeature) de um Plano.
 * Porquê: Isolamos a chamada de leitura de regras para o Modal de Edição de Planos (P4).
 */
export function usePlanRules(planoId?: string) {
    
    const [rules, setRules] = useState<PlanRuleResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // O useCallback é ideal aqui, mas usaremos uma função interna para simplicidade no escopo atual.
    const fetchRules = async () => {
        if (!planoId) return;

        setIsLoading(true);
        setError(null);
        try {
            // GET para a nova rota de leitura de regras do Plano
            const response = await api.get(`/admin/plans/${planoId}/rules`);
            
            // Sucesso
            setRules(response.data as PlanRuleResponse[]);
            
        } catch (err: any) {
            console.error(`Erro ao buscar regras para o Plano ${planoId}:`, err);
            const errorMessage = err.response?.data?.message || "Falha ao carregar regras de Feature.";
            setError(errorMessage);
            
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Recarrega as regras sempre que o planoId mudar
        fetchRules();
    }, [planoId]); 

    // Retorna a função de busca para ser usada no onSuccess do formulário (revalidação)
    return { rules, isLoading, error, fetchRules };
}