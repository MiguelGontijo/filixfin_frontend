import { z } from 'zod';

/**
 * ============================================================================
 * 🛡️ SCHEMA: ClientFormSchema (Versão Sincronizada V4)
 * @description Define as regras de integridade e normalização para a entidade Cliente.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Enterprise Grade):
 * 1. Data Scrubbing: Normaliza documentos removendo caracteres não numéricos.
 * 2. Payload Optimization: O transform final garante que campos opcionais vazios 
 * sejam enviados como 'undefined', respeitando o DTO de PATCH/PUT do Backend.
 * 3. Null-Resilience: Preparado para lidar com o fluxo da DataEngine, permitindo 
 * que campos opcionais transitem entre a UI e o banco com segurança.
 * ============================================================================
 */
export const ClientFormSchema = z.object({
    
    /** 🔑 Identificador único (Opcional na criação, obrigatório na edição) */
    id: z.string().optional(),
    
    // =========================================================================
    // 👤 IDENTIDADE E DOCUMENTAÇÃO
    // =========================================================================
    name: z.string()
        .min(3, 'O nome do cliente deve ter no mínimo 3 caracteres.')
        .max(100, 'O nome excedeu o limite de 100 caracteres.'),
    
    document: z.string()
        .optional()
        .transform(val => val ? val.replace(/\D/g, '') : val), 

    // =========================================================================
    // 📞 CANAIS DE CONTATO
    // =========================================================================
    email: z.string()
        .email('Por favor, insira um endereço de e-mail válido.')
        .optional()
        .or(z.literal('')), 
        
    phone: z.string()
        .optional()
        .or(z.literal('')),

    // =========================================================================
    // 📝 INTELIGÊNCIA E NOTAS
    // =========================================================================
    userNotes: z.string()
        .max(2000, 'As observações não podem ultrapassar 2000 caracteres.')
        .optional()
        .or(z.literal('')),

    // =========================================================================
    // ⚙️ CONTROLE DE ESTADO (Vínculo com SmartSwitch)
    // =========================================================================
    isActive: z.boolean().default(true),

    /** 🛡️ Campos de Auditoria (Gerenciados pelo Sistema) */
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    aiSummary: z.string().optional().or(z.literal('')),

}).transform((data) => {
    /**
     * 🪄 NORMALIZAÇÃO DE SAÍDA (Contract Guard)
     * @description Limpamos strings vazias e as convertemos em 'undefined'.
     * Isso evita que o Backend tente validar ou persistir strings em branco 
     * em campos que deveriam ser nulos/ausentes no DTO.
     */
    return {
        ...data,
        document: data.document === '' ? undefined : data.document,
        email: data.email === '' ? undefined : data.email,
        phone: data.phone === '' ? undefined : data.phone,
        userNotes: data.userNotes === '' ? undefined : data.userNotes,
        aiSummary: data.aiSummary === '' ? undefined : data.aiSummary,
    };
});

/** * @type ClientFormInput 
 * @description Contrato de entrada para o React Hook Form.
 */
export type ClientFormInput = z.input<typeof ClientFormSchema>;

/** * @type ClientFormOutput 
 * @description Contrato de saída pronto para consumo da API.
 */
export type ClientFormOutput = z.output<typeof ClientFormSchema>;