// src/types/client.ts

// Definições de Tipagem para a Entidade Cliente

/**
 * @interface Client
 * @description Tipagem para a Entidade Cliente (que pertence a um Tenant).
 */
export interface Client {
    id: string;
    tenantId: string;
    name: string;
    document: string;
    email: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * @interface CreateClientDto
 * @description Tipagem para o payload de criação de Cliente.
 */
export interface CreateClientDto {
    name: string;
    document: string;
    email?: string;
}