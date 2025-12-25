'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FaBoxOpen } from 'react-icons/fa';

import { api } from '@/core/services/api';
import { Product } from '@/modules/products/types';
import { ProductForm } from '@/modules/products/components/ProductForm';

/**
 * Rota de Edição de Produto.
 * * URL: /[tenantId]/dashboard/products/[id]
 * * Responsabilidade:
 * - Buscar o produto pelo ID.
 * - Gerenciar Loading/Erro da busca.
 * - Renderizar o ProductForm preenchido (Modo Edição).
 */
export default function ProductEditPage() {
    const router = useRouter();
    const params = useParams();
    const tenantId = params.tenantId as string;
    const productId = params.id as string;

    const [product, setProduct] = useState<Product | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Função de busca do produto individual
    const fetchProduct = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await api.get<Product>(`/products/${productId}`);
            setProduct(response.data);
        } catch (err: any) {
            console.error('❌ Erro ao buscar produto:', err);
            setError('Não foi possível carregar os dados do produto.');
        } finally {
            setIsLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        if (productId) {
            fetchProduct();
        }
    }, [fetchProduct, productId]);

    // Handler de Navegação
    const handleNavigateBack = () => {
        router.push(`/${tenantId}/dashboard/products`);
    };

    // Renderização de Estado de Carregamento
    if (isLoading) {
        return (
            <div className="h-[calc(100vh-6rem)] flex flex-col items-center justify-center text-gray-500 animate-pulse">
                <FaBoxOpen className="text-4xl mb-4 opacity-50" />
                <p>Carregando dados do produto...</p>
            </div>
        );
    }

    // Renderização de Erro (ex: Produto não encontrado)
    if (error || !product) {
        return (
            <div className="h-[calc(100vh-6rem)] flex flex-col items-center justify-center text-red-400">
                <p className="text-lg font-bold mb-2">Erro</p>
                <p>{error || 'Produto não encontrado.'}</p>
                <button 
                    onClick={handleNavigateBack}
                    className="mt-4 text-sm underline hover:text-white"
                >
                    Voltar para listagem
                </button>
            </div>
        );
    }

    // Renderização do Formulário em Modo de Edição
    return (
        <div className="h-[calc(100vh-6rem)]">
            <ProductForm 
                product={product} // A presença desta prop ativa o modo edição
                onSuccess={handleNavigateBack}
                onCancel={handleNavigateBack}
            />
        </div>
    );
}