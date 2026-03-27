import { z } from 'zod';
import { ReactNode } from 'react';
import { UseFormReturn, FieldValues } from 'react-hook-form'; 

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
 * 🎴 CONFIGURAÇÃO DE CARDS (Injeção Visão Lateral) [NOVO - FASE 1]
 * @description Mapeia dinamicamente as propriedades de uma entidade de domínio
 * para os "slots" visuais de um Card de interface (ex: ClientListWidget).
 * ============================================================================
 */
export interface CrudCardBadge {
    text: string;
    variant?: 'success' | 'danger' | 'warning' | 'info' | 'default';
}

export interface CrudCardConfig<T> {
    /** O texto principal em destaque no card (Ex: Nome do Cliente) */
    title: keyof T | ((item: T) => string);
    /** Texto secundário abaixo do título (Ex: E-mail ou CPF) */
    subtitle?: keyof T | ((item: T) => string | ReactNode);
    /** Tag de status colorida (Ex: Ativo/Inativo) */
    badge?: keyof T | ((item: T) => CrudCardBadge | null);
    /** Ícone ou avatar posicionado na lateral do card */
    avatar?: keyof T | ((item: T) => ReactNode);
}

/**
 * ============================================================================
 * ⚙️ CONFIGURAÇÕES PRINCIPAIS (O "Manual de Instruções" da Impressora)
 * ============================================================================
 */

export interface CrudConfig<T, FormData extends FieldValues = any> {
    /** 🏷️ Identidade do Módulo (Ex: "Clientes", "Deals") */
    title: string;

    /** * 🎨 ÍCONE DE IDENTIDADE (Classe Ouro)
     * @description O elemento visual que dá vida ao cabeçalho do módulo.
     * Deve ser um componente de ícone (ex: FaHandshake) que represente 
     * semanticamente a entidade no Master Data.
     */
    icon?: ReactNode;

    /** 📝 Descrição de apoio para contextos de tela cheia */
    description?: string;

    /** 🛡️ O validador blindado (Zod Schema) */
    schema: z.ZodType<any, any, any>; 

    /** 📊 Definição de Colunas: Como exibir na Grid/Tabela (Master Data) */
    columns: CrudColumn<T>[];

    /** 📝 Definição de Campos: Como exibir no Formulário Principal */
    fields: CrudField<FormData>[];

    /** 🗄️ Auditoria: Campos de Sistema (Gaveta secundária de leitura) */
    systemFields?: CrudField<FormData>[]; 
    
    /** * 🎴 CONFIGURAÇÃO DE CARDS
     * @description Dicionário de renderização para o layout de Cards.
     * Essencial para a barra lateral polimórfica (ListMode = 'cards').
     */
    cardConfig?: CrudCardConfig<T>;
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
 * 🛡️ CONTRATOS DO ADAPTADOR DE DOMÍNIO (Domain Adapter Pattern)
 * @description Interfaces que garantem o alinhamento estrito entre os Hooks 
 * de API (React Query/Axios) e o Motor CRUD, padronizando a injeção de dependências.
 * ============================================================================
 */

export interface CrudQueryContext<T> {
    data: T[];
    isLoading: boolean;
    error: unknown;
    refetch: () => void;
}

export interface CrudMutationContext<FormData extends FieldValues> {
    isLoading: boolean;
    error: unknown;
    createFn: (data: FormData) => Promise<any>;
    updateFn: (id: string, data: Partial<FormData>) => Promise<any>;
    deleteFn?: (id: string) => Promise<any>;
}

export interface CrudAdapterOptions {
    /** Nome amigável da entidade para exibição nas mensagens e alertas de UI (Ex: "Cliente") */
    entityName: string;
    /** Regra de Negócio: Permite ou bloqueia a exibição e ação do botão de exclusão física */
    allowDelete?: boolean;
    /** Chaves de domínio específicas que devem ser sumariamente removidas no Update, além do lixo de sistema (ex: campos temporários da UI) */
    omitKeysOnUpdate?: string[];
}

export interface UseCrudAdapterParams<T, FormData extends FieldValues> {
    query: CrudQueryContext<T>;
    mutation: CrudMutationContext<FormData>;
    options: CrudAdapterOptions;
}

/**
 * ============================================================================
 * 🖨️ MÁQUINA DE ESTADOS VISUAIS (Orquestradores) [NOVO - FASE 1]
 * ============================================================================
 */

export type ListMode = 'table' | 'cards';
export type FormMode = 'edit' | 'readonly';
export type PresentationMode = 'drawer' | 'modal' | 'inline';

/**
 * ============================================================================
 * 🧱 CONTRATOS DE PROPRIEDADES DOS COMPONENTES VISUAIS
 * ============================================================================
 */

export interface CrudFormProps<T, FormData extends FieldValues = any> {
    isOpen: boolean;
    onClose: () => void;
    config: CrudConfig<T, FormData>;
    initialData?: T;
    
    /**
     * @property presentationMode
     * @description Roteador Espacial do Formulário (Onde e como ele nasce).
     * - 'drawer': (Padrão) Desliza da borda direita com fundo escuro.
     * - 'modal': Abre centralizado flutuando sobre a tela.
     * - 'inline': Renderiza de forma plana, adaptando-se à div pai (Cockpit).
     */
    presentationMode?: PresentationMode;
    
    /**
     * @property formMode
     * @description Roteador Lógico do Formulário (O que ele permite fazer).
     * - 'edit': (Padrão) Instancia o Zod e inputs editáveis.
     * - 'readonly': Remove inputs e botões de salvar, exibindo como um Dossiê.
     */
    formMode?: FormMode;
    
    onSubmit: (data: FormData) => Promise<void>;
}

export interface CrudLayoutProps<T, FormData extends FieldValues = any> {
    config: CrudConfig<T, FormData>;
    hooks: CrudHooks<T, FormData>;
    
    /**
     * @property listMode
     * @description Define o Operário Visual da listagem. Padrão: 'table'.
     */
    listMode?: ListMode;
    
    /**
     * @property formMode
     * @description Define o Operário Lógico do painel de detalhes. Padrão: 'edit'.
     */
    formMode?: FormMode;

    /**
     * @property selectedItemId
     * @description Injeção de estado externo passivo (A Informação). Informa ao layout qual 
     * registro está em foco no momento (útil para realçar o item ativo em barras laterais polimórficas).
     */
    selectedItemId?: string;

    /**
     * @property onViewRequest
     * @description 💡 FIO DE EVENTO (Leitura/Dossiê): Emissor de intenção de foco.
     * Disparado quando o usuário clica no corpo do card (e não no lápis). Informa ao 
     * Maestro que o objetivo é exibir o Dossiê/Dashboard de IA, e não o formulário de edição.
     * Desacopla perfeitamente a intenção de "Ver" da intenção de "Editar".
     */
    onViewRequest?: (item: T) => void;

    /**
     * @property onFormRequest
     * @description 💡 FIO DE DELEGAÇÃO (Escrita/Edição): Inversão de Controle (IoC). 
     * Disparado quando o usuário clica em "Novo" ou no ícone de "Lápis/Editar".
     * Se fornecido, o layout não abrirá o formulário localmente. Em vez disso, emitirá a 
     * intenção para o componente pai assumir a renderização no Palco Central.
     */
    onFormRequest?: (item?: T | Partial<T> | null) => void;
    
    /**
     * @property baseInjectData
     * @description Rascunho dinâmico para Criação (Null Object Pattern). 
     * Utilizado para pré-preencher formulários filhos quando disparados a partir de um 
     * contexto pai (Ex: injetar silenciosamente o `clientId` ao criar uma nova Oportunidade).
     */
    baseInjectData?: Partial<T>;
}