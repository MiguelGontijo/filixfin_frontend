// src/hooks/useFeatures.ts

import { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { Feature } from '@/types/acl'; // Tipagem correta (assumindo que o src/types/user.ts está corrigido)

/**
 * @function useFeatures
 * @description Hook customizado para buscar e gerenciar o estado da lista de Features (Permissões).
 * Porquê: Abstrai a lógica de fetching assíncrono e tratamento de loading/error dos componentes.
 */
export function useFeatures() {
    const [features, setFeatures] = useState<Feature[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFeatures = async () => {
            try {
                setIsLoading(true);
                
                // GET para a rota protegida de Features
                const response = await api.get('/admin/features'); 
                
                // Sucesso: Tipamos explicitamente a resposta
                setFeatures(response.data as Feature[]);
                
            } catch (err) {
                console.error("Erro ao buscar features:", err);
                // Erro: pode ser 401, 403, ou 500
                setError("Falha ao carregar catálogo de Features. Verifique a autenticação e o Backend.");
                
            } finally {
                setIsLoading(false);
            }
        };

        fetchFeatures();
    }, []); // Roda apenas uma vez na montagem

    return { features, isLoading, error };
}