import { z } from 'zod';
import { BaseProductSchema } from './baseProductSchema';
import { ProductType, ProductDomainModel } from '../types/enums';

/**
 * ============================================================================
 * 🛠️ SCHEMA: ServiceProductSchema
 * @description Especialização isolada para prestação de serviços e assinaturas.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Zero Side-Effects):
 * 1. Encapsulated Attributes: Define o contrato ServiceAttributes sem vazar tipos.
 * 2. Strict Defaulting: Resolve o erro ts(2769) garantindo que o objeto 
 * padrão respeite a forma do schema.
 * ============================================================================
 */
export const ServiceProductSchema = BaseProductSchema.extend({
    /** 🔑 Chave Discriminadora */
    type: z.literal(ProductType.SERVICE),

    /** 💠 Modelo de Domínio */
    domainModel: z.literal(ProductDomainModel.SERVICE).default(ProductDomainModel.SERVICE),

    /** ⏱️ Duração em minutos */
    durationMinutes: z.coerce.number({
        error: 'A duração deve ser informada em minutos'
    }).min(1, 'Duração mínima de 1 minuto'),

    /** 🛠️ Código ISS */
    serviceCode: z.string().trim().min(1, 'O código de serviço fiscal é obrigatório'),

    /** 💰 Preço de Venda */
    salePrice: z.coerce.number({ 
        error: 'Preço de venda inválido' 
    }).min(0, 'O valor do serviço não pode ser negativo'),

    /** 🏷️ Referência */
    sku: z.string().trim().min(1, 'O código de referência (SKU) é obrigatório'),

    /** 🧠 Metadados de Serviço (Corrigido para evitar erro de atribuição) */
    attributes: z.object({
        duration_minutes: z.number().optional(),
        is_remote: z.boolean().default(true),
        recurrence: z.enum(['NONE', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']).default('NONE'),
        requirements: z.array(z.string()).optional(),
        requires_scheduling: z.boolean().default(false),
        location_type: z.enum(['CLIENT_SITE', 'COMPANY_SITE', 'PUBLIC_SPACE']).optional(),
    }).default({
        is_remote: true,
        recurrence: 'NONE',
        requires_scheduling: false
    }), // ✅ FIX: O default agora contém as propriedades obrigatórias definidas acima
});