'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FaPlus, FaBoxOpen } from 'react-icons/fa';

// Imports dos Hooks e Componentes do Módulo
import { useProducts } from '../hooks/useProducts';
import { useProductMutation } from '../hooks/useProductMutation';
import { ProductListGrid } from './ProductListGrid';

/**
 * Container Principal da Listagem de Produtos.
 * * Responsabilidade:
 * - Buscar dados via useProducts.
 * - Gerenciar exclusão via useProductMutation.
 * - Renderizar o Layout da página (Header + Grid).
 */
export function ProductList() {
    // 1. Contexto e Navegação
    const params = useParams();
    const tenantId = params.tenantId as string;

    // 2. Hooks de Dados
    // Nota: O hook useProducts precisa retornar a lista tipada conforme o novo types.ts
    const { products, isLoading, error, refreshProducts } = useProducts();
    const { deleteProduct } = useProductMutation();

    // 3. Efeitos
    useEffect(() => {
        refreshProducts();
    }, [refreshProducts]);

    // 4. Handlers
    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este produto? A ação não pode ser desfeita.')) {
            return;
        }

        const success = await deleteProduct(id);
        if (success) {
            // Recarrega a lista após exclusão bem-sucedida
            await refreshProducts();
        }
    };

    return (
        <div className="w-full space-y-6 p-6 animate-fade-in">
            {/* Header da Página */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-base-metallic p-4 rounded-lg border border-gray-700 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gray-800 rounded-lg text-accent-primary border border-gray-700">
                        <FaBoxOpen className="text-xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            Produtos
                        </h1>
                        <p className="text-sm text-gray-400">
                            Gerencie seu catálogo, preços e estoque
                        </p>
                    </div>
                </div>

                {/* Botão de Novo Produto */}
                <Link href={`/${tenantId}/dashboard/products/create`}>
                    <button className="flex items-center gap-2 bg-accent-primary hover:bg-accent-primary/90 text-base-dark font-bold py-2.5 px-5 rounded-md transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                        <FaPlus />
                        <span>Novo Produto</span>
                    </button>
                </Link>
            </div>

            {/* Tratamento de Erro Visual */}
            {error && (
                <div className="p-4 bg-red-900/20 border border-red-500/50 text-red-200 rounded-lg text-sm flex items-center gap-2">
                    <span>⚠️</span>
                    {error}
                </div>
            )}

            {/* Grid de Listagem */}
            <ProductListGrid
                products={products}
                isLoading={isLoading}
                onDelete={handleDelete}
                tenantId={tenantId}
            />
        </div>
    );
}