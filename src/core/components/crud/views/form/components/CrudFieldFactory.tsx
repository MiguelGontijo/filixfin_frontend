'use client';

import React from 'react';
import { UseFormReturn, FieldValues, Path, RegisterOptions, Controller } from 'react-hook-form';

// --- Tipagens e Componentes UI do Core ---
import { CrudField } from '../../../types/engine.types';
import { SmartDatePicker } from '@/core/components/ui/SmartDatePicker';
import { SmartSwitch } from '@/core/components/ui/SmartSwitch'; // 🆕 Injeção do novo componente

export interface CrudFieldFactoryProps<FormData extends FieldValues> {
    field: CrudField<FormData>;
    form: UseFormReturn<FormData>;
    disabled?: boolean;
}

/**
 * ============================================================================
 * 🏭 FÁBRICA DE CAMPOS (CrudFieldFactory V5 - Smart Edition)
 * @description Princípio da Responsabilidade Única (SRP). Traduz contratos 
 * JSON em interfaces de alta performance e fidelidade visual.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Componentes Controlados):
 * 1. Unified Control: Utiliza o padrão Controller para componentes customizados,
 * garantindo sincronia perfeita com o Zod.
 * 2. Visual Evolution: Substitui o checkbox nativo pelo SmartSwitch monumental.
 * 3. Type Resilience: Preserva a integridade de tipos numéricos e de data.
 * ============================================================================
 */
export function CrudFieldFactory<FormData extends FieldValues>({
    field,
    form,
    disabled = false
}: CrudFieldFactoryProps<FormData>) {
    
    const fieldName = String(field.name) as Path<FormData>;
    const errorMessage = form.formState.errors[fieldName]?.message as string | undefined;

    // ========================================================================
    // ⚙️ CONSTRUTOR DE OPÇÕES (Roteamento de Tipagem Seguro)
    // ========================================================================
    let registerOptions: RegisterOptions<FormData, Path<FormData>> = {};
    
    if (field.type === 'number') {
        registerOptions = { valueAsNumber: true };
    }

    // ========================================================================
    // 🧩 1. INJEÇÃO DE MICRO-COMPONENTES (Custom Render)
    // ========================================================================
    if (field.type === 'custom' && field.customRender) {
        return (
            <div className="col-span-full w-full">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider ml-1">
                    {field.label}
                </label>
                
                <div className={disabled ? 'opacity-60 pointer-events-none grayscale' : ''}>
                    {field.customRender(form)}
                </div>
                
                {errorMessage && (
                    <span className="text-red-400 text-xs mt-1 ml-1 block font-medium">
                        {errorMessage}
                    </span>
                )}
            </div>
        );
    }

    // ========================================================================
    // 🎨 2. RENDERIZAÇÃO PADRÃO (Inputs e Componentes UI de Elite)
    // ========================================================================
    return (
        <div className={`flex flex-col space-y-1.5 w-full ${field.type === 'textarea' ? 'col-span-full' : 'col-span-1 md:col-span-1'}`}>
            
            {/* O label é omitido para o SmartSwitch pois ele já possui label interno opcional */}
            {field.type !== 'boolean' && (
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                    {field.label}
                </label>
            )}
            
            {field.type === 'select' ? (
                <select
                    {...form.register(fieldName)}
                    disabled={disabled}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <option value="">Selecione...</option>
                    {field.options?.map((opt, idx) => (
                        <option key={`${opt.value}-${idx}`} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                
            ) : field.type === 'textarea' ? (
                <textarea
                    {...form.register(fieldName)}
                    disabled={disabled}
                    placeholder={field.placeholder}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none transition-all min-h-[100px] resize-y disabled:opacity-50 disabled:cursor-not-allowed"
                />
                
            ) : field.type === 'boolean' ? (
                /**
                 * 🔘 EVOLUÇÃO CLASSE OURO: SmartSwitch Integration
                 * @description Substituímos o checkbox legacy pela experiência cinética.
                 * Usamos o Controller para mapear as labels customizadas vinda do Config.
                 */
                <Controller
                    control={form.control}
                    name={fieldName}
                    render={({ field: { onChange, value } }) => (
                        <SmartSwitch
                            label={field.label}
                            value={value}
                            onChange={onChange}
                            disabled={disabled}
                            options={[
                                { label: field.trueLabel || 'Sim', value: true, activeColor: 'primary' },
                                { label: field.falseLabel || 'Não', value: false, activeColor: 'secondary' }
                            ]}
                        />
                    )}
                />
                
            ) : field.type === 'date' ? (
                <Controller
                    control={form.control}
                    name={fieldName}
                    render={({ field: { onChange, value } }) => (
                        <SmartDatePicker
                            value={value as string | undefined}
                            onChange={onChange}
                            disabled={disabled}
                            placeholder={field.placeholder || "Selecione a data"}
                        />
                    )}
                />
                
            ) : (
                <input
                    type={field.type}
                    {...form.register(fieldName, registerOptions)}
                    disabled={disabled}
                    placeholder={field.placeholder}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
            )}

            {/* Exibição de Erros com Animação */}
            {errorMessage && (
                <span className="text-red-400 text-[10px] font-bold mt-1 ml-1 block uppercase tracking-wide animate-fade-in">
                    {errorMessage}
                </span>
            )}
        </div>
    );
}