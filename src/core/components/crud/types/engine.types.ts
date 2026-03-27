import { z } from 'zod';
import { ReactNode } from 'react';
import { UseFormReturn, FieldValues } from 'react-hook-form';

/**
 * ============================================================================
 * ⚙️ ENGINE MODELS: CONFIGURAÇÃO E EXECUÇÃO (Mundo 1)
 * @description Define os contratos de inteligência que regem o funcionamento 
 * interno do Motor CRUD V4. Separa a lógica de dados da apresentação visual.
 * ============================================================================
 */

/** * @interface CrudCardBadge
 * @description 🛡️ FIX CLASSE OURO: Define o contrato para tags de status 
 * coloridas (Badges) utilizadas na visão de cards da barra lateral.
 */
export interface CrudCardBadge {
    text: string;
    variant?: 'success' | 'danger' | 'warning' | 'info' | 'default';
}

/** * @interface CrudCardConfig
 * @description 🛡️ FIX CLASSE OURO: Define como o motor deve mapear as chaves
 * de uma entidade de domínio para os slots visuais do card compacto.
 */
export interface CrudCardConfig<T> {
    title: keyof T | ((item: T) => string);
    subtitle?: keyof T | ((item: T) => string | ReactNode);
    badge?: keyof T | ((item: T) => CrudCardBadge | null);
    avatar?: keyof T | ((item: T) => ReactNode);
}

/**
 * @interface CrudField
 * @description Contrato de renderização de um campo individual no formulário.
 */
export type FieldType = 'text' | 'number' | 'email' | 'select' | 'boolean' | 'date' | 'textarea' | 'custom';

export interface CrudField<FormData extends FieldValues = any> {
    name: keyof FormData | string;
    label: string;
    type: FieldType;
    placeholder?: string;
    options?: { value: string | number; label: string }[];
    trueLabel?: string;  // Para Toggles/Booleanos
    falseLabel?: string; // Para Toggles/Booleanos
    
    /** Injeção para renderização de campos ultra-especializados */
    customRender?: (form: UseFormReturn<FormData>) => ReactNode;
}

/**
 * @interface CrudConfig
 * @description O "Manual de Instruções" da entidade. Define a alma do módulo.
 */
export interface CrudConfig<T, FormData extends FieldValues = any> {
    title: string;
    description?: string;
    icon?: ReactNode;

    /** 🛡️ SCHEMA: Validador blindado via Zod */
    schema: z.ZodType<any, any, any>; 

    /** 📊 COLUNAS: Definição para Tabela (Master Visão) */
    columns: Array<{
        header: string;
        accessor: keyof T | ((item: T) => ReactNode);
    }>;

    /** 📝 CAMPOS: Definição para o Formulário Principal */
    fields: CrudField<FormData>[];

    /** 🗄️ AUDITORIA: Campos de leitura secundária (Sistema) */
    systemFields?: CrudField<FormData>[]; 
    
    /** 🎴 CARD_CONFIG: Dicionário para visão de Cards (Barra Lateral) */
    cardConfig?: CrudCardConfig<T>;
}

/**
 * ============================================================================
 * 🔌 CONTRATOS DE ADAPTAÇÃO E MUTAÇÃO (CQRS)
 * ============================================================================
 */

export interface CrudHooks<T, FormData extends FieldValues = any> {
    data: T[];
    isLoading: boolean;
    error: string | null;
    onCreate: (data: FormData) => Promise<T | void>;
    onUpdate: (id: string, data: FormData) => Promise<T | void>;
    onDelete: (id: string) => Promise<void | boolean>;
    onRefresh: () => void;
}

export interface UseCrudAdapterParams<T, FormData extends FieldValues> {
    query: {
        data: T[];
        isLoading: boolean;
        error: unknown;
        refetch: () => void;
    };
    mutation: {
        isLoading: boolean;
        error: unknown;
        createFn: (data: FormData) => Promise<any>;
        updateFn: (id: string, data: Partial<FormData>) => Promise<any>;
        deleteFn?: (id: string) => Promise<any>;
    };
    options: {
        entityName: string;
        allowDelete?: boolean;
        omitKeysOnUpdate?: string[];
    };
}