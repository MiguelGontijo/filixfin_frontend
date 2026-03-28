import { useState, useEffect, useCallback } from 'react';

// --- Mundo 1: Core (Serviço de API Padronizado) ---
// Supomos que 'api' seja o Axios/Fetch padrão configurado no Core do projeto
import { api } from '@/core/services/api'; 

// --- Mundo 2: Domínio (CRM) ---
import { ICRMSummary } from '../../domain/types/crm-summary.types';

/**
 * ============================================================================
 * 🧠 HOOK: useCRMSummary
 * @description Provê os KPIs analíticos de alto nível (BI) para o CRM Dashboard.
 * Consome a rota /crm/deals/summary e gerencia o ciclo de vida dos dados.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Netflix/Shopify Level):
 * 1. Strategic Isolation: Isola a complexidade da chamada de rede e tratamento
 * de erro da View (Dumb Components), entregando dados prontos para renderização.
 * 2. State Management native: Utiliza hooks nativos do React (useState/useEffect)
 * respeitando o padrão existente do projeto, sem introduzir bibliotecas externas.
 * 3. Reactive Refresh: Expõe a função 'refreshSummary', permitindo que o 
 * usuário atualize os KPIs sob demanda (ex: Botão "Atualizar" no Header).
 * ============================================================================
 */
export function useCRMSummary() {
    // ========================================================================
    // 🕹️ ESTADOS LOCAIS (Gerenciamento de Ciclo de Vida)
    // ========================================================================
    const [summary, setSummary] = useState<ICRMSummary | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * @method fetchSummary
     * @description Executa a chamada de API assíncrona para buscar os KPIs.
     * Utiliza o useCallback para estabilizar a referência da função.
     */
    const fetchSummary = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // 📡 Chamada: Rota aberta no Backend (Passo 1)
            // O tenantId é resolvido no Backend via authMiddleware (req.user!)
            const response = await api.get<ICRMSummary>('/crm/deals/summary');
            
            // 💰 Validação e Definição: Contrato de Domínio (Passo 2)
            if (response.data) {
                setSummary(response.data);
            } else {
                setSummary(null); // Caso de funil vazio
            }
        } catch (err: any) {
            // 🛡️ Tratamento de Erro Padrão (Filix V4 Style)
            const errorMessage = err?.response?.data?.message || 'Falha ao processar resumo analítico do CRM.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ========================================================================
    // ⚙️ EFEITOS COLATERAIS (AUTO-START)
    // ========================================================================
    useEffect(() => {
        // Busca os dados automaticamente ao montar o componente
        fetchSummary();
    }, [fetchSummary]);

    // ========================================================================
    // 🎁 RETORNO: O Manual de Uso para a View
    // ========================================================================
    return {
        summary,
        isLoading,
        error,
        refreshSummary: fetchSummary // Função de refresh para UI reativa
    };
}