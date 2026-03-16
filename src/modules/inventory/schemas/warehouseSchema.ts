// ===== FILE: src/modules/inventory/schemas/warehouseSchema.ts =====

import { z } from 'zod';

/**
 * @description Helper para campos de texto opcionais e resilientes.
 */
const OptionalString = z.string().nullable().optional()
    .transform(val => (!val || val.trim() === '') ? undefined : val.trim());

/**
 * @description Schema do Objeto de Endereço (JSONB)
 */
const AddressInfoSchema = z.object({
    street: OptionalString,
    city: OptionalString,
    zipCode: OptionalString,
    state: z.string().nullable().optional()
        .transform(val => (!val || val.trim() === '') ? undefined : val.trim().toUpperCase())
        .refine(val => val === undefined || val.length === 2, { message: 'UF deve ter 2 letras' }),
});

/**
 * @description Schema Principal para Criação de Depósitos
 * FIX CLASSE OURO (TS 2769): O .default() agora contém explicitamente as chaves 
 * como undefined. Isso satisfaz o rigor do TypeScript e evita o erro de sobrecarga.
 */
export const CreateWarehouseSchema = z.object({
    name: z.string().trim().min(3, 'O nome do depósito deve ter no mínimo 3 caracteres'),
    
    isDefault: z.boolean().default(false),
    isActive: z.boolean().default(true),
    allowsNegativeStock: z.boolean().default(false),

    // 💡 A Mágica: Definimos o valor default com a estrutura que o TS espera
    addressInfo: AddressInfoSchema.default({
        street: undefined,
        city: undefined,
        zipCode: undefined,
        state: undefined
    }),
});

export const UpdateWarehouseSchema = CreateWarehouseSchema.extend({
    id: z.string().uuid('ID do depósito inválido').optional(),
});

/**
 * 💡 EXPORTAÇÃO VITAL (TS 2305): 
 * Este é o tipo que o WarehouseRegistry está tentando importar.
 */
export type WarehouseFormInput = z.infer<typeof CreateWarehouseSchema>;