
import { useState } from 'react';
import { api } from '@/core/services/api';
import { Client, CreateClientDto, UpdateClientDto } from '@/core/types/client';

/**
 * @function useClientMutation
 * @description Hook de mutação para gerenciar as operações de escrita (C/U/D) sobre Clientes.
 * Porquê: Centraliza o tratamento de loading e erros de API.
 */
export function useClientMutation() {
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * @method createClient
     * @description Envia uma requisição POST para criar um novo Cliente.
     * Inclui a checagem de ACL (limite de clientes).
     */
    const createClient = async (data: CreateClientDto): Promise<Client> => {
        setIsLoading(true);
        setError(null);
        try {
            // Rota POST /client implementada no Backend
            const response = await api.post('/client', data);
            return response.data as Client;
        } catch (err: any) {
            // Captura erros de ACL (403/422) ou Conflito (409) do Backend.
            const errorMessage = err.response?.data?.message || 'Falha ao criar o Cliente.';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * @method updateClient
     * @description Envia requisição PATCH para atualizar dados parciais do cliente.
     * @param id UUID do cliente.
     * @param data Objeto com os campos a serem alterados.
     */
    const updateClient = async (id: string, data: UpdateClientDto): Promise<Client> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.patch(`/client/${id}`, data);
            return response.data as Client;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Falha ao atualizar o Cliente.';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * @method deleteClient
     * @description Executa um "Soft Delete" (Desativação) via PATCH.
     * @param id UUID do cliente.
     */
    const deleteClient = async (id: string): Promise<void> => {
        setIsLoading(true);
        setError(null);
        try {
            // Porquê: O Backend espera um PATCH com isActive: false para desativar.
            // Isso mantém o histórico (interações, vendas) intacto.
            await api.patch(`/client/${id}`, { isActive: false });
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Falha ao desativar o Cliente.';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { createClient,
                updateClient,
                deleteClient,
                isLoading,
                error
            };
}