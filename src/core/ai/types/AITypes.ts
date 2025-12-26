/**
 * @file AITypes.ts
 * @description Definições de Tipos para o Ecossistema Filix IA (Frontend + LangChain Integration).
 */

// --- 1. Contexto & Estado Global ---

/**
 * Contextos possíveis onde a IA pode operar.
 * Isso define qual "Persona" ou "Tools" o LangChain vai carregar no Backend.
 */
export type AIContextScope = 
    | 'GLOBAL'          // Generalista (Default)
    | 'CRM'             // Foco em Vendas, Clientes, Funil
    | 'SUPPLY_CHAIN'    // Foco em Produtos, Estoque, Categorias
    | 'FISCAL';         // Foco em NFe, Impostos

/**
 * Estado Visual do Widget Flutuante.
 */
export type AIWidgetMode = 'HIDDEN' | 'MINIMIZED' | 'EXPANDED';

/**
 * Coordenadas para persistência da posição do Widget (Draggable).
 */
export interface AIPosition {
    x: number;
    y: number;
}

// --- 2. Mensageria & LangChain ---

export type AIRole = 'user' | 'assistant' | 'system' | 'function';

/**
 * Estrutura de uma mensagem no chat.
 * Preparada para suportar streaming e chamadas de ferramenta.
 */
export interface AIMessage {
    id: string;
    role: AIRole;
    content: string;
    createdAt: Date;
    
    // Suporte a LangChain Tools (Ex: A IA decidiu chamar uma função)
    toolCalls?: {
        name: string;
        arguments: Record<string, any>;
        status: 'pending' | 'success' | 'error';
    }[];

    // Metadados opcionais (ex: ID do áudio original, confiança, etc)
    metadata?: Record<string, any>;
}

// --- 3. Interface do Contexto (React Context) ---

export interface FilixAIContextData {
    // Estado Visual
    mode: AIWidgetMode;
    position: AIPosition;
    contextScope: AIContextScope;
    
    // Ações de Interface
    toggleVisibility: () => void;
    setMode: (mode: AIWidgetMode) => void;
    updatePosition: (pos: AIPosition) => void;
    
    // Ações de Inteligência (Troca de Chip)
    setContextScope: (scope: AIContextScope) => void;
    
    // Estado de "Soberania" (Kill Switch do Header)
    isEnabled: boolean;
    toggleEnabled: () => void;
}