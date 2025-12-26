'use client';

import React, { useState, useEffect } from 'react';
import { 
    FaChartPie, 
    FaBox, 
    FaExchangeAlt, 
    FaWarehouse, 
    FaTags, 
    FaFileInvoiceDollar 
} from 'react-icons/fa';

// --- Imports de Componentes Locais (Módulo Products) ---
import { OverviewTab } from '../components/tabs/OverviewTab';
import { CatalogTab } from '../components/tabs/CatalogTab';
import { MovementsTab } from '../components/tabs/MovementsTab';
import { WarehousesTab } from '../components/tabs/WarehousesTab';
import { CategoriesTab } from '../components/tabs/CategoriesTab'; // Novo Componente

// --- Imports Cross-Module (Reutilização de Componentes Existentes) ---
import { FiscalList } from '../../fiscal/components/FiscalList';
import { useAIContextInjector } from '@/core/ai/hooks/useAIContextInjector';

export type ProductViewType = 
    | 'OVERVIEW'
    | 'CATALOG'
    | 'MOVEMENTS'
    | 'WAREHOUSES'
    | 'CATEGORIES'
    | 'FISCAL';

interface ProductContainerProps {
    initialView?: ProductViewType;
}

/**
 * @component ProductContainer
 * @description Hub Principal de Supply Chain.
 * @style Dark/Metallic (Seguindo Design System)
 */
export const ProductContainer: React.FC<ProductContainerProps> = ({ 
    initialView = 'CATALOG' 
}) => {
    
    useAIContextInjector('SUPPLY_CHAIN');
    
    const [activeView, setActiveView] = useState<ProductViewType>(initialView);

    useEffect(() => {
        if (initialView) {
            setActiveView(initialView);
        }
    }, [initialView]);

    const tabs = [
        { id: 'OVERVIEW', label: 'Visão Geral', icon: FaChartPie },
        { id: 'CATALOG', label: 'Catálogo', icon: FaBox },
        { id: 'MOVEMENTS', label: 'Movimentações', icon: FaExchangeAlt },
        { id: 'WAREHOUSES', label: 'Depósitos', icon: FaWarehouse },
        { id: 'CATEGORIES', label: 'Categorias', icon: FaTags },
        { id: 'FISCAL', label: 'Fiscal', icon: FaFileInvoiceDollar },
    ];

    const renderContent = () => {
        switch (activeView) {
            case 'OVERVIEW':
                return <OverviewTab />;
            case 'CATALOG':
                return <CatalogTab />;
            case 'MOVEMENTS':
                return <MovementsTab />;
            case 'WAREHOUSES':
                return <WarehousesTab />;
            case 'CATEGORIES':
                // Nova implementação: Componente nativo do módulo Products
                return <CategoriesTab />;
            case 'FISCAL':
                return (
                    // Wrapper estilizado com tema Metálico para listas externas (Fiscal ainda é legado)
                    <div className="bg-base-metallic rounded-xl shadow-lg border border-gray-700 overflow-hidden min-h-[500px]">
                        <FiscalList />
                    </div>
                );
            default:
                return <OverviewTab />;
        }
    };

    return (
        // BASE: Fundo Escuro (#111827) e Texto Claro (#F3F4F6)
        <div className="flex flex-col h-full w-full bg-base-dark text-base-text">
            
            {/* HEADER: Fundo Escuro com Borda Sutil para separar do conteúdo */}
            <header className="bg-base-dark border-b border-gray-800 px-8 pt-8 pb-0 sticky top-0 z-20">
                <div className="flex flex-col space-y-6">
                    
                    {/* Título e Ações */}
                    <div className="flex justify-between items-center pb-2">
                        <div>
                            <h1 className="text-3xl font-bold text-base-text tracking-tight animate-fade-in-down">
                                {activeView === 'OVERVIEW' ? 'Supply Chain Tower' : 'Gestão de Materiais'}
                            </h1>
                            <p className="text-gray-400 text-sm mt-1 animate-fade-in">
                                {activeView === 'OVERVIEW' 
                                    ? 'Monitoramento estratégico de estoque e movimentações.' 
                                    : 'Controle operacional e cadastros de produtos.'}
                            </p>
                        </div>
                    </div>

                    {/* Navegação de Abas */}
                    <nav className="flex space-x-8 overflow-x-auto custom-scrollbar">
                        {tabs.map((tab) => {
                            const isActive = activeView === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveView(tab.id as ProductViewType)}
                                    className={`
                                        group flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 whitespace-nowrap
                                        ${isActive 
                                            ? 'border-accent-primary text-accent-primary' // Ativo: Laranja Vibrante
                                            : 'border-transparent text-gray-400 hover:text-base-text hover:border-gray-700' // Inativo: Cinza -> Claro
                                        }
                                    `}
                                >
                                    <tab.icon className={`w-4 h-4 ${isActive ? 'text-accent-primary' : 'text-gray-500 group-hover:text-gray-300'}`} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </header>

            {/* MAIN: Conteúdo com Fundo Transparente (herda base-dark) */}
            <main className="flex-1 p-8 overflow-y-auto animate-fade-in custom-scrollbar">
                {renderContent()}
            </main>

        </div>
    );
};