'use client';

import { useEffect } from 'react';
import { useFilixAI } from '../context/FilixAIContext';
import { AIContextScope } from '../types/AITypes';

/**
 * @hook useAIContextInjector
 * @description Hook utilitário para definir o escopo semântico da IA ao montar um componente.
 * * @example
 * // Em ProductContainer.tsx:
 * useAIContextInjector('SUPPLY_CHAIN');
 * * // A IA agora sabe que deve carregar tools de Estoque e Produtos.
 */
export const useAIContextInjector = (scope: AIContextScope) => {
    const { setContextScope } = useFilixAI();

    useEffect(() => {
        // Ao montar o componente, define o novo contexto
        // console.debug(`[Filix AI] Mudança de Contexto: ${scope}`);
        setContextScope(scope);

        // Opcional: Poderíamos resetar para 'GLOBAL' no unmount, 
        // mas em SPAs geralmente o próximo componente já sobrescreve o contexto,
        // então deixamos o último contexto ativo persistir até a próxima navegação explicita.
    }, [scope, setContextScope]);
};