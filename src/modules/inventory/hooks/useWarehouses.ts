'use strict';

import { useState, useCallback } from 'react';
import { api } from '@/core/services/api'; // Caminho relativo para o Core
import { Warehouse, CreateWarehouseInput } from '../types/InventoryTypes';

/**
 * Hook para gerenciamento de Depósitos (Warehouses).
 * Responsável por conectar com a API e gerenciar o estado local da lista.
 */
export function useWarehouses() {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Busca todos os depósitos do tenant (GET /inventory/warehouses)
     */
    const fetchWarehouses = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get<Warehouse[]>('/inventory/warehouses');
            setWarehouses(response.data);
        } catch (error) {
            console.error('Erro ao buscar depósitos:', error);
            // Aqui poderíamos integrar com um Toast Notification global se houver
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Cria um novo depósito (POST /inventory/warehouses)
     */
    const createWarehouse = async (input: CreateWarehouseInput) => {
        setIsLoading(true);
        try {
            const response = await api.post<Warehouse>('/inventory/warehouses', input);
            // Atualiza a lista localmente para evitar refetch desnecessário
            setWarehouses((prev) => [...prev, response.data]);
            return response.data;
        } catch (error) {
            console.error('Erro ao criar depósito:', error);
            throw error; // Repassa o erro para o componente tratar (ex: fechar modal ou mostrar erro)
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Atualiza um depósito existente (PATCH /inventory/warehouses/:id)
     */
    const updateWarehouse = async (id: string, input: Partial<CreateWarehouseInput>) => {
        setIsLoading(true);
        try {
            const response = await api.patch<Warehouse>(`/inventory/warehouses/${id}`, input);
            
            // Atualiza o item específico na lista local
            setWarehouses((prev) => 
                prev.map((item) => (item.id === id ? response.data : item))
            );

            // Se o depósito atualizado virou padrão (isDefault), precisamos atualizar a flag dos outros
            if (input.isDefault) {
                setWarehouses((prev) => 
                    prev.map((item) => 
                        item.id === id 
                            ? { ...item, isDefault: true } 
                            : { ...item, isDefault: false }
                    )
                );
            }

            return response.data;
        } catch (error) {
            console.error('Erro ao atualizar depósito:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        warehouses,
        isLoading,
        fetchWarehouses,
        createWarehouse,
        updateWarehouse
    };
}