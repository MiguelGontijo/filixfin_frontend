import { z } from 'zod';
import { DealStatus, DealSource, DealItemType } from '../types';

/**
 * ============================================================================
 * 🛡️ SCHEMA: DealFormSchema (Versão Auditada V4)
 * @description O motor de validação e precificação automática de Oportunidades.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Financial Integrity):
 * 1. Precision Math: Recalcula o 'value' global no transform, atuando como a 
 * "Fonte da Verdade" para evitar divergências entre UI e Banco.
 * 2. ID Preservation: Distingue UUIDs reais de IDs temporários da UI (temp-),
 * garantindo que o Backend execute UPDATES precisos em sub-itens.
 * 3. Type Coercion: Força a conversão de strings de inputs em números reais,
 * blindando o cálculo contra falhas de tipagem do JavaScript.
 * ============================================================================
 */

// ============================================================================
// 📦 SUB-SCHEMA: DealItemSchema (Produtos / Serviços no Deal)
// ============================================================================
const DealItemSchema = z.object({
    /** 🔑 UUID da linha (Preservado para Delta Sync) */
    id: z.string().optional(),
    
    /** 🔗 Vínculo com o Catálogo (Opcional por enquanto) */
    productId: z.string().optional().nullable(),
    
    type: z.enum(DealItemType).default(DealItemType.SERVICE),
    description: z.string().min(2, 'A descrição do item é obrigatória.'),
    
    // 🛡️ AMORTECIMENTO DE VALORES: Força conversão e evita NaN
    quantity: z.coerce.number().min(0.01, 'Quantidade inválida.').catch(1),
    unitPrice: z.coerce.number().min(0, 'Preço inválido.').catch(0),
});

// ============================================================================
// 💼 SCHEMA MESTRE: DealFormSchema
// ============================================================================
export const DealFormSchema = z.object({
    id: z.string().optional(),
    
    // --- Identidade da Negociação ---
    title: z.string().min(3, 'O título é obrigatório para identificação.'),
    clientId: z.string().min(1, 'Vincule um cliente para prosseguir.'),
    
    // --- Roteamento Comercial (Funil) ---
    pipelineId: z.string().optional(),
    currentStageId: z.string().optional(),
    
    // --- Status e Qualificação ---
    status: z.enum(DealStatus).default(DealStatus.NEW),
    source: z.enum(DealSource).default(DealSource.MANUAL),
    lossReason: z.string().optional().nullable(),
    
    // --- Projeções Financeiras ---
    probability: z.coerce.number().min(0).max(100).default(50).catch(50),
    expectedCloseDate: z.string().optional().nullable(),
    
    // Valor base (Usado se não houver itens detalhados)
    value: z.coerce.number().min(0).default(0).catch(0),
    
    // Tabela de Itens (Composição Detalhada)
    items: z.array(DealItemSchema).default([]),

    // --- Auditoria ---
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),

}).transform((data) => {
    /**
     * 🪄 A MÁGICA DA TRANSFORMAÇÃO (Payload Builder)
     * @description Realiza a auditoria final de preços antes do envio.
     */
    const hasItems = data.items && data.items.length > 0;
    
    /** 🧮 Cálculo Real: A soma dos itens sempre sobrepõe o valor manual 
     * se a tabela de precificação estiver preenchida. 
     */
    const computedValue = hasItems 
        ? data.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0)
        : data.value;

    return {
        ...data,
        value: computedValue, 
        
        items: data.items.map(item => ({
            ...item,
            // Injeta o total calculado da linha para persistência redundante
            total: item.quantity * item.unitPrice, 
            
            /** * 🧹 CLEANUP DE IDENTIDADE: 
             * Remove IDs temporários (gerados na UI) para que o Backend saiba 
             * que deve criar um novo registro. Preserva UUIDs reais para UPDATE.
             */
            id: (!item.id || item.id.startsWith('temp-')) ? undefined : item.id,
        }))
    };
});

/** * @type DealFormInput 
 * @description Tipagem de entrada (Estado do Formulário).
 */
export type DealFormInput = z.input<typeof DealFormSchema>;

/** * @type DealFormOutput 
 * @description Tipagem de saída (Payload para API).
 */
export type DealFormOutput = z.output<typeof DealFormSchema>;