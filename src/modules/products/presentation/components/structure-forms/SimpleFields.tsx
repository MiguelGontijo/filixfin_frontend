'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';

// --- Inteligência de Domínio ---
import { ProductFormInput } from '../../../domain/schemas/productSchema';

/**
 * ============================================================================
 * 📦 COMPONENTE: SimpleFields
 * @description Fragmento de interface para produtos de venda direta (SIMPLE).
 * Injeta os campos de precificação e identificação única na raiz do formulário.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Netflix/Shopify Level):
 * 1. UI Consistency: Utiliza as classes utilitárias do Tailwind para manter 
 * a estética Dark/Metallic do projeto.
 * 2. Hook Form Integration: Conecta-se diretamente ao registro do formulário 
 * pai para garantir validação em tempo real.
 * 3. Zero Side-Effects: Não gerencia estado interno, apenas reflete o estado global.
 * ============================================================================
 */
export const SimpleFields: React.FC<{ form: UseFormReturn<ProductFormInput> }> = ({ form }) => {
    const { register, formState: { errors } } = form;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
            
            {/* 🏷️ Identificação Única */}
            <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">SKU do Produto</label>
                <input 
                    {...register('sku' as any)}
                    placeholder="Ex: PROD-123"
                    className={`w-full bg-black/40 border ${errors.sku ? 'border-red-500/50' : 'border-gray-800'} p-3 rounded-lg text-sm focus:border-accent-primary outline-none transition-all`}
                />
                {errors.sku && <p className="text-[10px] text-red-400">{errors.sku.message as string}</p>}
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Código de Barras (EAN)</label>
                <input 
                    {...register('barcode' as any)}
                    placeholder="789..."
                    className="w-full bg-black/40 border border-gray-800 p-3 rounded-lg text-sm focus:border-accent-primary outline-none transition-all"
                />
            </div>

            {/* 💰 Valores Financeiros */}
            <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Preço de Venda (R$)</label>
                <input 
                    {...register('salePrice' as any)}
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    className={`w-full bg-black/40 border ${errors.salePrice ? 'border-red-500/50' : 'border-gray-800'} p-3 rounded-lg text-sm focus:border-accent-primary outline-none transition-all font-mono text-green-400`}
                />
                {errors.salePrice && <p className="text-[10px] text-red-400">{errors.salePrice.message as string}</p>}
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Preço de Custo (R$)</label>
                <input 
                    {...register('costPrice' as any)}
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    className="w-full bg-black/40 border border-gray-800 p-3 rounded-lg text-sm focus:border-accent-primary outline-none transition-all font-mono text-gray-300"
                />
            </div>

        </div>
    );
};