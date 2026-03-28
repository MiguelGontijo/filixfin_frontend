'use client';

import React from 'react';

// --- Motores do Core CRUD V4 (A fundação blindada) ---
import { CrudLayout } from '@/core/components/crud/CrudLayout';
import { CrudHooks } from '@/core/components/crud/types';

// --- Inteligência de Domínio e Configuração ---
import { ProductFormInput } from '../../domain/schemas/productSchema';
import { useProductConfig } from '../../application/useProductConfig';

// --- Hooks de Aplicação (Caminhos da Nova Estrutura) ---
import { useProducts } from '../../application/hooks/useProducts';
import { useProductMutation } from '../../application/hooks/useProductMutation';
import { useCategories } from '@/modules/categories/hooks/useCategories';
import { useFiscal } from '@/modules/fiscal/hooks/useFiscal';

/**
 * ============================================================================
 * 🏭 REGISTRY: ProductRegistry (Versão Purificada V2)
 * @description Maestro principal para gestão de produtos e serviços polimórficos.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Netflix/Shopify Architecture):
 * 1. Zero-Maintenance Data: Remove o 'Great Flattener' manual. O Motor CRUD 
 * agora consome o middleware 'hydrate' definido no Config automaticamente.
 * 2. Pure Data Binding: Mantém o Registry 100% agnóstico à estrutura do JSONB.
 * 3. Reactive Sync: Integração total com categorias, fiscal e mutações de API.
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
     * O Hook especializado agora entrega não apenas os campos, mas a inteligência 
     * de hidratação/desidratação que o Motor CRUD executará internamente.
     */
    const productConfig = useProductConfig({ 
        categories, 
        taxGroups, 
        loadingCats, 
        loadingFiscal 
    });

    /**
     * 🔌 4. GANCHOS DE EXECUÇÃO (Data Bindings)
     * Conecta as ações do Motor CRUD aos Hooks de Mutação.
     * Nota: O 'flatProducts' foi removido. O CrudLayout receberá 'products' bruto 
     * e aplicará o hydrate por conta própria em cada linha e no formulário.
     */
    const crudHooks: CrudHooks<any, ProductFormInput> = {
        data: products || [],
        isLoading: loadingProducts,
        error: queryError || mutationError || null,
        onCreate: createProduct as any,
        onUpdate: updateProduct as any,
        onDelete: deleteProduct,
        onRefresh: refreshProducts
    };

    return <CrudLayout config={productConfig} hooks={crudHooks} />;
};