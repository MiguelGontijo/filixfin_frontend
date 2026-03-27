import { useState, useEffect, useCallback } from 'react';
import { api } from '@/core/services/api';

// --- Contratos de Domínio (Mundo 2) ---
import { IPipeline } from '../../domain/types/pipeline.types';

/**
 * ============================================================================
 * 📊 HOOK: usePipelines (CQRS - Query / Listagem)
 * @description Responsável pela recuperação e sincronização da lista global 
 * de Funis de Venda. Atua como a fonte de dados para seletores e gerenciadores.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO:
 * - Memoização proativa: fetchPipelines encapsulado em useCallback para evitar 
 * ciclos infinitos em componentes que dependem da referência da função.
 * - Single Responsibility: Focado 100% em leitura, desacoplado de mutações.
 * ============================================================================
 */
export function usePipelines() {
    const [pipelines, setPipelines] = useState<IPipeline[]>([]);
    const [isLoadingPipelines, setIsLoadingPipelines] = useState(false);
    const [errorPipelines, setErrorPipelines] = useState<unknown>(null);

    /**
     * @method fetchPipelines
     * @description Sincroniza a lista de funis com o servidor.
     */
    const fetchPipelines = useCallback(async () => {
        setIsLoadingPipelines(true);
        setErrorPipelines(null);
        try {
            const response = await api.get<IPipeline[]>('/crm/pipelines');
            setPipelines(response.data);
        } catch (err) {
            setErrorPipelines(err);
            console.error("❌ [usePipelines] Erro ao buscar lista:", err);
        } finally {
            setIsLoadingPipelines(false);
        }
    }, []);

    // Hidratação inicial automática
    useEffect(() => {
        fetchPipelines();
    }, [fetchPipelines]);

    return {
        pipelines,
        isLoadingPipelines,
        errorPipelines,
        refreshPipelines: fetchPipelines
    };
}

/**
 * ============================================================================
 * 🔍 HOOK: usePipelineDetails (CQRS - Query / Detalhe)
 * @description Recupera os dados profundos de um funil específico, incluindo
 * sua árvore completa de estágios (stages).
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO:
 * - Lazy Loading: Só aciona a API se um pipelineId válido for fornecido.
 * - Derivação de Estado: Expõe 'stages' diretamente para facilitar o consumo 
 * em componentes de Kanban e Configuração.
 * ============================================================================
 */
export function usePipelineDetails(pipelineId: string | undefined) {
    const [pipeline, setPipeline] = useState<IPipeline | null>(null);
    const [isLoadingPipeline, setIsLoadingPipeline] = useState(false);
    const [isError, setIsError] = useState(false);

    /**
     * @method fetchDetails
     * @description Busca a estrutura completa do funil solicitado.
     */
    useEffect(() => {
        if (!pipelineId) {
            setPipeline(null);
            return;
        }

        const fetchDetails = async () => {
            setIsLoadingPipeline(true);
            setIsError(false);
            try {
                const response = await api.get<IPipeline>(`/crm/pipelines/${pipelineId}`);
                setPipeline(response.data);
            } catch (error) {
                console.error(`❌ [usePipelineDetails] Erro ao buscar ID ${pipelineId}:`, error);
                setIsError(true);
            } finally {
                setIsLoadingPipeline(false);
            }
        };

        fetchDetails();
    }, [pipelineId]);

    return {
        pipeline,
        stages: pipeline?.stages || [],
        isLoadingPipeline,
        isError
    };
}