// src/components/auth/AuthGuard.tsx

"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext'; // Hook de autenticação
import { UserRole } from '@/types/user'; // Tipos de permissão

interface AuthGuardProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[]; // Quais roles têm permissão de acesso
}

/**
 * @component AuthGuard
 * @description Componente de HOC (High-Order Component) para proteger rotas.
 * Porquê: Centraliza a lógica de ACL e autenticação no Frontend, garantindo que o usuário
 * seja redirecionado se não estiver logado ou não tiver a role correta.
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles }) => {
    const { isLoggedIn, user, token } = useAuth();
    const router = useRouter();
    const isReady = token !== undefined; // Verifica se o contexto carregou

    useEffect(() => {
        if (isReady && !isLoggedIn) {
            // Se o contexto carregou, mas o usuário não está logado, redireciona para o login
            console.log("DIAGNÓSTICO: Usuário não autenticado. Redirecionando para /login.");
            router.push('/login');
        } else if (isLoggedIn && allowedRoles && !allowedRoles.includes(user!.role)) {
            // Se logado, mas sem a permissão correta (Ex: Membro tentando acessar Admin Global)
            const userRoleString = user!.role;
            console.log(`DIAGNÓSTICO: Permissão Negada. Usuário ${userRoleString} tentou acessar rota restrita.`);
            alert("Acesso negado. Você não tem permissão para esta área.");
            // router.push('/dashboard'); // Redireciona para um local seguro
        }
    }, [isLoggedIn, isReady, user, allowedRoles, router]);

    // Renderiza a página se o usuário estiver logado e tiver a permissão correta
    if (!isReady || !isLoggedIn) {
        // Renderiza um placeholder enquanto verifica o estado (evita o flash de conteúdo)
        return <div className="flex items-center justify-center min-h-screen bg-base-dark">Carregando Sessão...</div>;
    }

    return <>{children}</>;
};