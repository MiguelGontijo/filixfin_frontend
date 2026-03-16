'use client';

import React, { useMemo } from 'react';

// Motor CRUD V3
import { CrudLayout } from '@/core/components/crud/CrudLayout';
import { CrudConfig, CrudHooks } from '@/core/components/crud/types';

// Tipagens e Contratos do Módulo
import { ProductFormSchema, ProductFormInput } from '../schemas/productSchema';

// Hooks de Integração
import { useProducts } from '../hooks/useProducts';
import { useProductMutation } from '../hooks/useProductMutation';
import { useCategories } from '@/modules/categories/hooks/useCategories';
import { useFiscal } from '@/modules/fiscal/hooks/useFiscal'; // Import herdado do seu legado
import { BaseUOM, ProductType } from '../types/enums';
import { ITaxGroup } from '@/modules/fiscal/types';

export const ProductRegistry: React.FC = () => {
    // 🔌 1. Conectando os Cabos (Data Fetching)
    const { products, isLoading: loadingProducts, error: queryError, refreshProducts } = useProducts();
    const { createProduct, updateProduct, deleteProduct, isLoading: mutating, error: mutationError } = useProductMutation();
    
    // Dependências (Dropdowns)
    const { categories, isLoading: loadingCats } = useCategories();
    const { taxGroups, isLoading: loadingFiscal } = useFiscal();

    // =========================================================================
    // 🔄 2. FILTRO DE HIDRATAÇÃO (O Caminho Inverso do Zod)
    // A API devolve { name: "Mouse", variants: [{ salePrice: 50, sku: "M01" }] }
    // O Formulário precisa de { name: "Mouse", salePrice: 50, sku: "M01" }
    // =========================================================================
    const flatProducts = useMemo(() => {
        return (products || []).map(product => {
            // Pegamos sempre a primeira variante (SKU Principal) para a visão "Plana"
            const mainVariant = (product.variants && product.variants.length > 0) ? product.variants[0] : {} as any;
            
            return {
                ...product,
                // Tratamento de nulos e extração de IDs de objetos aninhados (DTO Response)
                categoryId: product.category?.id || product.categoryId || '',
                taxGroupId: product.taxGroupId ,
                
                // Achata os dados do Filho para a raiz do objeto
                variantId: mainVariant.id || '',
                sku: mainVariant.sku || '',
                barcode: mainVariant.barcode || '',
                salePrice: mainVariant.salePrice || 0,
                costPrice: mainVariant.costPrice || 0,
            };
        });
    }, [products]);

    // =========================================================================
    // 🗂️ 3. OPÇÕES DOS DROPDOWNS (Selects)
    // =========================================================================
    const categoryOptions = useMemo(() => 
        categories?.map(cat => ({ label: cat.name, value: cat.id })) || [], 
    [categories]);

    const fiscalOptions = useMemo(() => 
        taxGroups?.map((fg: ITaxGroup) => ({ 
            label: fg.name, 
            value: fg.id 
        })) || [], 
    [taxGroups]);
    
    // Enums mapeados para o Select
    const typeOptions = [
        { label: 'Produto Físico/Simples', value: ProductType.SIMPLE },
        { label: 'Serviço Prestado', value: ProductType.SERVICE },
        { label: 'Kit / Combo', value: ProductType.KIT }
    ];
    
    const uomOptions = Object.values(BaseUOM).map(uom => ({ label: uom, value: uom }));

    // =========================================================================
    // 📐 4. A PLANTA DA TELA (Configuração V3)
    // =========================================================================
    const productConfig: CrudConfig<any, ProductFormInput> = useMemo(() => ({
        title: 'Catálogo de Produtos',
        description: 'Gerencie itens, preços e regras fiscais.',
        schema: ProductFormSchema as any,
        
        // 📊 O Grid (O que aparece na listagem)
        columns: [
            { header: 'Nome / Item', accessor: 'name' },
            { header: 'SKU', accessor: 'sku' },
            { 
                header: 'Tipo', 
                accessor: (item) => (
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                        item.type === ProductType.SERVICE ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' : 'border-blue-500/30 text-blue-400 bg-blue-500/10'
                    }`}>
                        {item.type === ProductType.SERVICE ? 'Serviço' : 'Produto'}
                    </span>
                )
            },
            { 
                header: 'Preço (R$)', 
                accessor: (item) => `R$ ${Number(item.salePrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            },
            { 
                header: 'Status', 
                accessor: (item) => (
                    <span className={item.isActive ? 'text-emerald-400 font-bold' : 'text-gray-500'}>
                        {item.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                )
            },
        ],
        
        // 📝 O Formulário Central (Desenhado na ordem perfeita para o UX)
        fields: [
            { name: 'name', label: 'Nome do Produto/Serviço', type: 'text', placeholder: 'Ex: Mouse Sem Fio Logitech' },
            
            // Agrupamento Visual de Classificação
            { name: 'categoryId', label: 'Categoria', type: 'select', options: categoryOptions, disabled: loadingCats },
            { name: 'type', label: 'Tipo de Item', type: 'select', options: typeOptions },
            { name: 'baseUOM', label: 'Unid. Medida', type: 'select', options: uomOptions },
            
            // Agrupamento Visual de Preços e Códigos
            { name: 'salePrice', label: 'Preço de Venda (R$)', type: 'number', placeholder: '0.00' },
            { name: 'costPrice', label: 'Custo de Aquisição (R$)', type: 'number', placeholder: '0.00' },
            { name: 'sku', label: 'SKU (Cód. Interno)', type: 'text', placeholder: 'Gerado auto se vazio' },
            { name: 'barcode', label: 'Código de Barras (EAN)', type: 'text' },
            
            // Agrupamento Fiscal
            { name: 'taxGroupId', label: 'Regra Fiscal (Tributação)', type: 'select', options: fiscalOptions, disabled: loadingFiscal },

            
            
            // Status
            { name: 'isActive', label: 'Visível no Catálogo', type: 'boolean', trueLabel: 'Ativo', falseLabel: 'Inativo' }
        ],

        // 🛡️ A Sanfona de Auditoria (Esconde a sujeira do sistema)
        systemFields: [
            { name: 'id', label: 'ID do Produto Pai', type: 'text' },
            { name: 'variantId', label: 'ID do SKU Principal', type: 'text' }, // Escondemos o ID da Variante aqui!
            { name: 'createdAt', label: 'Data de Criação', type: 'text' },
            { name: 'updatedAt', label: 'Última Modificação', type: 'text' }
        ]

    }), [categoryOptions, fiscalOptions, loadingCats, loadingFiscal]);

    // 🔌 5. Os Ganchos do Motor
    const crudHooks: CrudHooks<any, ProductFormInput> = {
        data: flatProducts, // Passamos a lista achatada e limpa!
        isLoading: loadingProducts,
        error: queryError || mutationError || null,
        onCreate: createProduct as any,
        onUpdate: updateProduct as any,
        onDelete: deleteProduct,
        onRefresh: refreshProducts
    };

    return <CrudLayout config={productConfig} hooks={crudHooks} />;
};