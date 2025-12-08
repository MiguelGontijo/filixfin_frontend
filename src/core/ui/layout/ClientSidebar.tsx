// src/core/ui/layout/ClientSidebar.tsx

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { 
    FaUsers, 
    FaHome, 
    FaChartPie, 
    FaBox, 
    FaChevronLeft, 
    FaChevronRight 
} from 'react-icons/fa';

/**
 * @component ClientSidebar
 * @description Barra de navegação lateral estruturada por contexto (Módulos vs Cadastros).
 * @update Removidos Admin e Logout. Reorganizado em seções lógicas.
 */
export const ClientSidebar: React.FC = () => {
    
    const params = useParams();
    const pathname = usePathname();
    const tenantId = params?.tenantId as string;

    const [isCollapsed, setIsCollapsed] = useState(false);

    if (!tenantId) return null;

    // --- Definição dos Grupos de Navegação ---
    
    const dashboardItems = [
        { 
            name: 'Visão Geral', 
            href: `/dashboard`, // Rota raiz do dashboard
            icon: FaHome,
            exact: true 
        },
        { 
            name: 'CRM', 
            href: `/dashboard/crm`, 
            icon: FaChartPie,
            exact: false 
        }
    ];

    const registerItems = [
        { 
            name: 'Clientes', 
            href: `/dashboard/clients`, 
            icon: FaUsers 
        },
        { 
            name: 'Produtos', 
            href: `/dashboard/products`, 
            icon: FaBox 
        }
    ];

    // --- Helpers de Estilo ---
    
    const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';
    const linkPadding = isCollapsed ? 'justify-center px-2' : 'px-4';
    const hideText = isCollapsed ? 'hidden' : 'block';
    const sectionLabelClass = isCollapsed ? 'hidden' : 'block text-[10px] font-bold uppercase text-gray-500 tracking-wider px-4 mb-2 mt-4';

    // Verifica se a rota está ativa
    const isActive = (href: string, exact = false) => {
        const fullPath = `/${tenantId}${href}`;
        if (exact) {
            return pathname === fullPath || pathname === `${fullPath}/`;
        }
        return pathname?.startsWith(fullPath);
    };

    return (
        <div 
            className={`relative flex flex-col min-h-screen bg-base-metallic border-r border-gray-700 transition-all duration-300 ease-in-out ${sidebarWidth}`}
        >
            
            {/* Botão de Toggle (Colapso) */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-8 bg-gray-700 text-white p-1 rounded-full border border-gray-600 shadow-md hover:bg-accent-primary transition z-50"
                title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
            >
                {isCollapsed ? <FaChevronRight className="w-3 h-3" /> : <FaChevronLeft className="w-3 h-3" />}
            </button>

            {/* Logo / Marca */}
            <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} overflow-hidden border-b border-gray-700/50 mb-2`}>
                {isCollapsed ? (
                    <span className="text-xl font-extrabold text-accent-primary cursor-default">F</span>
                ) : (
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-accent-secondary uppercase tracking-wider whitespace-nowrap">
                            filix_control
                        </span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">Workspace</span>
                    </div>
                )}
            </div>

            {/* --- NAVEGAÇÃO --- */}
            <nav className="flex-1 overflow-y-auto custom-scrollbar py-2 space-y-1">
                
                {/* GRUPO 1: DASHBOARDS (Seletor Principal) */}
                <div className={sectionLabelClass}>Módulos</div>
                
                {dashboardItems.map((item) => (
                    <Link 
                        key={item.href}
                        href={`/${tenantId}${item.href}`}
                        className={`flex items-center space-x-3 py-3 mx-2 rounded-lg transition duration-150 group ${
                            isActive(item.href, item.exact) 
                            ? 'bg-gray-700 text-white shadow-sm border-l-4 border-accent-primary' 
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white border-l-4 border-transparent'
                        } ${linkPadding}`}
                        title={item.name}
                    >
                        <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive(item.href, item.exact) ? 'text-accent-primary' : 'group-hover:text-accent-primary transition-colors'}`} />
                        <span className={`text-sm font-medium whitespace-nowrap ${hideText}`}>{item.name}</span>
                    </Link>
                ))}

                {/* Separador Visual */}
                <div className="my-4 border-t border-gray-700/50 mx-4"></div>

                {/* GRUPO 2: CADASTROS */}
                <div className={sectionLabelClass}>Cadastros</div>

                {registerItems.map((item) => (
                    <Link 
                        key={item.href}
                        href={`/${tenantId}${item.href}`}
                        className={`flex items-center space-x-3 py-3 mx-2 rounded-lg transition duration-150 group ${
                            isActive(item.href) 
                            ? 'bg-gray-700 text-white shadow-sm' 
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        } ${linkPadding}`}
                        title={item.name}
                    >
                        <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive(item.href) ? 'text-accent-secondary' : 'group-hover:text-accent-secondary transition-colors'}`} />
                        <span className={`text-sm font-medium whitespace-nowrap ${hideText}`}>{item.name}</span>
                    </Link>
                ))}

            </nav>
            
            {/* Rodapé (Opcional: Versão do App) */}
            <div className={`p-4 border-t border-gray-700 text-center ${hideText}`}>
                <p className="text-[10px] text-gray-600">v1.0.0 Enterprise</p>
            </div>
        </div>
    );
};