// ===== FILE: src/core/ai/types/AITypes.ts =====

/**
 * @file AITypes.ts
 * @description Definições de Tipos para o Ecossistema Filix IA.
 * * PADRÃO V8 (Native Tooling & Governance):
 * Este arquivo reflete o contrato de dados estabelecido pelo AIOrchestrator V3.
 * Ele suporta respostas híbridas (Texto + Propostas de Ação).
 */

// --- 1. Contexto & Estado Global ---

/**
 * Contextos possíveis onde a IA pode operar.
 * Define qual "Persona" e quais "Tools" o Backend irá carregar.
 */
export type AIContextScope = 
    | 'GLOBAL'          // Generalista
    | 'CRM'             // Vendas: Pipeline, Deals
    | 'SUPPLY_CHAIN'    // Estoque: Produtos, Movimentações
    | 'FISCAL';         // Fiscal: NFe, Impostos

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

// --- 2. Estruturas de Ação (O "Motor V8") ---

/**
 * Define o tipo de interação visual que a IA está solicitando.
 * Mapeado diretamente do DTO do Backend (UIActionType).
 */
export type UIActionType = 
    | 'FORM_REVIEW'   // Exibe um card com dados para revisar e aprovar/rejeitar
    | 'CONFIRMATION'  // Exibe um simples Sim/Não
    | 'INFO_CARD';    // Exibe dados ricos apenas para leitura (ex: Resumo do Cliente)

/**
 * O Objeto de Proposta.
 * Quando o Agente está em modo CONSULTIVO, ele não executa a ação,
 * ele retorna este objeto para o Frontend renderizar o "Smart Card".
 */
export interface AIActionProposal {
    /**
     * O tipo de UI a ser renderizada.
     */
    ui_action: UIActionType;

    /**
     * Título amigável para o card (ex: "Confirmar Criação de Oportunidade").
     */
    label: string;

    /**
     * O nome técnico da ferramenta que a IA queria usar (ex: 'create_sales_deal').
     * Necessário para enviar de volta ao Backend na confirmação.
     */
    actionIntent: string;

    /**
     * Payload Polimórfico.
     * Contém os dados que a ferramenta precisa (ex: { title: "Venda X", value: 500 }).
     * O componente SmartCard irá iterar sobre estas chaves dinamicamente.
     */
    data: Record<string, any>;
}

/**
 * Status visual da proposta no chat.
 * Controlado pelo FRONTEND para dar feedback instantâneo ao usuário.
 */
export type ProposalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED';

// --- 3. Mensageria ---

export type AIRole = 'user' | 'assistant' | 'system' | 'function';

/**
 * Estrutura de uma mensagem no chat.
 * Atualizada para suportar o fluxo híbrido (Texto + Proposta).
 */
export interface AIMessage {
    id: string;
    role: AIRole;
    content: string; // O texto da conversa (obrigatório, mesmo que seja "Confirme abaixo")
    timestamp: Date;
    
    /**
     * [NOVO V8] Proposta de Ação (Modo Consultivo).
     * Se existir, o Frontend deve renderizar o card de aprovação logo após o texto.
     */
    proposal?: AIActionProposal;

    /**
     * [NOVO V8] Controle de Estado Local.
     * Define se o card desta mensagem ainda é interativo.
     */
    proposalStatus?: ProposalStatus;

    /**
     * [LEGADO/DEBUG] Registro técnico de tools executadas no modo Autônomo.
     * Útil para mostrar "checkzinhos" de ações automáticas no futuro.
     */
    toolCalls?: {
        name: string;
        arguments: Record<string, any>;
        status: 'pending' | 'success' | 'error';
    }[];
}

// --- 4. Interface do Contexto (React Context) ---

export interface FilixAIContextData {
    // Estado Visual
    mode: AIWidgetMode;
    position: AIPosition;
    contextScope: AIContextScope;
    
    // Ações de Interface
    toggleVisibility: () => void;
    setMode: (mode: AIWidgetMode) => void;
    updatePosition: (pos: AIPosition) => void;
    
    // Ações de Inteligência
    setContextScope: (scope: AIContextScope) => void;
    
    // Soberania
    isEnabled: boolean;
    toggleEnabled: () => void;
}