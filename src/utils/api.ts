// src/utils/api.ts

import axios from 'axios';
import { forceGlobalLogout, useAuth } from '@/contexts/AuthContext'; // Para obter o token JWT

// Porquê: A URL base deve ser lida do ambiente para facilitar a transição para produção.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * @const api
 * @description Instância do Axios centralizada e configurada com interceptors.
 */
export const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Necessário para enviar cookies (se usarmos)
});

// --- Interceptor de Requisição (Injeção do Token JWT) ---
// Porquê: Garante que todas as requisições para o Backend (Backend) enviem o token de autenticação,
// permitindo o acesso às rotas protegidas (AuthMiddleware).
api.interceptors.request.use(
    (config) => {
        // NOTE: Como o hook useAuth só pode ser chamado em componentes React,
        // usaremos o localStorage para obter o token para este interceptor,
        // que é chamado fora do ciclo de vida do componente.

        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('auth_token');
            if (token) {
                if (config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- Interceptor de Resposta (Tratamento Global de Erros de Auth) ---
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Porquê: Captura o 401 (Unauthorized) ou 403 (Forbidden) e força o logout/redirecionamento.
        if (error.response?.status === 401 || error.response?.status === 403) {
            forceGlobalLogout();
        }
        return Promise.reject(error);
    }
);