import { z } from 'zod';

/**
 * @type FieldType
 * @description Os tipos de inputs visuais que a nossa "Fábrica" consegue desenhar.
 */
export type FieldType = 
    | 'text' 
    | 'number' 
    | 'boolean' // Renderiza um Toggle/Switch
    | 'textarea' 
    | 'select' 
    | 'currency'
    | 'hidden'
    | 'date'
    | 'datetime'
    | 'time'
    | 'file';

/**
 * @interface CrudFieldConfig
 * @description Configuração visual de um campo do formulário.
 * O <T> garante que o 'name' pertença estritamente ao Schema Zod fornecido.
 */
export interface CrudFieldConfig<TForm> {
    name: keyof TForm;          // A chave exata do banco/zod (ex: 'name', 'isActive')
    label: string;          // O rótulo humano (ex: 'Nome da Categoria')
    type: FieldType;        // Como deve ser desenhado na tela
    placeholder?: string;
    options?: { label: string; value: string | number | boolean }[]; // Necessário se for 'select'
    disabled?: boolean;
}

/**
 * @interface CrudColumnConfig
 * @description Configuração de como uma coluna deve aparecer no Grid (Tabela).
 */
export interface CrudColumnConfig<TData> {
    key: keyof TData;
    label: string;
    type?: 'text' | 'boolean' | 'currency' | 'date'; // Formatação automática na tabela
    align?: 'left' | 'center' | 'right';
}

/**
 * @interface CrudConfig
 * @description O Blueprint (A Planta) completa de uma tela de Cadastro.
 * É isso que o desenvolvedor vai preencher para criar uma tela nova.
 */
export interface CrudConfig<TData, TForm> {
    title: string;
    description?: string;
    schema: z.ZodSchema<TForm>;            // A validação matemática
    fields: CrudFieldConfig<TForm>[];      // O desenho do Formulário
    columns: CrudColumnConfig<TData>[];    // O desenho da Tabela
}

/**
 * @interface CrudHooks
 * @description O contrato de comunicação com o Backend.
 * O Motor não faz fetch direto; ele pede para os seus Hooks de Domínio fazerem.
 */
export interface CrudHooks<TData, TForm> {
    data: TData[];
    isLoading: boolean;
    error: string | null;
    onCreate: (data: TForm) => Promise<any>;
    onUpdate: (id: string, data: Partial<TForm>) => Promise<any>;
    onDelete: (id: string) => Promise<any>;
    onRefresh: () => void;
}