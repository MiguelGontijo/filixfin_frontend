// ===== FILE: src/core/types/api.types.ts =====

/**
 * @file api.types.ts
 * @description CONTRATOS GLOBAIS DE COMUNICAÇÃO HTTP (Shared Kernel).
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Enterprise Grade):
 * 1. Single Source of Truth (SSOT): Centraliza o formato de resposta do backend NestJS.
 * Se a API mudar o nome de 'limit' para 'perPage' no futuro, alteramos apenas aqui,
 * e o TypeScript avisará exatamente quais telas do sistema precisam ser ajustadas.
 * 2. Uso de Generics (<T>): Permite que qualquer módulo do sistema (CRM, Financeiro, etc.) 
 * reutilize esta estrutura de paginação garantindo tipagem forte na propriedade 'data'.
 */

// ============================================================================
// 📊 METADADOS DE PAGINAÇÃO
// ============================================================================
/**
 * Interface que espelha o objeto "meta" devolvido pelo NestJS nas rotas paginadas.
 */
export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// ============================================================================
// 📦 RESPOSTA PAGINADA (Generic Wrapper)
// ============================================================================
/**
 * Interface Genérica para respostas que contêm listas grandes.
 * @template T - O tipo de entidade que está sendo trafegada (Ex: CRMDeal, Client, Category).
 */
export interface PaginatedResponse<T> {
    /** * O array contendo os registros da página atual. 
     * O TypeScript saberá exatamente o que tem dentro deste array graças ao <T>.
     */
    data: T[];
    
    /** * Os metadados para construção de componentes de paginação (Next/Prev) na UI. 
     */
    meta: PaginationMeta;
}