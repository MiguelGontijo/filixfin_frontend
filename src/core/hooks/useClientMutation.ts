
import { useState } from 'react';
import { api } from '@/core/services/api';
import { Client, CreateClientDto } from '@/core/types/client';

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

    // FUTURO: updateClient (PATCH)
    // FUTURO: deleteClient (DELETE)

    return { createClient, isLoading, error };
}