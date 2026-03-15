// ===== FILE: src/core/components/crud/CrudForm.tsx =====

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useForm, Controller, FieldValues, SubmitHandler, DefaultValues, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FaTimes, FaSave, FaChevronDown, FaChevronUp, FaShieldAlt } from 'react-icons/fa';
import { CrudConfig, CrudFieldConfig } from './types';

interface CrudFormProps<TData, TForm extends FieldValues> {
    isOpen: boolean;
    onClose: () => void;
    config: CrudConfig<TData, TForm>;
    initialData?: TData | null;
    onSubmit: (data: TForm) => Promise<void>;
}

/**
 * @component CrudForm (A Impressora 3D - Motor V4.1)
 * @description Drawer universal que desenha inputs automaticamente.
 * CLASSE OURO: Implementa o "Absolute Reset" para evitar vazamento de memória
 * em arrays complexos (Master-Detail) na transição de Edição para Criação.
 */
export function CrudForm<TData, TForm extends FieldValues>({
    isOpen,
    onClose,
    config,
    initialData,
    onSubmit
}: CrudFormProps<TData, TForm>) {
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSystemInfo, setShowSystemInfo] = useState(false);

    // =========================================================================
    // 🧹 GHOST-BUSTER (O Gerador de Estado Vazio)
    // O RHF não limpa arrays (useFieldArray) automaticamente com um `reset({})`.
    // Nós mapeamos a configuração para forçar a limpeza estrutural de tudo.
    // =========================================================================
    const defaultFormValues = useMemo(() => {
        const defaults: any = {};
        config.fields.forEach(field => {
            if (field.type === 'custom') {
                // 💡 A MÁGICA: Se for um array/grid customizado, cravamos [] (Vazio).
                // Isso diz ao RHF: "Destrua as regras da memória agora!"
                defaults[field.name] = []; 
            } else if (field.type === 'boolean') {
                defaults[field.name] = true;
            } else {
                defaults[field.name] = '';
            }
        });
        return defaults as DefaultValues<TForm>;
    }, [config.fields]);

    // =========================================================================
    // 🧠 O CÉREBRO DO FORMULÁRIO
    // =========================================================================
    const formContext = useForm<TForm>({
        resolver: zodResolver(config.schema as any),
        mode: 'onChange',
        defaultValues: defaultFormValues // Injeta o estado vazio como base
    });

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors }
    } = formContext;

    // =========================================================================
    // 💧 HIDRATAÇÃO E DELTA SYNC
    // =========================================================================
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // MODO EDIÇÃO: Preenche com os dados do banco (trazendo as regras com IDs)
                reset(initialData as DefaultValues<TForm>);
            } else {
                // 💡 MODO CRIAÇÃO (O Bloqueio do Roubo Relacional):
                // Injetamos o `defaultFormValues` explícito. O array `rules` será cravado
                // como `[]`, e o formulário abrirá 100% virgem e seguro.
                reset(defaultFormValues); 
            }
        }
    }, [isOpen, initialData, reset, defaultFormValues]);

    // =========================================================================
    // ⚙️ HANDLERS
    // =========================================================================
    const handleFormSubmit: SubmitHandler<TForm> = async (data) => {
        setIsSubmitting(true);
        try {
            await onSubmit(data);
            onClose(); 
        } catch (error) {
            console.error('❌ [CrudForm] Erro ao salvar:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // =========================================================================
    // 🎨 RENDERIZADOR POLIMÓRFICO (O "Pintor" de Inputs)
    // =========================================================================
    const renderField = (field: CrudFieldConfig<TForm>) => {
        const fieldName = String(field.name);
        const hasError = !!errors[fieldName];

        const baseInputClasses = `
            w-full bg-gray-900 border rounded-lg px-3 py-2.5 text-sm text-white 
            focus:outline-none transition-all placeholder-gray-600
            ${hasError 
                ? 'border-red-500 focus:ring-1 focus:ring-red-500' 
                : 'border-gray-700 focus:border-accent-primary focus:ring-1 focus:ring-accent-primary'
            }
            ${field.disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `;

        switch (field.type) {
            case 'text':
            case 'number':
            case 'currency':
                return (
                    <input
                        type={field.type === 'number' || field.type === 'currency' ? 'number' : 'text'}
                        step={field.type === 'currency' ? '0.01' : undefined}
                        {...register(field.name as any, { 
                            setValueAs: v => (field.type === 'number' || field.type === 'currency') ? (v === '' ? undefined : Number(v)) : v 
                        })}
                        placeholder={field.placeholder}
                        disabled={field.disabled || isSubmitting}
                        className={baseInputClasses}
                    />
                );

            case 'textarea':
                return (
                    <textarea
                        {...register(field.name as any)}
                        placeholder={field.placeholder}
                        disabled={field.disabled || isSubmitting}
                        rows={3}
                        className={`${baseInputClasses} resize-y`}
                    />
                );

            case 'select':
                return (
                    <select
                        {...register(field.name as any)}
                        disabled={field.disabled || isSubmitting}
                        className={baseInputClasses}
                    >
                        <option value="">Selecione...</option>
                        {field.options?.map(opt => (
                            <option key={String(opt.value)} value={String(opt.value)}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                );

            case 'hidden':
                return (
                    <input type="hidden" {...register(field.name as any)} />
                );

            case 'boolean':
                return (
                    <Controller
                        name={field.name as any}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <div className="flex items-center mt-2">
                                <button
                                    type="button"
                                    onClick={() => onChange(!value)}
                                    disabled={field.disabled || isSubmitting}
                                    className={`
                                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors 
                                        focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-gray-900
                                        ${value ? 'bg-emerald-500' : 'bg-gray-600'}
                                        ${field.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}
                                >
                                    <span
                                        className={`
                                            inline-block h-4 w-4 transform rounded-full bg-white transition-transform 
                                            ${value ? 'translate-x-6' : 'translate-x-1'}
                                        `}
                                    />
                                </button>
                                <span className="ml-3 text-sm font-medium text-gray-300">
                                    {value 
                                        ? (field.trueLabel || 'Ativo') 
                                        : (field.falseLabel || 'Inativo')
                                    }
                                </span>
                            </div>
                        )}
                    />
                );

            case 'custom':
                if (field.customRender) {
                    return field.customRender(formContext);
                }
                return (
                    <div className="p-3 bg-red-900/20 text-red-400 text-xs rounded border border-red-500/50">
                        ⚠️ Desenvolvedor: Forneça a propriedade `customRender` para o campo '{fieldName}'.
                    </div>
                );

            default:
                return null;
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className={`
                absolute inset-0 z-20 bg-base-dark flex flex-col
                transform transition-all duration-300 ease-in-out
                ${isOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-12 opacity-0 pointer-events-none'}
            `}
        >
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-700 bg-gray-900/50 flex-shrink-0">
                    <div>
                        <h3 className="text-lg font-semibold text-base-text leading-tight">
                            {initialData ? `Editar ${config.title}` : `Novo(a) ${config.title}`}
                        </h3>
                        {config.description && (
                            <p className="text-xs text-gray-400 mt-1">{config.description}</p>
                        )}
                    </div>
                    <button 
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                <form id="crud-form" onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 p-6 space-y-5 overflow-y-auto custom-scrollbar">
                    
                    {config.fields.map((field) => {
                        const fieldName = String(field.name);
                        const hasError = !!errors[fieldName];
                        const errorMessage = errors[fieldName]?.message as string;
                        const displayError = typeof errorMessage === 'string' ? errorMessage : undefined;

                        return (
                            <div key={fieldName} className="space-y-1.5 animate-fade-in">
                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                    {field.label}
                                    {!config.schema.isOptional() && <span className="text-accent-primary ml-1">*</span>}
                                </label>
                                
                                {renderField(field)}
                                
                                {hasError && displayError && (
                                    <p className="text-[10px] text-red-400 mt-1 font-medium">
                                        {displayError}
                                    </p>
                                )}
                            </div>
                        );
                    })}

                    {initialData && config.systemFields && config.systemFields.length > 0 && (
                        <div className="pt-4 mt-6 border-t border-gray-800/50 animate-fade-in flex-shrink-0">
                            <button
                                type="button"
                                onClick={() => setShowSystemInfo(!showSystemInfo)}
                                className="flex items-center justify-between w-full p-3.5 bg-gray-800/30 hover:bg-gray-800/60 border border-gray-700/50 rounded-lg transition-colors focus:outline-none"
                            >
                                <div className="flex items-center gap-2 text-gray-400">
                                    <FaShieldAlt className="w-4 h-4 text-gray-500" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Informações do Sistema</span>
                                </div>
                                {showSystemInfo ? <FaChevronUp className="w-3 h-3 text-gray-500" /> : <FaChevronDown className="w-3 h-3 text-gray-500" />}
                            </button>

                           {showSystemInfo && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3 p-5 bg-gray-900/50 border border-gray-800/50 rounded-lg shadow-inner animate-fade-in">
                                    {config.systemFields.map((field) => {
                                        const fieldName = String(field.name);
                                        return (
                                            <div key={fieldName} className="space-y-1.5">
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                    {field.label}
                                                </label>
                                                <div className="opacity-60 pointer-events-none grayscale">
                                                    {/* 💡 FIX TS 2345: Assinatura de contrato garantida para o motor de renderização */}
                                                    {renderField({ ...field, disabled: true } as unknown as CrudFieldConfig<TForm>)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </form>

                <div className="p-6 border-t border-gray-700 bg-gray-900/30 flex justify-end gap-3 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-bold text-gray-400 bg-transparent border border-gray-600 rounded-lg hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="crud-form"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-base-dark bg-accent-primary rounded-lg hover:brightness-110 focus:outline-none transition-all shadow-lg shadow-accent-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-base-dark border-t-transparent"></div>
                                <span>Salvando...</span>
                            </>
                        ) : (
                            <>
                                <FaSave className="w-4 h-4" />
                                <span>{initialData ? 'Atualizar' : 'Salvar'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}