import { z } from 'zod';

/**
 * @file clientSchema.ts
 * @description SCHEMA DE VALIDAÇÃO DE CLIENTES (Zod)
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Enterprise Grade):
 * 1. Blindagem de Tipos: Garante que os dados do formulário respeitem o DTO do Backend.
 * 2. Tratamento de Vazios: Uso do `.or(z.literal(''))` para permitir que campos 
 * opcionais sejam limpos pelo usuário sem disparar falsos erros de tipagem.
 * 3. Sanitização Silenciosa: (Opcional) Prepara o terreno para futuras máscaras de CPF/CNPJ.
 */
export const ClientFormSchema = z.object({
    
    // Identificador (Injetado automaticamente no modo Edição)
    id: z.string().optional(),
    
    // =========================================================================
    // 👤 DADOS PRINCIPAIS
    // =========================================================================
    name: z.string()
        .min(3, 'O nome do cliente deve ter no mínimo 3 caracteres.')
        .max(100, 'O nome excedeu o limite de 100 caracteres.'),
    
    document: z.string()
        .optional()
        .transform(val => val ? val.replace(/\D/g, '') : val), // Limpa pontos e traços (se houver)

    // =========================================================================
    // 📞 CONTATO
    // =========================================================================
    email: z.string()
        .email('Por favor, insira um endereço de e-mail válido.')
        .optional()
        .or(z.literal('')), // Permite que o campo inicie ou fique vazio sem quebrar a validação
        
    phone: z.string()
        .optional()
        .or(z.literal('')),

    // =========================================================================
    // 📝 INFORMAÇÕES AUXILIARES
    // =========================================================================
    userNotes: z.string()
        .max(2000, 'As observações não podem ultrapassar 2000 caracteres.')
        .optional()
        .or(z.literal('')),

    // =========================================================================
    // ⚙️ CONTROLE DE SISTEMA
    // =========================================================================
    isActive: z.boolean().default(true),

    // Campos de Auditoria (Apenas leitura)
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),

}).transform((data) => {
    // 🪄 TRANSFORMAÇÃO DE SAÍDA (O Roteador Final)
    // Limpamos strings vazias transformando-as em undefined, garantindo que o 
    // Backend receba um Payload enxuto (UpdateClientDto / CreateClientDto).
    return {
        ...data,
        document: data.document === '' ? undefined : data.document,
        email: data.email === '' ? undefined : data.email,
        phone: data.phone === '' ? undefined : data.phone,
        userNotes: data.userNotes === '' ? undefined : data.userNotes,
    };
});

/**
 * @type ClientFormInput
 * @description Tipagem inferida automaticamente a partir do Schema Zod.
 * Usada para tipar o CrudLayout e o React Hook Form.
 */
export type ClientFormInput = z.input<typeof ClientFormSchema>;