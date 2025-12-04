// src/core/ui/layout/ClientSidebar.tsx

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation'; 
import { FaUsers, FaHome, FaSignOutAlt, FaBook, FaBox, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/core/types/user';

// Definição das funcionalidades/módulos
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
 * @description Barra de navegação lateral retrátil para as rotinas de negócio.
 * @update Adicionado suporte a colapso (Retrátil) para otimizar espaço de tela.
 */
export const ClientSidebar: React.FC = () => {
    
    const { user } = useAuth();
    const params = useParams();
    const pathname = usePathname(); // Para destacar o link ativo
    const tenantId = params?.tenantId as string;
    
    // Estado de controle da Sidebar (Expandida/Recolhida)
    const [isCollapsed, setIsCollapsed] = useState(false);

    // MOCK ACL
    const hasFeatureAccess = (featureKey: string) => {
        if (user?.role === UserRole.TENANT_ADMIN) return true;
        return ['CLIENTE_VIEW', 'CRM_VIEW'].includes(featureKey); 
    }

    if (!tenantId) return null;

    // Classes dinâmicas baseadas no estado
    const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';
    const linkPadding = isCollapsed ? 'justify-center px-2' : 'px-4';
    const hideText = isCollapsed ? 'hidden' : 'block';

    // Helper para verificar rota ativa
    const isActive = (path: string) => pathname?.includes(path);

    return (
        <div 
            className={`relative flex flex-col min-h-screen bg-base-metallic border-r border-gray-700 transition-all duration-300 ease-in-out ${sidebarWidth}`}
        >
            
            {/* Botão de Toggle (Aba) */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-8 bg-gray-700 text-white p-1 rounded-full border border-gray-600 shadow-md hover:bg-accent-primary transition z-50"
                title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
            >
                {isCollapsed ? <FaChevronRight className="w-3 h-3" /> : <FaChevronLeft className="w-3 h-3" />}
            </button>

            {/* Título / Logo */}
            <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} overflow-hidden`}>
                {isCollapsed ? (
                    <span className="text-xl font-extrabold text-accent-primary cursor-default">F</span>
                ) : (
                    <div className="text-xl font-bold text-accent-secondary uppercase tracking-wider whitespace-nowrap">
                        FilixFin <span className="text-white text-xs block normal-case font-normal opacity-50">Workspace</span>
                    </div>
                )}
            </div>

            {/* Navegação Principal */}
            <nav className="flex-1 space-y-2 py-4">
                
                {/* Dashboard Principal */}
                <Link 
                    href={`/${tenantId}/dashboard`}
                    className={`flex items-center space-x-3 py-3 mx-2 rounded-lg transition duration-150 group ${
                        isActive('/dashboard') && !isActive('/dashboard/') // Exato ou raiz
                        ? 'bg-gray-700 text-white' 
                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    } ${linkPadding}`}
                    title="Dashboard Principal"
                >
                    <FaHome className={`w-5 h-5 flex-shrink-0 ${isActive('/dashboard') && !isActive('/dashboard/') ? 'text-accent-primary' : 'group-hover:text-accent-primary'}`} />
                    <span className={`text-sm font-medium whitespace-nowrap ${hideText}`}>Dashboard</span>
                </Link>

                {/* LINKS DINÂMICOS */}
                {featureModules.map((item) => (
                    hasFeatureAccess(item.key) && (
                        <Link 
                            key={item.name} 
                            href={`/${tenantId}${item.href}`}
                            className={`flex items-center space-x-3 py-3 mx-2 rounded-lg transition duration-150 group ${
                                isActive(item.href) 
                                ? 'bg-gray-700 text-white' 
                                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            } ${linkPadding}`}
                            title={item.name}
                        >
                            <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive(item.href) ? 'text-accent-primary' : 'group-hover:text-accent-primary'}`} />
                            <span className={`text-sm font-medium whitespace-nowrap ${hideText}`}>{item.name}</span>
                        </Link>
                    )
                ))}
                
                {/* Separador */}
                <div className="my-4 border-t border-gray-700 mx-4 opacity-50"></div>

                {/* Link Admin */}
                {(user?.role === UserRole.TENANT_ADMIN) && (
                    <Link 
                        href="/admin/tenants" 
                        className={`flex items-center space-x-3 py-3 mx-2 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition duration-150 group ${linkPadding}`}
                        title="Configurações Admin"
                    >
                        <FaSignOutAlt className="w-5 h-5 flex-shrink-0 transform rotate-180 text-violet-400 group-hover:text-white" />
                        <span className={`text-sm font-medium whitespace-nowrap ${hideText}`}>Admin</span>
                    </Link>
                )}
            </nav>
            
            {/* Logout */}
            <div className="p-4 border-t border-gray-700">
                <Link 
                    href="/logout" 
                    className={`flex items-center space-x-2 text-sm text-red-400 hover:text-red-500 transition hover:bg-red-900/10 rounded-lg py-2 ${linkPadding}`}
                    title="Sair"
                >
                    <FaSignOutAlt className="w-5 h-5 flex-shrink-0" />
                    <span className={`font-medium whitespace-nowrap ${hideText}`}>Sair</span>
                </Link>
            </div>
        </div>
    );
};