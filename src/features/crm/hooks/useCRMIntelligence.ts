// src/features/crm/hooks/useCRMIntelligence.ts

import { useState } from 'react';
import { api } from '@/core/services/api';
import { InteractionAnalysis } from '../types';

/**
 * @hook useCRMIntelligence
 * @description Gerencia a comunicação com os serviços de IA do CRM.
 * Porquê: Abstrai a complexidade da chamada de API, tipagem do retorno e estados de loading/erro.
 */
export function useCRMIntelligence() {
    
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<InteractionAnalysis | null>(null);
    const [error, setError] = useState<string | null>(null);

    /**
     * @method analyzeText
     * @description Envia um texto bruto para análise de IA no Backend.
     * @param text O conteúdo da interação (nota, transcrição, email).
     */
    const analyzeText = async (text: string) => {
        setIsAnalyzing(true);
        setError(null);
        setAnalysisResult(null); // Limpa resultado anterior

        try {
            // POST para o endpoint que criamos na Fase 3 do Backend
            const response = await api.post('/crm/analyze', { text });
            
            // O Backend (Zod) garante que o retorno bata com a interface InteractionAnalysis
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
        // Reset para limpar a tela se necessário
        clearAnalysis: () => setAnalysisResult(null) 
    };
}