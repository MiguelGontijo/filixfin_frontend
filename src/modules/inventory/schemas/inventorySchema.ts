import { z } from 'zod';
import { TransactionType } from '../types/InventoryTypes';

/**
 * @description Schema para Registro de Movimentação de Estoque (Kardex).
 * CLASSE OURO: Foco em coerção de tipos e validação de Enums.
 */
export const RegisterMovementSchema = z.object({
    // IDs de Relacionamento (Obrigatórios)
    warehouseId: z.string().uuid('Selecione um depósito válido'),
    variantId: z.string().uuid('Selecione um produto/variante'),

    // Enum Nativo: Garante que a IA ou o Usuário usem apenas os tipos do Backend
    type: z.enum(TransactionType, {
        error: () => ({ message: 'Tipo de movimentação inválido' })
    }),

    // Coerção Numérica: O HTML manda string, o Zod converte para Number
    quantity: z.coerce.number()
        .min(0.0001, 'A quantidade deve ser maior que zero'),
    
    unitCost: z.coerce.number()
        .min(0, 'O custo não pode ser negativo')
        .optional()
        .default(0),

    // Documentação e Auditoria
    documentRef: z.string().trim().max(50, 'Referência muito longa').optional(),
    notes: z.string().trim().max(255, 'A observação deve ter no máximo 255 caracteres').optional(),
});

/**
 * @description Como o Kardex é imutável, o UpdateSchema é idêntico ao Create,
 * mas na prática, o Registry irá bloquear a edição.
 */
export const UpdateMovementSchema = RegisterMovementSchema.extend({
    id: z.string().uuid().optional(),
});

export type InventoryFormInput = z.infer<typeof RegisterMovementSchema>;