// ===== FILE: src/modules/inventory/hooks/useBalances.ts =====

'use client';

import { useState, useCallback, useEffect } from 'react';
import { api } from '@/core/services/api';

// ⚠️ Nota: Adicionaremos essas tipagens no `InventoryTypes.ts` no próximo passo.
import { InventoryStock } from '../types/InventoryTypes';
import { BalancesFilters } from '../types/InventoryFilters';

/**
 * @hook useBalances
 * @description O Motor de Consulta de Posição de Estoque (Visão Master).
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Enterprise Grade):
 * 1. Responsabilidade Única (CQRS - Query): Este hook não salva e não deleta. 
 * Ele apenas lê a posição atual do estoque (Fotografia do momento).
 * 2. Prevenção de Falsos Positivos: Inicia com `isLoading = true` para que a UI 
 * exiba o Skeleton/Spinner imediatamente, evitando a temida "piscada de tela vazia".
 * 3. Memoização Segura: Uso de `useCallback` para evitar re-renderizações infinitas
 * caso este hook seja consumido em listas de dependência (useEffect).
 */
export function useBalances() {
    const [balances, setBalances] = useState<InventoryStock[]>([]);
    
    // Começamos com 'true' para garantir que o CrudTable mostre o loading na montagem inicial
    const [isLoading, setIsLoading] = useState(true); 
    const [error, setError] = useState<string | null>(null);

    /**
     * @method fetchBalances
     * @description Busca a lista de saldos consolidados no backend.
     * Suporta filtros dinâmicos para a Inteligência Artificial ou buscas refinadas.
     * @param filters Objeto contendo parâmetros opcionais (warehouseId, variantId).
     */
    const fetchBalances = useCallback(async (filters?: BalancesFilters) => {
        setIsLoading(true);
        setError(null);
        
        try {
            // Chamada à nova rota Master do backend que criamos juntos
            const response = await api.get<InventoryStock[]>('/inventory/balances', {
                params: filters
            });
            setBalances(response.data);
        } catch (err: any) {
            console.error('❌ [useBalances] Erro ao buscar saldos de estoque:', err);
            const msg = err.response?.data?.message || 'Falha ao carregar a posição atual do estoque.';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // =========================================================================
    // 🚀 O GATILHO DE IGNIÇÃO AUTOMÁTICO
    // Dispara a busca global de saldos assim que o módulo de Inventário é montado.
    // =========================================================================
    useEffect(() => {
        fetchBalances();
    }, [fetchBalances]);

    /**
     * @method clearBalances
     * @description Utilitário de Limpeza. Ideal para desmontagem de componentes 
     * complexos, prevenindo vazamento de memória (Memory Leaks).
     */
    const clearBalances = useCallback(() => {
        setBalances([]);
        setError(null);
    }, []);

    return {
        balances,
        isLoading,
        error,
        fetchBalances,
        clearBalances
    };
}