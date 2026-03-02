import { useState, useCallback, useEffect } from 'react';
import { api } from '@/core/services/api';
import { AIMessage } from '../types/state/AIState';

/**
 * @hook useAIHistory
 * @description Hook de "Query" (Leitura). Responsável exclusivamente por buscar 
 * o histórico de conversas da IA e manter esse estado na tela.
 * Padrão Arquitetural: Separation of Concerns (Isolado das Mutations de envio).
 */
export const useAIHistory = (routineKey: string | null) => {
    // 1. O "Cache" local da tela
    const [data, setData] = useState<AIMessage[] | null>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * @method fetchHistory
     * @description Faz a chamada HTTP e formata os dados para o padrão da UI.
     */
    const fetchHistory = useCallback(async () => {

        console.log('FRONT [1]: Disparando fetchHistory para a rotina:', routineKey);
        
        // Se a tela abriu mas a rotina ainda não foi injetada, não faz nada
        if (!routineKey) {
            setData(null);
            return
        };

        setIsLoading(true);
        setError(null);

        try {
            // Chama a rota GET que criamos no Backend V8
            const response = await api.get<any[]>(`/ai/history/${routineKey}`);

            console.log('FRONT [4]: Resposta da API recebida. Dados brutos:', response.data);

            // Transforma o JSON bruto do Backend na tipagem estrita do Frontend
            const formattedHistory: AIMessage[] = response.data.map((msg) => ({
                id: msg.id,
                role: msg.role as 'user' | 'assistant',
                content: msg.content,
                timestamp: new Date(msg.timestamp),
                // Se o backend devolver toolUsed na história, repassamos para a UI
                toolUsed: msg.toolUsed 
            }));

            setData(formattedHistory);

        } catch (err: any) {
            console.error(`❌ [useAIHistory] Erro ao carregar histórico da rotina ${routineKey}:`, err);
            // Erro suave: não estouramos a tela vermelha do React, apenas avisamos o estado
            setError('Não foi possível carregar as mensagens anteriores.');
            setData([]); // Garante que a tela não fique travada com lixo de memória
        } finally {
            setIsLoading(false);
        }
    }, [routineKey]);

    // 2. O Despertar Automático (Auto-Fetch)
    // Quando o componente que usar esse hook nascer na tela, ele busca os dados sozinho.
    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return {
        data,           // As mensagens prontas
        isLoading,      // Para a bolinha de "Carregando..."
        error,          // Para mostrar um aviso sutil se a rede cair
        refetch: fetchHistory // Exposto caso precisemos forçar um recarregamento manual
    };
};