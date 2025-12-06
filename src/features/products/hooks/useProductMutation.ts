// src/features/products/hooks/useProductMutation.ts

import { useState } from 'react';
import { api } from '@/core/services/api';
import { Product, ProductFormData } from '../types';

/**
 * @hook useProductMutation
 * @description Gerencia as operações de escrita (CUD) para o módulo de Produtos.
 * Centraliza o envio de dados para a API e tratamento de erros.
 */
export function useProductMutation() {
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * @method createProduct
     * @description Envia o payload (incluindo metadata dinâmico) para criar um produto.
     */
    const createProduct = async (data: ProductFormData): Promise<Product> => {
        setIsLoading(true);
        setError(null);
        try {
            // POST /product
            const response = await api.post('/product', data);
            return response.data as Product;
        } catch (err: any) {
            console.error("Erro ao criar produto:", err);
            const msg = err.response?.data?.message || "Falha ao cadastrar o produto.";
            setError(msg);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * @method updateProduct
     * @description Atualiza dados parciais de um produto.
     * @param id ID do produto.
     * @param data Dados parciais (Partial<ProductFormData>).
     */
    const updateProduct = async (id: string, data: Partial<ProductFormData>): Promise<Product> => {
        setIsLoading(true);
        setError(null);
        try {
            // PATCH /product/:id (Implementaremos o endpoint de update no backend em breve,
            // mas já deixamos o hook pronto no front)
            const response = await api.patch(`/product/${id}`, data);
            return response.data as Product;
        } catch (err: any) {
            console.error("Erro ao atualizar produto:", err);
            const msg = err.response?.data?.message || "Falha ao atualizar o produto.";
            setError(msg);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * @method deleteProduct
     * @description Remove um produto do catálogo.
     */
    const deleteProduct = async (id: string): Promise<void> => {
        setIsLoading(true);
        setError(null);
        try {
            // DELETE /product/:id
            await api.delete(`/product/${id}`);
        } catch (err: any) {
            console.error("Erro ao deletar produto:", err);
            const msg = err.response?.data?.message || "Falha ao remover o produto.";
            setError(msg);
            throw err;
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