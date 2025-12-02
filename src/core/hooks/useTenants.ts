
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/core/services/api';
import { Plan } from '@/core/types/acl';
import { Tenant } from '@/core/types/tenant';
// Importamos os tipos necessários

// Tipagem completa do Tenant para uso no Frontend (inclui a relação 'plan')
interface TenantWithPlan extends Tenant {
    plan: Plan; // O repository retorna o objeto plan completo
}

/**
 * @function useTenants
 * @description Hook customizado para buscar e gerenciar o estado da lista de Tenants.
 * Porquê: Abstrai a lógica de fetching assíncrono, loading e tratamento de erros do Admin Global.
 */
export function useTenants() {
    // Usamos a tipagem estendida para garantir acesso a tenant.plan.name na UI
    const [tenants, setTenants] = useState<TenantWithPlan[]>([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

        const fetchTenants = useCallback(async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                // GET para a rota protegida de listagem de Tenants
                const response = await api.get('/admin/tenants'); 
                
                // Sucesso: Tipamos explicitamente a resposta
                setTenants(response.data as TenantWithPlan[]);
                
            } catch (err: any) {
                console.error("Erro ao buscar Tenants:", err);
                // Erro: pode ser 403 (Permissão negada) ou 500
                const errorMessage = err.response?.data?.message || 
                                     "Falha ao carregar lista de Tenants. Verifique o Backend.";
                setError(errorMessage);
                
            } finally {
                setIsLoading(false);
            }
        },[]);

    useEffect(() => {
        fetchTenants();
    }, [fetchTenants]); // Roda apenas uma vez na montagem

    return { tenants, isLoading, error, refreshData: fetchTenants };
}