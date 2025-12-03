// src/features/crm/types.ts

import { Client } from '@/core/types/client';

// --- ENUMS (Espelhos do Backend) ---

export enum DealStatus {
    NEW = 'NEW',
    QUALIFIED = 'QUALIFIED',
    PROPOSAL = 'PROPOSAL',
    NEGOTIATION = 'NEGOTIATION',
    WON = 'WON',
    LOST = 'LOST',
}

export enum InteractionType {
    NOTE = 'NOTE',
    AUDIO = 'AUDIO',
    EMAIL = 'EMAIL',
    MEETING = 'MEETING',
}

// --- INTELEGÊNCIA ARTIFICIAL (O Contrato com o LangChain) ---

/**
 * @interface InteractionAnalysis
 * @description Estrutura exata do JSON retornado pelo endpoint /crm/analyze (Backend).
 * Define os insights extraídos pela IA.
 */
export interface InteractionAnalysis {
    summary: string;
    sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "TENSE";
    tags: string[];
    actionItems: string[];
    dealProbability?: number; // Opcional, pois o Zod definiu como optional
    extractedIdentity?: {
        personName: string | null;
        companyName: string | null;
        contactInfo: string | null;
        intentType: "NEW_BUSINESS" | "SUPPORT" | "FOLLOW_UP" | "UNKNOWN";
    };
}

// --- ENTIDADES DO CRM ---

export interface CRMDeal {
    id: string;
    tenantId: string;
    clientId: string;
    title: string;
    status: DealStatus;
    value: number;
    probability: number;
    expectedCloseDate?: string; // Datas vêm como string do JSON
    createdAt: string;
    updatedAt: string;
    
    // Relação (Hidratada se necessário)
    client?: Client;
}

export interface CRMInteraction {
    id: string;
    tenantId: string;
    clientId: string;
    type: InteractionType;
    content: string; // Texto bruto ou transcrição
    mediaUrl?: string;
    
    // A Inteligência Anexada
    aiAnalysis?: InteractionAnalysis;
    
    createdAt: string;
}