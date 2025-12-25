import { useState, useCallback, useEffect } from 'react';
import { api } from '@/core/services/api';
import { IFiscalGroup } from '../types';

/**
 * Hook de Leitura para Grupos Fiscais.
 * * Responsabilidade:
 * - Buscar a lista de grupos tributários disponíveis.
 * - Gerenciar estado de loading e erro para a UI.
 */
export function useFiscal() {
    const [fiscalGroups, setFiscalGroups] = useState<IFiscalGroup[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFiscalGroups = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get<IFiscalGroup[]>('/fiscal-groups');
            setFiscalGroups(response.data);
        } catch (err: any) {
            console.error('❌ Erro ao buscar grupos fiscais:', err);
            const msg = err.response?.data?.message || 'Erro ao carregar grupos fiscais.';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Carregamento inicial automático
    useEffect(() => {
        fetchFiscalGroups();
    }, [fetchFiscalGroups]);

    return {
        fiscalGroups,
        isLoading,
        error,
        refreshFiscalGroups: fetchFiscalGroups
    };
}