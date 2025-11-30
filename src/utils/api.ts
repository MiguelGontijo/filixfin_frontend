// src/utils/api.ts

import axios from 'axios';
import { forceGlobalLogout } from '@/contexts/AuthContext'; // Para obter o token JWT

// Porquê: A URL base deve ser lida do ambiente para facilitar a transição para produção.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * @const api
 * @description Instância do Axios centralizada e configurada com interceptors.
 */
export const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Necessário para enviar cookies (HttpOnly)
});


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