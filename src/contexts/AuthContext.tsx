// src/contexts/AuthContext.tsx

"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { LoginDto } from '@/types/auth'; // Usaremos um tipo placeholder (a ser criado)
import { UserRole } from '@/types/user'; // Usaremos um tipo placeholder (a ser criado)

// --- 1. Definição de Tipos ---

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
    logout: () => void;
}

// --- 2. Criação do Contexto ---

const AuthContext = createContext<AuthContextData | undefined>(undefined);

// --- 3. Criação do Provider ---

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const isLoggedIn = !!user;

    // Efeito para carregar estado do localStorage na inicialização (persistência)
    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = async (credentials: LoginDto) => {
        // FUTURO: Implementação real da chamada à API (POST /api/v1/user/login)

        // Simulação de Chamada de API Bem-Sucedida
        const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwMDAiLCJ0ZW5hbnRJZCI6bnVsbCwicm9sZSI6IkdMT0JBTF9BRE1JTiIsImlhdCI6MTY3MjUzMTIwMH0.";
        const fakeUser: AuthUser = {
            id: '00000000-0000-0000-0000-000000000000',
            email: credentials.email,
            role: 'GLOBAL_ADMIN' as UserRole,
            tenantId: null,
        };

        // Salvar estado no Contexto e no localStorage para persistência
        setToken(fakeToken);
        setUser(fakeUser);
        localStorage.setItem('auth_token', fakeToken);
        localStorage.setItem('auth_user', JSON.stringify(fakeUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        // Futuro: Redirecionar para /login
    };

    const contextValue: AuthContextData = {
        user,
        token,
        isLoggedIn,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// --- 4. Criação do Hook para Consumo ---

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};