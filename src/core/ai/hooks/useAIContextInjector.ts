// ===== FILE: src/core/ai/hooks/useAIContextInjector.ts =====

'use client';

import { useEffect } from 'react';
import { useFilixAI } from '../context/FilixAIContext';
import { AIContextMetadata } from '../types/dtos/AIChatRequest.dto';
import { AIContextScope } from '../types/enums/AIEnums';

/**
 * @hook useAIContextInjector
 * @description Hook utilitário para definir o escopo semântico (e dados finos) da IA ao montar um componente.
 * * @example
 * // Uso Básico (Apenas Módulo - "Pistola")
 * useAIContextInjector('SUPPLY_CHAIN');
 * * @example
 * // Uso Avançado (Com Metadados - "Sniper")
 * useAIContextInjector('CRM_SALES', {
 * refType: 'CLIENT',
 * refId: client.id,
 * refName: client.name,
 * featureLocation: 'CLIENT_DASHBOARD'
 * });
 */
export const useAIContextInjector = (
    scope: AIContextScope, 
    metadata?: AIContextMetadata
) => {
    // Consome a nova função setContext do Provider (Fase 2)
    const { setContext } = useFilixAI();

    useEffect(() => {
        // Injeta o contexto no Cérebro Global
        setContext(scope, metadata);

        // Opcional: Log em desenvolvimento para validar a troca
        // if (process.env.NODE_ENV === 'development') {
        //     console.debug(`💉 [AI Injector] Scope: ${scope}`, metadata ? `| Ref: ${metadata.refId}` : '');
        // }

    }, [
        scope, 
        setContext,
        // DEPENDÊNCIAS CRÍTICAS:
        // Desconstruímos o metadata para evitar loops infinitos caso o objeto seja recriado,
        // mas o conteúdo seja o mesmo. O contexto só atualiza se o ID ou o Local mudarem.
        metadata?.refId,
        metadata?.featureLocation,
        metadata?.subContext
    ]);
};