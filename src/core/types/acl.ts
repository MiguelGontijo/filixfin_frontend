
// Definições de Entidades de ACL (Administração)

// --- Novo tipo para as opções de controle ---
export const FeatureType = {
    BOOLEAN: 'boolean', // Permissão simples (sim/não)
    QUANTITY: 'quantity', // Permissão com limite numérico
} as const;

export type FeatureType = 'boolean' | 'quantity';

// Tipagem da FeatureKey (Importado do Backend, mas definido aqui para tipagem Frontend)
export type FeatureKey = 
    'PLANO_GERENCIAR' | 'DASHBOARD_USO_VIEW' | 
    'CLIENTE_ADD' | 'CLIENTE_VIEW' | 'CLIENTE_EDIT' | 
    'CLIENTE_DELETE' | 'PRODUTO_ADD' | 'PRODUTO_VIEW' |
    'ESTOQUE_MOVIMENTAR' | 'FATURAMENTO_MAX_NF_E' | 
    'ACESSO_SISTEMA_LOGIN';

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

// DTO para Criação (corpo do POST)
export interface CreateFeatureDto {
    key: FeatureKey;
    name: string;
    description?: string;
    type: 'boolean' | 'quantity';
}

// DTO para Atualização (corpo do PATCH)
export interface UpdateFeatureDto {
    name?: string;
    description?: string;
    type?: 'boolean' | 'quantity';
}
