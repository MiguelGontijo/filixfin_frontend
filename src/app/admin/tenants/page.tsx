// src/app/admin/tenants/page.tsx

import React from 'react';
import { AuthGuard } from '@/core/components/auth/AuthGuard';
import { UserRole } from '@/core/types/user';
import { TenantTable } from '@/modules/admin/components/TenantTable';

/**
 * @component AdminTenantsPage
 * @description Página de Gerenciamento de Tenants (Empresas).
 * Porquê: Aplica o AuthGuard e renderiza a tabela de Tenants para o Admin Global.
 */
export default function AdminTenantsPage() {
    
    const role = UserRole.GLOBAL_ADMIN
    // Apenas o GLOBAL_ADMIN pode acessar esta rotina
    const allowedRoles: UserRole[] = [UserRole.GLOBAL_ADMIN];

    return (
        // O AuthGuard protege o conteúdo
        <AuthGuard allowedRoles={allowedRoles}>
            <div className="space-y-6">
                
                <h1 className="text-3xl font-extrabold text-white">
                    Gerenciamento de Tenants (Empresas)
                </h1>
                
                <p className="text-gray-400">
                    Visualize, edite o Plano, e ative/desative as contas de todos os Tenants da plataforma.
                </p>
                
                {/* Renderiza o componente que busca e exibe os dados */}
                <TenantTable />
                
            </div>
        </AuthGuard>
    );
}