'use client';

import React, { useMemo } from 'react';
import { FaBoxOpen } from 'react-icons/fa';

/** * --- MOTORES DO CORE CRUD V4 ---
 * O Config agora é 100% declarativo, delegando a inteligência de dados 
 * para o processamento automático da DataEngine no CrudLayout.
 */
import { CrudConfig } from '@/core/components/crud/types';

/** * --- INTELIGÊNCIA DE DOMÍNIO (Schemas & Enums) ---
 * O Schema permanece como o contrato de verdade para validação.
 */
import { ProductFormSchema, ProductFormInput } from '../domain/schemas/productSchema';
import { ProductType, BaseUOM, ProductDomainModel } from '../domain/types/enums';

/** * --- O MAESTRO (Injeção de Poder) ---
 * Orquestrador que gerencia as seções dinâmicas injetadas no formulário.
 */
import { ProductOrchestrator } from '../presentation/components/ProductOrchestrator';

interface UseProductConfigProps {
    categories: any[];
    taxGroups: any[];
    loadingCats?: boolean;
    loadingFiscal?: boolean;
}

/**
 * ============================================================================
 * 🧠 HOOK: useProductConfig
 * @description Centraliza a definição técnica (Blueprint) do catálogo de itens.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Netflix/Shopify Level):
 * 1. Declarative UI: Define labels semânticas para componentes polimórficos.
 * 2. Visual Consistency: Integra o SmartSwitch para controle de status comercial.
 * 3. Zero-Logic Policy: Mantém a pureza do mapeamento delegando a execução ao Core.
 * ============================================================================
 */
export const useProductConfig = ({ 
    categories, 
    taxGroups, 
    loadingCats, 
    loadingFiscal 
}: UseProductConfigProps) => {

    const productConfig: CrudConfig<any, ProductFormInput> = useMemo(() => ({
        title: 'Catálogo de Itens',
        description: 'Gestão integrada de bens e serviços com inteligência de nicho e polimorfismo de dados.',
        icon: <FaBoxOpen className="text-accent-primary" />,
        schema: ProductFormSchema as any,

        /**
         * 📊 A VITRINE: Configuração de Colunas
         */
        columns: [
            { header: 'Nome / Item', accessor: 'name' },
            { 
                header: 'SKU', 
                accessor: (item) => <span className="font-mono text-[11px] text-accent-secondary">{item.sku || 'N/A'}</span> 
            },
            { 
                header: 'Preço Venda', 
                accessor: (item) => (
                    <span className="font-bold text-green-400">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.salePrice || 0)}
                    </span>
                ) 
            },
            { 
                header: 'Status', 
                accessor: (item) => (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-800 text-gray-500'
                    }`}>
                        {item.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                )
            },
        ],

        // 📝 O FORMULÁRIO: Estrutura Genética do Produto
        fields: [
            { 
                name: 'name', 
                label: 'Nome Comercial', 
                type: 'text', 
                placeholder: 'Ex: Smartphone Alpha Pro' 
            },
            
            { 
                name: 'type', 
                label: 'Estrutura Comercial', 
                type: 'select', 
                options: [
                    { label: '📦 Simples (Venda Direta)', value: ProductType.SIMPLE },
                    { label: '📊 Grade (Variantes/Tamanhos)', value: ProductType.VARIABLE },
                    { label: '🛠️ Serviço (Execução/Tempo)', value: ProductType.SERVICE },
                    { label: '🎁 Kit (Combos/Agrupamentos)', value: ProductType.KIT },
                ] 
            },

            { 
                name: 'domainModel', 
                label: 'Modelo de Domínio (Nicho)', 
                type: 'select', 
                options: [
                    { label: '🛒 Físico Geral', value: ProductDomainModel.PHYSICAL },
                    { label: '🏎️ Automotivo', value: ProductDomainModel.VEHICLE },
                    { label: '🏠 Imobiliário', value: ProductDomainModel.REAL_ESTATE },
                    { label: '🍕 Alimentação / Food', value: ProductDomainModel.FOOD },
                    { label: '💾 Digital / Software', value: ProductDomainModel.DIGITAL },
                    { label: '⚙️ Serviço Especializado', value: ProductDomainModel.SERVICE },
                ] 
            },

            { 
                name: 'categoryId', 
                label: 'Categoria do Item', 
                type: 'select', 
                options: categories.map(c => ({ label: c.name, value: c.id })), 
                disabled: loadingCats 
            },
            
            { 
                name: 'taxGroupId', 
                label: 'Regra Fiscal (Tributação)', 
                type: 'select', 
                options: taxGroups.map(t => ({ label: t.name, value: t.id })), 
                disabled: loadingFiscal 
            },

            { 
                name: 'baseUOM', 
                label: 'Unid. Medida', 
                type: 'select', 
                options: Object.values(BaseUOM).map(v => ({ label: v, value: v })) 
            },

            {
                name: '_orchestrator_bridge',
                label: 'Detalhes Técnicos e Comerciais',
                type: 'custom',
                colSpan: 'full',
                customRender: (form) => <ProductOrchestrator form={form} />
            },

            /**
             * 🔘 CAMPO EVOLUÍDO: isActive
             * @description Agora utilizando labels semânticas que o SmartSwitch 
             * interpretará para exibir "Ativo" (Laranja) e "Inativo" (Violeta).
             */
            { 
                name: 'isActive', 
                label: 'Status de Disponibilidade', 
                type: 'boolean',
                trueLabel: 'Ativo',
                falseLabel: 'Inativo'
            }
        ],

        // 🛡️ AUDITORIA (Rastreabilidade)
        systemFields: [
            { name: 'id', label: 'ID Único', type: 'text' },
            { name: 'createdAt', label: 'Data de Registro', type: 'text' }
        ]
    }), [categories, taxGroups, loadingCats, loadingFiscal]);

    return productConfig;
};