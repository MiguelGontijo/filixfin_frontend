// src/contexts/AuthContext.tsx

"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LoginDto, LoginResponse } from '@/types/auth'; 
import { UserRole } from '@/types/user';
import { api } from '@/utils/api'; 
import { useNavigation } from '@/hooks/useNavigation'; 

// --- 1. Definição de Tipos e Variável Global ---

// O que o nosso JWT Claims carrega
interface AuthUser {
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
    // MODIFICAÇÃO: Nova sentinela para indicar se a leitura do localStorage terminou.
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
    // MODIFICAÇÃO: Usamos o hook centralizado, incluindo o novo método de decisão.
    const { toLogin, toPostLoginDestination } = useNavigation();
    
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null); 
    const [isReady, setIsReady] = useState(false); // MODIFICAÇÃO: Estado inicial 'false'
    const isLoggedIn = !!user;

    // Função de limpeza de sessão (memória e localStorage)
    const cleanSession = () => {
        setUser(null);
        setToken(null); 
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    };

    // Função principal de logout e redirecionamento (expõe o redirecionamento)
    const logoutAndRedirect = useCallback(() => {
        cleanSession();
        // MODIFICAÇÃO: Usa o método centralizado para o login.
        toLogin(); 
    }, [toLogin]); 

    // Efeito para carregar estado do localStorage na inicialização (persistência)
    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        } else {
             // Caso não haja token, garante que o estado inicial seja null.
             setToken(null);
        }
        
        // MODIFICAÇÃO CHAVE: A leitura foi concluída, independentemente do resultado.
        setIsReady(true);
        
    }, []); 
    
    // Efeito para injetar a função de logout no mecanismo global (Axios)
    useEffect(() => {
        globalLogoutAndRedirect = logoutAndRedirect;
        return () => {
            globalLogoutAndRedirect = null;
        };
    }, [logoutAndRedirect]); 

    const login = async (credentials: LoginDto) => {
        try {
            // 1. CHAMADA REAL À API DE LOGIN
            const response = await api.post('/user/login', credentials);
            // 2. Extrair Token e Dados
            const result = response.data as LoginResponse;
            const { token, user: userData } = result; 
            
            // Mapeamento de Tipos para o Contexto
            const authUser: AuthUser = {
                id: userData.id,
                email: userData.email,
                role: userData.role as UserRole,
                tenantId: userData.tenantId,
            };
            // 3. Salvar estado no Contexto e no localStorage
            setToken(token);
            setUser(authUser);
            localStorage.setItem('auth_token', token);
            localStorage.setItem('auth_user', JSON.stringify(authUser));

            // Chamamos o novo método do hook que DECIDE e EXECUTA o push.
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
        // MODIFICAÇÃO: Exporta o novo estado isReady
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