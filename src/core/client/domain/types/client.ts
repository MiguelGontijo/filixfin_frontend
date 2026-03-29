// src/core/types/client.ts

export enum AddressType {
    MAIN = 'MAIN',
    BILLING = 'BILLING',
    SHIPPING = 'SHIPPING'
}

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
 * @update Adicionado userNotes (Notas Privadas).
 */
export interface Client {
    id: string;
    tenantId: string;
    name: string;
    document: string | null;
    email: string | null;
    phone: string | null;
    
    // IA Memory
    aiSummary: string | null;
    
    // Notas Privadas do Usuário ---
    userNotes: string | null;

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
    aiSummary?: string;
    userNotes?: string;

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
    aiSummary?: string;
    userNotes?: string;

    addresses?: AddressDto[];
}