import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/core/services/api';
import { ICategory, ICreateCategoryDTO, IUpdateCategoryDTO } from '../types';

/**
 * Hook de Mutação para o Módulo de Categorias.
 * * Responsabilidade:
 * - Gerenciar operações de escrita (C/U/D).
 * - Centralizar tratamento de erro via estado local (Padrão do Projeto).
 */
export function useCategoryMutation() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    /**
     * Cria uma nova categoria.
     */
    const createCategory = async (data: ICreateCategoryDTO): Promise<ICategory | null> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post<ICategory>('/categories', data);
            
            // O sucesso é tratado pelo componente (ex: redirecionar ou fechar modal)
            return response.data;
        } catch (err: any) {
            console.error('❌ Erro ao criar categoria:', err);
            const msg = err.response?.data?.message || 'Falha ao criar a categoria.';
            setError(msg);
            throw err; // Re-lança para que o form possa reagir se necessário
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Atualiza uma categoria existente.
     */
    const updateCategory = async (id: string, data: IUpdateCategoryDTO): Promise<ICategory | null> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.put<ICategory>(`/categories/${id}`, data);
            router.refresh();
            return response.data;
        } catch (err: any) {
            console.error('❌ Erro ao atualizar categoria:', err);
            const msg = err.response?.data?.message || 'Falha ao atualizar a categoria.';
            setError(msg);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Remove uma categoria.
     */
    const deleteCategory = async (id: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            await api.delete(`/categories/${id}`);
            return true;
        } catch (err: any) {
            console.error('❌ Erro ao remover categoria:', err);
            const msg = err.response?.data?.message || 'Não foi possível remover a categoria. Verifique se há vínculos.';
            setError(msg);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        createCategory,
        updateCategory,
        deleteCategory,
        isLoading,
        error // Retornado para exibição no componente
    };
}