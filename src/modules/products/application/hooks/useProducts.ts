import { useState, useEffect, useCallback } from 'react';
// Ajuste o import da API conforme sua estrutura real (se for @/services/api ou @/core/services/api)
import { api } from '@/core/services/api'; 
import { Product } from '../../domain/types/product';

/**
 * @hook useProducts
 * @description Gerencia a listagem, busca e estado de carregamento dos Produtos.
 * Local: src/modules/products/hooks/useProducts.ts
 */
export function useProducts(refreshTrigger: number = 0) {
    
    // Estados de Dados
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados de Busca
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedTerm, setDebouncedTerm] = useState('');

    // 1. Debounce: Aguarda 500ms após parar de digitar
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedTerm(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // 2. Função de Fetching
    const fetchProducts = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Monta os parâmetros (query string ?q=...)
            const params = debouncedTerm ? { q: debouncedTerm } : {};

            // Ajuste a rota se necessário (ex: '/products' ou '/product')
            const response = await api.get('/product', { params });

            setProducts(response.data as Product[]);
        } catch (err: any) {
            console.error("Erro ao buscar produtos:", err);
            const errorMessage = err.response?.data?.message || "Falha ao carregar produtos.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedTerm]);

    // 3. Recarrega quando muda o termo (debounced) ou o trigger externo
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts, refreshTrigger]);

    return {
        products,
        isLoading,
        error,
        searchTerm,      // Exposto para o Input value
        setSearchTerm,   // Exposto para o onChange
        refreshProducts: fetchProducts // Exposto com o nome que o ProductSelector espera
    };
}