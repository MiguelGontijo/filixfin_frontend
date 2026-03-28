import { z } from 'zod';
import { BaseProductSchema } from './baseProductSchema';
import { ProductType, ProductDomainModel } from '../types/enums';

/**
 * ============================================================================
 * 📦 SCHEMA AUXILIAR: VariantItemSchema
 * @description Define as regras rigorosas para cada SKU dentro de uma grade.
 * Utilizado exclusivamente pelo modo VARIABLE para garantir que cada variação 
 * tenha sua própria identidade financeira e logística.
 * ============================================================================
 */
const VariantItemSchema = z.object({
    id: z.uuid('ID de variante inválido').optional(),
    sku: z.string().trim().min(1, 'O SKU da variante é obrigatório'),
    name: z.string().optional(), // Ex: "Camiseta - Preta - G"
    barcode: z.string().optional(),
    
    /** 💰 Precificação específica da variante */
    salePrice: z.coerce.number({ 
        error: 'Preço de venda inválido' 
    }).min(0.01, 'O preço da variante deve ser maior que zero'),
    
    /** 💰 Custo específico da variante para DRE */
    costPrice: z.coerce.number({ 
        error: 'Preço de custo inválido' 
    }).min(0).default(0),
    
    promotionalPrice: z.coerce.number().min(0).optional(),
    
    /** 🧠 Metadados específicos da variante (JSONB) */
    attributes: z.record(z.string(), z.any()).default({}),
});

/**
 * ============================================================================
 * 📊 SCHEMA: VariableProductSchema
 * @description Especialização para produtos complexos com grade (Cores, Tamanhos).
 * Implementa o padrão de delegação, onde a raiz do produto não possui preço, 
 * obrigando a existência de pelo menos uma variante válida.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Shopify/Netflix Level):
 * 1. Strategic Omission: Remove SKU e Preço da raiz para evitar dados fantasmas.
 * 2. Array Integrity: Exige no mínimo 1 item na lista de variantes.
 * 3. Domain Model Sync: Mantém a paridade de domínio para filtros globais.
 * ============================================================================
 */
export const VariableProductSchema = BaseProductSchema.extend({
    /** 🔑 Chave Discriminadora: Define este contrato como Produto com Grade */
    type: z.literal(ProductType.VARIABLE),

    /** 💠 Modelo de Domínio: Define a identidade visual do catálogo */
    domainModel: z.enum(ProductDomainModel).default(ProductDomainModel.PHYSICAL),

    /** 🏷️ Lista de Variantes: O coração do produto variável */
    variantsList: z.array(VariantItemSchema)
        .min(1, 'Um produto variável deve possuir ao menos uma variante na grade'),

    /** * 🛡️ Bloqueio de Raiz: Garantimos que SKU e Preço não existam na raiz.
     * Isso impede que o programador ou a UI enviem dados inconsistentes.
     */
    sku: z.never().optional(),
    salePrice: z.never().optional(),
    costPrice: z.never().optional(),
});