import { z } from 'zod';

/**
 * @description Helpers Nível Ouro para React Hook Form (Resiliência a Null).
 * O Banco de Dados manda `null`, o HTML manda `""`.
 * Estes helpers absorvem qualquer um dos dois e convertem para `undefined` limpo.
 */
const OptionalUfField = z.string().nullable().optional()
    .transform(val => (!val || val.trim() === '') ? undefined : val.trim().toUpperCase())
    .refine(val => val === undefined || val.length === 2, { message: 'A UF deve ter exatamente 2 letras (Ex: SP)' });

const OptionalCfopField = z.string().nullable().optional()
    .transform(val => (!val || val.trim() === '') ? undefined : val.trim())
    .refine(val => val === undefined || val.length === 4, { message: 'O CFOP deve ter exatamente 4 dígitos' });

const OptionalStringField = z.string().nullable().optional()
    .transform(val => (!val || val.trim() === '') ? undefined : val.trim());

/**
 * =========================================================================
 * 1. SCHEMA DA MATRIZ TRIBUTÁRIA (Filhos)
 * =========================================================================
 */
export const TaxRuleSchema = z.object({
    id: z.uuid('ID da regra inválido').optional(), // ID serve para o Delta Sync (Update)
    
    // Cenários de Estado
    ufOrigem: OptionalUfField,
    ufDestino: OptionalUfField,
    
    // Códigos NF-e
    cfopState: OptionalCfopField,
    cfopInterstate: OptionalCfopField,
    cstCsosn: OptionalStringField,
    
    // Alíquotas (O z.coerce força a conversão de String do HTML para Number do Typescript)
    icmsRate: z.coerce.number({ error: 'Digite um número válido' })
        .min(0, 'Alíquota não pode ser negativa').max(100, 'Máximo de 100%').default(0),
    pisRate: z.coerce.number({ error: 'Digite um número válido' })
        .min(0, 'Alíquota não pode ser negativa').max(100, 'Máximo de 100%').default(0),
    cofinsRate: z.coerce.number({ error: 'Digite um número válido' })
        .min(0, 'Alíquota não pode ser negativa').max(100, 'Máximo de 100%').default(0),
});

/**
 * =========================================================================
 * 2. SCHEMA DO PERFIL TRIBUTÁRIO (Pai) - MODO CRIAÇÃO
 * =========================================================================
 */
export const CreateFiscalGroupSchema = z.object({
    name: z.string().trim().min(3, 'O nome do grupo fiscal deve ter no mínimo 3 caracteres'),
    // Usamos o Helper resiliente aqui também
    description: OptionalStringField,
    isActive: z.boolean().default(true),
    
    // A trava arquitetural: Não existe Perfil sem Matriz.
    rules: z.array(TaxRuleSchema)
        .min(1, 'É obrigatório definir pelo menos uma regra fiscal (mesmo que seja a Padrão com zeros).')
});

/**
 * =========================================================================
 * 3. SCHEMA DO PERFIL TRIBUTÁRIO (Pai) - MODO ATUALIZAÇÃO
 * =========================================================================
 */
export const UpdateFiscalGroupSchema = CreateFiscalGroupSchema.extend({
    id: z.string().uuid('ID do grupo fiscal inválido').optional(),
});

// Extração automática dos tipos (Para uso direto nos formulários)
export type FiscalFormInput = z.infer<typeof CreateFiscalGroupSchema>;