// ===== FILE: src/modules/inventory/hooks/useWarehouses.ts =====

'use client';

import { useState, useCallback, useEffect } from 'react';
import { api } from '@/core/services/api';
import { Warehouse } from '../types/InventoryTypes';

/**
 * @hook useWarehouses
 * @description Hook de Leitura (Query Operations) para Depósitos.
 * CLASSE OURO: Responsabilidade Única (CQRS - Query). Focado em buscar 
 * a lista de depósitos, expor o estado de carregamento e tratar erros de GET.
 */
export function useWarehouses() {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [isLoading, setIsLoading] = useState(true); // Começa true para skeleton loading
    const [error, setError] = useState<string | null>(null);

    /**
     * @method fetchWarehouses
     * @description Busca a lista completa de depósitos do tenant atual.
     * Memoizado para estabilidade do useEffect.
     */
    const fetchWarehouses = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get<Warehouse[]>('/inventory/warehouses');
            setWarehouses(response.data);
        } catch (err: any) {
            console.error('❌ [useWarehouses] Erro ao buscar depósitos:', err);
            const msg = err.response?.data?.message || 'Falha ao carregar a lista de depósitos.';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // =========================================================================
    // 🚀 O GATILHO DE IGNIÇÃO AUTOMÁTICO
    // =========================================================================
    useEffect(() => {
        fetchWarehouses();
    }, [fetchWarehouses]);

    return {
        warehouses,
        isLoading,
        error,
        refreshWarehouses: fetchWarehouses // Alias semântico para recarregar a tela
    };
}