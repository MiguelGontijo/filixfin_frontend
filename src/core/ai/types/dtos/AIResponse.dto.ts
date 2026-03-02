/**
 * @file AIResponse.dto.ts
 * @description O envelope principal da resposta da IA.
 * Define como o Backend entrega inteligência para o Frontend.
 * [ESPELHO PERFEITO DA CLASSE AIResponseDto DO BACKEND]
 */

import { AIActionProposal } from './AIActionProposal.dto';

export interface AIResponseDto {
    /**
     * A resposta textual da IA (chat convencional).
     * Pode conter markdown.
     */
    text: string;

    /**
     * ID de rastreamento da interação (para logs e auditoria).
     */
    interactionId: string;

    /**
     * (Debug) Qual ferramenta foi utilizada para gerar essa resposta.
     * Útil para o desenvolvedor entender o fluxo no frontend.
     */
    toolUsed?: string;

    /**
     * (Inovação) A Proposta de Ação.
     * Se for omitido ou null, é apenas uma conversa normal.
     * Se existir, o Frontend deve renderizar a UI correspondente.
     */
    proposal?: AIActionProposal | null;

    /**
     * Metadados de consumo de tokens (opcional, para controle interno).
     */
    usage?: {
        inputTokens: number;
        outputTokens: number;
    };
}