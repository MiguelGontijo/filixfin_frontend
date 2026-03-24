import React from 'react';
import { UseFormReturn, FieldValues, Path, RegisterOptions, Controller } from 'react-hook-form'; // 💡 IMPORT VITAL: Controller adicionado

// --- Tipagens e Componentes UI ---
import { CrudField } from '../types';
import { SmartDatePicker } from '../../ui/SmartDatePicker'; // 👈 Nosso Calendário Inteligente

export interface CrudFieldFactoryProps<FormData extends FieldValues> {
    field: CrudField<FormData>;
    form: UseFormReturn<FormData>;
    disabled?: boolean;
}

/**
 * ============================================================================
 * 🏭 FÁBRICA DE CAMPOS (CrudFieldFactory)
 * @description Princípio da Responsabilidade Única (SRP) do SOLID. 
 * Este componente não conhece regras de negócio. Sua ÚNICA função é traduzir 
 * um contrato JSON em inputs visuais de alta fidelidade e interceptar erros.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Componentes Controlados):
 * - Substitui o <input type="date"> nativo falho por um SmartDatePicker,
 * eliminando problemas de Timezone e garantindo que o Zod receba Strings ISO puras.
 * ============================================================================
 */
export function CrudFieldFactory<FormData extends FieldValues>({
    field,
    form,
    disabled = false
}: CrudFieldFactoryProps<FormData>) {
    
    // 🛡️ Tipagem Forte: Garante que o fieldName é um caminho válido no formulário.
    const fieldName = String(field.name) as Path<FormData>;
    const errorMessage = form.formState.errors[fieldName]?.message as string | undefined;

    // ========================================================================
    // ⚙️ CONSTRUTOR DE OPÇÕES (Roteamento de Tipagem Seguro)
    // ========================================================================
    let registerOptions: RegisterOptions<FormData, Path<FormData>> = {};
    
    // 🛡️ FIX ARQUITETURAL: Removemos o `valueAsDate: true`. 
    // A data agora trafega como String pura (ISO 8601), respeitando o Zod Schema 
    // e evitando bloqueios silenciosos na submissão.
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
    // 🎨 2. RENDERIZAÇÃO PADRÃO (Inputs e Componentes UI)
    // ========================================================================
    return (
        <div className={`flex flex-col space-y-1.5 w-full ${field.type === 'textarea' ? 'col-span-full' : 'col-span-1 md:col-span-1'}`}>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                {field.label}
            </label>
            
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
                <label className={`flex items-center space-x-3 cursor-pointer mt-2 bg-gray-900/50 p-3 rounded-xl border border-gray-700/50 transition-opacity ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}>
                    <div className="relative">
                        <input type="checkbox" {...form.register(fieldName)} disabled={disabled} className="sr-only" />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${form.watch(fieldName) ? 'bg-accent-primary' : 'bg-gray-600'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${form.watch(fieldName) ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <div className="text-sm font-bold text-gray-300">
                        {form.watch(fieldName) ? (field.trueLabel || 'Sim') : (field.falseLabel || 'Não')}
                    </div>
                </label>
                
            ) : field.type === 'date' ? (
                // 📅 O CALENDÁRIO INTELIGENTE: Padrão "Controlled Input"
                // O Controller atua como um tradutor perfeito entre o nosso componente
                // de UI customizado e a engine interna do React Hook Form.
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
                    // 🛡️ O objeto limpo e seguro é injetado aqui
                    {...form.register(fieldName, registerOptions)}
                    disabled={disabled}
                    placeholder={field.placeholder}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
            )}

            {/* Exibição de Erros */}
            {errorMessage && (
                <span className="text-red-400 text-[10px] font-bold mt-1 ml-1 block uppercase tracking-wide animate-fade-in">
                    {errorMessage}
                </span>
            )}
        </div>
    );
}