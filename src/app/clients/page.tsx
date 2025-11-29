// src/app/clients/page.tsx

import React from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { UserRole } from '@/types/user';
import { ClientTable } from '@/components/client/ClientTable'; // Tabela de Clientes

/**
 * @component ClientsPage
 * @description Página de Gerenciamento de Clientes (acessível por Tenant Admin e Members).
 * Porquê: É a primeira rota de negócio que valida todo o sistema de ACL e Isolamento.
 */
export default function ClientsPage() {
    
    // Lista de roles que podem acessar esta página de negócio.
    // O GLOBAL_ADMIN NÃO deve acessar rotinas de Tenant por aqui, apenas por /admin
    const allowedRoles: UserRole[] = [UserRole.TENANT_ADMIN, UserRole.MEMBER];

    return (
        <AuthGuard allowedRoles={allowedRoles}>
            <div className="space-y-6">
                
                <h1 className="text-3xl font-extrabold text-white">
                    Gerenciamento de Clientes
                </h1>
                
                <p className="text-gray-400">
                    Cadastre e visualize todos os clientes vinculados à sua conta (Tenant).
                </p>
                
                {/* Renderiza o componente que busca e exibe os dados (Listagem e Criação) */}
                <ClientTable />
                
            </div>
        </AuthGuard>
    );
}