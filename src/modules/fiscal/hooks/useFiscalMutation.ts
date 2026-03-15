import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/core/services/api';
import { ITaxGroup, ICreateTaxGroupDTO, IUpdateTaxGroupDTO } from '../types';

/**
 * @hook useFiscalMutation
 * @description Hook de Escrita para o Módulo Fiscal (Create, Update, Delete).
 * * PADRÃO CLASSE OURO:
 * 1. Usa `useCallback` para evitar re-renders desnecessários no React.
 * 2. Faz o parse inteligente de erros (Pega os detalhes do class-validator do Backend).
 * 3. Gerencia o estado de loading para bloquear botões de salvar (Prevenção de Double-Click).
 */
export function useFiscalMutation() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    /**
     * @description Helper interno para extrair mensagens de erro da API.
     */
    const extractErrorMessage = (err: any, defaultMsg: string): string => {
        const backendMessage = err.response?.data?.message;
        if (Array.isArray(backendMessage)) {
            return backendMessage.join(' | '); // Formata os erros do class-validator
        }
        return backendMessage || defaultMsg;
    };

    /**
     * @method createTaxGroup
     * @description Envia o Perfil e a Matriz de Regras para criação.
     */
    const createTaxGroup = useCallback(async (data: ICreateTaxGroupDTO): Promise<ITaxGroup | null> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post<ITaxGroup>('/fiscal/tax-groups', data);
            return response.data;
        } catch (err: any) {
            console.error('❌ Erro ao criar grupo fiscal:', err);
            const msg = extractErrorMessage(err, 'Falha ao criar o grupo fiscal.');
            setError(msg);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * @method updateTaxGroup
     * @description Atualiza o Perfil e dispara o Motor Delta Sync nas regras.
     */
    const updateTaxGroup = useCallback(async (id: string, data: IUpdateTaxGroupDTO): Promise<ITaxGroup | null> => {
        setIsLoading(true);
        setError(null);
        try {
            // Nota: Corrigimos o Backend para aceitar PUT, então o frontend usa .put com segurança.
            const response = await api.put<ITaxGroup>(`/fiscal/tax-groups/${id}`, data);
            router.refresh(); // Força o Next.js a revalidar o cache da página atual
            return response.data;
        } catch (err: any) {
            console.error('❌ Erro ao atualizar grupo fiscal:', err);
            const msg = extractErrorMessage(err, 'Falha ao atualizar o grupo fiscal.');
            setError(msg);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    /**
     * @method deleteTaxGroup
     * @description Remove o grupo fiscal (Se não estiver em uso).
     */
    const deleteTaxGroup = useCallback(async (id: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            await api.delete(`/fiscal/tax-groups/${id}`);
            return true;
        } catch (err: any) {
            console.error('❌ Erro ao remover grupo fiscal:', err);
            const msg = extractErrorMessage(err, 'Não é possível remover este grupo fiscal (provavelmente em uso por um produto).');
            setError(msg);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        createTaxGroup,
        updateTaxGroup,
        deleteTaxGroup,
        isLoading,
        error
    };
}