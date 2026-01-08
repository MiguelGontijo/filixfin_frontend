import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../core/services/api';
import { IPipeline, ICreatePipelineDTO, IUpdatePipelineDTO } from '../pipeline.types';

export function usePipelines() {
    const [pipelines, setPipelines] = useState<IPipeline[]>([]);
    const [isLoadingPipelines, setIsLoadingPipelines] = useState(false);
    const [errorPipelines, setErrorPipelines] = useState<unknown>(null);

    // GET /crm/pipelines
    const fetchPipelines = useCallback(async () => {
        setIsLoadingPipelines(true);
        setErrorPipelines(null);
        try {
            const response = await api.get<IPipeline[]>('/crm/pipelines');
            setPipelines(response.data);
        } catch (err) {
            setErrorPipelines(err);
            console.error("Erro ao buscar pipelines:", err);
        } finally {
            setIsLoadingPipelines(false);
        }
    }, []);

    // Carrega inicial
    useEffect(() => {
        fetchPipelines();
    }, [fetchPipelines]);

    // POST /crm/pipelines
    const createPipeline = async (data: ICreatePipelineDTO) => {
        try {
            const response = await api.post('/crm/pipelines', data);
            // Atualiza a lista localmente após sucesso
            await fetchPipelines(); 
            return response.data;
        } catch (error) {
            console.error("Erro ao criar pipeline:", error);
            throw error;
        }
    };

    // PUT /crm/pipelines/:id
    const updatePipeline = async (data: IUpdatePipelineDTO) => {
        try {
            const response = await api.put(`/crm/pipelines/${data.id}`, data);
            // Atualiza a lista localmente após sucesso
            await fetchPipelines();
            return response.data;
        } catch (error) {
            console.error("Erro ao atualizar pipeline:", error);
            throw error;
        }
    };

    return {
        pipelines,
        isLoadingPipelines,
        errorPipelines,
        createPipeline,
        updatePipeline,
        refreshPipelines: fetchPipelines
    };
}

export function usePipelineDetails(pipelineId: string | undefined) {
    const [pipeline, setPipeline] = useState<IPipeline | null>(null);
    const [isLoadingPipeline, setIsLoadingPipeline] = useState(false);
    const [isError, setIsError] = useState(false);

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
                console.error("Erro ao buscar detalhes do pipeline:", error);
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