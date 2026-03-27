import { ReactNode } from 'react';
import { FieldValues } from 'react-hook-form';
import { CrudConfig, CrudHooks } from './engine.types';

/**
 * ============================================================================
 * 👁️ VISUAL MODELS: APRESENTAÇÃO E UI (Mundo 1)
 * @description Define as diretrizes estéticas e de comportamento espacial 
 * do Motor V4. Rege como o Maestro e os Operários se posicionam no palco.
 * ============================================================================
 */

/** * @interface CrudColumn
 * @description 🛡️ FIX CLASSE OURO: Define o contrato de renderização para 
 * colunas da Tabela Master Data. Permite acesso direto via chave ou 
 * renderização complexa via componente funcional.
 */
export interface CrudColumn<T> {
    header: string;
    accessor: keyof T | ((item: T) => ReactNode);
}

/** * @type ListMode
 * @description Roteador Visual da Vitrine. 
 * 'table' (Master Data Largo) vs 'cards' (Barra Lateral/Mobile).
 */
export type ListMode = 'table' | 'cards';

/** * @type FormMode
 * @description Roteador Lógico do conteúdo do formulário.
 * 'edit' (Interativo) vs 'readonly' (Dossiê/Demitido da Edição).
 */
export type FormMode = 'edit' | 'readonly';

/** * @type PresentationMode
 * @description Roteador Espacial (O Envelopador).
 * 'drawer' (Lateral), 'modal' (Flutuante) ou 'inline' (Plano/Cockpit).
 */
export type PresentationMode = 'drawer' | 'modal' | 'inline';

/**
 * ============================================================================
 * 🧱 CONTRATOS DE PROPRIEDADES (Props Interfaces)
 * ============================================================================
 */

/**
 * @interface CrudFormProps
 * @description Contrato estrito para o nascimento de qualquer formulário V4.
 */
export interface CrudFormProps<T, FormData extends FieldValues = any> {
    isOpen: boolean;
    onClose: () => void;
    config: CrudConfig<T, FormData>;
    initialData?: T;
    presentationMode?: PresentationMode;
    formMode?: FormMode;
    onSubmit: (data: FormData) => Promise<void>;
}

/**
 * @interface CrudLayoutProps
 * @description Contrato de montagem do Maestro Central (CrudLayout).
 */
export interface CrudLayoutProps<T, FormData extends FieldValues = any> {
    config: CrudConfig<T, FormData>;
    hooks: CrudHooks<T, FormData>;
    
    /** Define o Operário Visual da listagem (Table/Cards) */
    listMode?: ListMode;
    
    /** Define o Operário Lógico do painel (Edit/Readonly) */
    formMode?: FormMode;

    /** 💡 ESTADO PASSIVO: ID do registro em foco para realce visual (Active State) */
    selectedItemId?: string;

    /** 💡 FIO DE EVENTO (Leitura): Emissor para abrir Dossiê/Dashboard IA */
    onViewRequest?: (item: T) => void;

    /** 💡 FIO DE EVENTO (Escrita): Inversão de Controle para Edição/Criação Externa */
    onFormRequest?: (item?: T | Partial<T> | null) => void;
    
    /** 💡 NULL OBJECT PATTERN: Dados pré-injetados para novos registros */
    baseInjectData?: Partial<T>;
}