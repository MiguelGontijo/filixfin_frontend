import { useState, useEffect } from 'react';

/**
 * ============================================================================
 * ⏱️ HOOK: useDelayedUnmount (O Cronômetro de Animações)
 * @description Design Pattern utilizado para permitir animações de saída (CSS) 
 * antes de destruir um componente da árvore do React.
 * * 🏆 PADRÃO CLASSE OURO:
 * Previne vazamentos de memória (Memory Leaks) garantindo que o `setTimeout` 
 * seja cancelado caso o componente seja fechado e aberto rapidamente.
 * ============================================================================
 */
export function useDelayedUnmount(isMounted: boolean, delayTime: number) {
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        
        if (isMounted && !shouldRender) {
            // Se mandou abrir, renderiza imediatamente
            setShouldRender(true);
        } else if (!isMounted && shouldRender) {
            // Se mandou fechar, inicia a contagem regressiva para a destruição
            timeoutId = setTimeout(() => {
                setShouldRender(false);
            }, delayTime);
        }
        
        // Cleanup function (A prova de balas contra bugs de duplo clique)
        return () => clearTimeout(timeoutId);
    }, [isMounted, delayTime, shouldRender]);

    return shouldRender;
}