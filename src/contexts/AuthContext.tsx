// src/contexts/AuthContext.tsx

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LoginDto, LoginResponse } from '@/core/types/auth'; 
import { UserRole } from '@/core/types/user';
import { api } from '@/core/services/api'; 
import { useNavigation } from '@/core/hooks/useNavigation'; 
import { User } from '@/core/types/user';

// --- 1. Definição de Tipos e Variável Global ---

interface AuthUser extends User { 
    id: string;
    email: string;
    role: UserRole;
    tenantId: string | null;
}

interface AuthContextData {
    user: AuthUser | null;
    token: string | null;
    isLoggedIn: boolean;
    isReady: boolean; 
    
    login: (credentials: LoginDto) => Promise<void>;
    logout: () => void; 
}

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

    const cleanSession = () => {
        setUser(null);
        setToken(null); 
    };

    const logoutAndRedirect = useCallback(() => {
        api.post('/user/logout')
            .catch(error => {
                console.error("Erro no logout do Backend (Cookie):", error);
            })
            .then(() => {
                cleanSession();
                toLogin(); 
            });
    }, [toLogin]); 

    const verifySession = useCallback(async () => {
        try {
            if (user) {
                setIsReady(true);
                return;
            }

            const response = await api.get('/user/profile'); 
            const authUser = response.data as AuthUser;
            
            setUser(authUser);
            setToken('VALID_SESSION'); 
            
        } catch (error: any) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                 console.warn("Sessão Expirada/Inválida. Limpeza do estado local.");
            }
            cleanSession();
        } finally {
            setIsReady(true);
        }
    }, [user]);

    useEffect(() => {
        verifySession();
    }, [verifySession]); 
    
    useEffect(() => {
        globalLogoutAndRedirect = logoutAndRedirect;
        return () => {
            globalLogoutAndRedirect = null;
        };
    }, [logoutAndRedirect]); 

    const login = async (credentials: LoginDto) => {
        try {
            const response = await api.post('/user/login', credentials);
            const result = response.data as LoginResponse;
            const { user: userData } = result; 
            
            const authUser: AuthUser = {
                id: userData.id,
                email: userData.email,
                role: userData.role as UserRole,
                tenantId: userData.tenantId,
            };
            
            setToken('VALID_SESSION'); 
            setUser(authUser);
            
            // MODIFICAÇÃO: Passamos o tenantId para o redirecionamento dinâmico
            toPostLoginDestination(authUser.role, authUser.tenantId);

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

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};

export const forceGlobalLogout = () => {
    if (globalLogoutAndRedirect) {
        console.warn("Token expirado ou inválido. Executando logout automático...");
        globalLogoutAndRedirect();
    }
};