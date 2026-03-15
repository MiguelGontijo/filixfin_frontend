/**
 * @file types.ts
 * @description CONTRATOS DE TIPAGEM: MÓDULO FISCAL E TRIBUTÁRIO.
 * * DIRETRIZES (Enterprise Grade):
 * 1. Arquitetura Bimodal: Separação clara entre o Perfil (TaxGroup) e a Matriz (TaxRule).
 * 2. Espelhamento Exato: Estes tipos refletem milimetricamente os DTOs do Backend.
 */

// ============================================================================
// 📦 TIPOS DE LEITURA (O que vem do Backend - GET)
// ============================================================================

/**
 * @interface ITaxRule
 * @description Representa uma regra tributária (A linha da Matriz).
 */
export interface ITaxRule {
    id: string;
    
    // Cenários de Estado (Se undefined/null, é a regra Padrão Nacional)
    ufOrigem?: string;
    ufDestino?: string;
    
    // Códigos NF-e
    cfopState?: string;
    cfopInterstate?: string;
    cstCsosn?: string;
    
    // Alíquotas de Imposto
    icmsRate: number;
    pisRate: number;
    cofinsRate: number;
}

/**
 * @interface ITaxGroup
 * @description Representa o Perfil Tributário (O Pai).
 */
export interface ITaxGroup {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    
    // A lista de regras aninhadas (O Motor)
    rules: ITaxRule[];
    
    // Auditoria para a UI
    createdAt: string;
    updatedAt: string;
}

// ============================================================================
// ✍️ TIPOS DE ESCRITA (O que vai para o Backend - POST / PUT)
// ============================================================================

/**
 * @interface ICreateTaxRuleDTO
 * @description Payload para criar uma nova regra na matriz.
 */
export interface ICreateTaxRuleDTO {
    ufOrigem?: string;
    ufDestino?: string;
    cfopState?: string;
    cfopInterstate?: string;
    cstCsosn?: string;
    icmsRate: number;
    pisRate: number;
    cofinsRate: number;
}

/**
 * @interface ICreateTaxGroupDTO
 * @description Payload para criar um novo Perfil Tributário.
 */
export interface ICreateTaxGroupDTO {
    name: string;
    description?: string;
    isActive?: boolean;
    
    // Obrigatório enviar pelo menos uma regra (mesmo que zerada/padrão)
    rules: ICreateTaxRuleDTO[];
}

/**
 * @interface IUpdateTaxRuleDTO
 * @description Payload para atualizar a matriz. 
 * O 'id' opcional é a chave do Delta Sync no Backend (Se tem ID, atualiza; Se não tem, cria).
 */
export interface IUpdateTaxRuleDTO extends Partial<ICreateTaxRuleDTO> {
    id?: string; 
}

/**
 * @interface IUpdateTaxGroupDTO
 * @description Payload de atualização parcial do Perfil.
 */
export interface IUpdateTaxGroupDTO {
    name?: string;
    description?: string;
    isActive?: boolean;
    
    // Se enviado, o Backend substitui a matriz atual por esta
    rules?: IUpdateTaxRuleDTO[];
}