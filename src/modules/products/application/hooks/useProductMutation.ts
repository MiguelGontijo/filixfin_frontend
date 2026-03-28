import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/core/services/api';
import { Product, ProductFormData } from '../../domain/types/product';

// Import corrigido para modules conforme sua instrução

/**
 * Hook de Mutação para Produtos.
 * * Responsabilidade:
 * - Enviar dados de criação (POST) e atualização (PUT).
 * - Gerenciar estados de loading e erro da operação.
 * - Redirecionar após sucesso.
 */
export function useProductMutation() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    /**
     * Cria um novo produto.
     * O payload (data) já vem tipado e formatado do ProductForm.
     */
    const createProduct = async (data: ProductFormData): Promise<Product | null> => {
        setIsLoading(true);
        setError(null);
        try {
            // O backend espera exatamente essa estrutura agora (com categoryId, fiscalGroupId, etc)
            const response = await api.post<Product>('/product', data);
            return response.data;
        } catch (err: any) {
            console.error('❌ Erro ao criar produto:', err);
            const msg = err.response?.data?.message || 'Falha ao criar produto. Verifique os dados.';
            setError(msg);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Atualiza um produto existente.
     */
    const updateProduct = async (id: string, data: Partial<ProductFormData>): Promise<Product | null> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.put<Product>(`/product/${id}`, data);
            
            // Opcional: Forçar refresh da rota para atualizar dados em cache do Next.js
            router.refresh();
            
            return response.data;
        } catch (err: any) {
            console.error('❌ Erro ao atualizar produto:', err);
            const msg = err.response?.data?.message || 'Falha ao salvar alterações.';
            setError(msg);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Remove um produto.
     */
    const deleteProduct = async (id: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            await api.delete(`/product/${id}`);
            return true;
        } catch (err: any) {
            console.error('❌ Erro ao excluir produto:', err);
            const msg = err.response?.data?.message || 'Não foi possível excluir o produto. Verifique se há movimentações.';
            setError(msg);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        createProduct,
        updateProduct,
        deleteProduct,
        isLoading,
        error
    };
}