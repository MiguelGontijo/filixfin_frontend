'use client';

import React, { useEffect } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { FaCogs, FaProjectDiagram } from 'react-icons/fa';

/** * --- INTELIGÊNCIA DE DOMÍNIO (Contratos de Elite) ---
 * Importamos os Enums e o Tipo do Schema Unificado para garantir 
 * que a orquestração respeite a genética do Produto.
 */
import { ProductType, ProductDomainModel } from '../../domain/types/enums';
import { ProductFormInput } from '../../domain/schemas/productSchema';

/** * --- 📦 FRAGMENTOS DE ESTRUTURA (Como se vende) ---
 * Componentes que injetam campos na raiz ou em listas (variantsList, componentsList).
 */
import { SimpleFields } from './structure-forms/SimpleFields';
import { VariableFields } from './structure-forms/VariableFields';
import { ServiceFields as ServiceFieldsStructure } from './structure-forms/ServiceFields';
import { KitFields } from './structure-forms/KitFields';

/** * --- 🧬 FRAGMENTOS DE MODELO/NICHO (O que se vende) ---
 * Componentes que injetam atributos polimórficos no campo 'attributes' (JSONB).
 * Agora operam sobre a nomenclatura unificada com o Backend.
 */
import { VehicleFields } from './attributes-forms/VehicleFields';
import { RealEstateFields } from './attributes-forms/RealEstateFields';
import { DigitalFields } from './attributes-forms/DigitalFields';
import { ServiceFields } from './attributes-forms/ServiceFields';
import { FoodFields } from './attributes-forms/FoodFields';
import { PhysicalFields } from './attributes-forms/PhysicalFields';

interface ProductOrchestratorProps {
    form: UseFormReturn<ProductFormInput>;
}

/**
 * ============================================================================
 * 🏛️ COMPONENTE: ProductOrchestrator (Versão Sincronizada V3)
 * @description O Grande Mediador de Estado e Interface do Módulo de Produtos.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Netflix/Shopify Level):
 * 1. Attribute Symmetry: Migração definitiva do container de dados para 'attributes',
 * eliminando a barreira semântica com o Service do Backend.
 * 2. Dynamic Routing: Gerencia a montagem dos sub-formulários baseando-se no 
 * DNA (domainModel) e na Estrutura (type) do objeto.
 * 3. State Sanitization: Garante que a troca de tipo comercial limpe campos órfãos,
 * mantendo a integridade do payload final.
 * ============================================================================
 */
export const ProductOrchestrator: React.FC<ProductOrchestratorProps> = ({ form }) => {
    
    /** 👁️ OBSERVADORES DE ESTADO (Scoped Watch)
     * Monitoramos os gatilhos de mudança de arquitetura (type) e nicho (domainModel).
     */
    const type = useWatch({ control: form.control, name: 'type' });
    const domainModel = useWatch({ control: form.control, name: 'domainModel' });

    /**
     * 🧹 FAXINA DE ESTADO (Sanitization Layer)
     * @description Quando o usuário troca a 'Estrutura Comercial', precisamos 
     * remover do estado os campos que pertencem a outros contratos estruturais.
     */
    useEffect(() => {
        if (!type) return;

        /** 🛡️ Lógica de Expurgo (Anti-Corruption) */
        if (type === ProductType.VARIABLE) {
            form.unregister(['sku', 'salePrice', 'costPrice', 'barcode', 'durationMinutes', 'serviceCode'] as any);
        } else {
            form.unregister('variantsList' as any);
        }

        if (type !== ProductType.SERVICE) {
            form.unregister(['durationMinutes', 'serviceCode'] as any);
        }

        if (type !== ProductType.KIT) {
            form.unregister('componentsList' as any);
        }

        // Sincroniza a validação após a limpeza para evitar erros persistentes em campos ocultos
        form.trigger();

    }, [type, form]);

    return (
        <div className="col-span-full space-y-12 animate-in fade-in duration-700">
            
            {/* --- 📦 SEÇÃO 2: ESTRUTURA COMERCIAL (Dinamismo por ProductType) --- */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 opacity-30 text-[10px] font-black uppercase tracking-[0.25em] border-b border-gray-800 pb-3">
                    <FaProjectDiagram className="text-accent-secondary" /> 
                    Arquitetura Comercial: <span className="text-accent-primary ml-1">{type}</span>
                </div>
                
                <div className="min-h-[120px] transition-all">
                    {type === ProductType.SIMPLE && <SimpleFields form={form} />}
                    {type === ProductType.VARIABLE && <VariableFields form={form} />}
                    {type === ProductType.SERVICE && <ServiceFieldsStructure form={form} />}
                    {type === ProductType.KIT && <KitFields form={form} />}
                </div>
            </div>

            {/* --- ⚙️ SEÇÃO 3: ESPECIFICAÇÕES DE MODELO (Dinamismo por ProductDomainModel) --- */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 opacity-30 text-[10px] font-black uppercase tracking-[0.25em] border-b border-gray-800 pb-3">
                    <FaCogs className="text-accent-primary" /> 
                    DNA do Ativo / Nicho: <span className="text-accent-secondary ml-1">{domainModel}</span>
                </div>

                <div className="bg-gradient-to-br from-black/40 via-black/20 to-transparent p-8 rounded-[2rem] border border-gray-800/60 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    {/* Injeção de Atributos: Os sub-formulários agora escrevem em 'attributes.x' */}
                    {domainModel === ProductDomainModel.PHYSICAL && <PhysicalFields form={form as any} />}
                    {domainModel === ProductDomainModel.VEHICLE && <VehicleFields form={form as any} />}
                    {domainModel === ProductDomainModel.REAL_ESTATE && <RealEstateFields form={form as any} />}
                    {domainModel === ProductDomainModel.FOOD && <FoodFields form={form as any} />}
                    {domainModel === ProductDomainModel.DIGITAL && <DigitalFields form={form as any} />}
                    {domainModel === ProductDomainModel.SERVICE && <ServiceFields form={form as any} />}
                </div>
            </div>

        </div>
    );
};