'use client';

import React from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { FaPlus, FaTrash, FaGlobeAmericas, FaMapMarkerAlt, FaPercent, FaFileInvoice } from 'react-icons/fa';

/**
 * @interface TaxRuleManagerProps
 * @description Recebe o controle total do formulário pai via portal customRender.
 */
interface TaxRuleManagerProps {
    formContext: UseFormReturn<any>;
}

/**
 * @component TaxRuleManager
 * @description O Motor Visual da Matriz Tributária.
 * Permite adicionar, editar e remover regras fiscais dinamicamente.
 */
export function TaxRuleManager({ formContext }: TaxRuleManagerProps) {
    const { control, register, formState: { errors } } = formContext;

    // =========================================================================
    // 🧠 O CÉREBRO DO ARRAY DINÂMICO
    // =========================================================================
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'rules', // O nome exato do array no nosso Zod Schema
    });

    // Função para adicionar uma nova linha em branco (SEMPRE sem ID, garantindo que seja uma criação nova)
    const handleAddRule = () => {
        append({
            ufOrigem: '',
            ufDestino: '',
            cfopState: '',
            cfopInterstate: '',
            cstCsosn: '',
            icmsRate: 0,
            pisRate: 0,
            cofinsRate: 0,
        });
    };

    // 💡 FIX CLASSE OURO (TypeScript 7053):
    // Como o 'errors.rules' pode ser o erro geral do Array OU um mapa de erros por índice,
    // nós fazemos uma coerção segura para um Record (Dicionário numérico) para o TS não reclamar.
    const safeRulesErrors = errors.rules as unknown as Record<number, any>;

    return (
        <div className="space-y-4 animate-fade-in mt-6 border-t border-gray-700/50 pt-6">
            
            {/* --- CABEÇALHO DO GESTOR --- */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h4 className="text-sm font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                        <FaFileInvoice className="text-accent-primary" />
                        Matriz de Regras de Imposto
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                        Defina a regra padrão global e adicione exceções por Estado (UF).
                    </p>
                </div>
                
                <button
                    type="button"
                    onClick={handleAddRule}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-base-dark bg-accent-primary rounded-md hover:bg-accent-primary-hover transition-colors shadow-lg"
                >
                    <FaPlus /> Nova Regra
                </button>
            </div>

            {/* --- ERRO GLOBAL DO ARRAY --- */}
            {/* Aqui pegamos a mensagem se o erro for do array inteiro (Ex: Array vazio) */}
            {errors.rules && !Array.isArray(errors.rules) && (errors.rules as any).message && (
                <div className="p-3 bg-red-900/20 text-red-400 text-xs rounded-lg border border-red-500/30">
                    ⚠️ {(errors.rules as any).message}
                </div>
            )}

            {/* --- O LOOP DE RENDERIZAÇÃO DAS REGRAS (Cards) --- */}
            <div className="space-y-4">
                {fields.map((field, index) => {
                    
                    // 💡 Aplicação do FIX TS: Buscamos os erros exatos desta linha
                    const ruleErrors = safeRulesErrors?.[index];
                    
                    return (
                        <div 
                            key={field.id} 
                            className="relative bg-gray-900 border border-gray-700 rounded-xl p-5 transition-all hover:border-gray-600 shadow-sm group"
                        >
                            {/* BADGE DA REGRA & BOTÃO EXCLUIR */}
                            <div className="absolute top-0 right-0 p-3 flex gap-2">
                                {index === 0 && (
                                    <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-gray-800 text-accent-primary rounded border border-gray-700">
                                        <FaGlobeAmericas /> Padrão Global
                                    </span>
                                )}
                                
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    disabled={fields.length === 1} 
                                    className="text-gray-500 hover:text-red-400 transition-colors p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                                    title={fields.length === 1 ? "O grupo precisa de pelo menos 1 regra" : "Excluir regra"}
                                >
                                    <FaTrash className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-2">
                                
                                {/* 1. BLOCO DE CENÁRIO (Origem/Destino) */}
                                <div className="md:col-span-3 space-y-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                                        <FaMapMarkerAlt /> Cenário (UF)
                                    </h5>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] text-gray-500 mb-1">Origem</label>
                                            <input
                                                {...register(`rules.${index}.ufOrigem`)}
                                                placeholder="Ex: SP"
                                                maxLength={2}
                                                className={`w-full bg-gray-900 border ${ruleErrors?.ufOrigem ? 'border-red-500' : 'border-gray-700'} rounded p-2 text-xs text-white text-center uppercase focus:ring-1 focus:ring-accent-primary outline-none`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-gray-500 mb-1">Destino</label>
                                            <input
                                                {...register(`rules.${index}.ufDestino`)}
                                                placeholder="Ex: RJ"
                                                maxLength={2}
                                                className={`w-full bg-gray-900 border ${ruleErrors?.ufDestino ? 'border-red-500' : 'border-gray-700'} rounded p-2 text-xs text-white text-center uppercase focus:ring-1 focus:ring-accent-primary outline-none`}
                                            />
                                        </div>
                                    </div>
                                    {(ruleErrors?.ufOrigem || ruleErrors?.ufDestino) && (
                                        <p className="text-[9px] text-red-400 mt-1 leading-tight">UF deve ter 2 letras.</p>
                                    )}
                                </div>

                                {/* 2. BLOCO DE CÓDIGOS NF-E */}
                                <div className="md:col-span-5 space-y-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                        Códigos de Operação (NF-e)
                                    </h5>
                                    
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-[10px] text-gray-500 mb-1">CFOP Interno</label>
                                            <input
                                                {...register(`rules.${index}.cfopState`)}
                                                placeholder="5102"
                                                maxLength={4}
                                                className={`w-full bg-gray-900 border ${ruleErrors?.cfopState ? 'border-red-500' : 'border-gray-700'} rounded p-2 text-xs text-white font-mono focus:ring-1 focus:ring-accent-primary outline-none`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-gray-500 mb-1">CFOP Externo</label>
                                            <input
                                                {...register(`rules.${index}.cfopInterstate`)}
                                                placeholder="6102"
                                                maxLength={4}
                                                className={`w-full bg-gray-900 border ${ruleErrors?.cfopInterstate ? 'border-red-500' : 'border-gray-700'} rounded p-2 text-xs text-white font-mono focus:ring-1 focus:ring-accent-primary outline-none`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-gray-500 mb-1" title="Situação Tributária">CST/CSOSN</label>
                                            <input
                                                {...register(`rules.${index}.cstCsosn`)}
                                                placeholder="102"
                                                className={`w-full bg-gray-900 border border-gray-700 rounded p-2 text-xs text-white font-mono focus:ring-1 focus:ring-accent-primary outline-none`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 3. BLOCO DE ALÍQUOTAS (%) */}
                                <div className="md:col-span-4 space-y-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                                        <FaPercent /> Alíquotas Base
                                    </h5>
                                    
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-[10px] text-blue-400 mb-1">ICMS %</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                {...register(`rules.${index}.icmsRate`, { valueAsNumber: true })}
                                                className={`w-full bg-gray-900 border ${ruleErrors?.icmsRate ? 'border-red-500' : 'border-gray-700'} rounded p-2 text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-green-400 mb-1">PIS %</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                {...register(`rules.${index}.pisRate`, { valueAsNumber: true })}
                                                className={`w-full bg-gray-900 border ${ruleErrors?.pisRate ? 'border-red-500' : 'border-gray-700'} rounded p-2 text-xs text-white focus:ring-1 focus:ring-green-500 outline-none`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-yellow-400 mb-1">COFINS %</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                {...register(`rules.${index}.cofinsRate`, { valueAsNumber: true })}
                                                className={`w-full bg-gray-900 border ${ruleErrors?.cofinsRate ? 'border-red-500' : 'border-gray-700'} rounded p-2 text-xs text-white focus:ring-1 focus:ring-yellow-500 outline-none`}
                                            />
                                        </div>
                                    </div>
                                    {(ruleErrors?.icmsRate || ruleErrors?.pisRate || ruleErrors?.cofinsRate) && (
                                        <p className="text-[9px] text-red-400 mt-1 leading-tight">Verifique as alíquotas.</p>
                                    )}
                                </div>
                                
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}