// src/app/dashboard/page.tsx

"use client";

import { AuthGuard } from '@/core/components/auth/AuthGuard';
import { UserRole } from '@/core/types/user';
import React from 'react'; 
import { useAuth } from '@/contexts/AuthContext'; 

// --- FUTURO: Importar os Orquestradores de Perfil de Negócio ---
// import { ServiceProviderDashboard } from '@/modules/dashboard/ServiceProviderDashboard';
// import { StoreDashboard } from '@/modules/dashboard/StoreDashboard';
// ---------------------------------------------------------------


/**
 * @component DashboardPage
 * @description Rota principal para usuários logados (Hub Central do Cliente/Tenant).
 * PORQUÊ: Serve como o ponto de orquestração para os diferentes perfis de negócio (Prestador vs. Loja).
 */
export default function DashboardPage() {
    
    const { user, isLoggedIn, isReady } = useAuth();
    
    // Lista de roles que podem acessar esta página
    // O GLOBAL_ADMIN é redirecionado pelo AuthContext para /admin/tenants
    const allowedRoles: UserRole[] = ['TENANT_ADMIN', 'MEMBER'];
    
    // NOTE: Se o AuthGuard não nos redirecionou, estamos logados (isReady=true, isLoggedIn=true).

    // --- LÓGICA DE ORQUESTRAÇÃO FUTURA (A ser expandida) ---
    /*
    const tenantProfile = determineProfile(user.planoId);
    
    if (tenantProfile === 'PRESTADOR_SERVICO') {
        return <ServiceProviderDashboard user={user} />;
    }
    
    if (tenantProfile === 'LOJA_VAREJO') {
        return <StoreDashboard user={user} />;
    }
    */
    // --------------------------------------------------------

    return (
        <AuthGuard allowedRoles={allowedRoles}>
            <div className="p-8 space-y-8 min-h-screen">
                
                <h1 className="text-4xl font-extrabold text-white border-l-4 border-accent-secondary pl-4">
                    Bem-vindo, {user?.email}
                </h1>
                
                <div className="bg-base-metallic p-6 rounded-lg shadow-xl">
                    <h2 className="text-xl font-bold text-base-text mb-4">Visão Geral</h2>
                    <p className="text-gray-400">
                        {user?.role === 'TENANT_ADMIN' 
                            ? 'Você é o administrador do Tenant. Use o menu lateral para gerenciar Clientes, Produtos e Agendamentos.'
                            : 'Você é um membro. Use o menu lateral para acessar suas rotinas.'
                        }
                    </p>
                    
                    <p className="mt-4 text-sm text-gray-500">
                        * O conteúdo deste dashboard será dinâmico e configurável com base no seu Plano de Assinatura.
                    </p>
                </div>

            </div>
        </AuthGuard>
    );
}