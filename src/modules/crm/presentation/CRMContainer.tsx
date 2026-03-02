// ===== FILE: src/modules/crm/presentation/CRMContainer.tsx =====

import React, { useState, useEffect, useMemo } from 'react';

// --- COMPONENTES DAS VISÕES ---
import { CRMKanbanView } from './CRMKanbanView';
import { CRMWorkstation } from './CRMWorkstation';

// --- HOOKS DE DADOS & IA ---
import { useDeals } from '../hooks/useDeals';
import { usePipelines } from '../hooks/usePipelines';
import { useCRMIntelligence } from '../hooks/useCRMIntelligence';
import { useAIContextInjector } from '@/core/ai/hooks/useAIContextInjector'; // [IA] Hook Sniper
import { useFilixAI } from '@/core/ai/context/FilixAIContext'; // [IA] Hook Widget & Draft

// --- ICONS & TYPES ---
import { FaStream, FaColumns, FaCalendarAlt, FaFilter } from 'react-icons/fa';
import { ConfigStage } from '../components/pipeline-manager/StageList';
import { Client } from '@/core/types/client';
import { DashboardMode } from '../components/client-dashboard/ClientDashboard';
import { AIContextMetadata } from '@/core/ai/types/dtos/AIChatRequest.dto';

// Definição das Views do CRM
export type CRMViewType = 'WORKSTATION' | 'KANBAN' | 'AGENDA';

export const CRMContainer: React.FC = () => {
    
    // ============================================================================
    // 1. ESTADOS DE NAVEGAÇÃO & CONFIG
    // ============================================================================
    const [activeView, setActiveView] = useState<CRMViewType>('WORKSTATION'); 
    
    // Configuração das Abas (Padrão Supply Chain)
    const tabs = [
        { id: 'WORKSTATION', label: 'Workstation', icon: FaStream },
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
        // Se estiver na Workstation com cliente selecionado -> Contexto: CLIENTE
        if (activeView === 'WORKSTATION' && selectedClient) {
            return {
                refType: 'CLIENT',
                refId: selectedClient.id,
                refName: selectedClient.name,
                featureLocation: 'WORKSTATION_DETAIL'
            };
        }
        // Se estiver no Kanban -> Contexto: FUNIL DE VENDAS
        if (activeView === 'KANBAN') {
            return {
                refType: 'DEAL', 
                refId: selectedPipelineId || 'general',
                refName: 'Pipeline View',
                featureLocation: 'KANBAN_BOARD'
            };
        }
        return undefined; // Sem contexto específico (Visão Geral)
    }, [activeView, selectedClient, selectedPipelineId]);

    // Injeta o contexto no Cérebro Global (Monitoramento Passivo)
    useAIContextInjector('AI_SALES_AGENT', aiMetadata);

    // ============================================================================
    // 3. ESTADOS DA WORKSTATION
    // ============================================================================
    const [dashboardMode, setDashboardMode] = useState<DashboardMode>('VIEW');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [aiInputText, setAiInputText] = useState('');
    const [activeChatTab, setActiveChatTab] = useState<'WA' | 'TG' | 'AGENDA'>('WA');

    const { 
        analyzeText, 
        analysisResult, 
        isAnalyzing, 
        error: aiError, 
        clearAnalysis 
    } = useCRMIntelligence();

    // ============================================================================
    // 4. ESTADOS DO KANBAN & DADOS
    // ============================================================================
    const [isPipelineModalOpen, setIsPipelineModalOpen] = useState(false);

    const { pipelines, isLoadingPipelines: loadingPipelines } = usePipelines();
    const { 
        deals, 
        isLoading: loadingDeals, 
        error: errorDeals,
        updateDeal,
        refreshDeals 
    } = useDeals(selectedPipelineId || undefined);

    // Seleciona o primeiro funil automaticamente ao carregar
    useEffect(() => {
        if (!loadingPipelines && pipelines.length > 0 && !selectedPipelineId) {
            setSelectedPipelineId(pipelines[0].id);
        }
        // setContext('AI_SALES_AGENT')
    }, [pipelines, loadingPipelines, selectedPipelineId]);

    // ============================================================================
    // 5. HANDLERS
    // ============================================================================

    // --- WORKSTATION ---
    const handleSelectClient = (client: Client | null) => {
        setSelectedClient(client);
        setDashboardMode('VIEW');
        clearAnalysis(); 
        setAiInputText(''); 
    };

    const handleOpenNewClient = () => {
        setSelectedClient(null); 
        setDashboardMode('CREATE'); 
        clearAnalysis();
    };

    const handleOpenEditClient = (client: Client) => {
        setSelectedClient(client);
        setDashboardMode('EDIT');
    };

    const handleUpdateSuccess = () => {
        setRefreshTrigger(prev => prev + 1); 
        setDashboardMode('VIEW'); 
        clearAnalysis(); 
        setAiInputText('');
    };

    const handleAnalyzeRequest = (text: string) => {
        analyzeText(text, selectedClient?.id);
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
     * Ação Mágica: Aciona a IA para sugerir o funil.
     * Não redireciona mais! Abre o widget sobre o Kanban.
     */
    const handleGeneratePipelineWithAI = () => {
        // 1. Define o Rascunho (Sugestão sem enviar automaticamente)
        setInputDraft("Sugira uma estrutura de Funil de Vendas padrão para consultoria (ex: Lead, Qualificação, Proposta...).");
        
        // 2. Define o Contexto de Setup (Sniper)
        // Isso avisa a IA que estamos configurando o sistema, não vendendo
        setContext('AI_SALES_AGENT', { 
            refType: 'SETUP', 
            refId: 'PIPELINE_CREATION', 
            refName: 'Novo Funil',
            featureLocation: 'EMPTY_STATE_SUGGESTION'
        });

        // 3. Abre o Widget (Se estiver fechado)
        // O usuário verá o chat abrir com o texto pronto para enviar/editar
        openChat();
    };

    // ============================================================================
    // 6. RENDERIZAÇÃO
    // ============================================================================

    return (
        // BASE: Fundo Escuro Sólido (Igual Supply Chain)
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
                                    ? 'Central de comando para gestão de clientes e interações.' 
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
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </header>

            {/* MAIN: Conteúdo Principal */}
            <main className="flex-1 p-6 overflow-hidden animate-fade-in relative">
                
                {activeView === 'WORKSTATION' && (
                    <CRMWorkstation 
                        contextClient={selectedClient}
                        dashboardMode={dashboardMode}
                        refreshListTrigger={refreshTrigger}
                        aiInputText={aiInputText}
                        isAnalyzing={isAnalyzing}
                        analysisResult={analysisResult}
                        aiError={aiError}
                        originalText={aiInputText}
                        activeChatTab={activeChatTab}
                        onAiInputChange={setAiInputText}
                        onAnalyzeRequest={handleAnalyzeRequest}
                        onClearAnalysis={clearAnalysis}
                        onAnalysisSuccess={handleUpdateSuccess}
                        onSelectClient={handleSelectClient}
                        onOpenNewClient={handleOpenNewClient}
                        onOpenEditClient={handleOpenEditClient}
                        onModeChange={setDashboardMode}
                        onUpdateSuccess={handleUpdateSuccess}
                        onTabChange={setActiveChatTab}
                    />
                )}

                {activeView === 'KANBAN' && (
                    <CRMKanbanView 
                        deals={deals}
                        isLoading={loadingDeals}
                        error={errorDeals}
                        onDealMove={updateDeal}
                        onRefresh={refreshDeals}
                        pipelineId={selectedPipelineId || undefined}
                        
                        // Controle do Drawer Manual
                        isPipelineDrawerOpen={isPipelineModalOpen}
                        onPipelineDrawerClose={() => setIsPipelineModalOpen(false)}
                        onPipelineDrawerOpen={() => setIsPipelineModalOpen(true)}
                        onSavePipeline={handleSavePipeline}
                        
                        // Controle da IA (Agora Corrigido!)
                        onGeneratePipelineWithAI={handleGeneratePipelineWithAI}
                    />
                )}

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