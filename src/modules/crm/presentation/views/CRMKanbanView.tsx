'use client';

import React, { useState, useMemo } from 'react';

// --- Mundo 2: Aplicação & Domínio (CRM) ---
import { usePipelines, usePipelineDetails } from '../../application/hooks/usePipelines';
import { useDeals } from '../../application/hooks/useDeals';
import { useDealMutation } from '../../application/hooks/useDealMutation';
import { useClients } from '@/core/client/hooks/useClients';

import { CRMDeal, DealStatus } from '../../domain/types';

// --- Hooks de Configuração (As Regras do Jogo) ---
import { useDealConfig } from '../../application/useDealConfig';
import { usePipelineConfig } from '../../application/usePipelineConfig';

// --- Peças de Elite do Kanban (Componentes Decompostos) ---
import { KanbanHeader } from '../components/kanban/KanbanHeader';
import { KanbanBody, KanbanViewMode } from '../components/kanban/KanbanBody';
import { KanbanFooter } from '../components/kanban/KanbanFooter';

/**
 * ============================================================================
 * 🎭 VIEW: CRMKanbanView (O Maestro do Board)
 * @description Orquestrador central da visualização por funis. Gere o estado 
 * de projeção (Board vs Form), a sincronização de dados e as mutações.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Netflix/Shopify Level):
 * 1. State Orchestration: Centraliza a 'Máquina de Estados' da visão, 
 * permitindo transições fluídas entre a gestão de cards e o Motor CRUD V4.
 * 2. Real-time Sync: Garante que após qualquer salvamento (Deal ou Pipeline), 
 * os dados sejam revalidados na fonte (Queries) para manter a UI íntegra.
 * 3. Contextual Intelligence: Resolve o ID do funil ativo priorizando a 
 * seleção do usuário, seguida pelo padrão de sistema (isDefault).
 * ============================================================================
 */
export function CRMKanbanView() {
    // --- 📡 MUNDO APPLICATION: LEITURA (Queries) ---
    const { clients = [] } = useClients();
    const { pipelines = [], isLoadingPipelines, refreshPipelines } = usePipelines();
    
    // Controle de Contexto: ID do funil selecionado no Header
    const [selectedPipelineId, setSelectedPipelineId] = useState<string | undefined>(undefined);
    
    // 🛡️ LOGICA DE RESOLUÇÃO: Define qual funil exibir baseado na hierarquia de preferência
    const effectivePipelineId = selectedPipelineId || pipelines.find(p => p.isDefault)?.id || pipelines[0]?.id;
    
    // Busca detalhes estruturais (Stages) do funil ativo
    const { pipeline: activePipeline } = usePipelineDetails(effectivePipelineId);

    // Busca as Deals vinculadas ao contexto atual
    const { deals = [], refreshDeals } = useDeals(effectivePipelineId);

    // --- 🛠️ MUNDO APPLICATION: ESCRITA (Commands/Mutations) ---
    const { updateDealStatus } = useDealMutation();

    // --- ⚙️ MANUAIS DE INSTRUÇÕES (Configs) ---
    const dealConfig = useDealConfig(clients, pipelines);
    const pipelineConfig = usePipelineConfig();

    // --- 🎭 MÁQUINA DE ESTADOS VISUAL (Roteador de Palco) ---
    const [viewMode, setViewMode] = useState<KanbanViewMode>({ type: 'BOARD' });

    /**
     * @method handleDealMove
     * @description Executa a mutação de Drag & Drop (Mudar de coluna/status).
     */
    const handleDealMove = async (dealId: string, newStageId: string, newStatus?: DealStatus) => {
        await updateDealStatus(dealId, newStageId, newStatus);
        refreshDeals(); 
    };

    /**
     * @method handleSaveSuccess
     * @description Callback de sucesso disparado pelo Motor V4 (CrudFormOrchestrator).
     * Retorna ao modo BOARD e sincroniza todos os caches de dados.
     */
    const handleSaveSuccess = () => {
        setViewMode({ type: 'BOARD' });
        refreshDeals();    // Sincroniza Oportunidades
        refreshPipelines(); // Sincroniza Funis (caso tenha alterado nomes ou ordens)
    };

    return (
        <div className="flex flex-col h-full w-full p-4 md:p-6 bg-base-darker/50 overflow-hidden relative">
            
            {/* 1. CABEÇALHO TÁTICO (Filtros & Ações) */}
            <KanbanHeader 
                pipelines={pipelines}
                selectedPipelineId={effectivePipelineId}
                dealCount={deals.length}
                onPipelineChange={setSelectedPipelineId}
                /** ➕ ATALHO: Abre o CRUD de Pipeline em modo de CRIAÇÃO (initialData vazio) */
                onCreatePipeline={() => setViewMode({ type: 'PIPELINE_FORM', data: {} })}
                onDealRequest={() => setViewMode({ 
                    type: 'DEAL_FORM', 
                    data: { pipelineId: effectivePipelineId } as Partial<CRMDeal> 
                })}
                onPipelineConfigRequest={() => setViewMode({ 
                    type: 'PIPELINE_FORM', 
                    data: activePipeline 
                })}
            />

            {/* 2. CORPO ROTEADOR (O Coração do Kanban) */}
            <KanbanBody 
                mode={viewMode}
                deals={deals}
                stages={activePipeline?.stages || []}
                dealConfig={dealConfig}
                pipelineConfig={pipelineConfig}
                onDealMove={handleDealMove}
                onEditDeal={(deal) => setViewMode({ type: 'DEAL_FORM', data: deal })}
                onAddDeal={(status) => setViewMode({ 
                    type: 'DEAL_FORM', 
                    data: { pipelineId: effectivePipelineId, status } as Partial<CRMDeal> 
                })}
                onCloseForm={() => setViewMode({ type: 'BOARD' })}
                onSaveSuccess={handleSaveSuccess}
            />

            {/* 3. RODAPÉ DE INTELIGÊNCIA (Visível apenas em modo BOARD) */}
            {viewMode.type === 'BOARD' && (
                <KanbanFooter deals={deals} />
            )}

        </div>
    );
}