// src/app/[tenantId]/dashboard/layout.tsx

import React from 'react';
// CORREÇÃO DE IMPORTS: Apontando para a estrutura Core/Feature correta
import { AuthGuard } from '@/core/components/auth/AuthGuard';
import { ClientSidebar } from '@/core/ui/layout/ClientSidebar'; 
import { TopNavigation } from '@/core/ui/layout/TopNavigation'; // NOVO
import { UserRole } from '@/core/types/user';

/**
 * @component DashboardLayout
 * @description Layout para todas as rotas sob /[tenantId]/dashboard.
 * PORQUÊ: Centraliza a Sidebar, o Header (TopNavigation) e a proteção AuthGuard.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
    
    // Roles permitidas para acessar qualquer rota sob /dashboard
    const allowedRoles: UserRole[] = ['TENANT_ADMIN', 'MEMBER'];

    return (
        <AuthGuard allowedRoles={allowedRoles}>
            <div className="flex min-h-screen bg-base-dark text-white">
                
                {/* 1. Sidebar do Cliente (Esquerda) */}
                <ClientSidebar />
                
                {/* 2. Área de Conteúdo (Direita) */}
                <div className="flex-1 flex flex-col min-w-0">
                    
                    {/* 2.1 Header Global com Contexto */}
                    <TopNavigation />
                    
                    {/* 2.2 Conteúdo Principal da Página */}
                    <main className="flex-1 p-8 overflow-y-auto relative">
                        {children}
                    </main>
                </div>

            </div>
        </AuthGuard>
    );
}