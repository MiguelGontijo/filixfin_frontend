import { Client } from '@/core/types/client';

// ============================================================================
// 1. ENUMS DE NEGÓCIO (DEALS) - Mantidos Intactos
// ============================================================================

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

// ============================================================================
// 2. ENTIDADES DE NEGÓCIO
// ============================================================================

export interface CRMDealItem {
    id: string;
    dealId: string;
    
    // Vínculo com Produto
    productId?: string | null; 
    product?: { 
        title: string;
        sku: string | null;
    };

    type: DealItemType;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    createdAt: string;
    updatedAt: string;
}

export interface CRMDeal {
    id: string;
    tenantId: string;
    clientId: string;
    ownerId: string | null;
    
    title: string;
    
    // --- CAMPOS DINÂMICOS (NOVA ARQUITETURA) ---
    pipelineId?: string;       // Identificador do funil
    currentStageId?: string;   // Identificador da etapa (coluna)
    priority?: string;         // 'HIGH' | 'MEDIUM' | 'LOW'

    // Mantido para compatibilidade imediata com componentes antigos
    status: DealStatus; 
    
    source: DealSource;
    lossReason: string | null;
    
    value: number;
    probability: number; // 0-100
    expectedCloseDate?: string;
    
    createdAt: string;
    updatedAt: string;

    client?: Client;
    items?: CRMDealItem[];
}