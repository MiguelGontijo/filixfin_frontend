'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FaSave, FaArrowLeft } from 'react-icons/fa';

// Imports do Módulo
import { useCategories } from '../hooks/useCategories';
import { useCategoryMutation } from '../hooks/useCategoryMutation';
import { ICreateCategoryDTO } from '../types';

/**
 * Formulário de Criação/Edição de Categorias.
 * * Responsabilidade:
 * - Gerenciar o estado local dos campos (Nome, Pai).
 * - Carregar a lista de categorias para o Select de "Pai".
 * - Executar a validação básica e submissão via Mutation.
 */
export function CategoryForm() {
    // 1. Contexto de Navegação
    const router = useRouter();
    const params = useParams();
    const tenantId = params.tenantId as string;

    // 2. Hooks de Dados
    // Precisamos das categorias existentes para preencher o Select de "Categoria Pai"
    const { categories, isLoading: isLoadingList, refreshCategories } = useCategories();
    const { createCategory, isLoading: isSaving, error: mutationError } = useCategoryMutation();

    // 3. Estado Local do Formulário
    const [formData, setFormData] = useState<ICreateCategoryDTO>({
        name: '',
        parentId: '' // String vazia indica "Sem Pai" (Raiz)
    });

    // Carrega a lista ao montar para garantir que o select de pais esteja atualizado
    useEffect(() => {
        refreshCategories();
    }, [refreshCategories]);

    // 4. Handlers
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            alert('O nome da categoria é obrigatório.');
            return;
        }

        // Prepara o payload (converte string vazia de parentId para undefined)
        const payload: ICreateCategoryDTO = {
            name: formData.name,
            parentId: formData.parentId === '' ? undefined : formData.parentId
        };

        const result = await createCategory(payload);

        // Se sucesso (retornou objeto), redireciona
        if (result) {
            router.push(`/${tenantId}/dashboard/categories`);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-6 animate-fade-in">
            {/* Header com Navegação */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link 
                        href={`/${tenantId}/dashboard/categories`}
                        className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                    >
                        <FaArrowLeft />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Nova Categoria</h1>
                        <p className="text-sm text-gray-400">Preencha os dados para criar um novo departamento</p>
                    </div>
                </div>
            </div>

            {/* Tratamento de Erro (API) */}
            {mutationError && (
                <div className="p-4 bg-red-900/20 border border-red-500/50 text-red-200 rounded-lg text-sm">
                    ⚠️ {mutationError}
                </div>
            )}

            {/* Container do Formulário */}
            <form onSubmit={handleSubmit} className="bg-base-metallic p-6 rounded-lg border border-gray-700 shadow-lg space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Campo: Nome */}
                    <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-400">
                            Nome da Categoria <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Ex: Bebidas, Lanches..."
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-accent-primary focus:border-transparent outline-none transition-all"
                            disabled={isSaving}
                            autoFocus
                        />
                    </div>

                    {/* Campo: Categoria Pai */}
                    <div className="space-y-2">
                        <label htmlFor="parentId" className="block text-sm font-medium text-gray-400">
                            Categoria Pai (Opcional)
                        </label>
                        <select
                            id="parentId"
                            value={formData.parentId || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-accent-primary focus:border-transparent outline-none transition-all appearance-none"
                            disabled={isSaving || isLoadingList}
                        >
                            <option value="">Nenhuma (Categoria Raiz)</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500">
                            Selecione apenas se esta for uma subcategoria.
                        </p>
                    </div>
                </div>

                {/* Footer com Ações */}
                <div className="pt-4 border-t border-gray-700 flex justify-end gap-3">
                    <Link href={`/${tenantId}/dashboard/categories`}>
                        <button
                            type="button"
                            className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors font-medium"
                            disabled={isSaving}
                        >
                            Cancelar
                        </button>
                    </Link>
                    
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-accent-primary hover:bg-accent-primary/90 text-base-dark font-bold py-2 px-6 rounded-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <>
                                <span className="animate-spin">⏳</span> Salvando...
                            </>
                        ) : (
                            <>
                                <FaSave /> Salvar Categoria
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}