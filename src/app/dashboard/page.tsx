// src/app/dashboard/page.tsx

"use client"; // Necessário para usar hooks como useEffect

import { AuthGuard } from '@/components/auth/AuthGuard';
import { UserRole } from '@/types/user';
import Link from 'next/link';
// MODIFICAÇÃO: Não precisamos mais de useEffect, useAuth e useNavigation aqui,
// exceto se o componente quiser usar os dados do usuário.
import React from 'react'; 
import { useAuth } from '@/contexts/AuthContext'; 

/**
 * @component DashboardPage
 * @description Página inicial da aplicação após o Login (Painel de Controle do Admin Global).
 * Porquê: Retorna ao seu papel original de PÁGINA DE CONTEÚDO para o TENANT_ADMIN/MEMBER,
 * enquanto o GLOBAL_ADMIN é redirecionado ANTES de chegar aqui.
 */
export default function DashboardPage() {
    
    // Hooks para lógica de exibição (mantemos o useAuth para acessar o user)
    const { user, isLoggedIn } = useAuth();
    
    // --- REMOÇÃO CIRÚRGICA DE LÓGICA REDUNDANTE (Passo 6) ---
    /*
    const { toAdminPlans, rawPush } = useNavigation(); 
    
    // Lógica de Redirecionamento Pós-Login
    useEffect(() => {
        if (isLoggedIn && user) {
            // Regra: Se for GLOBAL_ADMIN, redireciona imediatamente para a tela de gestão de Tenants/Planos.
            if (user.role === UserRole.GLOBAL_ADMIN) {
                // Rota sugerida de entrada para o Global Admin: Lista de Tenants
                rawPush('/admin/tenants'); // Usar rawPush para rota específica
            }
            // Se for TENANT_ADMIN ou MEMBER, permanece no Dashboard.
        }
    }, [isLoggedIn, user, rawPush]);
    
    // Se o GLOBAL_ADMIN for redirecionado, esta tela piscará brevemente.
    if (isLoggedIn && user?.role === UserRole.GLOBAL_ADMIN) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-base-dark text-accent-secondary">
                Redirecionando para a Área de Administração...
            </div>
        );
    }
    */
    // ----------------------------------------------------------------------
    
    // Lista de roles que podem acessar esta página (apenas Tenant Admin/Member)
    // O GLOBAL_ADMIN NUNCA deve chegar aqui (regra crítica), mas mantemos a lista 
    // de allowedRoles para um eventual AuthGuard externo, se necessário.
    const allowedRoles: UserRole[] = ['TENANT_ADMIN', 'MEMBER'];
    
    return (
        // Envolve o conteúdo com o AuthGuard
        <AuthGuard allowedRoles={allowedRoles}>
            <div className="p-8 space-y-8 min-h-screen bg-base-metallic">
                
                <h1 className="text-4xl font-extrabold text-white border-l-4 border-accent-secondary pl-4">
                    Painel Principal do Cliente
                </h1>
                
                <p className="text-gray-400">
                    Bem-vindo, **{user?.email}** (Role: {user?.role}). Este é o seu painel de controle principal. Use o menu lateral para navegar nas rotinas de negócio.
                </p>
                
                {/* Futuras Ações Rápidas */}
                <div className="flex space-x-4">
                    <Link href="/clients" legacyBehavior>
                       
                        <a className="px-4 py-2 bg-accent-primary rounded-lg text-base-dark font-medium hover:bg-orange-500 transition">
                            Gerenciar Clientes
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