// src/hooks/useFeatureMutation.ts

import { useState } from 'react';
import { api } from '@/utils/api';
import { CreateFeatureDto, Feature, UpdateFeatureDto } from '@/types/acl'; // Entidade Feature (usada no PATCH)

/**
 * @function useFeatureMutation
 * @description Hook de mutação para gerenciar as operações de escrita (C/U/D) sobre Features.
 * Porquê: Centraliza o tratamento de loading, erros de API e lógica de envio.
 */
export function useFeatureMutation() {
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- MÉTODOS DE MUTATION ---

    /**
     * @method createFeature
     * @description Envia uma requisição POST para criar uma nova Feature.
     */
    const createFeature = async (data: CreateFeatureDto): Promise<Feature> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post('/admin/features', data);
            return response.data as Feature;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Falha ao criar a Feature.';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * @method updateFeature
     * @description Envia uma requisição PATCH para atualizar uma Feature existente.
     */
    const updateFeature = async (id: string, data: UpdateFeatureDto): Promise<Feature> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.patch(`/admin/features/${id}`, data);
            return response.data as Feature;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Falha ao atualizar a Feature.';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * @method deleteFeature
     * @description Envia uma requisição DELETE para remover uma Feature.
     */
    const deleteFeature = async (id: string): Promise<void> => {
        setIsLoading(true);
        setError(null);
        try {
            // Requisição DELETE para o endpoint
            await api.delete(`/admin/features/${id}`);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Falha ao deletar a Feature.';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { createFeature, updateFeature, deleteFeature, isLoading, error };
}