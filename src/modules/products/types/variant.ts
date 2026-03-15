/**
 * @interface ProductVariant
 * @description O Espelho da Resposta (GET).
 * Representa a Variação Física (SKU) exatamente como o backend a devolve.
 * Contém dados injetados por outros módulos (ex: stockQuantity do Inventário).
 */
export interface ProductVariant {
    // 🔑 Identificadores
    id: string;
    sku: string;
    name: string; // Nome autogerado pelo backend (Ex: "Camiseta - Azul - P")
    barcode?: string; // EAN / GTIN

    // 💰 Precificação
    salePrice: number;
    promotionalPrice?: number;
    costPrice: number;

    // 🧬 Metadados
    attributes: Record<string, any>; // O JSONB de atributos (Cor, Tamanho, etc)

    // 📦 Estoque (Injetado pelo InventoryService via Response DTO)
    stockQuantity?: number; 
    
    // 🛡️ Auditoria
    createdAt?: string;
    updatedAt?: string;
}

/**
 * @interface ProductVariantFormData
 * @description O Contrato de Envio (POST / PUT).
 * Preparado para a arquitetura "Delta Sync" do seu NestJS.
 */
export interface ProductVariantFormData {
    // O "Pulo do Gato": Se tiver ID, o backend faz UPDATE. Se não tiver, faz CREATE.
    id?: string; 

    // Opcionais: Se não enviarmos, o backend gera automaticamente usando o prefixo do Produto Pai
    sku?: string;
    name?: string;
    barcode?: string;

    // Obrigatórios para a operação de venda
    salePrice: number;
    costPrice: number;
    
    // Opcionais de Precificação
    promotionalPrice?: number;

    // JSONB
    attributes?: Record<string, any>;
}