import { ProductMetadata } from './metadata.types';

/**
 * ============================================================================
 * 🧬 ENTIDADE: ProductVariant (O SKU Físico)
 * @description Representa a unidade mínima de comercialização e estoque.
 * Em um modelo Shopify, cada variante possui sua própria identidade, 
 * precificação e atributos específicos salvos em JSONB.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Enterprise Grade):
 * 1. Metadata Sovereignty: O campo 'metadata' armazena as especificidades 
 * de nicho (ex: a quilometragem de um carro ou os alérgenos de uma pizza).
 * 2. Financial Precision: Separação estrita entre preço de venda, custo 
 * e promoções para auditoria de margem.
 * 3. Inventory Integration: Preparado para receber dados injetados de 
 * saldo físico (stockQuantity).
 * ============================================================================
 */
export interface ProductVariant {
    /** 🔑 Identificadores Únicos */
    id: string;
    productId: string;
    
    /** 🏷️ Identificação Comercial */
    sku: string;
    /** Nome descritivo da variante (ex: "Camiseta Filix - Preta - G") */
    name: string;
    /** Código de barras global (EAN/GTIN/UPC) */
    barcode?: string;

    /** 💰 Gestão Financeira */
    salePrice: number;
    costPrice: number;
    /** Preço de oferta ativo (se aplicável) */
    promotionalPrice?: number;

    /** 🧠 Inteligência Dinâmica (JSONB)
     * Contém os atributos polimórficos definidos pelo DomainModel do Produto.
     */
    metadata: ProductMetadata;

    /** 📦 Informações de Estoque (Injetadas via Response DTO) */
    stockQuantity?: number;
    
    /** 🛡️ Auditoria */
    createdAt?: string;
    updatedAt?: string;
}

/**
 * ============================================================================
 * 📝 DTO: ProductVariantFormData (O Contrato de Escrita)
 * @description Estrutura para envio de dados de variantes. 
 * Suporta a lógica de "Delta Sync" (Criação ou Atualização baseada no ID).
 * ============================================================================
 */
export interface ProductVariantFormData {
    /** Se presente, o sistema executa UPDATE. Se nulo/undefined, executa CREATE. */
    id?: string; 

    sku?: string;
    name?: string;
    barcode?: string;

    salePrice: number;
    costPrice: number;
    promotionalPrice?: number;

    /** Payload dinâmico para o JSONB */
    metadata?: any;
}