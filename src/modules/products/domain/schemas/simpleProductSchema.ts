import { z } from 'zod';
import { BaseProductSchema } from './baseProductSchema'; // Importando sua versão canônica
import { ProductType, ProductDomainModel } from '../types/enums';

/**
 * ============================================================================
 * 📦 SCHEMA: SimpleProductSchema
 * @description Especialização para itens de venda direta com SKU único.
 * Este schema estende a base genética e adiciona a precificação e identificação
 * necessárias para o fluxo comercial de unidade única.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Shopify/Google Architecture):
 * 1. Discriminator Injection: Força o tipo como 'SIMPLE' para o roteamento.
 * 2. Flat UI Mapping: Captura dados financeiros na raiz para melhor UX.
 * 3. Attributes Synergy: Preparado para receber o payload polimórfico (JSONB).
 * ============================================================================
 */
export const SimpleProductSchema = BaseProductSchema.extend({
    /** 🔑 Chave Discriminadora: Define este contrato como Produto Simples */
    type: z.literal(ProductType.SIMPLE),

    /** 💠 Modelo de Domínio: Define a "Pele" de metadados (Físico, Veículo, etc) */
    domainModel: z.enum(ProductDomainModel).default(ProductDomainModel.PHYSICAL),

    /** 🏷️ SKU Principal: Identificador único de estoque na raiz para produtos simples */
    sku: z.string().trim().min(1, 'O SKU é obrigatório para produtos simples'),

    /** 🔢 Código de Barras (EAN/GTIN) */
    barcode: z.string().optional(),

    /** 💰 Gestão Financeira: Preço de Venda obrigatório */
    salePrice: z.coerce.number({ 
        error: 'Preço de venda inválido' 
    }).min(0.01, 'O preço de venda deve ser maior que zero'),

    /** 💰 Gestão Financeira: Preço de Custo para cálculo de margem */
    costPrice: z.coerce.number({ 
        error: 'Preço de custo inválido' 
    }).min(0).default(0),

    /** 🧠 Metadados Polimórficos: Onde o JSONB de nicho (Veículo, Food, etc) reside */
    attributes: z.record(z.string(), z.any()).default({ }),
});

/**
 * Nota de Engenharia: Ao usar .extend(), garantimos que todas as validações 
 * da sua BaseProductSchema (UUIDs, Nomes, URLs) sejam herdadas e executadas 
 * antes das validações específicas de precificação.
 */