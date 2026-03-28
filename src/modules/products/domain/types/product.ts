import { ProductType, BaseUOM, ProductDomainModel } from './enums';
import { ProductVariant, ProductVariantFormData } from './variant';

/**
 * @interface CategorySummary
 * @description Resumo da categoria aninhado no Produto para otimização de leitura (Eager Loading).
 */
export interface CategorySummary {
    id: string;
    name: string;
    slug: string;
}

/**
 * ============================================================================
 * 📦 ENTIDADE: Product (O Contrato de Leitura)
 * @description Representa o estado consolidado do Produto no ecossistema Filix.
 * Projetado para suportar o padrão de Variantes (Shopify) e Metadados 
 * Polimórficos (JSONB).
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Netflix/Shopify Level):
 * 1. Hybrid Architecture: Combina campos fixos relacionais com um campo 
 * de metadados discriminado por domínio.
 * 2. Variant-Centric: Trata o produto como uma abstração, onde a unidade de 
 * venda real reside no array de variants.
 * 3. Type Resilience: Garante que IDs e Enums estejam sempre sincronizados 
 * com o Backend (image_036f21.png).
 * ============================================================================
 */
export interface Product {
    /** 🔑 Identificadores Únicos */
    id: string;
    tenantId: string;
    
    /** 🏷️ Identificação e Branding */
    name: string;
    brand?: string;
    model?: string;
    description?: string;
    
    /** ⚙️ Configuração Estrutural */
    type: ProductType | string;
    baseUOM: BaseUOM | string;
    
    /** 🔗 Relacionamentos Estratégicos */
    categoryId: string;
    category?: CategorySummary;
    taxGroupId?: string;
    
    /** 🖼️ Ativos de Mídia (URLs) */
    images: string[];

    /** ⚖️ Fiscal, Logística e Serviços (Campos do Backend) */
    weight?: number;
    ncm?: string;
    cest?: string;
    origin?: number;
    serviceCode?: string;
    durationMinutes?: number;
    bufferMinutes?: number;

    /** 🧬 Os Filhos (Variantes/SKUs) */
    variants: ProductVariant[];

    /** 🛡️ Status e Auditoria */
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
}

/**
 * ============================================================================
 * 📝 DTO: ProductFormData (O Contrato de Escrita)
 * @description Estrutura de dados para operações de POST e PUT.
 * Garante que o payload enviado para a API esteja em conformidade com as 
 * regras de Variantes e o Modelo de Domínio selecionado.
 * ============================================================================
 */
export interface ProductFormData {
    name: string;
    brand?: string;
    model?: string;
    description?: string;
    
    /** Define a lógica de variantes (SIMPLE, VARIABLE, etc) */
    type: ProductType;
    /** Define qual sub-formulário JSONB será utilizado (VEHICLE, FOOD, etc) */
    domainModel: ProductDomainModel;
    
    baseUOM: BaseUOM;
    categoryId: string;
    taxGroupId: string;
    images: string[];

    /** Campos de Logística/Fiscal */
    weight?: number;
    ncm?: string;
    cest?: string;
    origin?: number;
    
    /** 🧬 Matriz de Variantes (Delta Sync) */
    variants: ProductVariantFormData[];

    isActive: boolean;
}