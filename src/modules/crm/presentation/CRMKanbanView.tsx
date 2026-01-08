// src/modules/crm/presentation/CRMKanbanView.tsx

import React, { useState } from 'react';

// --- COMPONENTES VISUAIS ---
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { DealModal } from '../components/deals/DealModal';

// --- NOVO COMPONENTE: A Sidebar de Configuração ---
import { PipelineDrawer } from '../components/pipeline-manager/PipelineDrawer';
import { ConfigStage } from '../components/pipeline-manager/StageList';

// --- TYPES E ICONS ---
import { CRMDeal, DealStatus } from '../types';
import { FaSync, FaExclamationTriangle, FaPlus } from 'react-icons/fa';

// --- HOOKS ---
import { usePipelineDetails } from '../hooks/usePipelines';

// ============================================================================
// INTERFACE DE PROPS
// ============================================================================
interface CRMKanbanViewProps {
    deals: CRMDeal[];
    isLoading: boolean;
    error: any;
    onDealMove: (dealId: string, newStageId: string, newStatus?: DealStatus) => void; 
    onRefresh: () => void;
    pipelineId?: string;

    // Controle do Drawer
    isPipelineDrawerOpen: boolean;
    onPipelineDrawerClose: () => void;
    onSavePipeline: (data: { name: string; stages: ConfigStage[] }) => void;
}

export const CRMKanbanView: React.FC<CRMKanbanViewProps> = ({ 
    deals, 
    isLoading: isLoadingDeals, 
    error, 
    onDealMove,
    onRefresh,
    pipelineId,
    isPipelineDrawerOpen,
    onPipelineDrawerClose,
    onSavePipeline
}) => {
    
    // ------------------------------------------------------------------------
    // 1. CARREGAMENTO E ESTADOS
    // ------------------------------------------------------------------------
    const { stages, isLoadingPipeline } = usePipelineDetails(pipelineId);
    const isLoading = isLoadingDeals || isLoadingPipeline;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [defaultStatus, setDefaultStatus] = useState<DealStatus | undefined>(undefined);
    const [dealToEdit, setDealToEdit] = useState<CRMDeal | undefined>(undefined);

    // ------------------------------------------------------------------------
    // 2. HANDLERS
    // ------------------------------------------------------------------------
    const handleOpenNewDeal = (status?: DealStatus) => {
        setDealToEdit(undefined);
        setDefaultStatus(status);
        setIsModalOpen(true);
    };

    const handleOpenEditDeal = (deal: CRMDeal) => {
        setDealToEdit(deal); 
        setDefaultStatus(undefined);
        setIsModalOpen(true);
    };
    
    const handleSuccess = () => onRefresh();

    // ------------------------------------------------------------------------
    // 3. RENDERIZAÇÃO DE CARREGAMENTO / ERRO
    // ------------------------------------------------------------------------
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <FaSync className="w-8 h-8 animate-spin text-accent-primary mb-3" />
                <p className="text-sm font-medium">Carregando Pipeline...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-red-400">
                <div className="bg-red-900/20 p-6 rounded-xl border border-red-900/50 text-center max-w-md">
                    <FaExclamationTriangle className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <h3 className="text-lg font-bold mb-2">Erro ao carregar negócios</h3>
                    <p className="text-sm mb-4">{String(error)}</p>
                    <button onClick={onRefresh} className="px-4 py-2 bg-red-900/50 hover:bg-red-800 text-white rounded-lg text-sm font-bold transition">
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    // ------------------------------------------------------------------------
    // 4. RENDERIZAÇÃO PRINCIPAL (LAYOUT AJUSTADO)
    // ------------------------------------------------------------------------
    return (
        /* CONTAINER RAIZ: Apenas flex column. 
           Removemos 'relative' daqui para que o Drawer não suba até o topo.
        */
        <div className="h-full flex flex-col">
            
            {/* --- HEADER INTERNO (FIXO NO TOPO) --- */}
            <div className="flex justify-between items-center mb-4 px-1 flex-shrink-0">
                <div className="flex items-baseline space-x-3">
                    <h2 className="text-xl font-bold text-white">Pipeline de Vendas</h2>
                    <div className="text-xs text-gray-500">
                        {deals.length} oportunidades ativas
                    </div>
                </div>

                <button 
                    onClick={() => handleOpenNewDeal()} 
                    className="flex items-center space-x-2 px-4 py-2 bg-accent-primary text-base-dark font-bold rounded-lg hover:bg-orange-500 transition shadow-lg transform active:scale-95"
                >
                    <FaPlus />
                    <span>Novo Deal</span>
                </button>
            </div>

            {/* --- CONTAINER ÂNCORA (WRAPPER) ---
               Este é o segredo. Ele ocupa o espaço restante (flex-1) e define
               o contexto 'relative'. O Drawer vai viver aqui dentro.
            */}
            <div className="flex-1 relative overflow-hidden">
                
                {/* 1. CAMADA DO BOARD (SCROLLÁVEL) */}
                {/* Ocupa todo o espaço do wrapper, mas permite scroll se o board for grande */}
                <div className="absolute inset-0 overflow-x-auto overflow-y-hidden">
                    <KanbanBoard 
                        deals={deals}
                        stages={stages} 
                        onDealMove={onDealMove} 
                        onAddDeal={handleOpenNewDeal}
                        onEditDeal={handleOpenEditDeal}
                    />
                </div>

                {/* 2. CAMADA DO DRAWER (OVERLAY LOCAL) */}
                {/* Como o pai (wrapper) é relative, o top-0 refere-se ao topo DESTE wrapper,
                    e não ao topo da tela. Ele fica, portanto, abaixo do Header. */}
                <PipelineDrawer 
                    isOpen={isPipelineDrawerOpen}
                    onClose={onPipelineDrawerClose}
                    onSave={onSavePipeline}
                />
                
            </div>

            {/* --- MODAL GLOBAL (DEALS) --- */}
            <DealModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSuccess}
                defaultStatus={defaultStatus}
                dealToEdit={dealToEdit}
                pipelineId={pipelineId}
            />
        </div>
    );
};