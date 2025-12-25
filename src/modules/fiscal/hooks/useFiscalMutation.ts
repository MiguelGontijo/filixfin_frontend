import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/core/services/api';
import { IFiscalGroup, ICreateFiscalGroupDTO, IUpdateFiscalGroupDTO } from '../types';

/**
 * Hook de Mutação para Grupos Fiscais.
 * * Responsabilidade: Centralizar operações de escrita (C/U/D).
 */
export function useFiscalMutation() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const createFiscalGroup = async (data: ICreateFiscalGroupDTO): Promise<IFiscalGroup | null> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post<IFiscalGroup>('/fiscal-groups', data);
            return response.data;
        } catch (err: any) {
            console.error('❌ Erro ao criar grupo fiscal:', err);
            const msg = err.response?.data?.message || 'Falha ao criar grupo fiscal.';
            setError(msg);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateFiscalGroup = async (id: string, data: IUpdateFiscalGroupDTO): Promise<IFiscalGroup | null> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.put<IFiscalGroup>(`/fiscal-groups/${id}`, data);
            router.refresh();
            return response.data;
        } catch (err: any) {
            console.error('❌ Erro ao atualizar grupo fiscal:', err);
            const msg = err.response?.data?.message || 'Falha ao atualizar grupo fiscal.';
            setError(msg);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteFiscalGroup = async (id: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            await api.delete(`/fiscal-groups/${id}`);
            return true;
        } catch (err: any) {
            console.error('❌ Erro ao remover grupo fiscal:', err);
            // Erro comum: Grupo vinculado a produtos existentes
            const msg = err.response?.data?.message || 'Não é possível remover este grupo fiscal (provavelmente em uso).';
            setError(msg);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        createFiscalGroup,
        updateFiscalGroup,
        deleteFiscalGroup,
        isLoading,
        error
    };
}