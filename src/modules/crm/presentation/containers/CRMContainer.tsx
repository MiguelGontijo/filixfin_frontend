'use client';

import React, { useState, useMemo } from 'react';

// --- VISÕES DE ELITE (Mundo 2 & V4) ---
import { CRMDashboardView } from '../views/CRMDashboardView'; // 👈 Nova Visão Geral (Tower)
import { CRMCockpitView } from '../views/CRMCockpitView';
import { CRMKanbanView } from '../views/CRMKanbanView';

// --- HOOKS DE INTELIGÊNCIA & IA ---
import { useAIContextInjector } from '@/core/ai/hooks/useAIContextInjector';
import { useFilixAI } from '@/core/ai/context/FilixAIContext';

// --- ICONS & CONTRATOS ---
import { FaColumns, FaCalendarAlt, FaRocket, FaChartBar } from 'react-icons/fa';
import { Client } from '@/core/client/domain/types/client';
import { AIContextMetadata } from '@/core/ai/types/dtos/AIChatRequest.dto';
import { AppModules, FeatureKeys } from '@/core/ai/types/enums/AIEnums';

/**
 * @type CRMViewType
 * @description Define as rotas mestras de navegação do Módulo CRM.
 * 🏆 CLASSE OURO: Evolução para o padrão Tower, priorizando a inteligência (OVERVIEW).
 */
export type CRMViewType = 'OVERVIEW' | 'COCKPIT' | 'KANBAN' | 'AGENDA';

/**
 * ============================================================================
 * 🏢 COMPONENTE: CRMContainer (The Sales Control Tower)
 * @description O Grande Orquestrador do Ecossistema de Vendas. Gerencia a 
 * navegação de alto nível e a injeção neural de IA em todas as frentes.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO:
 * 1. Strategic Decoupling: Removemos o controle de pipelines e clientes deste 
 * nível, permitindo que cada View (Kanban/Cockpit) seja soberana.
 * 2. Navigation Intelligence: Implementa abas dinâmicas com feedback visual 
 * e badges de status para guiar a produtividade.
 * 3. AI Contextualization: Mapeia em tempo real onde o usuário está para que 
 * o FilixAI entregue insights cirúrgicos baseados na visão ativa.
 * ============================================================================
 */
export const CRMContainer: React.FC = () => {
    
    // ============================================================================
    // 1. ESTADOS DE NAVEGAÇÃO (MÁQUINA DE ESTADOS)
    // ============================================================================
    
    // 💡 Inicializamos na 'OVERVIEW' para dar a visão de torre ao entrar no módulo
    const [activeView, setActiveView] = useState<CRMViewType>('OVERVIEW'); 
    
    // Definição das Abas de Topo (Hierarquia de Valor)
    const tabs = [
        { id: 'OVERVIEW', label: 'Visão Geral', icon: FaChartBar },  // 📊 Inteligência
        { id: 'COCKPIT',  label: 'Cockpit 360',  icon: FaRocket },    // 🚀 Relacionamento
        { id: 'KANBAN',   label: 'Kanban Board', icon: FaColumns },   // 🗂️ Processo
        { id: 'AGENDA',   label: 'Agenda',       icon: FaCalendarAlt }, // 📅 Tempo
    ];

    // ============================================================================
    // 2. INTEGRAÇÃO NEURAL (FilixAI Sniper)
    // ============================================================================
    
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    /**
     * @constant aiMetadata
     * @description Resolve o contexto para a IA baseado na aba ativa.
     * Garante que o chat saiba se você está analisando o funil ou um cliente.
     */
    const aiMetadata = useMemo((): AIContextMetadata | undefined => {
        // Contexto: DASHBOARD/OVERVIEW
        if (activeView === 'OVERVIEW') {
            return {
                module: AppModules.CRM,
                refId: 'global_analytics',
                refName: 'Visão Geral de Vendas',
                featureLocation: 'CRM_TOWER_OVERVIEW'
            };
        }
        // Contexto: CLIENTE (Cockpit)
        if (activeView === 'COCKPIT' && selectedClient) {
            return {
                module: AppModules.CLIENTE,
                refId: selectedClient.id,
                refName: selectedClient.name,
                featureLocation: 'COCKPIT_V4_DETAIL'
            };
        }
        // Contexto: PROCESSO (Kanban)
        if (activeView === 'KANBAN') {
            return {
                module: AppModules.CRM, 
                refId: 'active_pipeline',
                refName: 'Fluxo de Vendas',
                featureLocation: 'KANBAN_BOARD_V4'
            };
        }
        return undefined; 
    }, [activeView, selectedClient]);

    // Monitoramento Neural Passivo
    useAIContextInjector(FeatureKeys.AI_SALES_MICRO, aiMetadata);

    // ============================================================================
    // 3. RENDERIZAÇÃO E LAYOUT (Tower Design)
    // ============================================================================

    return (
        <div className="flex flex-col h-full w-full bg-base-dark text-base-text overflow-hidden">
            
            {/* 🏰 HEADER: Barra de Navegação de Elite */}
            <header className="bg-base-dark border-b border-gray-800 px-6 pt-6 pb-0 sticky top-0 z-20 flex-shrink-0">
                <div className="flex flex-col space-y-6">
                    
                    {/* Linha Superior: Branding e Título Contextual */}
                    <div className="flex justify-between items-end pb-2">
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tighter animate-fade-in-down uppercase">
                                Customer Relationship <span className="text-accent-primary">Tower</span>
                            </h1>
                            <p className="text-gray-500 text-sm mt-1 font-medium animate-fade-in">
                                {activeView === 'OVERVIEW' && 'Monitoramento estratégico de performance e saúde do pipeline.'}
                                {activeView === 'COCKPIT'  && 'Central unificada de relacionamento Master-Detail.'}
                                {activeView === 'KANBAN'   && 'Gestão visual de fluxos e oportunidades.'}
                                {activeView === 'AGENDA'   && 'Calendário integrado de compromissos e tarefas.'}
                            </p>
                        </div>
                    </div>

                    {/* Navegação por Abas (Estilo Underline Shopify/Netflix) */}
                    <nav className="flex space-x-8 overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => {
                            const isActive = activeView === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveView(tab.id as CRMViewType)}
                                    className={`
                                        group flex items-center space-x-2 py-4 px-1 border-b-2 font-bold text-xs uppercase tracking-widest transition-all duration-300 whitespace-nowrap
                                        ${isActive 
                                            ? 'border-accent-primary text-accent-primary drop-shadow-[0_0_8px_rgba(255,102,0,0.3)]' 
                                            : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-700'
                                        }
                                    `}
                                >
                                    <tab.icon className={`w-3.5 h-3.5 ${isActive ? 'text-accent-primary' : 'text-gray-600 group-hover:text-gray-400'}`} />
                                    <span>{tab.label}</span>
                                    {tab.id === 'COCKPIT' && (
                                        <span className="ml-2 bg-accent-primary/10 text-accent-primary text-[8px] px-1.5 py-0.5 rounded border border-accent-primary/20 animate-pulse">
                                            Beta
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </header>

            {/* 🚀 PALCO PRINCIPAL: Renderização Dinâmica das Visões */}
            <main className="flex-1 p-6 overflow-hidden relative bg-gradient-to-b from-transparent to-base-darker/30">
                
                {/* 📊 VISÃO 1: DASHBOARD GERAL (TOWER) */}
                {activeView === 'OVERVIEW' && (
                    <CRMDashboardView />
                )}

                {/* 🚀 VISÃO 2: COCKPIT 360 (V4) */}
                {activeView === 'COCKPIT' && (
                    <CRMCockpitView 
                        selectedClient={selectedClient}
                        onSelectClient={setSelectedClient}
                        onOpenNewClient={() => setSelectedClient(null)}
                    />
                )}

                {/* 🗂️ VISÃO 3: KANBAN BOARD (CRUD INTEGRADO) */}
                {activeView === 'KANBAN' && (
                    <CRMKanbanView />
                )}

                {/* 📅 VISÃO 4: AGENDA */}
                {activeView === 'AGENDA' && (
                     <div className="flex h-full items-center justify-center text-gray-500 bg-gray-900/40 rounded-3xl border border-dashed border-gray-800 animate-fade-in">
                        <div className="text-center">
                            <FaCalendarAlt className="w-16 h-16 mx-auto mb-4 text-gray-800" />
                            <h3 className="text-xl font-bold text-gray-600 uppercase tracking-tighter">Agenda Integrada</h3>
                            <p className="text-sm text-gray-700 mt-2 max-w-xs mx-auto">Sincronização de compromissos e tarefas comerciais em tempo real.</p>
                        </div>
                     </div>
                )}

            </main>

        </div>
    );
};