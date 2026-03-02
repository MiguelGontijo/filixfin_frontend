/**
 * @file AIEnums.ts
 * @description Vocabulário Universal da IA.
 * Contém apenas as enumerações e tipos literais compartilhados.
 * Espelho exato do Backend para garantir integridade de dados (SRP).
 */

/**
 * @enum UIActionType
 * @description O Vocabulário Visual da IA.
 * Define quais tipos de interface a IA pode "invocar" no Frontend.
 * [ESPELHO PERFEITO DO BACKEND]
 */
export enum UIActionType {
    /** Apenas exibe uma notificação toast */
    NOTIFICATION = 'NOTIFICATION',
    
    /** Exibe um Card de Decisão com Sim/Não ou opções */
    CONFIRMATION_CARD = 'CONFIRMATION_CARD',
    
    /** Abre um Modal/Formulário preenchido para edição */
    FORM_REVIEW = 'FORM_REVIEW',
    
    /** Navega o usuário para outra tela */
    NAVIGATION = 'NAVIGATION',
    
    /** Exibe dados tabulares ou listas ricas */
    DATA_VIEW = 'DATA_VIEW'
}

/**
 * @enum AIContextScopeEnum
 * @description Contextos possíveis onde a IA pode operar (A Pistola - Macro).
 */
export enum AIContextScopeEnum {
    CHAT = 'AI_AGENT_CHAT',
    SALES = 'AI_SALES_AGENT',
    INVENTORY = 'AI_INVENTORY_AGENT',
    FISCAL = 'AI_FISCAL_AUDITOR',
    SCHEDULER = 'AI_SCHEDULER_AGENT'
}

export type AIContextScope = `${AIContextScopeEnum}`;

/**
 * @type AIEntityRefType
 * @description Classificador de Entidades. Vocabulário controlado para o Backend saber onde buscar o 'refId'.
 */
export type AIEntityRefType = 
    | 'CLIENT' 
    | 'DEAL' 
    | 'PRODUCT' 
    | 'WAREHOUSE' 
    | 'EVENT'
    | 'SETUP';

/**
 * @type AIRole
 * @description Papéis na conversação da IA.
 */
export type AIRole = 'user' | 'assistant' | 'system' | 'function';

/**
 * @type AIWidgetMode
 * @description Estado Visual do Widget Flutuante.
 */
export type AIWidgetMode = 'HIDDEN' | 'MINIMIZED' | 'EXPANDED';

/**
 * @type ProposalStatus
 * @description Status visual da proposta no chat (Controlado pelo FRONTEND).
 */
export type ProposalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED';