// src/components/auth/AuthGuard.tsx

"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user'; // Tipos de permissão
import { useNavigation } from '@/hooks/useNavigation'; // Importa o hook centralizado (R1)

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
    // MODIFICAÇÃO: Consome o novo estado 'isReady' do contexto.
    const { isLoggedIn, user, isReady } = useAuth();
    // REMOÇÃO: A definição de isReady baseada no token foi removida,
    // pois o AuthContext agora fornece o estado de leitura explícito.
    // const isReady = token !== undefined; 
    
    // MODIFICAÇÃO: Usamos o hook useNavigation.
    const { toLogin, toDashboard } = useNavigation();

    useEffect(() => {
        // A checagem de isReady garante que o redirecionamento só ocorra APÓS
        // a leitura do localStorage ter sido concluída no AuthContext.
        if (isReady && !isLoggedIn) {
            // Se o contexto carregou (isReady) mas o usuário não está logado, redireciona para o login
            console.log("DIAGNÓSTICO: Usuário não autenticado. Redirecionando para /login.");
            toLogin();
        } else if (isLoggedIn && allowedRoles && !allowedRoles.includes(user!.role)) {
     
            // Se logado, mas sem a permissão correta
            const userRoleString = user!.role;
            console.log(`DIAGNÓSTICO: Permissão Negada. Usuário ${userRoleString} tentou acessar rota restrita.`);
            alert("Acesso negado. Você não tem permissão para esta área.");
      
        }
        // MODIFICAÇÃO: Dependência 'token' removida, 'isReady' (novo) usado.
    }, [isLoggedIn, isReady, user, allowedRoles, toLogin]); 

    // MODIFICAÇÃO: A renderização do placeholder agora é controlada estritamente por !isReady.
    if (!isReady) {
        // Renderiza um placeholder enquanto verifica o estado
        return <div className="flex items-center justify-center min-h-screen bg-base-dark">Carregando Sessão...</div>;
    }

    // Se a sessão foi carregada (isReady) e não houve redirecionamento (isLoggedIn é true), 
    // ou se o usuário estiver logado, mas com a role errada, 
    // o useEffect cuidará do redirecionamento, e este if final só garante que 
    // não renderizamos conteúdo se o usuário não estiver logado (evitando a renderização)
    if (!isLoggedIn) {
        // Se isReady é true e isLoggedIn é false, estamos esperando o push para /login.
        // Retornamos null ou o placeholder padrão para evitar renderização duplicada.
        return <div className="flex items-center justify-center min-h-screen bg-base-dark">Carregando Sessão...</div>;
    }


    return <>{children}</>;
};