// src/core/hooks/useClients.ts

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/core/services/api';
import { Client } from '@/core/client/domain/types/client';

/**
 * @function useClients
 * @description Hook inteligente para gerenciamento de Clientes.
 * @update Adicionado 'externalTrigger' para permitir recarga forçada por componentes pais.
 */
export function useClients(externalTrigger: number = 0) {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- ESTADO DE BUSCA ---
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedTerm, setDebouncedTerm] = useState('');

    // 1. EFEITO DE DEBOUNCE
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedTerm(searchTerm);
        }, 500); 

        return () => {
            clearTimeout(timer); 
        };
    }, [searchTerm]);

    // 2. FUNÇÃO DE BUSCA (Memoized)
    const fetchClients = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const params = debouncedTerm ? { q: debouncedTerm } : {};

            const response = await api.get('/client', { params });
            
            setClients(response.data as Client[]);
            
        } catch (err: any) {
            console.error("Erro ao buscar clientes:", err);
            const errorMessage = err.response?.data?.message || "Falha ao carregar lista de Clientes.";
            setError(errorMessage);
            
        } finally {
            setIsLoading(false);
        }
    }, [debouncedTerm]); 

    // 3. DISPARO INICIAL E REATIVO
    // IMPORTANTE: Adicionamos 'externalTrigger' aqui. Se ele mudar, o efeito roda novamente.
    useEffect(() => {
        fetchClients();
    }, [fetchClients, externalTrigger]);

    return { 
        clients, 
        isLoading, 
        error, 
        refreshData: fetchClients,
        searchTerm,
        setSearchTerm 
    };
}