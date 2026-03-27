import React, { useState, useEffect, useMemo } from 'react';

// --- COMPONENTES DAS VISÕES LEGADAS E ATUAIS ---
import { CRMCockpitView } from '../views/CRMCockpitView';
import { CRMKanbanView } from '../views/CRMKanbanView';

// --- HOOKS DE DADOS & IA ---
import { useDeals } from '../../application/hooks/useDeals';
import { usePipelines } from '../../application/hooks/usePipelines';
import { useAIContextInjector } from '@/core/ai/hooks/useAIContextInjector'; // [IA] Hook Sniper
import { useFilixAI } from '@/core/ai/context/FilixAIContext'; // [IA] Hook Widget & Draft

// --- ICONS & TYPES ---
import { FaStream, FaColumns, FaCalendarAlt, FaFilter, FaRocket } from 'react-icons/fa';
import { ConfigStage } from '../components/pipeline-manager/StageList';
import { Client } from '@/core/client/types/client';
import { DashboardMode } from '../../presentation/components/cockpit/client-dashboard/ClientDashboard';
import { AIContextMetadata } from '@/core/ai/types/dtos/AIChatRequest.dto';
import { AppModules, FeatureKeys } from '@/core/ai/types/enums/AIEnums';
import { useDealMutation } from '../../application/hooks/useDealMutation';

/**
 * @type CRMViewType
 * @description Define as rotas internas de renderização do Módulo CRM.
 * 🏆 CLASSE OURO: Adicionada a rota 'COCKPIT' para atuar como ambiente 
 * de construção paralela (Padrão Strangler Fig).
 */
export type CRMViewType = 'WORKSTATION' | 'KANBAN' | 'AGENDA' | 'COCKPIT';

/**
 * ============================================================================
 * 🏢 COMPONENTE: CRMContainer (O Orquestrador de Batalha)
 * @description Container principal do módulo de vendas. Gerencia o estado global
 * de seleção de funis, clientes e contexto de IA, distribuindo essas 
 * informações para as sub-visualizações (Views).
 * ============================================================================
 */
export const CRMContainer: React.FC = () => {
    
    // ============================================================================
    // 1. ESTADOS DE NAVEGAÇÃO & CONFIGURAÇÃO
    // ============================================================================
    
    // 💡 Para facilitar o desenvolvimento, você pode mudar o estado inicial para 'COCKPIT' depois
    const [activeView, setActiveView] = useState<CRMViewType>('WORKSTATION'); 
    
    // Configuração das Abas (Navegação de Topo)
    const tabs = [
        { id: 'COCKPIT', label: 'Cockpit 360 (V4)', icon: FaRocket }, // 👈 O Nosso Novo Canteiro de Obras
        { id: 'KANBAN', label: 'Kanban Board', icon: FaColumns },
        { id: 'AGENDA', label: 'Agenda', icon: FaCalendarAlt },
    ];

    // ============================================================================
    // 2. INTEGRAÇÃO IA (SNIPER & WIDGET) - Conexão Neural
    // ============================================================================
    
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);

    // Hook Global da IA (Para controlar o Widget e Rascunho)
    const { setInputDraft, setContext, openChat } = useFilixAI();

    // Cria o objeto de metadados dinamicamente baseado na navegação
    const aiMetadata = useMemo((): AIContextMetadata | undefined => {
        // Contexto: CLIENTE (Válido para a Workstation Legada e para o futuro Cockpit)
        if ((activeView === 'WORKSTATION' || activeView === 'COCKPIT') && selectedClient) {
            return {
                module: AppModules.CLIENTE,
                refId: selectedClient.id,
                refName: selectedClient.name,
                featureLocation: activeView === 'COCKPIT' ? 'COCKPIT_V4' : 'WORKSTATION_DETAIL'
            };
        }
        // Contexto: FUNIL DE VENDAS
        if (activeView === 'KANBAN') {
            return {
                module: AppModules.CRM, 
                refId: selectedPipelineId || 'general',
                refName: 'Pipeline View',
                featureLocation: 'KANBAN_BOARD'
            };
        }
        return undefined; 
    }, [activeView, selectedClient, selectedPipelineId]);

    // Injeta o contexto no Cérebro Global (Monitoramento Passivo)
    useAIContextInjector(FeatureKeys.AI_SALES_MICRO, aiMetadata);

    // ============================================================================
    // 3. ESTADOS DA WORKSTATION LEGADA
    // ============================================================================
    const [dashboardMode, setDashboardMode] = useState<DashboardMode>('VIEW');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [aiInputText, setAiInputText] = useState('');
    const [activeChatTab, setActiveChatTab] = useState<'WA' | 'TG' | 'AGENDA'>('WA');

    // ============================================================================
    // 4. ESTADOS DO KANBAN & DADOS GLOBAIS
    // ============================================================================
    const [isPipelineModalOpen, setIsPipelineModalOpen] = useState(false);

    const { pipelines, isLoadingPipelines: loadingPipelines } = usePipelines();
    const { 
        deals, 
        isLoading: loadingDeals, 
        error: errorDeals,
        refreshDeals 
    } = useDeals(selectedPipelineId || undefined);
    const { updateDeal } = useDealMutation();

    // Seleciona o primeiro funil automaticamente ao carregar
    useEffect(() => {
        if (!loadingPipelines && pipelines.length > 0 && !selectedPipelineId) {
            setSelectedPipelineId(pipelines[0].id);
        }
    }, [pipelines, loadingPipelines, selectedPipelineId]);

    // ============================================================================
    // 5. HANDLERS (Roteamento de Eventos)
    // ============================================================================

    // --- WORKSTATION LEGADA ---
    const handleSelectClient = (client: Client | null) => {
        setSelectedClient(client);
        setDashboardMode('VIEW');
        setAiInputText(''); 
    };

    const handleOpenNewClient = () => {
        setSelectedClient(null); 
        setDashboardMode('CREATE'); 
    };

    const handleOpenEditClient = (client: Client) => {
        setSelectedClient(client);
        setDashboardMode('EDIT');
    };

    const handleUpdateSuccess = () => {
        setRefreshTrigger(prev => prev + 1); 
        setDashboardMode('VIEW'); 
        setAiInputText('');
    };

    // --- KANBAN ---
    const handlePipelineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === '__CREATE_NEW__') {
            setIsPipelineModalOpen(true);
        } else {
            setSelectedPipelineId(value);
        }
    };

    const handleSavePipeline = async (data: { name: string; stages: ConfigStage[] }) => {
        console.log("🛠️ Criar Funil (Mock):", data);
        setIsPipelineModalOpen(false);
    };

    /**
     * Ação Mágica: Aciona a IA para sugerir o funil no modo vazio do Kanban.
     */
    const handleGeneratePipelineWithAI = () => {
        setInputDraft("Sugira uma estrutura de Funil de Vendas padrão para consultoria (ex: Lead, Qualificação, Proposta...).");
        setContext(FeatureKeys.AI_SALES_MICRO, { 
            module: AppModules.CRM, 
            refId: 'PIPELINE_CREATION', 
            refName: 'Novo Funil',
            featureLocation: 'EMPTY_STATE_SUGGESTION'
        });
        openChat();
    };

    // ============================================================================
    // 6. RENDERIZAÇÃO MONUMENTAL
    // ============================================================================

    return (
        <div className="flex flex-col h-full w-full bg-base-dark text-base-text">
            
            {/* HEADER: Padrão Ouro (Título + Abas Underline) */}
            <header className="bg-base-dark border-b border-gray-800 px-6 pt-6 pb-0 sticky top-0 z-20 flex-shrink-0">
                <div className="flex flex-col space-y-6">
                    
                    {/* Linha Superior: Título e Filtros Contextuais */}
                    <div className="flex justify-between items-end pb-2">
                        <div>
                            <h1 className="text-3xl font-bold text-base-text tracking-tight animate-fade-in-down">
                                Customer Relationship Tower
                            </h1>
                            <p className="text-gray-400 text-sm mt-1 animate-fade-in">
                                {activeView === 'WORKSTATION' 
                                    ? 'Central de comando para gestão de clientes e interações (Antiga).' 
                                    : activeView === 'COCKPIT'
                                        ? 'Nova central unificada Master-Detail de relacionamento.'
                                        : activeView === 'KANBAN'
                                            ? 'Gestão visual de oportunidades e pipeline de vendas.'
                                            : 'Calendário unificado de compromissos.'}
                            </p>
                        </div>

                        {/* Seletor de Funil (Aparece apenas no Kanban) */}
                        {activeView === 'KANBAN' && !loadingPipelines && (
                            <div className="flex items-center gap-3 animate-fade-in">
                                <div className="relative group">
                                    <FaFilter className="absolute left-3 top-3 text-gray-500 group-hover:text-accent-primary transition-colors" />
                                    <select 
                                        value={selectedPipelineId || ''}
                                        onChange={handlePipelineChange}
                                        className="pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-gray-200 focus:border-accent-primary focus:outline-none hover:bg-gray-800 transition-all cursor-pointer appearance-none min-w-[200px]"
                                    >
                                        {pipelines.length > 0 ? (
                                            pipelines.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))
                                        ) : (
                                            <option value="" disabled>Nenhum funil</option>
                                        )}
                                        <option disabled>──────────</option>
                                        <option value="__CREATE_NEW__" className="font-bold">+ Novo Funil</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navegação de Abas (Estilo Underline) */}
                    <nav className="flex space-x-8 overflow-x-auto custom-scrollbar">
                        {tabs.map((tab) => {
                            const isActive = activeView === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveView(tab.id as CRMViewType)}
                                    className={`
                                        group flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 whitespace-nowrap
                                        ${isActive 
                                            ? 'border-accent-primary text-accent-primary' 
                                            : 'border-transparent text-gray-400 hover:text-base-text hover:border-gray-700'
                                        }
                                    `}
                                >
                                    <tab.icon className={`w-4 h-4 ${isActive ? 'text-accent-primary' : 'text-gray-500 group-hover:text-gray-300'}`} />
                                    <span>{tab.label}</span>
                                    {/* Badge Beta para a aba nova */}
                                    {tab.id === 'COCKPIT' && (
                                        <span className="ml-2 bg-accent-primary/20 text-accent-primary text-[9px] font-black uppercase px-1.5 py-0.5 rounded border border-accent-primary/30">
                                            Beta
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </header>

            {/* MAIN: Conteúdo Principal */}
            <main className="flex-1 p-6 overflow-hidden animate-fade-in relative">
                
                 {/* --- VISÃO 2: O NOVO CANTEIRO DE OBRAS (Cockpit V4) --- */}
                {activeView === 'COCKPIT' && (
                    <CRMCockpitView 
                        selectedClient={selectedClient}
                        onSelectClient={handleSelectClient}
                        onOpenNewClient={handleOpenNewClient}
                    />
                )}

                {/* --- VISÃO 3: KANBAN --- */}
                {activeView === 'KANBAN' && (
                    <CRMKanbanView 
                        deals={deals}
                        isLoading={loadingDeals}
                        error={errorDeals}
                        onDealMove={updateDeal}
                        onRefresh={refreshDeals}
                        pipelineId={selectedPipelineId || undefined}
                        
                        isPipelineDrawerOpen={isPipelineModalOpen}
                        onPipelineDrawerClose={() => setIsPipelineModalOpen(false)}
                        onPipelineDrawerOpen={() => setIsPipelineModalOpen(true)}
                        onSavePipeline={handleSavePipeline}
                        onGeneratePipelineWithAI={handleGeneratePipelineWithAI}
                    />
                )}

                {/* --- VISÃO 4: AGENDA --- */}
                {activeView === 'AGENDA' && (
                     <div className="flex h-full items-center justify-center text-gray-500 bg-gray-800/20 rounded-xl border border-dashed border-gray-700">
                        <div className="text-center">
                            <FaCalendarAlt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium text-gray-400">Agenda Integrada</h3>
                            <p className="text-sm text-gray-600 mt-2">Visualize compromissos e tarefas de vendas.</p>
                        </div>
                     </div>
                )}

            </main>

        </div>
    );
};