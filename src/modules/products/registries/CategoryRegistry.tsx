'use client';

import React from 'react';
import { z } from 'zod';

import { CrudLayout } from '@/core/components/crud/CrudLayout';
import { CrudConfig, CrudHooks } from '@/core/components/crud/types';
import { useCategories } from '@/modules/categories/hooks/useCategories';
import { useCategoryMutation } from '@/modules/categories/hooks/useCategoryMutation';
import { Category } from '@/modules/categories/types'; // Entidade do Banco (TData)

// =========================================================================
// 1. O DTO DE CRIAÇÃO/EDIÇÃO (TForm)
// Somente o que o usuário interage. O Backend resolve tenantId e Datas.
// =========================================================================
const CategoryFormSchema = z.object({
    name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
    isActive: z.boolean().default(true),
    categoryId: z.string().optional().nullable(), // Sub-categoria (Pai) - Opcional
});

// Inferimos o tipo do formulário automaticamente a partir do Zod
type CategoryFormData = z.infer<typeof CategoryFormSchema>;

// =========================================================================
// 2. A PLANTA (Configuração da Interface)
// Passamos os dois mundos: <TData, TForm>
// =========================================================================
const categoryConfig: CrudConfig<Category, CategoryFormData> = {
    title: 'Categorias de Produtos',
    description: 'Organize seu catálogo e a vitrine do e-commerce.',
    schema: CategoryFormSchema,
    
    // A Tabela enxerga o TData (Category)
    columns: [
        { key: 'name', label: 'Nome da Categoria', type: 'text' },
        { key: 'isActive', label: 'Status', type: 'boolean', align: 'center' },
    ],
    
    // O Formulário enxerga o TForm (CategoryFormData)
    fields: [
        { 
            name: 'name', 
            label: 'Nome da Categoria', 
            type: 'text', 
            placeholder: 'Ex: Eletrônicos, Vestuário...' 
        },
        { 
            name: 'isActive', 
            label: 'Status Ativo', 
            type: 'boolean' 
        },
        // Se quisermos que o usuário escolha uma Categoria Pai, descomentamos abaixo:
        // {
        //     name: 'categoryId',
        //     label: 'Categoria Principal (Pai)',
        //     type: 'select',
        //     options: [{ label: 'Nenhuma', value: '' }] // Aqui poderíamos injetar opções dinâmicas
        // }
    ]
};

// =========================================================================
// 3. O COMPONENTE MESTRE
// =========================================================================
export const CategoryRegistry: React.FC = () => {
    const { categories, isLoading, refreshCategories } = useCategories();
    const { createCategory, updateCategory, deleteCategory, error: mutationError } = useCategoryMutation();

    const crudHooks: CrudHooks<Category, CategoryFormData> = {
        data: categories || [],
        isLoading: isLoading,
        error: mutationError || null,
        onCreate: createCategory,
        onUpdate: updateCategory,
        onDelete: deleteCategory,
        onRefresh: refreshCategories || (() => window.location.reload())
    };

    return <CrudLayout<Category, CategoryFormData> config={categoryConfig} hooks={crudHooks} />;
};