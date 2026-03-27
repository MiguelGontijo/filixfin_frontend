import React, { useEffect, useState, useMemo } from 'react';
import { useForm, FieldValues, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// --- Tipagens e Contratos ---
import { CrudFormProps } from '../../types';

// --- Utilitários de Performance ---
import { useDelayedUnmount } from '@/core/components/crud/hooks/useDelayedUnmount';

// --- Componentes Estruturais (Layout) ---
import { CrudFormWrapper } from '../form/layout/CrudFormWrapper';
import { CrudFormHeader } from '../form/components/CrudFormHeader';
import { CrudFormBody } from './components/CrudFormBody';
import { CrudFormFooter } from './components/CrudFormFooter';

/**
 * @function CrudForm
 * @description O Maestro do Motor V4. Ponto de entrada do gerador dinâmico de formulários. 
 * Gerencia o estado global (React Hook Form + Zod) e orquestra a renderização.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (SOLID & Resiliência):
 * - Implementa o "Absolute Reset" (Ghost-Buster) para evitar vazamentos de memória.
 * - Sincroniza o unmount com as animações CSS via `useDelayedUnmount`.
 */
export function CrudForm<T, FormData extends FieldValues = any>({
    isOpen,
    onClose,
    config,
    initialData,
    presentationMode = 'drawer', // Roteador visual principal
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
    // Constrói um objeto 100% limpo com base na configuração dos campos,
    // garantindo que não haja resquícios (fantasmas) na transição de registros.
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
    // Injeta os dados corretos no milissegundo em que a tela abre.
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

    // ========================================================================
    // ⚙️ INTERCEPTADORES DE SUBMISSÃO E FALHA
    // ========================================================================
    
    /**
     * @method handleSubmitWrapper
     * @description Rota de Sucesso. Disparada apenas se o Zod aprovar o payload.
     * Extrai erros da API e gerencia o estado de loading.
     */
    const handleSubmitWrapper = async (data: FormData) => {
        setIsSubmitting(true);
        setError(null);
        try {
            await onSubmit(data);
        } catch (err: any) {
            console.error('[CrudForm] Falha na transação API:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Ocorreu um erro inesperado ao salvar os dados.';
            setError(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * @method handleValidationError
     * @description Rota de Falha. Disparada quando o Zod bloqueia o envio.
     * 🏆 FIX VITAL: Impede a "Falha Silenciosa", escancarando o motivo do 
     * bloqueio no console e na tarja de erro da interface.
     */
    const handleValidationError = (errors: any) => {
        console.error('❌ [CrudForm] O Validador Zod bloqueou o envio:', errors);
        setError('Existem campos inválidos, obrigatórios não preenchidos ou conflitos de dados. Verifique o formulário.');
    };

    // ========================================================================
    // 🛑 A GUILHOTINA CLASSE OURO:
    // Só destrói a árvore do DOM DEPOIS que a animação terminar
    // ========================================================================
    if (!shouldRender) return null;

    return (
        <CrudFormWrapper 
            presentationMode={presentationMode} 
            isOpen={isOpen} // Comunicação de estado para o CSS de saída
            onClose={onClose}
        >
            <form 
                // 🔌 A CONEXÃO: Pluga a rota de sucesso E a rota de falha no motor.
                onSubmit={form.handleSubmit(handleSubmitWrapper, handleValidationError)} 
                className="flex flex-col h-full w-full"
                noValidate // Desliga validação tosca do HTML em favor do Zod
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