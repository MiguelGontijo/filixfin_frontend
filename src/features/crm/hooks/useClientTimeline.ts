// src/features/crm/hooks/useClientTimeline.ts

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/core/services/api';
import { CRMInteraction } from '../types';

/**
 * @hook useClientTimeline
 * @description Gerencia a busca do histórico de interações de um cliente específico.
 * @param clientId ID do cliente selecionado (ou null se nenhum).
 */
export function useClientTimeline(clientId: string | null) {
    
    const [interactions, setInteractions] = useState<CRMInteraction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTimeline = useCallback(async () => {
        if (!clientId) {
            setInteractions([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // GET na rota que criamos no Backend: /crm/client/:clientId/timeline
            const response = await api.get(`/crm/client/${clientId}/timeline`);
            
            // Tipagem forçada garantida pelo contrato do Backend
            setInteractions(response.data as CRMInteraction[]);
            
        } catch (err: any) {
            console.error("Erro ao buscar timeline:", err);
            const msg = err.response?.data?.message || "Falha ao carregar histórico.";
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    }, [clientId]);

    // Busca automática sempre que o ID do cliente mudar
    useEffect(() => {
        fetchTimeline();
    }, [fetchTimeline]);

    return {
        interactions,
        isLoading,
        error,
        refreshTimeline: fetchTimeline // Expomos para permitir recarga manual (ex: após enviar msg)
    };
}