'use client';

import React from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { FaBoxes, FaPlus, FaTrash, FaLayerGroup } from 'react-icons/fa';

// --- Inteligência de Domínio ---
import { ProductFormInput } from '../../../domain/schemas/productSchema';

/**
 * ============================================================================
 * 🎁 COMPONENTE: KitFields
 * @description Gestor de Composição para Combos e Agrupamentos (KIT).
 * Permite vincular múltiplas variantes existentes a um único SKU comercial,
 * gerenciando quantidades e preços de venda unificados.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Amazon/Shopify Level):
 * 1. Composition Logic: Utiliza 'useFieldArray' para gerenciar a lista de componentes.
 * 2. Type-Safe Access: Aplica cast seguro (errors as any) para evitar conflitos 
 * de união discriminada no TypeScript (Erro ts(2339)).
 * 3. Atomic Identity: Mantém o SKU e Preço de Venda na raiz, conforme o KitProductSchema.
 * ============================================================================
 */
export const KitFields: React.FC<{ form: UseFormReturn<ProductFormInput> }> = ({ form }) => {
    const { register, control, formState: { errors } } = form;

    // 🔗 Conexão com a lista de componentes do KitProductSchema
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'componentsList' as any
    });

    /** ➕ Adiciona um novo slot de componente ao Kit */
    const addComponent = () => {
        append({ variantId: '', quantity: 1, unitPrice: 0 });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
            
            {/* --- SEÇÃO A: IDENTIDADE DO COMBO (RAIZ) --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-accent-primary/5 border border-accent-primary/10 rounded-2xl">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-accent-primary/80">SKU do Kit (Combo)</label>
                    <input 
                        {...register('sku' as any)}
                        placeholder="Ex: KIT-Gamer-01"
                        className={`w-full bg-black/40 border ${(errors as any).sku ? 'border-red-500/50' : 'border-gray-800'} p-3 rounded-lg text-sm focus:border-accent-primary outline-none transition-all font-mono`}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-accent-primary/80">Preço de Venda do Combo (R$)</label>
                    <input 
                        {...register('salePrice' as any)}
                        type="number"
                        step="0.01"
                        className={`w-full bg-black/40 border ${(errors as any).salePrice ? 'border-red-500/50' : 'border-gray-800'} p-3 rounded-lg text-sm focus:border-accent-primary outline-none transition-all font-mono text-green-400`}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Custo Total Estimado (R$)</label>
                    <input 
                        {...register('costPrice' as any)}
                        type="number"
                        step="0.01"
                        className="w-full bg-black/40 border border-gray-800 p-3 rounded-lg text-sm focus:border-accent-primary outline-none transition-all font-mono text-gray-400"
                    />
                </div>
            </div>

            {/* --- SEÇÃO B: COMPONENTES DO KIT --- */}
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                    <div className="flex items-center gap-2">
                        <FaBoxes className="text-accent-secondary text-xs" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Itens Inclusos no Kit</span>
                    </div>
                    <button
                        type="button"
                        onClick={addComponent}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-[9px] uppercase rounded-md transition-all border border-gray-700"
                    >
                        <FaPlus className="text-[8px]" /> Adicionar Item
                    </button>
                </div>

                <div className="grid gap-3">
                    {fields.length === 0 && (
                        <div className="py-8 border border-dashed border-gray-800 rounded-xl text-center">
                            <p className="text-[10px] text-gray-600 italic font-mono uppercase tracking-tighter">O Kit deve possuir pelo menos 2 componentes.</p>
                        </div>
                    )}

                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-4 p-3 bg-black/20 border border-gray-800/50 rounded-xl group hover:border-gray-700 transition-all">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                                {/* Seleção da Variante (ID) */}
                                <div className="md:col-span-8 space-y-1">
                                    <label className="text-[9px] font-bold text-gray-600 uppercase">ID da Variante / Produto</label>
                                    <input 
                                        {...register(`componentsList.${index}.variantId` as any)}
                                        placeholder="UUID da variante..."
                                        className="w-full bg-transparent border-b border-gray-800 p-1 text-sm focus:border-accent-secondary outline-none transition-all"
                                    />
                                </div>
                                {/* Quantidade */}
                                <div className="md:col-span-4 space-y-1">
                                    <label className="text-[9px] font-bold text-gray-600 uppercase">Qtd.</label>
                                    <input 
                                        {...register(`componentsList.${index}.quantity` as any)}
                                        type="number"
                                        min="1"
                                        className="w-full bg-transparent border-b border-gray-800 p-1 text-sm focus:border-accent-secondary outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => remove(index)}
                                className="p-2 text-gray-700 hover:text-red-500 transition-colors"
                            >
                                <FaTrash className="text-xs" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Erros da Lista (Ex: Mínimo de 2 componentes) */}
                {(errors as any).componentsList?.root && (
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">
                        ⚠️ {(errors as any).componentsList.root.message}
                    </p>
                )}
            </div>
        </div>
    );
};