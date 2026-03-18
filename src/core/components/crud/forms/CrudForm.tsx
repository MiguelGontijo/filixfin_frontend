import React, { useEffect, useState, useMemo } from 'react';
import { useForm, FieldValues, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// --- Tipagens e Contratos ---
import { CrudFormProps } from '../types';

// --- Utilitários de Performance ---
import { useDelayedUnmount } from '@/core/hooks/useDelayedUnmount'; // 👈 IMPORT DO NOSSO HOOK

// --- Componentes Estruturais (Layout) ---
import { CrudFormWrapper } from './layout/CrudFormWrapper';
import { CrudFormHeader } from './layout/CrudFormHeader';
import { CrudFormBody } from './layout/CrudFormBody';
import { CrudFormFooter } from './layout/CrudFormFooter';

/**
 * @function CrudForm
 * @description O Maestro do Motor V4. Ponto de entrada do gerador dinâmico de formulários. 
 * Gerencia o estado global (React Hook Form + Zod) e orquestra a renderização.
 */
export function CrudForm<T, FormData extends FieldValues = any>({
    isOpen,
    onClose,
    config,
    initialData,
    presentationMode = 'drawer', // Retornando para o seu padrão de painel lateral
    onSubmit
}: CrudFormProps<T, FormData>) {

    // ========================================================================
    // ⏱️ GESTÃO DE CICLO DE VIDA (Animação vs Memória)
    // Sincroniza o tempo de destruição do componente com a animação CSS (300ms)
    // ========================================================================
    const shouldRender = useDelayedUnmount(isOpen, 300);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ========================================================================
    // 🧹 GHOST-BUSTER (O Gerador de Estado Vazio)
    // ========================================================================
    const defaultFormValues = useMemo(() => {
        const defaults: any = {};
        config.fields.forEach(field => {
            if (field.type === 'custom') {
                defaults[field.name] = []; 
            } else if (field.type === 'boolean') {
                defaults[field.name] = true;
            } else {
                defaults[field.name] = '';
            }
        });
        return defaults as DefaultValues<FormData>;
    }, [config.fields]);

    // ========================================================================
    // 🛡️ MOTOR DE VALIDAÇÃO (Reatividade e Schemas)
    // ========================================================================
    const form = useForm<FormData>({
        resolver: zodResolver(config.schema),
        defaultValues: defaultFormValues, 
        mode: 'onChange', 
    });

    // ========================================================================
    // 💧 HIDRATAÇÃO E DELTA SYNC
    // ========================================================================
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                form.reset(initialData as DefaultValues<FormData>);
            } else {
                form.reset(defaultFormValues);
            }
            setError(null);
        }
    }, [isOpen, initialData, form, defaultFormValues]);

    const handleSubmitWrapper = async (data: FormData) => {
        setIsSubmitting(true);
        setError(null);
        try {
            await onSubmit(data);
        } catch (err: any) {
            console.error('[CrudForm] Falha na transação:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Ocorreu um erro inesperado ao salvar os dados.';
            setError(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 🛑 A GUILHOTINA CLASSE OURO:
    // Só destrói a árvore do DOM (e a memória do form) DEPOIS que a animação terminar
    if (!shouldRender) return null;

    return (
        <CrudFormWrapper 
            presentationMode={presentationMode} 
            isOpen={isOpen} // Passamos o isOpen para o CSS saber quando iniciar a transição
            onClose={onClose}
        >
            <form 
                onSubmit={form.handleSubmit(handleSubmitWrapper)} 
                className="flex flex-col h-full w-full"
                noValidate
            >
                <CrudFormHeader 
                    title={config.title}
                    description={config.description}
                    isEdit={!!initialData}
                    presentationMode={presentationMode}
                    onClose={onClose}
                />
                
                <CrudFormBody 
                    config={config}
                    form={form}
                    error={error}
                />
                
                <CrudFormFooter 
                    isEdit={!!initialData}
                    isSubmitting={isSubmitting}
                    onClose={onClose}
                />
            </form>
        </CrudFormWrapper>
    );
}