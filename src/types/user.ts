// src/types/user.ts

// Reúsa o ENUM de Role do Backend (simplificado aqui)
export type UserRole = 'GLOBAL_ADMIN' | 'TENANT_ADMIN' | 'MEMBER';

export interface Feature {
    id: string;
    key: string;
    name: string;
    description: string | null;
    type: 'boolean' | 'quantity';
    createdAt: string;
    updatedAt: string;
}

// --- Tipagem do Plano ---
export interface Plan {
    id: string;
    name: string;
    description: string | null;
    price: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}