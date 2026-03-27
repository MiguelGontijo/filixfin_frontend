import React, { useState } from 'react';

// --- COMPONENTES VISUAIS ---
import { KanbanBoard } from '../../presentation/components/kanban/KanbanBoard';
import { EmptyPipelineState } from '../../presentation/components/kanban/EmptyPipelineState'; // ✅ Importado
import { DealModal } from '../../components/deals/DealModal';

// --- COMPONENTES DE CONFIGURAÇÃO ---
import { PipelineDrawer } from '../components/pipeline-manager/PipelineDrawer';
import { ConfigStage } from '../components/pipeline-manager/StageList';

// --- TYPES E ICONS ---
import { CRMDeal, DealStatus } from '../../domain/types';
import { FaSync, FaExclamationTriangle, FaPlus } from 'react-icons/fa';

// --- HOOKS ---
import { usePipelineDetails } from '../../application/hooks/usePipelines';

interface CRMKanbanViewProps {
    // Dados Principais
    deals: CRMDeal[];
    isLoading: boolean;
    error: any;
    
    // Ações do Kanban
    onDealMove: (dealId: string, newStageId: string, newStatus?: DealStatus) => void; 
    onRefresh: () => void;
    
    // Contexto
    pipelineId?: string;

    // --- CONTROLE DO DRAWER DE CONFIGURAÇÃO ---
    isPipelineDrawerOpen: boolean;
    onPipelineDrawerClose: () => void;
    onPipelineDrawerOpen: () => void; // ✅ Nova prop para o botão manual do EmptyState
    onSavePipeline: (data: { name: string; stages: ConfigStage[] }) => void;

    // --- CONTROLE DA IA (ONBOARDING) ---
    onGeneratePipelineWithAI: () => void; // ✅ Nova prop para o botão mágico
}

export const CRMKanbanView: React.FC<CRMKanbanViewProps> = ({ 
    deals, 
    isLoading: isLoadingDeals, 
    error, 
    onDealMove, 
    onRefresh, 
    pipelineId,
    
    // Props de Controle
    isPipelineDrawerOpen,
    onPipelineDrawerClose,
    onPipelineDrawerOpen,
    onSavePipeline,
    onGeneratePipelineWithAI
}) => {
    
    // 1. CARREGAMENTO ESTRUTURAL
    const { stages, isLoadingPipeline } = usePipelineDetails(pipelineId);

    const isLoading = isLoadingDeals || isLoadingPipeline;
    
    // ✅ VERIFICAÇÃO DE ESTADO VAZIO (ZERO DATA)
    // Se carregou e não tem estágios, estamos no "Limbo" que precisa de Onboarding.
    const isEmptyState = !isLoading && stages.length === 0;

    // 2. ESTADOS LOCAIS (DEALS)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [defaultStatus, setDefaultStatus] = useState<DealStatus | undefined>(undefined);
    const [dealToEdit, setDealToEdit] = useState<CRMDeal | undefined>(undefined);

    // 3. HANDLERS
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
    
    const handleSuccess = () => {
        onRefresh();
    };

    // 4. RENDERIZAÇÃO DE ESTADOS DE CARREGAMENTO / ERRO
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
                    <button 
                        onClick={onRefresh}
                        className="px-4 py-2 bg-red-900/50 hover:bg-red-800 text-white rounded-lg text-sm font-bold transition"
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    // 5. RENDERIZAÇÃO PRINCIPAL
    return (
        <div className="h-full flex flex-col relative overflow-hidden">
            
            {/* --- HEADER INTERNO --- */}
            <div className="flex justify-between items-center mb-4 px-1 flex-shrink-0">
                <div className="flex items-baseline space-x-3">
                    <h2 className="text-xl font-bold text-white">Pipeline de Vendas</h2>
                    {!isEmptyState && (
                        <div className="text-xs text-gray-500">
                            {deals.length} oportunidades ativas
                        </div>
                    )}
                </div>

                {/* BOTÃO NOVO DEAL (Protegido) */}
                {/* Só aparece se NÃO estivermos no estado vazio.
                    Isso previne o erro de criar deal sem funil. */}
                {!isEmptyState && (
                    <button 
                        onClick={() => handleOpenNewDeal()} 
                        className="flex items-center space-x-2 px-4 py-2 bg-accent-primary text-base-dark font-bold rounded-lg hover:bg-orange-500 transition shadow-lg transform active:scale-95"
                    >
                        <FaPlus />
                        <span>Novo Deal</span>
                    </button>
                )}
            </div>

            {/* --- ÁREA DO BOARD ou EMPTY STATE --- */}
            <div className="flex-1 min-h-0 overflow-hidden">
                {isEmptyState ? (
                    // ✨ ESTADO VAZIO INTELIGENTE
                    <EmptyPipelineState 
                        onGenerateWithAI={onGeneratePipelineWithAI}
                        onManualConfig={onPipelineDrawerOpen}
                    />
                ) : (
                    // 🏗️ KANBAN NORMAL
                    <div className="h-full overflow-x-auto overflow-y-hidden">
                        <KanbanBoard 
                            deals={deals}
                            stages={stages} 
                            onDealMove={onDealMove} 
                            onAddDeal={handleOpenNewDeal}
                            onEditDeal={handleOpenEditDeal}
                        />
                    </div>
                )}
            </div>

            {/* --- MODAIS E DRAWERS --- */}
            
            {/* Modal de Deal (Só renderiza se tiver stages para evitar crash, embora o botão esteja oculto) */}
            {!isEmptyState && (
                <DealModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleSuccess}
                    defaultStatus={defaultStatus}
                    dealToEdit={dealToEdit}
                    pipelineId={pipelineId}
                    // A correção interna do DealEditor (Passo 3) virá a seguir, 
                    // mas aqui já garantimos que ele não abre sem dados.
                />
            )}

            {/* Sidebar de Configuração */}
            <PipelineDrawer 
                isOpen={isPipelineDrawerOpen}
                onClose={onPipelineDrawerClose}
                onSave={onSavePipeline}
            />
        </div>
    );
};