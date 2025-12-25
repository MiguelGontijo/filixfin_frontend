'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FaPlus, FaFolder } from 'react-icons/fa';

// Hooks e Componentes Internos
import { useCategories } from '../hooks/useCategories';
import { useCategoryMutation } from '../hooks/useCategoryMutation';
import { CategoryListGrid } from './CategoryListGrid';

/**
 * Container Principal da Listagem de Categorias.
 * * Responsabilidade:
 * - Orquestrar a lógica da tela (Hooks, Estados).
 * - Renderizar o Cabeçalho e Botões de Ação.
 * - Alimentar o Grid com dados.
 */
export function CategoryList() {
    const params = useParams();
    const tenantId = params.tenantId as string;

    // Lógica de Negócio
    const { categories, isLoading, error, refreshCategories } = useCategories();
    const { deleteCategory } = useCategoryMutation();

    useEffect(() => {
        refreshCategories();
    }, [refreshCategories]);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja remover esta categoria?')) return;
        const success = await deleteCategory(id);
        if (success) {
            await refreshCategories();
        }
    };

    return (
        <div className="w-full space-y-6 p-6 animate-fade-in">
            {/* Header / Actions Area */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-base-metallic p-4 rounded-lg border border-gray-700 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gray-800 rounded-lg text-accent-primary border border-gray-700">
                        <FaFolder className="text-xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            Categorias
                        </h1>
                        <p className="text-sm text-gray-400">
                            Gestão de departamentos e hierarquia
                        </p>
                    </div>
                </div>

                <Link href={`/${tenantId}/dashboard/products/categories/new`}>
                    <button className="flex items-center gap-2 bg-accent-primary hover:bg-accent-primary/90 text-base-dark font-bold py-2.5 px-5 rounded-md transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                        <FaPlus />
                        <span>Nova Categoria</span>
                    </button>
                </Link>
            </div>

            {/* Tratamento de Erro */}
            {error && (
                <div className="p-4 bg-red-900/20 border border-red-500/50 text-red-200 rounded-lg text-sm">
                    ⚠️ {error}
                </div>
            )}

            {/* Grid de Dados (Componente Puro) */}
            <CategoryListGrid
                categories={categories}
                isLoading={isLoading}
                onDelete={handleDelete}
                tenantId={tenantId}
            />
        </div>
    );
}