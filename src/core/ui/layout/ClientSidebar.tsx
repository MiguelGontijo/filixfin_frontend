'use client';

import React from 'react';
import Link from 'next/link';
import { FaUsers, FaHome, FaSignOutAlt, FaBook, FaBox } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/core/types/user'; 

// Definição das funcionalidades/módulos e suas chaves (Mock do Backend Features)
// PORQUÊ: Usamos FeatureKeys como a fonte de verdade para decidir a visibilidade.
const featureModules = [
    // FeatureKey: CLIENTE_VIEW, Tipo: quantity
    { 
        key: 'CLIENTE_VIEW', 
        name: 'Gerenciar Clientes', 
        href: '/dashboard/clients', // CORREÇÃO: Atualizamos o caminho para a nova rota aninhada
        icon: FaUsers 
    }, 
    // MOCK: CRM (Assumindo que CRM_VIEW seria uma feature)
    { 
        key: 'CRM_VIEW', 
        name: 'CRM - Leads e Tarefas', 
        href: '/dashboard/crm', // Rota aninhada
        icon: FaBook 
    },
    // MOCK: Produtos/Estoque (Assumindo que PRODUTO_VIEW seria uma feature)
    { 
        key: 'PRODUTO_VIEW', 
        name: 'Produtos e Estoque', 
        href: '/dashboard/products', // Rota aninhada
        icon: FaBox 
    },
    // FUTURO: FATURAMENTO_MAX_NF_E (Pode ter um link para Relatórios)
];

/**
 * @component ClientSidebar
 * @description Barra de navegação lateral para as rotinas de negócio do Tenant.
 * PORQUÊ: Renderiza links dinamicamente com base na Role e no Plano (via FeatureKeys MOCK).
 */
export const ClientSidebar: React.FC = () => {
    
    const { user } = useAuth();
    
    // MOCK: Função para simular a checagem de ACL (Simplificação para esta etapa)
    // Em produção, usaríamos um hook para buscar as Features do Plano logado.
    const hasFeatureAccess = (featureKey: string) => {
        // Lógica de MOCK: Permite acesso se for TENANT_ADMIN ou se a Feature for conhecida.
        
        if (user?.role === UserRole.TENANT_ADMIN) return true;
        
        // Simulação de Feature Keys ativas (MOCK) para o Member/Guest
        return ['CLIENTE_VIEW', 'CRM_VIEW'].includes(featureKey); 
    }

    return (
        <div className="flex flex-col w-64 min-h-screen bg-base-metallic p-4 space-y-6 border-r border-gray-700">
            
            {/* Título */}
            <div className="text-xl font-bold text-accent-secondary uppercase tracking-wider">
                FilixFin Workspace
            </div>

            {/* Navegação Principal */}
            <nav className="flex-1 space-y-2">
                
                {/* Link Estático: Dashboard Principal (LegacyBehavior Removido) */}
                <Link href="/dashboard" className="flex items-center space-x-3 p-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition duration-150">
                    <FaHome className="w-4 h-4 text-accent-primary" />
                    <span>Dashboard Principal</span>
                </Link>

                {/* LINKS DINÂMICOS (Baseados nas Features/Planos) */}
                {featureModules.map((item) => (
                    hasFeatureAccess(item.key) && (
                        // MODIFICAÇÃO: legacyBehavior e <a> tag removidos. Classes aplicadas diretamente no Link.
                        <Link 
                            key={item.name} 
                            href={item.href} 
                            className="flex items-center space-x-3 p-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition duration-150"
                        >
                            <item.icon className="w-4 h-4 text-accent-primary" />
                            <span>{item.name}</span>
                        </Link>
                    )
                ))}
                
                {/* Link para área de Admin Global (LegacyBehavior Removido) */}
                {(user?.role === UserRole.TENANT_ADMIN) && (
                    <Link href="/admin/tenants" className="flex items-center space-x-3 p-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-700 hover:text-white transition duration-150">
                        <FaSignOutAlt className="w-4 h-4 transform rotate-180 text-violet-400" />
                        <span>Configurações Admin</span>
                    </Link>
                )}
            </nav>
            
            {/* Logout Simples (LegacyBehavior Removido) */}
            <Link href="/logout" className="text-sm text-red-400 hover:text-red-500 transition border-t border-gray-700 pt-4 flex items-center space-x-2">
                <FaSignOutAlt className="w-4 h-4" />
                <span>Sair / Logout</span>
            </Link>
        </div>
    );
};