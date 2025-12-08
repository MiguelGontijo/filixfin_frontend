// src/contexts/AuthContext.tsx

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LoginDto, LoginResponse } from '@/core/types/auth'; 
import { UserRole } from '@/core/types/user';
import { api } from '@/core/services/api';
import { useNavigation } from '@/core/hooks/useNavigation'; 
import { User } from '@/core/types/user';

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
    loginWithGoogle: (credential: string) => Promise<void>;
    logout: () => void;
}

let globalLogoutAndRedirect: (() => void) | null = null; 

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    
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
            .catch(error => console.error("Erro no logout:", error))
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
            // Tipagem explicita no GET também ajuda
            const response = await api.get<AuthUser>('/user/profile'); 
            const authUser = response.data;
            setUser(authUser);
            setToken('VALID_SESSION'); 
        } catch (error: any) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                 // Sessão inválida - silêncio
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
        return () => { globalLogoutAndRedirect = null; };
    }, [logoutAndRedirect]);

    // Helper para processar sucesso (DRY)
    const handleAuthSuccess = (result: LoginResponse) => {
        const { user: userData } = result;
        const authUser: AuthUser = {
            id: userData.id,
            email: userData.email,
            role: userData.role as UserRole,
            tenantId: userData.tenantId,
        };
        setToken('VALID_SESSION'); 
        setUser(authUser);
        toPostLoginDestination(authUser.role, authUser.tenantId);
    };

    // --- Login Tradicional ---
    const login = async (credentials: LoginDto) => {
        try {
            // CORREÇÃO AQUI: Adicionado <LoginResponse>
            const response = await api.post<LoginResponse>('/user/login', credentials);
            handleAuthSuccess(response.data);
        } catch (error) {
            cleanSession();
            throw error;
        }
    };

    // --- Login Google ---
    const loginWithGoogle = async (credential: string) => {
        try {
            // CORREÇÃO AQUI: Adicionado <LoginResponse>
            const response = await api.post<LoginResponse>('/user/google-auth', { credential });
            handleAuthSuccess(response.data);
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
        loginWithGoogle,
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
    if (globalLogoutAndRedirect) globalLogoutAndRedirect();
};