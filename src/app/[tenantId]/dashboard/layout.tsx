// src/app/[tenantId]/dashboard/layout.tsx

import React from 'react';
// CORREÇÃO DE IMPORTS: Apontando para a estrutura Core/Feature correta
import { AuthGuard } from '@/core/components/auth/AuthGuard';
import { ClientSidebar } from '@/core/ui/layout/ClientSidebar'; 
import { TopNavigation } from '@/core/ui/layout/TopNavigation'; // NOVO
import { UserRole } from '@/core/types/user';
import { FilixAIProvider } from '@/core/ai/context/FilixAIContext';
import { FloatingWidget } from '@/core/ai/components/FloatingWidget';

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
            <FilixAIProvider>
                {/* CORREÇÃO: h-screen e overflow-hidden para travar a janela */}
                <div className="flex h-screen bg-base-dark text-white overflow-hidden">
                        
                    {/* 1. Sidebar */}
                    <ClientSidebar />
                    
                    {/* 2. Área de Conteúdo */}
                    <div className="flex-1 flex flex-col min-w-0">
                        
                        {/* 2.1 Header */}
                        <TopNavigation />
                        
                        {/* 2.2 Conteúdo Principal */}
                        {/* O main ocupa o resto e esconde o que vazar. O filho deve rolar se precisar. */}
                        <main className="flex-1 p-2 overflow-hidden relative">
                            {children}
                        </main>
                    </div>
                </div>

                {/* Adicione AQUI, no final, antes de fechar o Provider */}
                <FloatingWidget />

            </FilixAIProvider>
        </AuthGuard>
    );
}