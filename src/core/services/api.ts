// src/core/services/api.ts

import axios from 'axios';
import { forceGlobalLogout } from '@/contexts/AuthContext'; 

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, 
});

// --- Interceptor de Resposta ---
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Lógica de Exceção:
        // Se o erro for na rota de verificação de perfil (/user/profile),
        // NÃO executamos o logout forçado. Apenas rejeitamos a promessa.
        // Isso permite que o AuthContext trate o "não logado" silenciosamente na Landing Page.
        const isProfileCheck = error.config?.url?.includes('/user/profile');

        if ((error.response?.status === 401 || error.response?.status === 403) && !isProfileCheck) {
            // Se for qualquer outra rota (ex: salvar cliente) e der 401, aí sim desloga.
            console.warn("Sessão expirada em operação protegida. Redirecionando...");
            forceGlobalLogout();
        }
        
        return Promise.reject(error);
    }
);