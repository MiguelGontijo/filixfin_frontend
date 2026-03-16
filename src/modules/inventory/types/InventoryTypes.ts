// src/modules/inventory/types/InventoryTypes.ts

/**
 * ==========================================
 * MÓDULO DE INVENTÁRIO - TIPOS E INTERFACES
 * ==========================================
 * * Centraliza as definições de Tipos para Depósitos (Warehouses)
 * e Movimentações de Estoque (Stock Movements).
 */

// --- ENUMS ---

/**
 * Tipos de Transação de Estoque
 * Define a natureza da operação (Entrada ou Saída) e o motivo.
 */
export enum TransactionType {
    // Entradas (+)
    IN_PURCHASE = 'IN_PURCHASE',       // Compra (Nota Fiscal)
    IN_TRANSFER = 'IN_TRANSFER',       // Transferência de outro local
    IN_ADJUSTMENT = 'IN_ADJUSTMENT',   // Ajuste de Inventário (Sobra)
    IN_RETURN = 'IN_RETURN',           // Devolução de Cliente
    
    // Saídas (-)
    OUT_SALE = 'OUT_SALE',             // Venda
    OUT_CONSUMPTION = 'OUT_CONSUMPTION', // Consumo Interno
    OUT_LOSS = 'OUT_LOSS',             // Perda / Quebra / Avaria
    OUT_TRANSFER = 'OUT_TRANSFER',     // Transferência para outro local
    OUT_ADJUSTMENT = 'OUT_ADJUSTMENT'  // Ajuste de Inventário (Falta)
}

// --- ENTIDADES (Models) ---

/**
 * Representa um Local de Estoque (Depósito, Loja, Caminhão)
 */
export interface Warehouse {
    id: string;
    tenantId?: string;
    name: string;
    isDefault: boolean;         // Se é o depósito padrão para vendas
    isActive: boolean;          // Se está disponível para uso
    allowsNegativeStock: boolean; // Se permite vender sem saldo
    
    // Dados de Endereço (Armazenado como JSONB no banco)
    addressInfo?: {
        street?: string;
        city?: string;
        zipCode?: string;
        state?: string;
    };

    createdAt?: string;
    updatedAt?: string;
}

/**
 * Representa um registro histórico de movimentação (Kardex)
 */
export interface InventoryTransaction {
    id: string;
    tenantId?: string;
    warehouseId: string;
    variantId: string; // ID da variante do produto (SKU)
    
    type: TransactionType;
    quantity: number;      // Valor absoluto ou assinado, dependendo da lógica do back
    
    previousBalance: number; // Snapshot do saldo antes
    newBalance: number;      // Snapshot do saldo depois
    
    unitCost?: number;     // Custo no momento da transação
    totalValue?: number;   // quantity * unitCost
    
    documentRef?: string;  // Número da NF, Pedido, etc.
    notes?: string;        // Observações manuais
    
    createdBy: string;     // ID ou Nome do usuário
    createdAt: string;

    // Relações Expandidas (para exibição na Lista)
    warehouse?: Warehouse;
    variant?: {
        id?: string;
        name: string;
        sku?: string;
        product?: { // Adicionei product aqui pois geralmente precisamos do nome do pai na lista
             name: string;
        };
    };
}

// --- DTOs (Data Transfer Objects) - Inputs de Formulário ---

/**
 * Payload para Criar ou Editar um Depósito
 */
export interface CreateWarehouseInput {
    name: string;
    isDefault: boolean;
    allowsNegativeStock: boolean;
    addressInfo: {
        street?: string;
        city?: string;
        [key: string]: any;
    };
}

/**
 * Payload para Registrar uma Movimentação Manual
 */
export interface RegisterMovementInput {
    warehouseId: string;
    variantId: string;
    type: TransactionType;
    quantity: number | string; // Aceita string durante a digitação no form
    unitCost?: number | string;
    documentRef?: string;
    notes?: string;
}

// --- ESTADOS DE FILTRO ---

export interface WarehouseFilter {
    isActive?: boolean;
    search?: string;
}

export interface MovementFilter {
    startDate?: string;
    endDate?: string;
    type?: TransactionType;
    warehouseId?: string;
    variantId?: string;
    
    // ADIÇÃO NECESSÁRIA: Paginação para a Tabela
    page?: number;
    limit?: number;
}

// Adicione este bloco no seu InventoryTypes.ts

/**
 * @interface InventoryStock
 * @description Representa a fotografia atual do saldo na prateleira.
 * Retornado pela rota Master (/balances).
 */
export interface InventoryStock {
    id: string;
    warehouseId: string;
    variantId: string;
    
    // Saldos
    quantity: number;           // Físico na prateleira
    reservedQuantity: number;   // Reservado (Pedidos pendentes)
    
    updatedAt: string;

    // Relações Expandidas (Trazidas via Join pelo Backend)
    warehouse?: Warehouse;
    variant?: {
        id: string;
        sku: string;
        name?: string;
        product?: {
            name: string;
        };
    };
}