import { z } from 'zod';
import { DealStatus, DealSource, DealItemType } from '../types';

/**
 * @file dealSchema.ts
 * @description SCHEMA DE VALIDAÇÃO DE OPORTUNIDADES (Deals).
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Enterprise Grade):
 * 1. Motor de Precificação Automática: Na etapa de `.transform()`, o schema 
 * recalcula o valor total do Deal baseado nos itens, impedindo divergências financeiras.
 * 2. Amortecimento Estrito (Resiliência): Uso de `z.coerce` e `.catch()` para garantir que 
 * números (probabilidade, valores) não quebrem o formulário se a API enviar strings ou nulos.
 * 3. Sanitização de IDs Temporários: Garante que os itens recém-criados na interface 
 * (com IDs temporários) sejam limpos antes de bater no banco de dados.
 */

// ============================================================================
// 📦 SCHEMA FILHO: ITENS DA OPORTUNIDADE (Produtos / Serviços)
// ============================================================================
const DealItemSchema = z.object({
    // Obrigatório na UI para manipulação de arrays, mas limpo no transform
    id: z.string().optional(),
    productId: z.string().optional().nullable(),
    
    // O '.nativeEnum' acopla perfeitamente o Zod aos Enums do TypeScript
    type: z.nativeEnum(DealItemType).default(DealItemType.SERVICE),
    description: z.string().min(2, 'A descrição do item é obrigatória.'),
    
    // 🛡️ AMORTECIMENTO DE UX: 
    // `coerce.number` força strings vindas de inputs HTML a virarem decimais.
    // `.catch(1)` impede que um erro de digitação zere a quantidade e quebre o cálculo.
    quantity: z.coerce.number().min(0.01, 'A quantidade deve ser maior que zero.').catch(1),
    unitPrice: z.coerce.number().min(0, 'O valor não pode ser negativo.').catch(0),
});

// ============================================================================
// 💼 SCHEMA PAI: A OPORTUNIDADE (Deal)
// ============================================================================
export const DealFormSchema = z.object({
    id: z.string().optional(),
    
    // --- Dados Básicos ---
    title: z.string().min(3, 'O título da oportunidade é obrigatório (Ex: Contrato Anual).'),
    clientId: z.string().min(1, 'É necessário vincular um cliente a esta oportunidade.'),
    
    // --- Posicionamento no Funil ---
    pipelineId: z.string().optional(),
    currentStageId: z.string().optional(),
    
    // --- Status e Origem ---
    status: z.nativeEnum(DealStatus).default(DealStatus.NEW),
    source: z.nativeEnum(DealSource).default(DealSource.MANUAL),
    lossReason: z.string().optional().nullable(),
    
    // --- Valores e Previsões ---
    probability: z.coerce.number().min(0).max(100).default(50).catch(50),
    expectedCloseDate: z.string().optional().nullable(),
    
    // Campo isolado de valor (usado livremente APENAS se a oportunidade NÃO tiver itens)
    value: z.coerce.number().min(0).default(0).catch(0),
    
    // Array de itens (Opcional, pois pode ser uma venda simples baseada apenas em "value")
    items: z.array(DealItemSchema).default([]),

    // --- Auditoria Automática ---
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),

}).transform((data) => {
    // 🪄 A MÁGICA DA TRANSFORMAÇÃO (Sanitização e Precificação)
    // Esta etapa atua como um Middleware entre o Frontend e a API.

    const hasItems = data.items && data.items.length > 0;
    
    // 🧮 Motor Matemático: Se houver itens detalhados na tabela, o valor real da 
    // oportunidade passa a ser estritamente a soma de (Qtd * Valor Unitário). 
    // Nós ignoramos o que o usuário digitou no campo manual de "value" para evitar fraudes.
    const computedValue = hasItems 
        ? data.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0)
        : data.value;

    return {
        ...data,
        // Sobrescreve o valor do payload com o cálculo auditado
        value: computedValue, 
        
        items: data.items.map(item => ({
            ...item,
            // Garante que o subtotal da linha também vá calculado corretamente para o BD
            total: item.quantity * item.unitPrice, 
            
            // 🧹 GHOST-BUSTER: Limpa IDs temporários do React (ex: 'temp-169823123')
            // para que o TypeORM do Backend gere UUIDs definitivos.
            id: item.id?.startsWith('temp-') ? undefined : item.id,
        }))
    };
});

/**
 * @type DealFormInput & DealFormOutput
 * Separação das tipagens arquiteturais.
 * Input: O formato que o React Hook Form consome (permite temp-ids).
 * Output: O payload final sanitizado e processado para o Axios/Backend.
 */
export type DealFormInput = z.input<typeof DealFormSchema>;
export type DealFormOutput = z.output<typeof DealFormSchema>;