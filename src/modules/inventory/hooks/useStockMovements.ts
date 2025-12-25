'use client';

import { useState, useCallback } from 'react';
import { api } from '@/core/services/api';
import { 
    InventoryTransaction, 
    RegisterMovementInput 
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
     * * @param input Dados da movimentação (Variant, Warehouse, Tipo, Qtd)
     * @returns A transação criada
     */
    const registerMovement = async (input: RegisterMovementInput) => {
        setIsLoading(true);
        try {
            const response = await api.post<InventoryTransaction>('/inventory/movements', input);
            
            // Opcional: Se estivermos visualizando o Kardex deste item no momento,
            // podemos adicionar a nova transação no topo da lista imediatamente.
            setTransactions((prev) => {
                // Só adiciona se o histórico carregado for do mesmo item (segurança básica)
                if (prev.length > 0 && prev[0].variantId === input.variantId) {
                    return [response.data, ...prev];
                }
                return prev;
            });

            return response.data;
        } catch (error) {
            console.error('Erro ao registrar movimentação:', error);
            // Repassa o erro para que o Modal exiba a mensagem específica do Backend
            // (ex: "Saldo insuficiente" ou "Regra de Negócio Violada")
            throw error; 
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Busca o histórico completo (Kardex) de uma variante específica.
     * GET /inventory/kardex/:variantId
     */
    const fetchKardex = useCallback(async (variantId: string) => {
        if (!variantId) return;

        setIsLoading(true);
        try {
            const response = await api.get<InventoryTransaction[]>(`/inventory/kardex/${variantId}`);
            setTransactions(response.data);
        } catch (error) {
            console.error(`Erro ao buscar Kardex para variante ${variantId}:`, error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Limpa o estado atual das transações (útil ao fechar modais ou trocar de aba)
     */
    const clearTransactions = useCallback(() => {
        setTransactions([]);
    }, []);

    return {
        transactions,
        isLoading,
        registerMovement,
        fetchKardex,
        clearTransactions
    };
}