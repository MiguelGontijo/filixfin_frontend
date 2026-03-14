/**
 * @file AIChatRequest.dto.ts
 * @description Contrato de Envio (Request) para o Motor V8.
 * Define a estrutura exata do que o Frontend envia para o endpoint POST /ai/chat.
 */

import { AppModule, FeatureKey } from '../enums/AIEnums';

/**
 * @interface AIContextMetadata
 * @description Metadados de Contexto Fino (A "Sniper").
 * Permite que a IA saiba exatamente com quem ou com o que o utilizador está a interagir.
 */
export interface AIContextMetadata {
    /** O QUE É: Classificador da entidade (ex: 'CLIENT' ou 'SETUP'). */
    module: AppModule;

    /** QUAL É: UUID do registo ou identificador do fluxo. */
    refId: string;

    /** QUEM É: Nome legível (ex: 'Miguel Prado'). */
    refName: string;

    /** ONDE ESTÁ: Contexto visual/navegacional (ex: 'KANBAN_BOARD'). */
    featureLocation: string;

    /** Sub-contexto opcional para detalhes visuais extras. */
    subContext?: string;
}

/**
 * @interface AIChatRequestDto
 * @description Payload completo a ser processado pelo AIOrchestrator.
 */
export interface AIChatRequestDto {
    /** A mensagem de texto do utilizador ou comando interno de sistema. */
    message: string;

    /** A chave de rotina macro (A "Pistola" - ex: AI_SALES_AGENT). */
    routineKey: FeatureKey;

    /** Identificação do Tenant para isolamento de dados e permissões no Backend. */
    tenantId: string;

    /** Identificação do Plano para controlo de quotas e rate-limits. */
    planId: string;

    /** (Opcional) Contexto microscópico focado injetado pela tela atual. */
    metadata?: AIContextMetadata;

    attachmentsUrls?: string[];

    /** (Opcional) Sobrescrita de comportamentos dinâmicos do Motor V8. */
    overrides?: {
        /** * Define se a IA deve agir sozinha (AUTONOMOUS) 
         * ou pedir permissão para a interface (CONSULTATIVE). 
         */
        mode?: 'AUTONOMOUS' | 'CONSULTATIVE';
    };
}