// src/contexts/AuthContext.tsx

"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LoginDto, LoginResponse } from '@/types/auth'; 
import { UserRole } from '@/types/user';
import { api } from '@/utils/api'; 
import { useNavigation } from '@/hooks/useNavigation'; 
import { User } from '@/types/user'; // Importamos o tipo User completo

// --- 1. Definição de Tipos e Variável Global ---

// O que o nosso JWT Claims carrega
interface AuthUser extends User { // Estende o tipo User para incluir os dados do token/claims
    id: string;
    email: string;
    role: UserRole;
    tenantId: string | null;
}

// O estado do Contexto
interface AuthContextData {
    user: AuthUser | null;
    token: string | null;
    isLoggedIn: boolean;
    isReady: boolean; 
    
    // Funções de interação
    login: (credentials: LoginDto) => Promise<void>;
    logout: () => void; // Funções de interação
}

// Variável global que armazena a função de logout do Provider (para ser acessada pelo Axios)
let globalLogoutAndRedirect: (() => void) | null = null; 

// --- 2. Criação do Contexto ---

const AuthContext = createContext<AuthContextData | undefined>(undefined);
// --- 3. Criação do Provider ---

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    
    const { toLogin, toPostLoginDestination } = useNavigation();
    
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null); 
    const [isReady, setIsReady] = useState(false); 
    const isLoggedIn = !!user;

    // Função de limpeza de sessão (memória e cookies)
    const cleanSession = () => {
        setUser(null);
        setToken(null); 
        // NOTE: A limpeza do Cookie HttpOnly deve ser feita pelo Backend (rota de logout)
        // ou pela expiração forçada do Cookie, o que não faz parte do escopo atual.
        // Por hora, apenas limpamos o estado do Frontend.
    };

    // Função principal de logout e redirecionamento (expõe o redirecionamento)
    const logoutAndRedirect = useCallback(() => {
        
        // --- MODIFICAÇÃO CHAVE (D.3): Chamada Assíncrona para Logout no Backend ---
        // PORQUÊ: Garante que o Cookie HttpOnly seja destruído antes de limpar o estado.
        api.post('/user/logout')
            .catch(error => {
                // Erros aqui (ex: rede offline) não devem impedir o logout no FE.
                console.error("Erro no logout do Backend (Cookie):", error);
            })
            .then(() => {
                // A limpeza do estado e o redirecionamento devem sempre ocorrer,
                // mesmo que a chamada de rede falhe.
                cleanSession();
                toLogin(); 
            });
    }, [toLogin]); 

    // --- NOVO: Função Assíncrona para Verificar a Sessão (Pilar da Correção) ---
    /**
     * @method verifySession
     * @description Tenta buscar o perfil do Backend usando o Cookie HttpOnly.
     * PORQUÊ: Hidrata o estado do AuthContext após o refresh.
     */
    const verifySession = useCallback(async () => {
        try {
            // Se o user já estiver no estado (ex: logo após o login ou hidratação anterior), não refazemos a chamada.
            if (user) {
                setIsReady(true);
                return;
            }

            // Tenta acessar a rota protegida. O browser envia o Cookie.
            const response = await api.get('/user/profile'); 
            const authUser = response.data as AuthUser;
            
            // Se o Backend responde 200 OK: O Cookie é válido, autentica o usuário.
            setUser(authUser);
            setToken('VALID_SESSION'); // Marcador de sessão válida
            
        } catch (error: any) {
            // Se falhar (401/403): O token expirou ou está faltando.
            // O interceptor já chamou forceGlobalLogout, mas garantimos a limpeza.
            if (error.response?.status === 401 || error.response?.status === 403) {
                 console.warn("Sessão Expirada/Inválida. Limpeza do estado local.");
            }
            cleanSession();
        } finally {
            // INDEPENDENTE do resultado, a verificação terminou. Libera o AuthGuard.
            setIsReady(true);
        }
    }, [user]);

    // Efeito para carregar estado assíncrono (Verificação de Sessão)
    useEffect(() => {
        verifySession();
    }, [verifySession]); 
    
    // Efeito para injetar a função de logout no mecanismo global (Axios)
    useEffect(() => {
        globalLogoutAndRedirect = logoutAndRedirect;
        return () => {
            globalLogoutAndRedirect = null;
        };
    }, [logoutAndRedirect]); 

    const login = async (credentials: LoginDto) => {
        try {
            // 1. CHAMADA REAL À API DE LOGIN (Backend setará o Cookie)
            const response = await api.post('/user/login', credentials);
            // 2. Extrair Token e Dados
            const result = response.data as LoginResponse;
            const { user: userData } = result; 
            
            // Mapeamento de Tipos para o Contexto
            const authUser: AuthUser = {
                id: userData.id,
                email: userData.email,
                role: userData.role as UserRole,
                tenantId: userData.tenantId,
            };
            // 3. Salvar estado no Contexto (user) e marcar sessão como válida
            setToken('VALID_SESSION'); // Marcador
            setUser(authUser);
            // Redirecionamento
            toPostLoginDestination(authUser.role);

        } catch (error) {
            cleanSession();
            throw error;
        }
    };

    const contextValue: AuthContextData = {
        user,
        token,
        isLoggedIn,
        isReady,
        login,
        logout: logoutAndRedirect, 
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// --- 4. Criação do Hook e Função Global ---

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};

/**
 * @function forceGlobalLogout
 * @description Chamado pelo Interceptor de API (api.ts) quando detecta 401/403.
 */
export const forceGlobalLogout = () => {
    if (globalLogoutAndRedirect) {
        console.warn("Token expirado ou inválido. Executando logout automático...");
        globalLogoutAndRedirect();
    }
};