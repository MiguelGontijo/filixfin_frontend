'use client';

import React, { useMemo } from 'react';
import { FaBoxOpen, FaCogs } from 'react-icons/fa';

// --- Motores do Core CRUD V4 ---
import { CrudConfig } from '@/core/components/crud/types';

// --- Inteligência de Domínio (Caminhos da Nova Estrutura) ---
import { ProductFormSchema, ProductFormInput } from '../domain/schemas/productSchema';
import { ProductType, BaseUOM, ProductDomainModel } from '../domain/types/enums';

// --- Operários de Metadados (A Pele Dinâmica do JSONB) ---
import { VehicleFields } from '../presentation/components/metadata-forms/VehicleFields';
import { RealEstateFields } from '../presentation/components/metadata-forms/RealEstateFields';
import { DigitalFields } from '../presentation/components/metadata-forms/DigitalFields';
import { ServiceFields } from '../presentation/components/metadata-forms/ServiceFields';
import { FoodFields } from '../presentation/components/metadata-forms/FoodFields';
import { PhysicalFields } from '../presentation/components/metadata-forms/PhysicalFields';

interface UseProductConfigProps {
    categories: any[];
    taxGroups: any[];
    loadingCats?: boolean;
    loadingFiscal?: boolean;
}

/**
 * ============================================================================
 * 🧠 HOOK: useProductConfig
 * @description Centraliza a inteligência de renderização e validação do módulo 
 * de produtos. Abstrai a complexidade do polimorfismo de metadados.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Netflix/Shopify Level):
 * 1. Clean Presentation: Isola a definição de colunas e campos do registro.
 * 2. Dynamic Field Mapping: Gerencia a injeção dos sub-forms de metadados 
 * com base no DomainModel selecionado.
 * 3. Reactive Dependencies: Recalcula opções de Categoria e Fiscal apenas 
 * quando necessário via useMemo.
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
        description: 'Gestão integrada de bens e serviços com inteligência de nicho.',
        icon: <FaBoxOpen className="text-accent-primary" />,
        schema: ProductFormSchema as any,

        // 📊 A VITRINE: Configuração de Colunas da Tabela
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
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.salePrice)}
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

        // 📝 O FORMULÁRIO: Definição de Campos e Lógica Reativa
        fields: [
            { name: 'name', label: 'Nome do Produto/Serviço', type: 'text', placeholder: 'Ex: Tesla Model 3' },
            { 
                name: 'type', 
                label: 'Estrutura Comercial', 
                type: 'select', 
                options: [
                    { label: '📦 Simples', value: ProductType.SIMPLE },
                    { label: '📊 Grade', value: ProductType.VARIABLE },
                    { label: '🛠️ Serviço', value: ProductType.SERVICE },
                    { label: '🎁 Kit', value: ProductType.KIT },
                ] 
            },
            { 
                name: 'domainModel', 
                label: 'Modelo de Domínio', 
                type: 'select', 
                options: [
                    { label: '🛒 Físico Geral', value: ProductDomainModel.PHYSICAL },
                    { label: '🏎️ Automotivo', value: ProductDomainModel.VEHICLE },
                    { label: '🏠 Imobiliário', value: ProductDomainModel.REAL_ESTATE },
                    { label: '🍕 Alimentação', value: ProductDomainModel.FOOD },
                    { label: '💾 Digital', value: ProductDomainModel.DIGITAL },
                    { label: '⚙️ Serviço Especializado', value: ProductDomainModel.SERVICE },
                ] 
            },
            { 
                name: 'categoryId', 
                label: 'Categoria', 
                type: 'select', 
                options: categories.map(c => ({ label: c.name, value: c.id })), 
                disabled: loadingCats 
            },
            { 
                name: 'taxGroupId', 
                label: 'Regra Fiscal', 
                type: 'select', 
                options: taxGroups.map(t => ({ label: t.name, value: t.id })), 
                disabled: loadingFiscal 
            },
            { 
                name: 'baseUOM', 
                label: 'Unidade de Medida', 
                type: 'select', 
                options: Object.values(BaseUOM).map(v => ({ label: v, value: v })) 
            },
            { name: 'salePrice', label: 'Preço (R$)', type: 'number', placeholder: '0,00' },
            { name: 'sku', label: 'SKU Interno', type: 'text', placeholder: 'Código único de estoque' },

            /**
             * 🧠 INJEÇÃO POLIMÓRFICA (Custom Render)
             * Responsável por trocar o sub-formulário de metadados em tempo real.
             */
            {
                name: 'metadata',
                label: 'Metadados Técnicos',
                type: 'custom',
                customRender: (form) => {
                    const domain = form.watch('domainModel') as ProductDomainModel;
                    const metadataValue = form.watch('metadata') || {};
                    const setMetadata = (data: any) => form.setValue('metadata', data, { shouldValidate: true });

                    return (
                        <div className="col-span-full bg-gray-900/30 p-5 rounded-2xl border border-gray-800 shadow-inner animate-fade-in">
                            <div className="flex items-center gap-2 mb-4 opacity-50 text-[10px] font-bold uppercase tracking-widest">
                                <FaCogs /> Especificações de Nicho: {domain}
                            </div>

                            {domain === ProductDomainModel.PHYSICAL && <PhysicalFields metadata={metadataValue as any} onChange={setMetadata} />}
                            {domain === ProductDomainModel.VEHICLE && <VehicleFields metadata={metadataValue as any} onChange={setMetadata} />}
                            {domain === ProductDomainModel.REAL_ESTATE && <RealEstateFields metadata={metadataValue as any} onChange={setMetadata} />}
                            {domain === ProductDomainModel.FOOD && <FoodFields metadata={metadataValue as any} onChange={setMetadata} />}
                            {domain === ProductDomainModel.DIGITAL && <DigitalFields metadata={metadataValue as any} onChange={setMetadata} />}
                            {domain === ProductDomainModel.SERVICE && <ServiceFields metadata={metadataValue as any} onChange={setMetadata} />}
                        </div>
                    );
                }
            },
            { name: 'isActive', label: 'Disponível para venda', type: 'boolean' }
        ],

        // 🛡️ AUDITORIA
        systemFields: [
            { name: 'id', label: 'ID Produto', type: 'text' },
            { name: 'createdAt', label: 'Data Cadastro', type: 'text' }
        ]
    }), [categories, taxGroups, loadingCats, loadingFiscal]);

    return productConfig;
};