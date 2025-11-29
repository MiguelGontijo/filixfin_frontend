// src/hooks/useClients.ts

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/utils/api';
import { Client } from '@/types/client'; // Importa a tipagem do cliente

/**
 * @function useClients
 * @description Hook customizado para buscar e gerenciar o estado da lista de Clientes.
 * Porquê: A rota /client no Backend retorna APENAS os clientes do Tenant logado (isolamento).
 */
export function useClients() {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Função para buscar e recarregar dados
    const fetchClients = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            // FUTURO: Rota GET /client deve ser implementada no Backend para esta chamada.
            const response = await api.get('/client'); 
            
            setClients(response.data as Client[]);
            
        } catch (err: any) {
            console.error("Erro ao buscar clientes:", err);
            const errorMessage = err.response?.data?.message || "Falha ao carregar lista de Clientes.";
            setError(errorMessage);
            
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]); 

    // Retorna a função de busca para ser usada no onSuccess do formulário (revalidação)
    return { clients, isLoading, error, refreshData: fetchClients };
}