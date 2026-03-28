'use client';

import React from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { FaPlus, FaTrash, FaLayerGroup } from 'react-icons/fa';

// --- Inteligência de Domínio ---
import { ProductFormInput } from '../../../domain/schemas/productSchema';

/**
 * ============================================================================
 * 📊 COMPONENTE: VariableFields
 * @description Gestor dinâmico de Grade de Variantes (Matrix/Grid System).
 * Permite a criação de múltiplas variações (Tamanhos, Cores, etc.) vinculadas
 * ao mesmo produto pai, delegando a inteligência financeira para cada item.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Shopify Architecture):
 * 1. Efficient List Rendering: Utiliza 'useFieldArray' para performance otimizada 
 * em listas de alta densidade.
 * 2. Automated Identification: Gera IDs temporários para variantes em criação 
 * garantindo a consistência do estado do React.
 * 3. Matrix Validation: Sincroniza erros do Zod diretamente nos índices do array.
 * ============================================================================
 */
export const VariableFields: React.FC<{ form: UseFormReturn<ProductFormInput> }> = ({ form }) => {
    const { register, control, formState: { errors } } = form;

    // 🔗 Conexão com o Array de Variantes definido no VariableProductSchema
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'variantsList' as any
    });

    /** ➕ Adiciona uma nova variante com valores padrão seguros */
    const addNewVariant = () => {
        append({
            sku: '',
            salePrice: 0,
            costPrice: 0,
            attributes: {}
        });
    };

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent-primary/10 rounded-lg">
                        <FaLayerGroup className="text-accent-primary text-sm" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-200 uppercase tracking-tighter">Grade de Variantes</h4>
                        <p className="text-[10px] text-gray-500">Gerencie SKUs individuais para este produto</p>
                    </div>
                </div>
                
                <button
                    type="button"
                    onClick={addNewVariant}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-primary hover:bg-accent-primary/80 text-black font-bold text-[10px] uppercase rounded-lg transition-all shadow-lg shadow-accent-primary/10"
                >
                    <FaPlus /> Adicionar Variante
                </button>
            </div>

            {/* 📋 LISTA DE VARIANTES (The Grid) */}
            <div className="space-y-3">
                {fields.length === 0 && (
                    <div className="py-12 border-2 border-dashed border-gray-800 rounded-2xl text-center">
                        <p className="text-xs text-gray-600 italic">Nenhuma variante definida. Adicione a primeira para começar.</p>
                    </div>
                )}

                {fields.map((field, index) => (
                    <div 
                        key={field.id} 
                        className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-black/40 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors group"
                    >
                        {/* SKU da Variante */}
                        <div className="md:col-span-4 space-y-1">
                            <label className="text-[9px] font-bold text-gray-500 uppercase">SKU / Identificador</label>
                            <input
                                {...register(`variantsList.${index}.sku` as any)}
                                placeholder="Ex: T-SHIRT-P-PRETA"
                                className="w-full bg-transparent border-b border-gray-800 p-1 text-sm focus:border-accent-primary outline-none transition-all"
                            />
                        </div>

                        {/* Preço de Venda */}
                        <div className="md:col-span-3 space-y-1">
                            <label className="text-[9px] font-bold text-gray-500 uppercase">Preço Venda (R$)</label>
                            <input
                                {...register(`variantsList.${index}.salePrice` as any)}
                                type="number"
                                step="0.01"
                                className="w-full bg-transparent border-b border-gray-800 p-1 text-sm text-green-400 font-mono focus:border-accent-primary outline-none transition-all"
                            />
                        </div>

                        {/* Preço de Custo */}
                        <div className="md:col-span-3 space-y-1">
                            <label className="text-[9px] font-bold text-gray-500 uppercase">Preço Custo (R$)</label>
                            <input
                                {...register(`variantsList.${index}.costPrice` as any)}
                                type="number"
                                step="0.01"
                                className="w-full bg-transparent border-b border-gray-800 p-1 text-sm text-gray-400 font-mono focus:border-accent-primary outline-none transition-all"
                            />
                        </div>

                        {/* Ação de Remoção */}
                        <div className="md:col-span-2 flex items-end justify-end pb-1">
                            <button
                                type="button"
                                onClick={() => remove(index)}
                                className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                title="Remover Variante"
                            >
                                <FaTrash className="text-xs" />
                            </button>
                        </div>

                        {/* 🛡️ Tratamento de Erro Seguro para Uniões Discriminadas */}
                        {(errors as any).variantsList?.[index] && (
                            <div className="col-span-full pt-2">
                                <p className="text-[9px] text-red-400 italic">
                                    ⚠️ Erro na variante {index + 1}: Verifique os dados financeiros e o SKU.
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            {/* 🛡️ Erro Global da Lista (Ex: 'Mínimo 1 variante') */}
            {(errors as any).variantsList?.root && (
                <p className="text-xs text-red-500 font-bold">
                    {(errors as any).variantsList.root.message}
                </p>
            )}
        </div>
    );
};