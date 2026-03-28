import { z } from 'zod';
import { BaseProductSchema } from './baseProductSchema';
import { ProductType, ProductDomainModel } from '../types/enums';

/**
 * ============================================================================
 * 📦 SCHEMA AUXILIAR: KitComponentSchema
 * @description Define a estrutura de um item dentro do combo.
 * Vincula uma variante existente a uma quantidade específica para o Kit.
 * ============================================================================
 */
const KitComponentSchema = z.object({
    /** 🔑 ID da variante que compõe o kit */
    variantId: z.uuid('ID de componente inválido'),
    /** 🔢 Quantidade deste item inclusa no kit */
    quantity: z.coerce.number().min(1, 'A quantidade mínima é 1'),
    /** 💰 Preço proporcional (opcional, para rateio de kit) */
    unitPrice: z.coerce.number().optional(),
});

/**
 * ============================================================================
 * 🎁 SCHEMA: KitProductSchema
 * @description Especialização para combos e agrupamentos de produtos.
 * Permite vender múltiplos itens sob um único SKU e preço unificado.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Netflix/Shopify Level):
 * 1. Composition Integrity: Exige que o kit tenha pelo menos 2 componentes 
 * (regra de negócio para evitar kits de um único item).
 * 2. Financial Logic: Valida o preço global do combo na raiz.
 * 3. Domain Fixed: Geralmente atrelado ao domínio físico ou digital.
 * ============================================================================
 */
export const KitProductSchema = BaseProductSchema.extend({
    /** 🔑 Chave Discriminadora: Define este contrato como Kit/Combo */
    type: z.literal(ProductType.KIT),

    /** 💠 Modelo de Domínio: Identidade visual do catálogo */
    domainModel: z.enum(ProductDomainModel).default(ProductDomainModel.PHYSICAL),

    /** 🏷️ SKU Principal do Combo */
    sku: z.string().trim().min(1, 'O SKU do Kit é obrigatório'),

    /** 💰 Preço de Venda do Kit completo */
    salePrice: z.coerce.number({ 
        error: 'Preço de venda do kit inválido' 
    }).min(0.01, 'O preço do kit deve ser maior que zero'),

    /** 💰 Preço de Custo (Soma dos componentes ou custo de montagem) */
    costPrice: z.coerce.number().min(0).default(0),

    /** 🧩 Componentes: Lista de itens que formam o agrupamento */
    componentsList: z.array(KitComponentSchema)
        .min(2, 'Um kit deve possuir ao menos 2 componentes para ser caracterizado como combo'),

    /** 🧠 Metadados Polimórficos (JSONB) */
    attributes: z.record(z.string(), z.any()).default({}),
});

/**
 * Nota Arquitetural: O KitProductSchema herda o 'isActive' e 'images' da base, 
 * permitindo que o combo tenha sua própria galeria de fotos independente 
 * dos itens que o compõem.
 */