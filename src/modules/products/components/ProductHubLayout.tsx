import React, { useState } from 'react';

// Importação das Abas
import { OverviewTab } from './tabs/OverviewTab';
import { CatalogTab } from './tabs/CatalogTab';
import { MovementsTab } from './tabs/MovementsTab';
import { WarehousesTab } from './tabs/WarehousesTab';

/**
 * Definição das chaves das abas para evitar "Magic Strings"
 */
type TabKey = 'overview' | 'catalog' | 'movements' | 'warehouses';

/**
 * Interface de Props do Layout
 * Adicionamos productId como opcional (?) para permitir que este layout
 * seja usado tanto na visão geral quanto na edição de um produto específico.
 */
interface ProductHubLayoutProps {
    productId?: string;
    tenantId?: string; // Útil se precisarmos passar contexto para as abas globais
}

export function ProductHubLayout({ productId }: ProductHubLayoutProps) {
    // Define 'overview' como padrão inicial
    const [activeTab, setActiveTab] = useState<TabKey>('overview');

    /**
     * Função auxiliar para renderizar o conteúdo baseado na aba ativa.
     * Contém a lógica de proteção para a aba de Movimentações.
     */
    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <OverviewTab />;
            
            case 'catalog':
                return <CatalogTab />;
            
            case 'movements':
                // CORREÇÃO CRÍTICA DE TYPE:
                // O componente MovementsTab exige um 'variantId'.
                // Se temos productId, renderizamos a aba do produto.
                if (productId) {
                    return <MovementsTab variantId={productId} />;
                }
                
                // Se NÃO temos productId (estamos na Dashboard Geral), 
                // não podemos renderizar a MovementsTab específica.
                // Aqui mostramos um fallback ou instrução.
                return (
                    <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500 font-medium">
                            Selecione um produto no Catálogo para visualizar seu Kardex individual.
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            Ou acesse o menu "Inventário" para ver o histórico global.
                        </p>
                    </div>
                );

            case 'warehouses':
                return <WarehousesTab />;
                
            default:
                return <OverviewTab />;
        }
    };

    /**
     * Helper para classes de botão (Ativo vs Inativo)
     */
    const getTabClass = (tabName: TabKey) => {
        const baseClass = "pb-3 px-4 text-sm font-medium transition-colors duration-200 border-b-2 focus:outline-none";
        const activeClass = "border-blue-600 text-blue-600";
        const inactiveClass = "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300";

        return `${baseClass} ${activeTab === tabName ? activeClass : inactiveClass}`;
    };

    return (
        <div className="flex flex-col w-full h-full bg-gray-50 space-y-6">
            
            {/* Cabeçalho do Hub */}
            <div className="bg-white shadow-sm border-b border-gray-200 px-6 pt-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestão de Produtos</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {productId 
                                ? 'Editando Produto e visualizando detalhes.' 
                                : 'Gerencie catálogo, estoques e movimentações em um só lugar.'}
                        </p>
                    </div>
                </div>

                {/* Navegação por Abas */}
                <div className="flex space-x-4 overflow-x-auto">
                    <button 
                        onClick={() => setActiveTab('overview')} 
                        className={getTabClass('overview')}
                    >
                        Visão Geral
                    </button>
                    <button 
                        onClick={() => setActiveTab('catalog')} 
                        className={getTabClass('catalog')}
                    >
                        Catálogo
                    </button>
                    <button 
                        onClick={() => setActiveTab('movements')} 
                        className={getTabClass('movements')}
                    >
                        Movimentações
                    </button>
                    <button 
                        onClick={() => setActiveTab('warehouses')} 
                        className={getTabClass('warehouses')}
                    >
                        Depósitos
                    </button>
                </div>
            </div>

            {/* Área de Conteúdo Dinâmico */}
            <div className="flex-1 px-6 pb-6 overflow-y-auto">
                {renderContent()}
            </div>
        </div>
    );
}