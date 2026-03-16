'use client';

import { useState, useCallback } from 'react';
import { api } from '@/core/services/api';
import { InventoryTransaction, RegisterMovementInput } from '../types/InventoryTypes';

/**
 * @hook useStockMovementMutation
 * @description Hook de Mutação (Write Operations) para o Kardex.
 * CLASSE OURO: Responsabilidade Única (CQRS - Command). 
 * Focado estritamente em registrar novas movimentações no estoque e 
 * traduzir os erros de validação da API para a interface.
 */
export function useStockMovementMutation() {
    const [isLoading, setIsLoading] = useState(false);
    
    // O CrudLayout consome este estado para renderizar a tarja vermelha
    const [error, setError] = useState<string | null>(null);

    /**
     * @helper extractError
     * @description Tradutor universal de erros do NestJS para o Frontend.
     */
    const extractError = useCallback((err: any, fallbackMessage: string): string => {
        console.error(`❌ [useStockMovementMutation] Erro:`, err);
        const backendMessage = err.response?.data?.message;
        
        if (Array.isArray(backendMessage)) {
            return backendMessage.join(' | ');
        }
        return backendMessage || fallbackMessage;
    }, []);

    /**
     * @method registerMovement
     * @description Envia o payload para a API processar a entrada ou saída.
     * Importante: A lógica de cálculo de saldo fica 100% no Backend.
     */
    const registerMovement = useCallback(async (input: RegisterMovementInput): Promise<InventoryTransaction> => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await api.post<InventoryTransaction>('/inventory/movements', input);
            return response.data;
        } catch (err: any) {
            const msg = extractError(err, 'Falha ao tentar registrar a movimentação de estoque.');
            setError(msg);
            throw err; // Essencial para avisar o CrudForm que a mutação falhou
        } finally {
            setIsLoading(false);
        }
    }, [extractError]);

    return {
        registerMovement,
        isLoading,
        error
    };
}