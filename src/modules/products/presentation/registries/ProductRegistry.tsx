'use client';

import React, { useMemo } from 'react';

// --- Motores do Core CRUD V4 (A fundação blindada) ---
import { CrudLayout } from '@/core/components/crud/CrudLayout';
import { CrudHooks } from '@/core/components/crud/types';

// --- Inteligência de Domínio e Configuração ---
import { ProductDomainModel } from '../../domain/types/enums';
import { ProductFormInput } from '../../domain/schemas/productSchema';
import { useProductConfig } from '../../application/useProductConfig';

// --- Hooks de Aplicação (Caminhos da Nova Estrutura) ---
import { useProducts } from '../../application/hooks/useProducts';
import { useProductMutation } from '../../application/hooks/useProductMutation';
import { useCategories } from '@/modules/categories/hooks/useCategories';
import { useFiscal } from '@/modules/fiscal/hooks/useFiscal';

/**
 * ============================================================================
 * 🏭 REGISTRY: ProductRegistry
 * @description Maestro principal para gestão de produtos e serviços polimórficos.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Netflix/Shopify Architecture):
 * 1. Strategic Decoupling: Consome a inteligência visual via 'useProductConfig', 
 * mantendo o Registry focado apenas no fluxo de dados.
 * 2. Data Transformation (Flattener): Normaliza a estrutura de Variantes/JSONB 
 * para uma visão plana e executiva na CrudTable V4.
 * 3. Reactive Integration: Sincroniza estados de Categoria e Fiscal em tempo 
 * real com os seletores do formulário.
 * ============================================================================
 */
export const ProductRegistry: React.FC = () => {
    // 🔌 1. Injeção de Motores de Dados (Camada de Application)
    const { products, isLoading: loadingProducts, error: queryError, refreshProducts } = useProducts();
    const { createProduct, updateProduct, deleteProduct, error: mutationError } = useProductMutation();
    
    // 🔗 2. Dependências de Contexto (Dados Relacionais)
    const { categories, isLoading: loadingCats } = useCategories();
    const { taxGroups, isLoading: loadingFiscal } = useFiscal();

    /**
     * 📐 3. CONFIGURAÇÃO VISUAL (Abstração de UI)
     * Delegamos a definição de campos e colunas para o hook especializado.
     */
    const productConfig = useProductConfig({ 
        categories, 
        taxGroups, 
        loadingCats, 
        loadingFiscal 
    });

    /**
     * 🔄 4. THE GREAT FLATTENER (Normalização de Leitura)
     * @description Traduz o modelo rico do Backend para o formato plano da Tabela.
     */
    const flatProducts = useMemo(() => {
        return (products || []).map(product => {
            // Extração da Variante Mestra para exibição Master-Data
            const mainVariant = (product.variants && product.variants.length > 0) 
                ? product.variants[0] 
                : {} as any;
            
            const metadataRaw = mainVariant.metadata as any;
            const domain = metadataRaw?.domain || ProductDomainModel.PHYSICAL;

            return {
                ...product,
                variantId: mainVariant.id || '',
                sku: mainVariant.sku || '',
                salePrice: mainVariant.salePrice || 0,
                domainModel: domain,
                // O metadata aqui chega plano para alimentar os sub-forms no CustomRender
                metadata: metadataRaw?.data || {}
            };
        });
    }, [products]);

    /**
     * 🔌 5. GANCHOS DE EXECUÇÃO (Data Bindings)
     * Conecta as ações do Motor CRUD aos Hooks de Mutação.
     */
    const crudHooks: CrudHooks<any, ProductFormInput> = {
        data: flatProducts,
        isLoading: loadingProducts,
        error: queryError || mutationError || null,
        onCreate: createProduct as any,
        onUpdate: updateProduct as any,
        onDelete: deleteProduct,
        onRefresh: refreshProducts
    };

    return <CrudLayout config={productConfig} hooks={crudHooks} />;
};