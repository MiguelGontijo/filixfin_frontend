/**
 * @file AIState.ts
 * @description O Estado do React (O Mundo da Tela).
 * Junta os contratos de rede com as necessidades visuais da interface (UI).
 */

import { Dispatch, SetStateAction } from 'react';
import { 
    AIWidgetMode, 
    AIRole, 
    AIContextScope, 
    ProposalStatus 
} from '../enums/AIEnums';
import { AIActionProposal } from '../dtos/AIActionProposal.dto';
import { AIContextMetadata } from '../dtos/AIChatRequest.dto';

// --- 1. A Mensagem (O "Tijolo" da Interface) ---

/**
 * @interface AIMessage
 * @description Estrutura de uma mensagem renderizada no chat.
 * É a evolução do AIResponseDto, adicionando controle de estado local (UI).
 */
export interface AIMessage {
    id: string;
    role: AIRole;
    content: string; 
    timestamp: Date;
    
    /**
     * Proposta de Ação (Modo Consultivo) vinda do Backend.
     */
    proposal?: AIActionProposal;

    /**
     * Controle de Estado Local (Exclusivo do Frontend).
     * Define se os botões do card desta mensagem estão ativos ou bloqueados.
     */
    proposalStatus?: ProposalStatus;

    /**
     * (Debug/Histórico) Registro técnico de tools executadas de forma autônoma.
     */
    toolUsed?: string;
}

// --- 2. O Cérebro Global (React Context) ---

/**
 * @interface FilixAIContextData
 * @description O contrato do Estado Global do Assistente.
 */
export interface FilixAIContextData {
    // === Estado Visual ===
    mode: AIWidgetMode;
    isEnabled: boolean;
    
    // === Estado Semântico ===
    contextScope: AIContextScope;          // A Pistola (Macro)
    contextMetadata?: AIContextMetadata;   // A Sniper (Micro - Opcional)
    
    // === Estado de Interação (Rascunho) ===
    inputDraft: string;
    setInputDraft: (text: string) => void;

    // === A Memória Central ===
    messages: AIMessage[]; 
    setMessages: Dispatch<SetStateAction<AIMessage[]>>;

    // === Ações (Actions) ===
    toggleVisibility: () => void;
    setMode: (mode: AIWidgetMode) => void;
    toggleEnabled: () => void;
    setContext: (scope: AIContextScope, metadata?: AIContextMetadata) => void;
    openChat: () => void;
}