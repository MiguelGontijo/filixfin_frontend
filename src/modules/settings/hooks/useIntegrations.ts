// src/modules/settings/hooks/useIntegrations.ts

import { useState } from 'react';
import { api } from '@/core/services/api';

// Interface que define o que o Backend retorna na rota /auth-url
interface GoogleAuthResponse {
    url: string;
}

export function useIntegrations() {
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Inicia o fluxo OAuth2 com o Google.
     * Busca a URL no backend e redireciona o navegador.
     */
    const connectGoogleCalendar = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // CORREÇÃO: Tipagem do retorno da API <GoogleAuthResponse>
            const response = await api.get<GoogleAuthResponse>('/scheduler/google/auth-url');
            
            if (response.data && response.data.url) {
                // Redireciona o usuário para a página de consentimento do Google
                window.location.href = response.data.url;
            } else {
                throw new Error("URL de autenticação não retornada pelo servidor.");
            }
        } catch (err: any) {
            console.error("Erro ao iniciar integração Google:", err);
            setError("Falha ao conectar com o Google. Tente novamente.");
            setIsLoading(false); 
        }
    };

    return {
        connectGoogleCalendar,
        isLoading,
        error
    };
}