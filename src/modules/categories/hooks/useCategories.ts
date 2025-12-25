import { useState, useCallback, useEffect } from 'react';
import { api } from '@/core/services/api';
import { ICategory } from '../types';

/**
 * Hook de Leitura (Query) para o Módulo de Categorias.
 * * Responsabilidade:
 * - Buscar e armazenar a lista de categorias.
 * - Expor estado de carregamento e erro para a UI.
 */
export function useCategories() {
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get<ICategory[]>('/categories');
            setCategories(response.data);
        } catch (err: any) {
            console.error('❌ Erro ao buscar categorias:', err);
            const msg = err.response?.data?.message || 'Erro ao carregar lista de categorias.';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Busca inicial automática
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return {
        categories,
        isLoading,
        error,
        refreshCategories: fetchCategories
    };
}