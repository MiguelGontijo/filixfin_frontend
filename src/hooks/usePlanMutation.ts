// src/hooks/usePlanMutation.ts

import { useState } from 'react';
import { api } from '@/utils/api';
import { Plan } from '@/types/acl'; // Entidade Plan
import { PlanFeatureRule } from '@/types/acl'; // Para a mutação de regras (P4)

// DTO para Criação (Baseado em CreatePlan.dto.ts do Backend)
interface CreatePlanDto {
    name: string;
    description?: string;
    price: number;
    isActive?: boolean;
}

// DTO para Atualização (Baseado em UpdatePlan.dto.ts do Backend)
interface UpdatePlanDto {
    name?: string;
    description?: string;
    price?: number;
    isActive?: boolean;
}

/**
 * @function usePlanMutation
 * @description Hook de mutação para gerenciar as operações de escrita (C/U/D) sobre Planos.
 * Porquê: Centraliza o tratamento de loading, erros de API e lógica de envio para o módulo ACL.
 */
export function usePlanMutation() {
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- MÉTODOS DE MUTATION ---

    /**
     * @method createPlan
     * @description Envia uma requisição POST para criar um novo Plano.
     */
    const createPlan = async (data: CreatePlanDto): Promise<Plan> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post('/admin/plans', data);
            return response.data as Plan;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Falha ao criar o Plano.';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * @method updatePlan
     * @description Envia uma requisição PATCH para atualizar um Plano existente.
     */
    const updatePlan = async (id: string, data: UpdatePlanDto): Promise<Plan> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.patch(`/admin/plans/${id}`, data);
            return response.data as Plan;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Falha ao atualizar o Plano.';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };
    
    /**
     * @method syncPlanRules
     * @description Envia uma requisição PATCH para sincronizar as regras de Features do Plano.
     * (Implementação para P4)
     */
    const syncPlanRules = async (id: string, rules: PlanFeatureRule[]): Promise<void> => {
        setIsLoading(true);
        setError(null);
        try {
            // Chamada para o novo endpoint transacional do Backend
            await api.patch(`/admin/plans/${id}/rules`, rules);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Falha ao sincronizar as regras do Plano.';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * @method deletePlan
     * @description Envia uma requisição DELETE para remover um Plano.
     */
    const deletePlan = async (id: string): Promise<void> => {
        setIsLoading(true);
        setError(null);
        try {
            // Requisição DELETE para o endpoint
            await api.delete(`/admin/plans/${id}`);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Falha ao deletar o Plano.';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { 
        createPlan, 
        updatePlan, 
        syncPlanRules,
        deletePlan, 
        isLoading, 
        error 
    };
}