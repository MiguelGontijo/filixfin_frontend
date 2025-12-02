// src/core/components/auth/TenantGuard.tsx

"use client";

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/core/hooks/useNavigation';
import { UserRole } from '@/core/types/user';

interface TenantGuardProps {
    children: React.ReactNode;
}

/**
 * @component TenantGuard
 * @description Protege rotas dinâmicas /[tenantId].
 * Verifica se o usuário logado tem permissão para acessar o tenantId da URL atual.
 */
export const TenantGuard: React.FC<TenantGuardProps> = ({ children }) => {
    const { user, isReady } = useAuth();
    const params = useParams();
    const { toDashboard, toLogin } = useNavigation();

    useEffect(() => {
        if (!isReady) return;

        // 1. Verifica se temos um usuário logado
        if (!user) {
            toLogin();
            return;
        }

        // 2. Obtém o tenantId da URL
        const routeTenantId = params?.tenantId as string;

        // 3. Validação de Segurança de Contexto
        // Se o usuário não é GLOBAL_ADMIN e está tentando acessar um tenant diferente do seu
        if (user.role !== UserRole.GLOBAL_ADMIN && user.tenantId !== routeTenantId) {
            console.warn(`Acesso Negado: Usuário ${user.email} (Tenant: ${user.tenantId}) tentou acessar Tenant: ${routeTenantId}`);
            
            // Redireciona para o SEU dashboard correto
            // Isso previne que usuários acessem dados de outras empresas trocando a URL manualmente
            if (user.tenantId) {
                toDashboard(user.tenantId);
            } else {
                toLogin();
            }
        }
    }, [isReady, user, params, toDashboard, toLogin]);

    // Enquanto verifica, exibe loading ou nada (o AuthGuard interno já lida com o user null)
    if (!isReady || !user) {
        return <div className="min-h-screen bg-base-dark flex items-center justify-center">Verificando Permissão de Acesso...</div>;
    }

    // Se a validação passou (ou está redirecionando), renderiza os filhos
    // Nota: O useEffect lida com o redirecionamento, então aqui deixamos renderizar 
    // para evitar flash, a menos que haja bloqueio explícito.
    return <>{children}</>;
};