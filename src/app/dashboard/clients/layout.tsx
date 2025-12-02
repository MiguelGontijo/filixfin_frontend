// src/app/dashboard/clients/layout.tsx (Agora na nova rota)

import React from 'react';
import { AuthGuard } from '@/core/components/auth/AuthGuard';
import { UserRole } from '@/core/types/user';
import { ClientSidebar } from '@/core/ui/layout/ClientSidebar'; 

// Esta é a lista de roles permitidas para ACESSAR qualquer rota sob /dashboard/clients
// Porquê: Garante que apenas usuários de Tenant possam ver o módulo de Clientes.
const allowedRoles: UserRole[] = ['TENANT_ADMIN', 'MEMBER'];

/**
 * @component ClientsLayout
 * @description Layout específico para as rotinas de negócio do Tenant (Ex: Clientes, Produtos, Agendamento).
 * PORQUÊ: Envolve o conteúdo com o AuthGuard e o layout com a ClientSidebar.
 */
export default function ClientsLayout({
  children,
}: {
  children: React.ReactNode
}) {
    
    // O layout se concentra em garantir a autenticação e o layout visual
    
    return (
        <AuthGuard allowedRoles={allowedRoles}>
            <div className="flex min-h-screen bg-base-dark text-white">
                
                {/* 1. Sidebar do Cliente */}
                <ClientSidebar />
                
                {/* 2. Conteúdo Principal */}
                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
        </AuthGuard>
    )
}