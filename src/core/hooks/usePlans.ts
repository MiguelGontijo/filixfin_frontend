
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/core/services/api';
import { Plan } from '@/core/types/acl';
// Usamos o tipo da entidade Plan do Backend (simplificado para o Frontend)

/**
 * @function usePlans
 * @description Hook customizado para buscar e gerenciar o estado da lista de Planos (ACL).
 * Porquê: Abstrai a lógica de fetching assíncrono e tratamento de loading/error dos componentes.
 */
export function usePlans() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    const fetchPlans = useCallback( async () => {
        try {
            setIsLoading(true);
            // GET para a rota protegida que criamos no Backend
            const response = await api.get('/admin/plans'); 
            
            // Sucesso: a resposta deve ser um array de Planos
            setPlans(response.data as Plan[]);
            
        } catch (err) {
            console.error("Erro ao buscar planos:", err);
            // Erro: pode ser 401, 403, ou 500
            setError("Falha ao carregar planos. Verifique a autenticação e o Backend.");
            
        } finally {
            setIsLoading(false);
        }
    },[]);

    useEffect(() => {
        fetchPlans();
    },[fetchPlans]); // Roda apenas uma vez na montagem

    return { plans, isLoading, error, refreshData: fetchPlans };
}