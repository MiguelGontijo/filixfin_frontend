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
 * @enum FeatureKeys
 * @description Contextos possíveis onde a IA pode operar (A Pistola - Macro).
 * [NOVO]: Agora espelha estritamente as 'FeatureKeys' (Inteligência) do Backend.
 */
export enum FeatureKeys {
    // Assistentes Interativos (Micro)
    AI_CONCIERGE_MICRO = 'AI_CONCIERGE_MICRO',
    AI_SALES_MICRO = 'AI_SALES_MICRO',
    AI_INVENTORY_MICRO = 'AI_INVENTORY_MICRO',
    AI_FISCAL_MICRO = 'AI_FISCAL_MICRO',
    
    // Background Workers (Micro / Meso / Macro)
    AI_CLIENT_MICRO = 'AI_CLIENT_MICRO',
    AI_CLIENT_MESO = 'AI_CLIENT_MESO',
    AI_SALES_MESO = 'AI_SALES_MESO',
    AI_INVENTORY_MESO = 'AI_INVENTORY_MESO',
    AI_TENANT_MACRO = 'AI_TENANT_MACRO'
}

export type FeatureKey = `${FeatureKeys}`;

/**
 * @enum AppModules
 * @description Classificador de Entidades.
 * [NOVO]: Agora espelha estritamente o 'AppModule' do Backend. O Eixo Universal de Domínio.
 */
export enum AppModules {
    CORE = 'CORE',
    CLIENTE = 'CLIENTE',
    CRM = 'CRM',
    FINANCEIRO = 'FINANCEIRO',
    ESTOQUE = 'ESTOQUE',
    ACL = 'ACL',
    TENANT = 'TENANT'
}

export type AppModule = `${AppModules}`;

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