// src/features/crm/hooks/useCRMIntelligence.ts

import { useState } from 'react';
import { api } from '@/core/services/api';
import { InteractionAnalysis } from '../types';

/**
 * @hook useCRMIntelligence
 * @description Gerencia a comunicação com os serviços de IA do CRM.
 * @update Agora suporta envio de clientId para análise contextual (RAG).
 */
export function useCRMIntelligence() {
    
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<InteractionAnalysis | null>(null);
    const [error, setError] = useState<string | null>(null);

    /**
     * @method analyzeText
     * @description Envia um texto bruto para análise de IA no Backend.
     * @param text O conteúdo da interação.
     * @param clientId (Opcional) ID do cliente selecionado para dar contexto à IA.
     */
    const analyzeText = async (text: string, clientId?: string) => {
        setIsAnalyzing(true);
        setError(null);
        setAnalysisResult(null); 

        try {
            // Monta o payload com ou sem contexto
            const payload = { 
                text, 
                clientId: clientId || undefined 
            };

            const response = await api.post('/crm/analyze', payload);
            
            setAnalysisResult(response.data as InteractionAnalysis);
            
        } catch (err: any) {
            console.error("Erro na análise de IA:", err);
            const msg = err.response?.data?.message || "Falha ao processar a inteligência da interação.";
            setError(msg);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return {
        analyzeText,
        isAnalyzing,
        analysisResult,
        error,
        clearAnalysis: () => setAnalysisResult(null) 
    };
}