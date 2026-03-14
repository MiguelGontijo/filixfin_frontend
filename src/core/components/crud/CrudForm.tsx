'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller, FieldValues, SubmitHandler, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FaTimes, FaSave } from 'react-icons/fa';
import { CrudConfig, CrudFieldConfig } from './types';

interface CrudFormProps<TData, TForm extends FieldValues> {
    isOpen: boolean;
    onClose: () => void;
    config: CrudConfig<TData, TForm>;
    initialData?: TData | null;
    onSubmit: (data: TForm) => Promise<void>;
}

/**
 * @component CrudForm (A Impressora 3D)
 * @description Drawer universal que desenha inputs automaticamente baseado na config.
 * Utiliza Generics <T> para garantir que a tipagem do formulário seja idêntica à do Zod.
 */
export function CrudForm<TData, TForm extends FieldValues>({
    isOpen,
    onClose,
    config,
    initialData,
    onSubmit
}: CrudFormProps<TData, TForm>) {
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    // =========================================================================
    // 🧠 O CÉREBRO DO FORMULÁRIO (React Hook Form + Zod)
    // =========================================================================
    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors }
    } = useForm<TForm>({
        resolver: zodResolver(config.schema as any), // Conecta a validação Zod!
        mode: 'onChange', // Valida em tempo real enquanto o usuário digita
    });

    // Hidratação: Preenche ou limpa o formulário sempre que abrir/fechar
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // MODO EDIÇÃO: Preenche com os dados existentes
                reset(initialData as DefaultValues<TForm>);
            } else {
                // MODO CRIAÇÃO: Reseta para vazio (pega defaults do Zod)
                // O cast vazio {} as T é seguro pois o Zod resolverá os campos obrigatórios
                reset({} as DefaultValues<TForm>); 
            }
        }
    }, [isOpen, initialData, reset]);

    // =========================================================================
    // ⚙️ HANDLERS
    // =========================================================================
    const handleFormSubmit: SubmitHandler<TForm> = async (data) => {
        setIsSubmitting(true);
        try {
            await onSubmit(data);
            onClose(); // Só fecha se a mutação na API der sucesso
        } catch (error) {
            console.error('❌ [CrudForm] Erro ao salvar:', error);
            // Os erros de API (como "Nome já existe") podem ser tratados pelo Toast global
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
        const errorMessage = errors[fieldName]?.message as string;

        // Classes base compartilhadas para manter o Design System (Dark/Metallic)
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
                            // Garante que números não virem strings "10" na hora de enviar pro Zod
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
                // Para booleanos (Toggle), usamos o Controller do React Hook Form
                // pois elementos customizados precisam de gerenciamento de estado controlado
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
                                <span className="ml-3 text-sm text-gray-300">
                                    {value ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>
                        )}
                    />
                );

            default:
                return null;
        }
    };

    // Se o Drawer estiver fechado, não carrega a árvore no DOM
    if (!isOpen) return null;

    // =========================================================================
    // 🖼️ A ESTRUTURA VISUAL DO DRAWER
    // =========================================================================
    // Se o Drawer estiver fechado, evitamos que ele bloqueie os cliques
    // Mantemos ele no DOM para a animação de saída funcionar suavemente
    return (
        <div 
            className={`
                absolute inset-0 z-20 bg-base-dark flex flex-col
                transform transition-all duration-300 ease-in-out
                ${isOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-12 opacity-0 pointer-events-none'}
            `}
        >
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                
                {/* O SEU CABEÇALHO, FORMULÁRIO E BOTÕES CONTINUAM EXATAMENTE AQUI DENTRO, SEM MUDAR NADA */} 
                {/* Header Dinâmico */}
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

                {/* Corpo Form: O Loop Mágico */}
                <form id="crud-form" onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 p-6 space-y-5 overflow-y-auto custom-scrollbar">
                    
                    {config.fields.map((field) => {
                        const fieldName = String(field.name);
                        const hasError = !!errors[fieldName];

                        return (
                            <div key={fieldName} className="space-y-1.5 animate-fade-in">
                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                    {field.label}
                                    {/* Asterisco se o Zod exigir o campo (Não é opcional) */}
                                    {!config.schema.isOptional() && <span className="text-accent-primary ml-1">*</span>}
                                </label>
                                
                                {renderField(field)}
                                
                                {/* Mensagem de Erro Injetada Automaticamente pelo Zod */}
                                {hasError && (
                                    <p className="text-[10px] text-red-400 mt-1 font-medium">
                                        {errors[fieldName]?.message as string}
                                    </p>
                                )}
                            </div>
                        );
                    })}

                </form>

                {/* Footer (Ações) */}
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