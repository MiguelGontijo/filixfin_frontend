// ===== FILE: src/modules/categories/registries/CategoryRegistry.tsx =====

'use client';

import React, { useMemo } from 'react';
import { z } from 'zod';

import { CrudLayout } from '@/core/components/crud/CrudLayout';
import { CrudConfig, CrudHooks } from '@/core/components/crud/types';
import { useCategories } from '@/modules/categories/hooks/useCategories';
import { useCategoryMutation } from '@/modules/categories/hooks/useCategoryMutation';
import { Category, CategoryType } from '@/modules/categories/types';

// =========================================================================
// 1. A PONTE DE TRADUÇÃO (Zod Schema)
// =========================================================================
const CategoryFormSchema = z.object({
    name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
    
    // O select HTML envia string vazia (''). Nós a aceitamos pacientemente.
    parentId: z.uuid('UUID inválido').optional().or(z.literal('')), 
    
    // 🎚️ Usando um Select limpo e direto como você sugeriu!
    // 🎚️ Zod v4: z.enum agora lê Enums nativos sozinho e usa a propriedade unificada 'error'
    type: z.enum(CategoryType, { 
        error: 'Selecione um tipo de categoria válido' 
    }),
    
    isActive: z.boolean().default(true),

    // 🛡️ Campos de Auditoria
    id: z.string().optional(),
    slug: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),

}).transform((data) => ({
    ...data,
    // TRADUÇÃO DE SAÍDA: O backend não aceita string vazia, ele quer 'undefined'.
    parentId: data.parentId === '' ? undefined : data.parentId,
    attributesSchema: [] // Garante o JSONB pro Backend
}));

type CategoryFormData = z.input<typeof CategoryFormSchema>;

// =========================================================================
// 2. O COMPONENTE MESTRE
// =========================================================================
export const CategoryRegistry: React.FC = () => {
    
    const { categories, isLoading, error: queryError, refreshCategories } = useCategories();
    const { createCategory, updateCategory, deleteCategory, error: mutationError } = useCategoryMutation();

    // =========================================================================
    // 🔄 FILTRO DE HIDRATAÇÃO (O Fim do Erro Null)
    // O Banco manda 'null', mas a UI só entende string vazia ('').
    // Interceptamos aqui para limpar os dados antes de chegarem na tela.
    // =========================================================================
    const safeCategories = useMemo(() => {
        return (categories || []).map(cat => ({
            ...cat,
            // Substitui null por string vazia de forma segura
            parentId: cat.parentId === null ? '' : cat.parentId
        }));
    }, [categories]);

    // Usamos as categorias seguras para montar o Dropdown
    const parentOptions = useMemo(() => {
        return safeCategories.map(cat => ({
            label: cat.name,
            value: cat.id
        }));
    }, [safeCategories]);

    // =========================================================================
    // 3. A PLANTA DA TELA (Configuração)
    // =========================================================================
    const categoryConfig: CrudConfig<Category, CategoryFormData> = useMemo(() => ({
        title: 'Categorias',
        description: 'Organize o catálogo de produtos e serviços do sistema.',
        schema: CategoryFormSchema as any,
        
        columns: [
            { header: 'Nome da Categoria', accessor: 'name' },
            { 
                header: 'Tipo', 
                accessor: (item) => (
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                        item.type === CategoryType.PRODUCT ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' : 'border-purple-500/30 text-purple-400 bg-purple-500/10'
                    }`}>
                        {item.type === CategoryType.PRODUCT ? 'Produto' : 'Serviço'}
                    </span>
                )
            },
            { 
                header: 'Status', 
                accessor: (item) => (
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                        item.isActive ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-gray-500/30 text-gray-400 bg-gray-500/10'
                    }`}>
                        {item.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                )
            },
        ],
        
        fields: [
            { 
                name: 'name', 
                label: 'Nome da Categoria', 
                type: 'text', 
                placeholder: 'Ex: Eletrônicos, Consultoria...' 
            },
            { 
                name: 'type', 
                label: 'Tipo de Categoria', 
                type: 'select', // 👈 Solução limpa e nativa!
                options: [
                    { label: 'Produto Físico/Digital', value: CategoryType.PRODUCT },
                    { label: 'Serviço Prestado', value: CategoryType.SERVICE }
                ]
            },
            {
                name: 'parentId',
                label: 'Categoria Principal (Pai)',
                type: 'select',
                options: parentOptions, 
                disabled: isLoading
            },
            { 
                name: 'isActive', 
                label: 'Status no Sistema', 
                type: 'boolean' // Voltou a ser o padrão (Ativo/Inativo)
            }
        ],

        systemFields: [
            { name: 'id', label: 'ID do Registro (UUID)', type: 'text' },
            { name: 'slug', label: 'Slug (URL Amigável)', type: 'text' },
            { name: 'createdAt', label: 'Data de Criação', type: 'text' },
            { name: 'updatedAt', label: 'Última Modificação', type: 'text' }
        ]

    }), [parentOptions, isLoading]);

    const crudHooks: CrudHooks<Category, CategoryFormData> = {
        data: safeCategories, // 👈 O Motor agora consome os dados blindados
        isLoading: isLoading,
        error: queryError || mutationError || null,
        onCreate: createCategory as any,
        onUpdate: updateCategory as any,
        onDelete: deleteCategory,
        onRefresh: refreshCategories
    };

    return <CrudLayout<Category, CategoryFormData> config={categoryConfig} hooks={crudHooks} />;
};