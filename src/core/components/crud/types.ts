import { z } from 'zod';
import { ReactNode } from 'react';
import { UseFormReturn, FieldValues } from 'react-hook-form'; // 💡 IMPORT VITAL: Adicionado FieldValues

/**
 * ============================================================================
 * 🧬 TIPAGENS DE COLUNAS E CAMPOS DO MOTOR V4
 * ============================================================================
 */

export interface CrudColumn<T> {
    header: string;
    accessor: keyof T | ((item: T) => ReactNode);
}

export type FieldType = 'text' | 'number' | 'email' | 'select' | 'boolean' | 'date' | 'textarea' | 'custom';

// 🛡️ CORREÇÃO: "FormData extends FieldValues" garante a compatibilidade com o React Hook Form
export interface CrudField<FormData extends FieldValues = any> {
    name: keyof FormData | string;
    label: string;
    type: FieldType;
    placeholder?: string;
    options?: { value: string | number; label: string }[];
    trueLabel?: string;  // Utilizado para inputs do tipo boolean (toggle/checkbox)
    falseLabel?: string; // Utilizado para inputs do tipo boolean
    
    /**
     * @property customRender
     * @description Permite a injeção de micro-componentes de alta complexidade 
     * (ex: Drag & Drop, Tabelas de Itens, React Hook Form useFieldArray) 
     * diretamente no motor de renderização.
     */
    customRender?: (form: UseFormReturn<FormData>) => ReactNode;
}

/**
 * ============================================================================
 * ⚙️ CONFIGURAÇÕES PRINCIPAIS (O "Manual de Instruções" da Impressora)
 * ============================================================================
 */

export interface CrudConfig<T, FormData extends FieldValues = any> {
    title: string;
    description?: string;
    schema: z.ZodType<any, any, any>; // O validador blindado (Zod)
    columns: CrudColumn<T>[];         // Como exibir na Grid/Tabela
    fields: CrudField<FormData>[];    // Como exibir no Formulário Principal
    systemFields?: CrudField<FormData>[]; // Campos de Auditoria (Gaveta secundária)
}

/**
 * ============================================================================
 * 🔌 HOOKS DE DADOS (CQRS - Leitura e Escrita)
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

/**
 * ============================================================================
 * 🖨️ A IMPRESSORA 3D (Propriedades do Formulário Gerador)
 * ============================================================================
 */

/**
 * @type PresentationMode
 * @description Define o comportamento espacial/visual do Motor de Formulário.
 * 🏆 CLASSE OURO: Aplicação do Princípio Aberto/Fechado (SOLID).
 */
export type PresentationMode = 'drawer' | 'modal' | 'inline';

export interface CrudFormProps<T, FormData extends FieldValues = any> {
    isOpen: boolean;
    onClose: () => void;
    config: CrudConfig<T, FormData>;
    initialData?: T;
    
    /**
     * @property presentationMode
     * @description Roteador Visual do Formulário.
     * - 'drawer': (Padrão) Desliza da borda direita com fundo escuro (Backdrop).
     * - 'modal': Abre centralizado flutuando sobre a tela.
     * - 'inline': Remove os wrappers absolutos e renderiza de forma plana, 
     * permitindo que o formulário se adapte a divs pais (ex: Cockpit Central Stage).
     */
    presentationMode?: PresentationMode;
    
    onSubmit: (data: FormData) => Promise<void>;
}

export interface CrudLayoutProps<T, FormData extends FieldValues = any> {
    config: CrudConfig<T, FormData>;
    hooks: CrudHooks<T, FormData>;
}