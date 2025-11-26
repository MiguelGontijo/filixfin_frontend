// src/types/acl.ts

// Definições de Entidades de ACL (Administração)

// Tipagem do Plano
export interface Plan {
    id: string;
    name: string;
    description: string | null;
    price: number; // Agora é garantido como number pelo TypeormNumericTransformer
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Tipagem da Feature
export interface Feature {
    id: string;
    key: string;
    name: string;
    description: string | null;
    type: 'boolean' | 'quantity';
    createdAt: string;
    updatedAt: string;
}

// Tipagem da Regra de Atrelamento Plan <-> Feature
export interface PlanFeatureRule {
    featureId: string;
    limitValue: number;
}