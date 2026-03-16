// ===== FILE: src/modules/inventory/hooks/useWarehouseMutation.ts =====

'use client';

import { useState, useCallback } from 'react';
import { api } from '@/core/services/api';
import { Warehouse, CreateWarehouseInput } from '../types/InventoryTypes';

/**
 * @hook useWarehouseMutation
 * @description Hook de Mutação (Write Operations) para Depósitos (Warehouses).
 * CLASSE OURO: Separação de Responsabilidades (CQRS). Lida exclusivamente com 
 * POST, PATCH, DELETE e captura padronizada de erros do NestJS.
 */
export function useWarehouseMutation() {
    const [isLoading, setIsLoading] = useState(false);
    
    // O CrudLayout escuta este estado para exibir tarjas vermelhas de erro
    const [error, setError] = useState<string | null>(null);

    /**
     * @helper extractError
     * @description Traduz erros brutos da API (Axios/NestJS) para mensagens amigáveis na UI.
     * Suporta a extração de arrays do class-validator.
     */
    const extractError = useCallback((err: any, fallbackMessage: string): string => {
        console.error(`❌ [useWarehouseMutation] Erro:`, err);
        const backendMessage = err.response?.data?.message;
        
        if (Array.isArray(backendMessage)) {
            return backendMessage.join(' | '); // Junta múltiplos erros de validação
        }
        return backendMessage || fallbackMessage;
    }, []);

    /**
     * @method createWarehouse
     * @description Cria um novo depósito.
     */
    const createWarehouse = useCallback(async (data: CreateWarehouseInput): Promise<Warehouse> => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await api.post<Warehouse>('/inventory/warehouses', data);
            return response.data;
        } catch (err: any) {
            const msg = extractError(err, 'Falha ao tentar criar o depósito.');
            setError(msg);
            throw err; // Re-lança para o CrudForm parar o "isSubmitting"
        } finally {
            setIsLoading(false);
        }
    }, [extractError]);

    /**
     * @method updateWarehouse
     * @description Atualiza parcialmente um depósito.
     */
    const updateWarehouse = useCallback(async (id: string, data: Partial<CreateWarehouseInput>): Promise<Warehouse> => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await api.patch<Warehouse>(`/inventory/warehouses/${id}`, data);
            return response.data;
        } catch (err: any) {
            const msg = extractError(err, 'Falha ao atualizar o depósito.');
            setError(msg);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [extractError]);

    /**
     * @method deleteWarehouse
     * @description Remove o depósito (geralmente Soft Delete).
     */
    const deleteWarehouse = useCallback(async (id: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        
        try {
            await api.delete(`/inventory/warehouses/${id}`);
            return true;
        } catch (err: any) {
            const msg = extractError(err, 'Não foi possível remover este depósito. Pode estar em uso por movimentações.');
            setError(msg);
            throw err; 
        } finally {
            setIsLoading(false);
        }
    }, [extractError]);

    return {
        createWarehouse,
        updateWarehouse,
        deleteWarehouse,
        isLoading,
        error
    };
}