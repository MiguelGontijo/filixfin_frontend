'use client';

import { useState, useCallback, useEffect } from 'react';
import { api } from '@/core/services/api';
import { InventoryTransaction } from '../types/InventoryTypes';
import { KardexFilters } from '../types/InventoryFilters'; // 👈 Importação da nova "Casa dos Filtros"

/**
 * @hook useStockMovements
 * @description Motor Analítico de Leitura (Query Operations) para o Kardex.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Enterprise Grade):
 * 1. Arquitetura CQRS (Query): Focado estritamente em buscar o histórico imutável 
 * de movimentações (global ou por produto) e expor o estado para a UI.
 * 2. Master-Detail Ready: Na nova arquitetura, este hook atuará como a "Visão Detail",
 * sendo invocado dinamicamente quando o usuário clicar em um saldo específico.
 */
export function useStockMovements() {
    const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
    
    // Inicia com 'true' para garantir que a UI mostre o Skeleton Loading na montagem,
    // oferecendo uma transição suave e eliminando "piscadas" de listas vazias.
    const [isLoading, setIsLoading] = useState(true); 
    const [error, setError] = useState<string | null>(null);

    /**
     * @method fetchMovements
     * @description O núcleo de busca do histórico (Extrato do Kardex) no backend.
     * Agora fortemente tipado com `KardexFilters`, aceitando paginação, 
     * range de datas, tipos de transação e IDs específicos (Produto/Depósito).
     * @param filters Objeto flexível de filtros para a query do TypeORM.
     */
    const fetchMovements = useCallback(async (filters?: KardexFilters) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get<InventoryTransaction[]>('/inventory/kardex', {
                params: filters
            });
            setTransactions(response.data);
        } catch (err: any) {
            console.error('❌ [useStockMovements] Erro ao buscar Kardex:', err);
            const msg = err.response?.data?.message || 'Falha ao carregar o histórico de movimentações.';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // =========================================================================
    // 🚀 O GATILHO DE IGNIÇÃO AUTOMÁTICO (Efeito Colateral Seguro)
    // Dispara a busca global assim que o módulo/componente é montado.
    // Na arquitetura Master-Detail, isso garante que o painel lateral já abra
    // buscando os dados caso o componente seja renderizado condicionalmente.
    // =========================================================================
    useEffect(() => {
        fetchMovements();
    }, [fetchMovements]);

    /**
     * @method fetchKardex
     * @description Facade (Fachada) mantida para retrocompatibilidade e conveniência.
     * Um atalho limpo e semântico para buscar a timeline de uma variante específica
     * sem precisar instanciar o objeto de filtros manualmente.
     * @param variantId O UUID da variação do produto.
     */
    const fetchKardex = useCallback(async (variantId: string) => {
        if (!variantId) return;
        return fetchMovements({ variantId });
    }, [fetchMovements]);

    /**
     * @method clearTransactions
     * @description Utilitário de Limpeza (Garbage Collection visual). 
     * Limpa o estado atual da lista. Vital para evitar "fantasmas" na UI 
     * ao trocar rapidamente entre a visão detalhada de dois produtos diferentes.
     */
    const clearTransactions = useCallback(() => {
        setTransactions([]);
        setError(null);
    }, []);

    return {
        transactions,
        isLoading,
        error,
        fetchMovements,
        fetchKardex,
        clearTransactions
    };
}