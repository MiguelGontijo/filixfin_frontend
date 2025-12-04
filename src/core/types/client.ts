// src/core/types/client.ts

// Enum para Tipos de Endereço
export enum AddressType {
    MAIN = 'MAIN',
    BILLING = 'BILLING',
    SHIPPING = 'SHIPPING'
}

// Interface para o Objeto de Endereço
export interface ClientAddress {
    id: string;
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
    zipCode: string;
    type: AddressType;
}

// DTO para o Objeto de Endereço
export interface AddressDto {
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
    zipCode: string;
    type?: AddressType;
}

/**
 * @interface Client
 * @description Tipagem para a Entidade Cliente.
 * @update Adicionado campo aiSummary (Memória de Longo Prazo).
 */
export interface Client {
    id: string;
    tenantId: string;
    name: string;
    document: string | null;
    email: string | null;
    phone: string | null;
    
    // --- NOVO: Resumo da IA ---
    aiSummary: string | null; 
    
    isActive: boolean;
    createdAt: string;
    updatedAt: string;

    addresses?: ClientAddress[];
}

/**
 * @interface CreateClientDto
 * @description DTO para criação.
 */
export interface CreateClientDto {
    name: string;
    document?: string; 
    email?: string;
    phone?: string;
    
    // --- NOVO ---
    aiSummary?: string;

    addresses?: AddressDto[];
}

/**
 * @interface UpdateClientDto
 * @description DTO para atualização.
 */
export interface UpdateClientDto {
    name?: string;
    document?: string;
    email?: string;
    phone?: string;
    isActive?: boolean;
    
    // --- NOVO ---
    aiSummary?: string;

    addresses?: AddressDto[];
}