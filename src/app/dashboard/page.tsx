// src/app/dashboard/page.tsx

import { AuthGuard } from '@/components/auth/AuthGuard';
import { UserRole } from '@/types/user';
import Link from 'next/link';

/**
 * @component DashboardPage
 * @description Página inicial da aplicação após o Login (Painel de Controle do Admin Global).
 */
export default function DashboardPage() {
    
    // Lista de roles que podem acessar esta página
    const allowedRoles: UserRole[] = ['GLOBAL_ADMIN', 'TENANT_ADMIN'];

    return (
        // Envolve o conteúdo com o AuthGuard
        <AuthGuard allowedRoles={allowedRoles}>
            <div className="p-8 space-y-8 min-h-screen bg-base-metallic">
                
                <h1 className="text-4xl font-extrabold text-white border-l-4 border-accent-secondary pl-4">
                    Painel de Controle Mestre
                </h1>
                
                <p className="text-gray-400">
                    Sua plataforma de gestão full-stack está ativa. O próximo passo é criar os módulos de negócio.
                </p>
                
                {/* Futuras Ações Rápidas */}
                <div className="flex space-x-4">
                    <Link href="/admin/plans" legacyBehavior>
                        <a className="px-4 py-2 bg-accent-primary rounded-lg text-base-dark font-medium hover:bg-orange-500 transition">
                            Gerenciar Planos (ACL)
                        </a>
                    </Link>
                    <Link href="/logout" legacyBehavior>
                        <a className="px-4 py-2 border border-gray-600 rounded-lg text-gray-400 hover:text-white transition">
                            Sair
                        </a>
                    </Link>
                </div>
            </div>
        </AuthGuard>
    );
}