// src/modules/inventory/hooks/useStockMovements.ts

'use client';

import { useState, useCallback } from 'react';
import { api } from '@/core/services/api';
import { 
    InventoryTransaction, 
    RegisterMovementInput,
    MovementFilter // Importando o filtro que definimos no InventoryTypes.ts
} from '../types/InventoryTypes';

/**
 * Hook para gerenciamento de Movimentações de Estoque.
 * Responsável por registrar entradas/saídas e consultar o histórico (Kardex).
 */
export function useStockMovements() {
    const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Registra uma nova movimentação (Entrada ou Saída).
     * POST /inventory/movements
     */
    const registerMovement = async (input: RegisterMovementInput) => {
        setIsLoading(true);
        try {
            const response = await api.post<InventoryTransaction>('/inventory/movements', input);
            
            // Opcional: Atualização otimista da lista se estiver vendo o mesmo item
            setTransactions((prev) => {
                if (prev.length > 0 && prev[0].variantId === input.variantId) {
                    return [response.data, ...prev];
                }
                // Se for visão global, adiciona no topo também
                if (!input.variantId || prev.length > 0) {
                     return [response.data, ...prev];
                }
                return prev;
            });

            return response.data;
        } catch (error) {
            console.error('Erro ao registrar movimentação:', error);
            throw error; 
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Busca o histórico (Kardex).
     * Agora suporta busca Global (sem ID) ou Específica (com ID/Filtros).
     * GET /inventory/kardex
     */
    const fetchMovements = useCallback(async (filters?: MovementFilter) => {
        setIsLoading(true);
        try {
            // Alteração: Usamos query params para flexibilidade (Global vs Produto Único)
            // O backend deve suportar receber os filtros via query string
            const response = await api.get<InventoryTransaction[]>('/inventory/kardex', {
                params: filters
            });
            setTransactions(response.data);
        } catch (error) {
            console.error('Erro ao buscar movimentações:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Mantive a assinatura antiga para compatibilidade, mas redirecionando para a nova lógica.
     * Isso evita quebrar telas que já usam fetchKardex(id).
     */
    const fetchKardex = useCallback(async (variantId: string) => {
        if (!variantId) return;
        return fetchMovements({ variantId });
    }, [fetchMovements]);

    /**
     * Limpa o estado atual das transações
     */
    const clearTransactions = useCallback(() => {
        setTransactions([]);
    }, []);

    return {
        transactions,
        isLoading,
        registerMovement,
        fetchMovements, // Nova função flexível
        fetchKardex,    // Mantida para retrocompatibilidade
        clearTransactions
    };
}