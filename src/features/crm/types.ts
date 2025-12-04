// src/features/crm/types.ts

import { Client } from '@/core/types/client';

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

// --- NOVO: Interface para o Endereço Extraído pela IA ---
// Porquê: Define a estrutura que esperamos receber do backend (via Zod/LLM).
// Todos os campos são anuláveis (nullable) pois a IA pode não encontrar todos os detalhes no texto.
export interface ExtractedAddress {
    street: string | null;
    number: string | null;
    complement: string | null;
    district: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    // Tipo literal compatível com o Enum do backend
    type: "MAIN" | "BILLING" | "SHIPPING" | null;
}

/**
 * @interface InteractionAnalysis
 * @description Estrutura exata do JSON retornado pelo endpoint /crm/analyze (Backend).
 * @update Adicionado suporte a lista de endereços extraídos (extractedAddresses).
 */
export interface InteractionAnalysis {
    summary: string;
    sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "TENSE";
    tags: string[];
    actionItems: string[];
    dealProbability?: number;
    
    extractedIdentity?: {
        personName: string | null;
        companyName: string | null;
        // Campos granulares de contato
        email: string | null;
        phone: string | null;
        
        // --- NOVO: Lista de Endereços identificados ---
        extractedAddresses?: ExtractedAddress[];

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
    expectedCloseDate?: string; 
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
    content: string;
    mediaUrl?: string;
    
    // A Inteligência Anexada
    aiAnalysis?: InteractionAnalysis;
    createdAt: string;
}