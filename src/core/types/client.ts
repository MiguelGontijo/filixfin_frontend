// src/core/types/client.ts

// --- NOVO: Enum para Tipos de Endereço (Espelho do Backend) ---
export enum AddressType {
    MAIN = 'MAIN',
    BILLING = 'BILLING',
    SHIPPING = 'SHIPPING'
}

// --- NOVO: Interface para o Objeto de Endereço (Leitura) ---
export interface ClientAddress {
    id: string;
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string; // UF (2 letras)
    zipCode: string;
    type: AddressType;
}

// --- NOVO: DTO para o Objeto de Endereço (Escrita/Criação) ---
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
 * @description Tipagem para a Entidade Cliente (que pertence a um Tenant).
 */
export interface Client {
    id: string;
    tenantId: string;
    name: string;
    // Atualizado: Documento pode ser nulo para Leads
    document: string | null;
    email: string | null;
    // --- NOVO: Campo de Telefone ---
    phone: string | null; 
    
    isActive: boolean;
    createdAt: string;
    updatedAt: string;

    // --- NOVO: Lista de Endereços Vinculados ---
    // Opcional pois pode não vir carregado em todas as listagens
    addresses?: ClientAddress[];
}

/**
 * @interface CreateClientDto
 * @description Tipagem para o payload de criação de Cliente.
 */
export interface CreateClientDto {
    name: string;
    // Opcional para Leads (sem documento inicial)
    document?: string; 
    email?: string;
    // --- NOVO: Campo de Telefone ---
    phone?: string;

    // --- NOVO: Array de Endereços para Criação em Cascata ---
    addresses?: AddressDto[];
}