// src/modules/crm/presentation/CRMContainer.tsx

import React, { useState, useEffect } from 'react';

// --- COMPONENTES DAS VISÕES ---
import { CRMKanbanView } from './CRMKanbanView';
// import { CRMWorkstationView } from './CRMWorkstationView'; // (Futuro)
// import { CRMAgendaView } from './CRMAgendaView'; // (Futuro)

// --- HOOKS DE DADOS ---
import { useDeals } from '../hooks/useDeals';
import { usePipelines } from '../hooks/usePipelines';

// --- ICONS & TYPES ---
import { FaStream, FaColumns, FaCalendarAlt } from 'react-icons/fa';
import { ConfigStage } from '../components/pipeline-manager/StageList'; // Import necessário para tipar o handler de save

export const CRMContainer: React.FC = () => {
    
    // ============================================================================
    // 1. ESTADOS DE NAVEGAÇÃO E DADOS
    // ============================================================================
    
    // Qual visão está ativa? (Padrão: Kanban)
    const [activeView, setActiveView] = useState<'WORKSTATION' | 'KANBAN' | 'AGENDA'>('KANBAN');
    
    // Qual Funil está selecionado?
    const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);

    // Controle da Gaveta de Criação de Funil (Sidebar)
    const [isPipelineModalOpen, setIsPipelineModalOpen] = useState(false);

    // --- HOOKS DE API ---
    // Buscamos a lista de funis para preencher o seletor
    const { pipelines, isLoadingPipelines: loadingPipelines } = usePipelines();
    
    // Buscamos os negócios (Deals) do funil selecionado
    // Nota: O hook useDeals reage automaticamente quando o selectedPipelineId muda
    const { 
        deals, 
        isLoading: loadingDeals, 
        error: errorDeals,
        updateDeal,
        refreshDeals 
    } = useDeals(selectedPipelineId || undefined);

    // ============================================================================
    // 2. EFEITOS COLATERAIS (AUTO-SELEÇÃO)
    // ============================================================================
    
    // Quando a lista de funis carregar, seleciona o primeiro automaticamente se nenhum estiver selecionado
    useEffect(() => {
        if (!loadingPipelines && pipelines.length > 0 && !selectedPipelineId) {
            setSelectedPipelineId(pipelines[0].id);
        }
    }, [pipelines, loadingPipelines, selectedPipelineId]);

    // ============================================================================
    // 3. HANDLERS (LÓGICA DE INTERAÇÃO)
    // ============================================================================

    const handlePipelineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        
        // Se o usuário selecionou a opção mágica de "Criar Novo"...
        if (value === '__CREATE_NEW__') {
            setIsPipelineModalOpen(true); // Abre a Sidebar
            // Não mudamos o selectedPipelineId para não quebrar a tela de fundo
        } else {
            setSelectedPipelineId(value); // Troca o funil normalmente
        }
    };

    // Função chamada quando o usuário clica em "Salvar" lá na Sidebar
    const handleSavePipeline = async (data: { name: string; stages: ConfigStage[] }) => {
        try {
            console.log("🛠️ Solicitando criação de novo funil:", data);
            
            // TODO: Aqui entra a chamada real para a API (POST /pipelines)
            // await api.post('/pipelines', data);
            
            // TODO: Após salvar, recarregar a lista de pipelines e selecionar o novo
            // refreshPipelines();
            
            setIsPipelineModalOpen(false); // Fecha a gaveta
            // toast.success("Funil criado com sucesso!");
        } catch (error) {
            console.error("Erro ao criar funil:", error);
            // toast.error("Erro ao criar funil.");
        }
    };

    // ============================================================================
    // 4. RENDERIZAÇÃO
    // ============================================================================

    return (
        <div className="flex flex-col h-full bg-base-dark p-4">
            
            {/* --- HEADER DE NAVEGAÇÃO E SELETOR --- */}
            {/* Mantivemos o visual "Dark/Metallic" ajustado anteriormente */}
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
                
                {/* Botões de Abas: Container Metálico */}
                <div className="flex items-center space-x-1 bg-base-metallic p-1 rounded-lg border border-white/5">
                    <button
                        onClick={() => setActiveView('WORKSTATION')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                            activeView === 'WORKSTATION' 
                            ? 'bg-gray-700 text-white shadow-md' 
                            : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                        }`}
                    >
                        <FaStream className={activeView === 'WORKSTATION' ? 'text-accent-secondary' : ''} /> 
                        <span>Workstation</span>
                    </button>
                    
                    <button
                        onClick={() => setActiveView('KANBAN')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                            activeView === 'KANBAN' 
                            ? 'bg-gray-700 text-white shadow-md' 
                            : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                        }`}
                    >
                        <FaColumns className={activeView === 'KANBAN' ? 'text-accent-secondary' : ''} /> 
                        <span>Kanban</span>
                    </button>

                    <button
                        onClick={() => setActiveView('AGENDA')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                            activeView === 'AGENDA' 
                            ? 'bg-gray-700 text-white shadow-md' 
                            : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                        }`}
                    >
                        <FaCalendarAlt className={activeView === 'AGENDA' ? 'text-accent-secondary' : ''} /> 
                        <span>Agenda</span>
                    </button>
                </div>

                {/* --- SELETOR DE PIPELINE --- */}
                {/* Só aparece se estivermos no Kanban e já tivermos carregado a lista */}
                {activeView === 'KANBAN' && !loadingPipelines && (
                    <div className="flex items-center space-x-2 bg-base-metallic p-1 rounded-lg border border-white/5">
                         <span className="text-[11px] uppercase tracking-widest font-bold text-gray-500 pl-2">Funil:</span>
                         
                         <select 
                            value={selectedPipelineId || ''}
                            onChange={handlePipelineChange}
                            className="bg-gray-700 text-gray-100 text-sm px-3 py-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-accent-primary cursor-pointer hover:bg-gray-600 transition-colors border border-gray-600"
                         >
                            {pipelines.length > 0 ? (
                                pipelines.map(p => (
                                    <option key={p.id} value={p.id} className="bg-gray-800">
                                        {p.name}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>Nenhum funil</option>
                            )}
                            
                            <option disabled className="bg-gray-800 text-gray-500">──────────</option>
                            
                            <option value="__CREATE_NEW__" className="bg-gray-800 text-accent-secondary font-bold">
                                + Criar Novo Funil
                            </option>
                         </select>
                    </div>
                )}
            </div>

            {/* --- CONTEÚDO PRINCIPAL (AREA DE VISÃO) --- */}
            <div className="flex-1 min-h-0 bg-base-metallic rounded-xl border border-white/5 p-4 shadow-inner relative overflow-hidden">
                
                {activeView === 'WORKSTATION' && (
                    <div className="text-white">Workstation View (Em Breve)</div>
                )}

                {activeView === 'KANBAN' && (
                    <CRMKanbanView 
                        // Props de Dados
                        deals={deals}
                        isLoading={loadingDeals}
                        error={errorDeals}
                        onDealMove={updateDeal}
                        onRefresh={refreshDeals}
                        pipelineId={selectedPipelineId || undefined}
                        
                        // Props da Sidebar (Drawer) - Passando o controle para o filho
                        isPipelineDrawerOpen={isPipelineModalOpen}
                        onPipelineDrawerClose={() => setIsPipelineModalOpen(false)}
                        onSavePipeline={handleSavePipeline}
                    />
                )}

                {activeView === 'AGENDA' && (
                     <div className="text-white">Agenda View (Em Breve)</div>
                )}
            </div>

        </div>
    );
};