'use client';

import { ClientRegistry } from '@/core/client/registries/ClientRegistry';
import { DealRegistry } from '@/modules/crm/registries/DealRegistry';
import { PipelineRegistry } from '@/modules/crm/registries/PipelineRegistry';
import { FiscalRegistry } from '@/modules/fiscal/registries/FiscalRegistry';
import { InventoryRegistry } from '@/modules/inventory/registries/InventoryRegistry';
import { WarehouseRegistry } from '@/modules/inventory/registries/WarehouseRegistry';
import { CategoryRegistry } from '@/modules/products/registries/CategoryRegistry';
import { ProductRegistry } from '@/modules/products/registries/ProductRegistry';
import React, { useState, useMemo } from 'react';
import { 
    FaBoxOpen, 
    FaChartLine, 
    FaFileInvoiceDollar, 
    FaTags, 
    FaCogs, 
    FaDatabase,
    FaBalanceScale
} from 'react-icons/fa';

// =========================================================================
// 📥 IMPORTS DOS REGISTROS (A Figueira Estranguladora crescendo)
// Conforme você for criando as telas novas com o CrudLayout, importe-as aqui.
// =========================================================================
// Exemplo: import { CategoryRegistry } from '@/modules/products/registries/CategoryRegistry';

// --- COMPONENTE PLACEHOLDER (Para as telas que ainda não existem) ---
const RegistryPlaceholder: React.FC<{ title: string, icon: React.ReactNode }> = ({ title, icon }) => (
    <div className="h-full border-2 border-dashed border-gray-800 bg-base-metallic/10 rounded-2xl flex flex-col items-center justify-center text-gray-500 animate-fade-in">
        <div className="text-4xl mb-4 opacity-20">{icon}</div>
        <h3 className="text-xl font-bold text-gray-400 tracking-tight">{title}</h3>
        <p className="text-sm mt-2 max-w-md text-center opacity-60">
            Este cadastro está na fila de migração para o novo Motor V3. Em breve estará disponível aqui.
        </p>
    </div>
);

// =========================================================================
// ⚙️ O COMPONENTE MESTRE
// =========================================================================
export const CadastrosContainer: React.FC = () => {
    
    // O Estado que guarda o ID do cadastro atualmente visível na tela
    const [activeRegistryId, setActiveRegistryId] = useState<string>('PRODUCTS');

    // =========================================================================
    // 🗺️ O MAPA DE NAVEGAÇÃO (Menu Lateral)
    // Agrupamento lógico por Módulos (Bounded Contexts do DDD).
    // =========================================================================
    const menuGroups = useMemo(() => [
        {
            module: 'CRM & Vendas',
            icon: <FaChartLine />,
            items: [
                { id: 'CLIENTS', label: 'Clientes' },
                { id: 'DEALS', label: 'Deals' },
                { id: 'PIPELINES', label: 'Pipelines' },
            ]
        },
        {
            module: 'Produtos & Estoque',
            icon: <FaBoxOpen />,
            items: [
                { id: 'PRODUCTS', label: 'Produtos' },
                { id: 'CATEGORIES', label: 'Categorias de Produto' },
                { id: 'WAREHOUSES', label: 'Warehouses' },
                { id: 'INVENTORY', label: 'Inventário' },
            ]
        },
        {
            module: 'Fiscal & Tributário',
            icon: <FaFileInvoiceDollar />,
            items: [
                { id: 'FISCAL_GROUPS', label: 'Grupos Fiscais' },
            ]
        },
        {
            module: 'Sistema',
            icon: <FaCogs />,
            items: [
                { id: 'USERS', label: 'Usuários & Permissões' },
            ]
        }
    ], []);

    // =========================================================================
    // 🔀 O ROTEADOR INTERNO (Dicionário de Componentes)
    // Complexidade O(1). Renderiza o componente exato baseado no ID selecionado.
    // =========================================================================
    const registryComponents: Record<string, React.ReactNode> = {
        // MÓDULO: PRODUTOS
        'PRODUCTS': < ProductRegistry/>,
        'CATEGORIES': <CategoryRegistry />,
        'WAREHOUSES': <WarehouseRegistry />,
        'INVENTORY': <InventoryRegistry />,
        
        // MÓDULO: CRM
        'CLIENTS': <ClientRegistry/>,
        'DEALS': <DealRegistry/>,
        'PIPELINES': <PipelineRegistry/>,
        
        // MÓDULO: FISCAL
        'FISCAL_GROUPS': <FiscalRegistry />,

        // MÓDULO: SISTEMA
        'USERS': <RegistryPlaceholder title="Usuários & Permissões" icon={<FaCogs />} />,
    };

    // =========================================================================
    // 🎨 RENDERIZAÇÃO
    // =========================================================================
    return (
        <div className="flex h-full w-full bg-base-dark text-base-text overflow-hidden">
            
            {/* --- BARRA LATERAL (MENU DE CADASTROS) --- */}
            <aside className="w-72 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col h-full z-10">
                
                {/* Header da Sidebar */}
                <div className="p-6 border-b border-gray-800/50 shrink-0">
                    <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        <FaDatabase className="text-accent-primary" />
                        Master Data
                    </h1>
                    <p className="text-[11px] text-gray-500 uppercase tracking-widest mt-2 font-bold">
                        Central de Cadastros
                    </p>
                </div>

                {/* Lista de Navegação Scrollável */}
                <nav className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                    {menuGroups.map((group, groupIdx) => (
                        <div key={groupIdx} className="animate-fade-in" style={{ animationDelay: `${groupIdx * 50}ms` }}>
                            
                            {/* Título do Grupo */}
                            <h3 className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-2 select-none">
                                <span className="opacity-70">{group.icon}</span>
                                {group.module}
                            </h3>
                            
                            {/* Botões (Tabelas) */}
                            <ul className="space-y-1">
                                {group.items.map((item) => {
                                    const isActive = activeRegistryId === item.id;
                                    return (
                                        <li key={item.id}>
                                            <button
                                                onClick={() => setActiveRegistryId(item.id)}
                                                className={`
                                                    w-full flex items-center justify-between px-3 py-2 rounded-lg 
                                                    text-sm font-medium transition-all duration-200 focus:outline-none
                                                    ${isActive 
                                                        ? 'bg-accent-primary/10 text-accent-primary shadow-sm ring-1 ring-accent-primary/20' 
                                                        : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                                                    }
                                                `}
                                            >
                                                <span className="truncate">{item.label}</span>
                                                
                                                {/* Indicador de seleção ativo sutil à direita */}
                                                {isActive && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-accent-primary shadow-[0_0_8px_rgba(255,94,26,0.8)]"></span>
                                                )}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>
            </aside>

            {/* --- ÁREA PRINCIPAL (O PALCO DOS CRUDS) --- */}
            <main className="flex-1 h-full min-w-0 bg-base-dark relative">
                {/* O padding aqui é estratégico: 
                    Dá espaço para o CrudLayout respirar e preencher a tela com elegância.
                */}
                <div className="absolute inset-0 p-8 overflow-hidden">
                    {registryComponents[activeRegistryId]}
                </div>
            </main>

        </div>
    );
};