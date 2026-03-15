import { ProductType, BaseUOM } from './enums';
import { ProductVariant, ProductVariantFormData } from './variant';

/**
 * @interface CategorySummary
 * @description O backend devolve um resumo da categoria aninhado no Produto.
 * Isso evita que o frontend precise fazer uma segunda requisição só para descobrir o nome da categoria.
 */
export interface CategorySummary {
    id: string;
    name: string;
    slug: string;
}

/**
 * @interface Product
 * @description O Contrato de Leitura (GET).
 * Representa o estado consolidado do Produto no Banco de Dados.
 * É esta interface que vai popular a nossa Tabela (Grid) de listagem.
 */
export interface Product {
    // 🔑 Identificadores e Dados Básicos
    id: string;
    name: string;
    description?: string;
    brand?: string;
    model?: string;
    type: ProductType | string; // Aceita string pura por segurança caso a API mande algo fora do Enum
    baseUOM: BaseUOM | string;
    images: string[];

    // ⚖️ Fiscal, Logística e Serviços
    ncm?: string;
    cest?: string;
    origin?: number;
    weight?: number;
    serviceCode?: string;
    durationMinutes?: number;
    bufferMinutes?: number;

    // 🔗 Relacionamentos e Árvore
    category?: CategorySummary; 
    categoryId?: string; // Usado internamente para facilitar a edição
    taxGroupId?: string;
    
    // 🧬 Os Filhos (Variantes)
    variants: ProductVariant[];

    // 🛡️ Auditoria e Status
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

/**
 * @interface ProductFormData
 * @description O Contrato de Escrita (POST / PUT).
 * O DTO exato que o NestJS espera receber na hora de Salvar.
 * Note que ele obriga o envio do array de Variantes (mesmo que seja só 1).
 */
export interface ProductFormData {
    // Dados Básicos
    name: string;
    description?: string;
    brand?: string;
    model?: string;
    type?: ProductType;
    baseUOM?: BaseUOM;
    images?: string[];

    // Relacionamentos Estratégicos
    categoryId?: string;
    taxGroupId?: string;

    // Fiscal e Logística
    ncm?: string;
    cest?: string;
    origin?: number;
    weight?: number;

    // Serviços (Agenda)
    serviceCode?: string;
    durationMinutes?: number;
    bufferMinutes?: number;

    // 🧬 Sincronismo de Variantes (Delta Sync)
    // O Zod vai cuidar de montar esse array nos bastidores para o usuário
    variants: ProductVariantFormData[];

    isActive?: boolean;
}