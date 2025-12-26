// src/core/ui/layout/ClientSidebar.tsx

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { 
    FaUsers, 
    FaHome, 
    FaChartPie, 
    FaBox,          // Ícone para Cadastro Simples (Lista)
    FaBoxOpen,      // Ícone para Gestão/Hub (Caixa aberta indicando operação)
    FaTags,         // Ícone para Categorias
    FaFileInvoice,  // Ícone para Fiscal
    FaChevronLeft, 
    FaChevronRight,
    FaChevronDown,  // Ícone para o Toggle (Expandido)
    FaCalendarAlt
} from 'react-icons/fa';

/**
 * Interface para os itens de navegação
 */
interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType;
    exact?: boolean;
}

/**
 * @component ClientSidebar
 * @description Barra de navegação lateral principal do sistema Multi-Tenant.
 * * Implementa padrão de "Módulos" (Visão Estratégica) vs "Cadastros" (Visão Operacional).
 * Possui comportamento de Toggle (Acordeão) para os grupos de menu.
 */
export const ClientSidebar: React.FC = () => {
    
    // Hooks de Roteamento do Next.js
    const params = useParams();
    const pathname = usePathname();
    const tenantId = params?.tenantId as string;

    // --- Gestão de Estado da UI ---
    
    // Controla se a sidebar inteira está recolhida (apenas ícones) ou expandida
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Controla quais seções do menu estão abertas (Lógica de Toggle)
    const [sectionState, setSectionState] = useState({
        modules: true,   // Inicia aberto
        registers: true  // Inicia aberto
    });

    // Se não houver tenantId (rota raiz ou erro), não renderiza a sidebar para evitar quebras
    if (!tenantId) return null;

    // --- Definição dos Grupos de Navegação ---

    /**
     * Grupo 1: Módulos (Visões Estratégicas / Hubs)
     * Estas rotas levam para Dashboards ou Containers de Abas.
     */
    const dashboardItems: NavItem[] = [
        { 
            name: 'Visão Geral', 
            href: `/dashboard`, 
            icon: FaHome,
            exact: true 
        },
        { 
            name: 'CRM', 
            href: `/dashboard/crm`, 
            icon: FaChartPie 
        },
        { 
            name: 'Agenda', 
            href: `/dashboard/schedule`, 
            icon: FaCalendarAlt 
        },
        { 
            name: 'Gestão de Produtos', // Rota Distinta: Hub de Supply Chain
            href: `/dashboard/supply-chain`, 
            icon: FaBoxOpen 
        }
    ];

    /**
     * Grupo 2: Cadastros (Visões Operacionais / Listas)
     * Estas rotas levam para listagens simples ou CRUDs.
     */
    const registerItems: NavItem[] = [
        { 
            name: 'Clientes', 
            href: `/dashboard/clients`, 
            icon: FaUsers 
        },
        { 
            name: 'Produtos', // Rota Distinta: Lista de Produtos
            href: `/dashboard/products`, 
            icon: FaBox 
        },
        { 
            name: 'Categorias', 
            href: `/dashboard/categories`, 
            icon: FaTags 
        },
        { 
            name: 'Fiscal', 
            href: `/dashboard/fiscal`, 
            icon: FaFileInvoice 
        }
    ];

    // --- Helpers de Lógica e Estilo ---
    
    // Função para alternar a visibilidade de uma seção
    const toggleSection = (section: 'modules' | 'registers') => {
        setSectionState(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Verifica se a rota atual corresponde ao link para aplicar o highlight
    const isActive = (href: string, exact = false) => {
        const fullPath = `/${tenantId}${href}`;
        if (exact) {
            return pathname === fullPath || pathname === `${fullPath}/`;
        }
        return pathname?.startsWith(fullPath);
    };

    // Classes condicionais baseadas no estado de colapso
    const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';
    const linkPadding = isCollapsed ? 'justify-center px-2' : 'px-4';
    const hideText = isCollapsed ? 'hidden' : 'block';

    /**
     * Renderiza um link de navegação individual
     */
    const renderNavLink = (item: NavItem) => {
        const active = isActive(item.href, item.exact);
        
        return (
            <Link 
                key={item.href}
                href={`/${tenantId}${item.href}`}
                className={`flex items-center space-x-3 py-3 mx-2 mb-1 rounded-lg transition-all duration-200 group relative ${
                    active 
                    ? 'bg-gray-800 text-white shadow-md border-l-4 border-accent-primary' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white border-l-4 border-transparent'
                } ${linkPadding}`}
                title={isCollapsed ? item.name : ''} // Tooltip nativo quando recolhido
            >
                <item.icon 
                    className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${
                        active ? 'text-accent-primary' : 'group-hover:text-accent-primary'
                    }`} 
                />
                
                <span className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-opacity duration-200 ${hideText}`}>
                    {item.name}
                </span>

                {/* Indicador visual extra para item ativo quando expandido */}
                {active && !isCollapsed && (
                    <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse" />
                )}
            </Link>
        );
    };

    /**
     * Renderiza o cabeçalho de uma seção (Botão de Toggle)
     * Só é interativo quando a sidebar está expandida.
     */
    const renderSectionHeader = (label: string, sectionKey: 'modules' | 'registers') => {
        // Se a sidebar estiver recolhida (fina), escondemos o cabeçalho para limpar a UI
        if (isCollapsed) return <div className="h-4" />; 

        const isOpen = sectionState[sectionKey];

        return (
            <button 
                onClick={() => toggleSection(sectionKey)}
                className="w-full flex items-center justify-between px-6 mb-2 mt-4 text-gray-500 hover:text-gray-300 transition-colors group"
            >
                <span className="text-[10px] font-bold uppercase tracking-wider">
                    {label}
                </span>
                {/* Ícone de Seta que gira */}
                <FaChevronDown 
                    className={`w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-0' : '-rotate-90'}`} 
                />
            </button>
        );
    };

    return (
        <div 
            className={`relative flex flex-col min-h-screen bg-gray-900 border-r border-gray-700 transition-all duration-300 ease-in-out ${sidebarWidth}`}
        >
            
            {/* --- CONTROLE DE EXPANSÃO (Botão Flutuante) --- */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-8 bg-gray-700 text-white p-1.5 rounded-full border border-gray-600 shadow-lg hover:bg-accent-primary hover:border-accent-primary transition-all z-50 focus:outline-none"
                title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
            >
                {isCollapsed ? <FaChevronRight className="w-3 h-3" /> : <FaChevronLeft className="w-3 h-3" />}
            </button>

            {/* --- HEADER (Marca) --- */}
            <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} overflow-hidden border-b border-gray-700/50 mb-2 h-20`}>
                {isCollapsed ? (
                    <span className="text-2xl font-extrabold text-accent-primary cursor-default animate-fade-in">F</span>
                ) : (
                    <div className="flex flex-col animate-fade-in">
                        <span className="text-xl font-bold text-accent-secondary uppercase tracking-wider whitespace-nowrap">
                            filix_control
                        </span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Workspace Enterprise</span>
                    </div>
                )}
            </div>

            {/* --- ÁREA DE NAVEGAÇÃO (Scrollável) --- */}
            <nav className="flex-1 overflow-y-auto custom-scrollbar py-2">
                
                {/* --- SEÇÃO 1: MÓDULOS --- */}
                {renderSectionHeader('Módulos', 'modules')}
                
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    // Se estiver colapsado, ignora o estado do toggle e mostra sempre (para acessibilidade dos ícones)
                    // Se estiver expandido, respeita o toggle
                    (isCollapsed || sectionState.modules) ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                }`}>
                    {dashboardItems.map(renderNavLink)}
                </div>

                {/* Separador Sutil (apenas se expandido e ambas seções abertas) */}
                {!isCollapsed && sectionState.modules && sectionState.registers && (
                    <div className="my-2 border-t border-gray-800/50 mx-4" />
                )}

                {/* --- SEÇÃO 2: CADASTROS --- */}
                {renderSectionHeader('Cadastros', 'registers')}

                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    (isCollapsed || sectionState.registers) ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                }`}>
                    {registerItems.map(renderNavLink)}
                </div>

            </nav>
            
            {/* --- RODAPÉ (Versão/Status) --- */}
            <div className={`p-4 border-t border-gray-700 text-center ${hideText} transition-opacity duration-300`}>
                <div className="flex flex-col items-center">
                    <p className="text-[10px] text-gray-500 font-medium">FilixFin v1.2.0</p>
                    <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mt-1" title="Sistema Online"></span>
                </div>
            </div>
        </div>
    );
};