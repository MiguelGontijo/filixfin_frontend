// src/core/services/api.ts

import axios from 'axios';
import { forceGlobalLogout } from '@/contexts/AuthContext'; 

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * @const api
 * @description Instância global do Axios para comunicação com o Backend.
 * @update Adicionado timeout de 15s (Fail Fast) para evitar travamento da UI quando o servidor cai.
 */
export const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, 
    timeout: 15000, // 15 segundos: Tempo máximo de espera antes de abortar
    headers: {
        'Content-Type': 'application/json',
    }
});

// --- Interceptor de Resposta ---
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const originalRequest = error.config;

        // 1. Tratamento de Erro de Rede / Timeout (Backend Off ou Lento)
        // ECONNABORTED = Timeout do Axios
        // ERR_NETWORK / Network Error = Backend desligado ou porta fechada
        if (error.code === 'ECONNABORTED' || error.message.includes('Network Error') || error.code === 'ERR_NETWORK') {
            console.error('[API] Falha crítica de conexão ou timeout.');
            
            // Modificamos a mensagem de erro para algo que a UI (useClients/useAuth) possa exibir amigavelmente
            error.message = 'O servidor não está respondendo. Verifique sua conexão ou tente novamente em instantes.';
            
            return Promise.reject(error);
        }

        // 2. Tratamento de Sessão Expirada (401/403)
        // Se for na rota de verificação de perfil, ignoramos o logout forçado (deixa o contexto lidar silenciosamente)
        const isProfileCheck = originalRequest?.url?.includes('/user/profile');

        if ((error.response?.status === 401 || error.response?.status === 403) && !isProfileCheck) {
            console.warn("Sessão expirada em operação protegida. Redirecionando...");
            forceGlobalLogout();
        }
        
        // Repassa o erro original (ou modificado) para ser tratado no try/catch do componente
        return Promise.reject(error);
    }
);