// src/features/products/hooks/useProducts.ts

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/core/services/api';
import { Product } from '../types';

/**
 * @hook useProducts
 * @description Gerencia a listagem, busca e estado de carregamento dos Produtos.
 * Integra-se ao endpoint de busca híbrida do Backend.
 */
export function useProducts(refreshTrigger: number = 0) {
    
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- CONTROLE DE BUSCA ---
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedTerm, setDebouncedTerm] = useState('');

    // 1. Efeito de Debounce: Aguarda o usuário parar de digitar por 500ms
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedTerm(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // 2. Função de Fetching (Memoized)
    const fetchProducts = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Se houver termo, envia query param 'q' para ativar a busca híbrida no Backend
            const params = debouncedTerm ? { q: debouncedTerm } : {};

            const response = await api.get('/product', { params });

            setProducts(response.data as Product[]);
        } catch (err: any) {
            console.error("Erro ao buscar produtos:", err);
            const errorMessage = err.response?.data?.message || "Falha ao carregar o catálogo de produtos.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedTerm]);

    // 3. Disparador de Efeito (Recarrega se a busca ou o trigger mudarem)
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts, refreshTrigger]);

    return {
        products,
        isLoading,
        error,
        searchTerm,
        setSearchTerm,
        refreshData: fetchProducts
    };
}