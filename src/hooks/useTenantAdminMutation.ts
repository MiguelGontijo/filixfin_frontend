// src/hooks/useTenantAdminMutation.ts

import { useState } from 'react';
import { api } from '@/utils/api';
import { UpdateTenantAdminDto, TenantResponse } from '@/types/tenant'; // Entidade Tenant


/**
 * @function useTenantAdminMutation
 * @description Hook de mutação para gerenciar as operações de escrita (Update/Soft Delete)
 * sobre Tenants, usado exclusivamente pelo Admin Global.
 * Porquê: Centraliza o tratamento de loading, erros de API e lógica de envio para o módulo Tenant.
 */
export function useTenantAdminMutation() {
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * @method updateTenant
     * @description Envia uma requisição PATCH para atualizar um Tenant existente.
     */
    const updateTenant = async (id: string, data: UpdateTenantAdminDto): Promise<TenantResponse> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.patch(`/admin/tenants/${id}`, data);
            return response.data as TenantResponse;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Falha ao atualizar o Tenant.';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };
    
    /**
     * @method toggleActiveStatus
     * @description Alterna o status isActive de um Tenant (Soft Delete).
     */
    const toggleActiveStatus = async (id: string, currentStatus: boolean): Promise<TenantResponse> => {
        // Envia apenas a propriedade isActive com o valor invertido.
        const newStatus = !currentStatus;
        
        return updateTenant(id, { isActive: newStatus });
    };

    return { 
        updateTenant, 
        toggleActiveStatus,
        isLoading, 
        error 
    };
}