// ============================================================================
// 📑 CONTRATOS DE FILTRAGEM (Data Transfer Objects internos)
// ============================================================================

export interface KardexFilters {
    variantId?: string;
    warehouseId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
}

export interface BalancesFilters {
    variantId?: string;
    warehouseId?: string;
    limit?: number;
}