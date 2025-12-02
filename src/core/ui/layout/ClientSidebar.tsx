// src/core/ui/layout/ClientSidebar.tsx

'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation'; // MODIFICAÇÃO: Importa useParams para ler a URL
import { FaUsers, FaHome, FaSignOutAlt, FaBook, FaBox } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/core/types/user'; 

// Definição das funcionalidades/módulos e suas chaves (Mock do Backend Features)
const featureModules = [
    { 
        key: 'CLIENTE_VIEW', 
        name: 'Gerenciar Clientes', 
        href: '/dashboard/clients', 
        icon: FaUsers 
    }, 
    { 
        key: 'CRM_VIEW', 
        name: 'CRM - Leads e Tarefas', 
        href: '/dashboard/crm', 
        icon: FaBook 
    },
    { 
        key: 'PRODUTO_VIEW', 
        name: 'Produtos e Estoque', 
        href: '/dashboard/products', 
        icon: FaBox 
    },
];

/**
 * @component ClientSidebar
 * @description Barra de navegação lateral para as rotinas de negócio do Tenant.
 * PORQUÊ: Renderiza links dinamicamente com base no Contexto do Tenant (URL) e ACL.
 */
export const ClientSidebar: React.FC = () => {
    
    const { user } = useAuth();
    const params = useParams();
    const tenantId = params?.tenantId as string; // MODIFICAÇÃO: Captura o ID da rota dinâmica
    
    // MOCK ACL
    const hasFeatureAccess = (featureKey: string) => {
        if (user?.role === UserRole.TENANT_ADMIN) return true;
        return ['CLIENTE_VIEW', 'CRM_VIEW'].includes(featureKey); 
    }

    // Se o tenantId ainda não estiver disponível (hidratação), evita renderizar links quebrados
    if (!tenantId) return null; 

    return (
        <div className="flex flex-col w-64 min-h-screen bg-base-metallic p-4 space-y-6 border-r border-gray-700">
            
            {/* Título */}
            <div className="text-xl font-bold text-accent-secondary uppercase tracking-wider">
                FilixFin Workspace
            </div>

            {/* Navegação Principal */}
            <nav className="flex-1 space-y-2">
                
                {/* Link Estático: Dashboard Principal (Dinâmico por Tenant) */}
                <Link 
                    href={`/${tenantId}/dashboard`} // MODIFICAÇÃO: Rota dinâmica
                    className="flex items-center space-x-3 p-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition duration-150"
                >
                    <FaHome className="w-4 h-4 text-accent-primary" />
                    <span>Dashboard Principal</span>
                </Link>

                {/* LINKS DINÂMICOS (Baseados nas Features/Planos) */}
                {featureModules.map((item) => (
                    hasFeatureAccess(item.key) && (
                        <Link 
                            key={item.name} 
                            href={`/${tenantId}${item.href}`} // MODIFICAÇÃO: Prefixa com o tenantId
                            className="flex items-center space-x-3 p-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition duration-150"
                        >
                            <item.icon className="w-4 h-4 text-accent-primary" />
                            <span>{item.name}</span>
                        </Link>
                    )
                ))}
                
                {/* Link para área de Admin Global (Apenas se for Admin) */}
                {(user?.role === UserRole.TENANT_ADMIN) && (
                    <Link href="/admin/tenants" className="flex items-center space-x-3 p-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-700 hover:text-white transition duration-150">
                        <FaSignOutAlt className="w-4 h-4 transform rotate-180 text-violet-400" />
                        <span>Configurações Admin</span>
                    </Link>
                )}
            </nav>
            
            {/* Logout Simples */}
            <Link href="/logout" className="text-sm text-red-400 hover:text-red-500 transition border-t border-gray-700 pt-4 flex items-center space-x-2">
                <FaSignOutAlt className="w-4 h-4" />
                <span>Sair / Logout</span>
            </Link>
        </div>
    );
};