// src/types/user.ts

// --- CORREÇÃO: Usar um objeto const para garantir valores em runtime ---
export const UserRole = {
    GLOBAL_ADMIN: 'GLOBAL_ADMIN',
    TENANT_ADMIN: 'TENANT_ADMIN',
    MEMBER: 'MEMBER',
} as const;

// Reúsa o ENUM de Role do Backend (simplificado aqui)
export type UserRole = 'GLOBAL_ADMIN' | 'TENANT_ADMIN' | 'MEMBER';

// Tipagem da Feature e Plan foram movidas para src/types/acl.ts

export interface User {
    id: string;
    email: string;
    role: UserRole;
    tenantId: string | null;
    // Removido o Plan, Feature, etc.
}