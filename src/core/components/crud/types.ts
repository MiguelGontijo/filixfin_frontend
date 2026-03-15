// ===== FILE: src/core/components/crud/types.ts =====

import { z } from 'zod';
import { FieldValues, UseFormReturn } from 'react-hook-form';

/**
 * @type CrudFieldType
 * @description Os tipos de inputs que a nossa "Impressora 3D" (CrudForm) sabe desenhar.
 * CLASSE OURO: Adicionado o tipo 'custom' para suportar Master-Detail (Arrays, Grids).
 */
export type CrudFieldType = 
    | 'text' 
    | 'number' 
    | 'boolean' 
    | 'textarea' 
    | 'select' 
    | 'currency'
    | 'hidden'
    | 'date'
    | 'datetime'
    | 'time'
    | 'file'
    | 'custom'; // 👈 NOVO: O portal para componentes complexos (Ex: Grade de Variantes, Regras Fiscais)

export interface CrudFieldOption {
    label: string;
    value: string | number;
}

/**
 * @interface CrudFieldConfig
 * @description Configuração individual de cada campo do formulário.
 */
export interface CrudFieldConfig<TForm extends FieldValues> {
    name: keyof TForm;
    label: string;
    type: CrudFieldType;
    placeholder?: string;
    disabled?: boolean;
    options?: CrudFieldOption[]; 
    
    // Customização do Switch
    trueLabel?: string;  
    falseLabel?: string; 

    // =========================================================================
    // 🧩 RENDERIZADOR CUSTOMIZADO (Feature V4)
    // Permite injetar um componente React inteiro dentro do formulário.
    // Ele recebe o contexto completo do 'useForm' para poder manipular arrays (useFieldArray).
    // =========================================================================
    customRender?: (formContext: UseFormReturn<TForm>) => React.ReactNode;
}

/**
 * @interface CrudColumnConfig
 * @description Configuração de como os dados serão renderizados na Tabela (Grid).
 */
export interface CrudColumnConfig<TData> {
    header: string;
    accessor: keyof TData | ((item: TData) => React.ReactNode);
}

/**
 * @interface CrudConfig
 * @description O "Manual de Instruções" central do Motor V3.
 */
export interface CrudConfig<TData, TForm extends FieldValues> {
    title: string;
    description?: string;
    schema: z.ZodType<TForm>; 
    columns: CrudColumnConfig<TData>[]; 
    fields: CrudFieldConfig<TForm>[];   
    
    systemFields?: CrudFieldConfig<any>[]; 
}

/**
 * @interface CrudHooks
 * @description O contrato de comunicação entre a UI (Motor) e as APIs (NestJS).
 */
export interface CrudHooks<TData, TForm> {
    data: TData[];
    isLoading: boolean;
    error: string | null;
    onCreate: (data: TForm) => Promise<any>;
    onUpdate: (id: string, data: TForm) => Promise<any>;
    onDelete: (id: string) => Promise<boolean | void>;
    onRefresh: () => void;
}