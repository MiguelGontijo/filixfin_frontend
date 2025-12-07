// src/modules/crm/types.ts

import { Client } from '@/core/types/client';

// --- ENUMS ---

export enum DealStatus {
    NEW = 'NEW',
    QUALIFIED = 'QUALIFIED',
    PROPOSAL = 'PROPOSAL',
    NEGOTIATION = 'NEGOTIATION',
    WON = 'WON',
    LOST = 'LOST',
}

export enum DealSource {
    MANUAL = 'MANUAL',
    WHATSAPP = 'WHATSAPP',
    INSTAGRAM = 'INSTAGRAM',
    WEB_SITE = 'WEB_SITE',
    ADS = 'ADS',
    INDICATION = 'INDICATION'
}

export enum DealItemType {
    PRODUCT = 'PRODUCT',
    SERVICE = 'SERVICE'
}

export enum InteractionType {
    NOTE = 'NOTE',
    AUDIO = 'AUDIO',
    EMAIL = 'EMAIL',
    MEETING = 'MEETING',
}

// --- SUB-ENTIDADES ---

export interface ExtractedAddress {
    street: string | null;
    number: string | null;
    complement: string | null;
    district: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    type: "MAIN" | "BILLING" | "SHIPPING" | null;
}

export interface InteractionAnalysis {
    summary: string;
    sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "TENSE";
    tags: string[];
    actionItems: string[];
    dealProbability?: number;
    updatedClientSummary?: string | null; 
    extractedIdentity?: {
        personName: string | null;
        companyName: string | null;
        email: string | null;
        phone: string | null;
        extractedAddresses?: ExtractedAddress[];
        intentType: "NEW_BUSINESS" | "SUPPORT" | "FOLLOW_UP" | "UNKNOWN";
    };
}

export interface CRMDealItem {
    id: string;
    dealId: string;
    
    // --- NOVO: Vínculo com Produto ---
    productId?: string | null; 
    product?: {  // Dados do produto para exibição (snapshot ou join)
        title: string;
        sku: string | null;
    };
    // ---------------------------------

    type: DealItemType;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    createdAt: string;
    updatedAt: string;
}

// --- ENTIDADES PRINCIPAIS ---

export interface CRMDeal {
    id: string;
    tenantId: string;
    clientId: string;
    ownerId: string | null;
    
    title: string;
    status: DealStatus;
    source: DealSource;
    lossReason: string | null;
    
    value: number;
    probability: number;
    expectedCloseDate?: string;
    
    createdAt: string;
    updatedAt: string;

    client?: Client;
    items?: CRMDealItem[];
}

export interface CRMInteraction {
    id: string;
    tenantId: string;
    clientId: string;
    type: InteractionType;
    content: string;
    mediaUrl?: string;
    aiAnalysis?: InteractionAnalysis;
    createdAt: string;
}