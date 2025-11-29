// src/contexts/AuthContext.tsx (VERSÃO FINAL E CORRIGIDA PARA LOGOUT AUTOMÁTICO)

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // <-- NOVO: Para redirecionamento
import { LoginDto, LoginResponse } from '@/types/auth'; 
import { UserRole } from '@/types/user'; 
import { api } from '@/utils/api'; // <-- NOVO: Cliente de API para uso no login real

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
    const router = useRouter(); // <-- NOVO: Hook de roteamento
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
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
        router.push('/login');
    }, [router]);
    
    // Efeito para carregar estado do localStorage na inicialização (persistência)
    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Efeito para injetar a função de logout no mecanismo global (Axios)
    useEffect(() => {
        globalLogoutAndRedirect = logoutAndRedirect;
        return () => {
            globalLogoutAndRedirect = null;
        };
    }, [logoutAndRedirect]); // Depende da função de redirecionamento

    // --- NOVO: Função para obter a rota de destino (SRP) ---
    const getTargetRoute = (role: UserRole): string => {
        console.log("Determinando rota de destino para o papel:", role);
        switch (role) {
            case UserRole.GLOBAL_ADMIN:
                // Leva para a tela de gestão principal de ACL
                return '/admin/plans'; 
            case UserRole.TENANT_ADMIN:
            case UserRole.MEMBER:
                // Leva para a tela de negócio principal
                return '/clients'; 
            default:
                return '/dashboard';
        }
    };

    const login = async (credentials: LoginDto) => {
        try {
            // 1. CHAMADA REAL À API DE LOGIN
            // POST para a rota que implementamos no Backend
            const response = await api.post('/user/login', credentials);
            
            // 2. Extrair Token e Dados
            const result = response.data as LoginResponse; 
            
            const { token, user } = result; // <-- Desestruturação agora é segura
            
            // Mapeamento de Tipos para o Contexto
            const authUser: AuthUser = {
                id: user.id,
                email: user.email,
                role: user.role as UserRole,
                tenantId: user.tenantId,
            };

            // 3. Salvar estado no Contexto e no localStorage
            setToken(token);
            setUser(authUser);
            localStorage.setItem('auth_token', token);
            localStorage.setItem('auth_user', JSON.stringify(authUser));

            const targetRoute = getTargetRoute(authUser.role);
            router.push(targetRoute);

        } catch (error) {
            cleanSession(); // Limpa a sessão em caso de erro
            throw error; // Propaga o erro (para o componente Login exibir a mensagem)
        }
    };

    const contextValue: AuthContextData = {
        user,
        token,
        isLoggedIn,
        login,
        logout: logoutAndRedirect, // Expõe o logout que também redireciona
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