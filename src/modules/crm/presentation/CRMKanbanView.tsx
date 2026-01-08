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
// Define o contrato do que este componente precisa para funcionar.
// Agora inclui os controles para a Sidebar (Drawer) de Funis.
// ============================================================================
interface CRMKanbanViewProps {
    // Dados Principais
    deals: CRMDeal[];
    isLoading: boolean;
    error: any;
    
    // Ações do Kanban
    onDealMove: (dealId: string, newStageId: string, newStatus?: DealStatus) => void; 
    onRefresh: () => void;
    
    // Contexto: Qual funil estamos visualizando?
    pipelineId?: string;

    // --- CONTROLE DO DRAWER (NOVO) ---
    // Estas props vêm do CRMContainer para controlar a visibilidade da Sidebar
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
    // Desestruturando as novas props do Drawer
    isPipelineDrawerOpen,
    onPipelineDrawerClose,
    onSavePipeline
}) => {
    
    // ------------------------------------------------------------------------
    // 1. CARREGAMENTO DE DADOS ESTRUTURAIS
    // Precisamos saber quais são as colunas (Stages) deste funil específico.
    // O hook usePipelineDetails resolve isso baseado no pipelineId.
    // ------------------------------------------------------------------------
    const { stages, isLoadingPipeline } = usePipelineDetails(pipelineId);

    // Unifica o status de carregamento:
    // A tela só está pronta quando temos os Deals E a estrutura das Colunas.
    const isLoading = isLoadingDeals || isLoadingPipeline;

    // ------------------------------------------------------------------------
    // 2. ESTADOS LOCAIS (MODAL DE DEALS)
    // Controlam apenas o formulário de criação/edição de Negócios (Deals),
    // que é diferente da configuração do Funil.
    // ------------------------------------------------------------------------
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [defaultStatus, setDefaultStatus] = useState<DealStatus | undefined>(undefined);
    const [dealToEdit, setDealToEdit] = useState<CRMDeal | undefined>(undefined);

    // ------------------------------------------------------------------------
    // 3. HANDLERS (Ações do Usuário)
    // ------------------------------------------------------------------------

    // Abre o modal para CRIAR um novo negócio
    const handleOpenNewDeal = (status?: DealStatus) => {
        setDealToEdit(undefined); // Garante que não é edição
        setDefaultStatus(status); // Se veio de uma coluna específica (botão + da coluna)
        setIsModalOpen(true);
    };

    // Abre o modal para EDITAR um negócio existente
    const handleOpenEditDeal = (deal: CRMDeal) => {
        setDealToEdit(deal); 
        setDefaultStatus(undefined);
        setIsModalOpen(true);
    };
    
    // Callback de sucesso ao salvar/editar um deal
    const handleSuccess = () => {
        onRefresh(); // Recarrega a lista para mostrar os dados novos
    };

    // ------------------------------------------------------------------------
    // 4. RENDERIZAÇÃO DE ESTADOS DE CARREGAMENTO / ERRO
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

    // ------------------------------------------------------------------------
    // 5. RENDERIZAÇÃO PRINCIPAL
    // Aqui está a mudança crítica de layout para a Sidebar funcionar.
    // ------------------------------------------------------------------------
    return (
        /* CONTAINER PRINCIPAL
           relative: Torna este elemento a "âncora" para elementos absolute filhos.
                     Isso garante que o Drawer (absolute) se posicione relativo a ESTE container,
                     e não à tela inteira.
           overflow-hidden: Garante que, quando o Drawer estiver fechado (fora da tela),
                            ele não gere barra de rolagem horizontal na página.
        */
        <div className="h-full flex flex-col relative overflow-hidden">
            
            {/* --- HEADER INTERNO (Título + Botão Novo Deal) --- */}
            {/* flex-shrink-0 impede que o header encolha se a tela for pequena */}
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

            {/* --- ÁREA DO BOARD (KANBAN) --- */}
            {/* flex-1: Ocupa todo o espaço vertical restante */}
            {/* min-h-0: Fix do Flexbox para permitir scroll interno corretamente */}
            <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
                <KanbanBoard 
                    deals={deals}
                    stages={stages} // Passamos as fases carregadas dinamicamente
                    onDealMove={onDealMove} 
                    onAddDeal={handleOpenNewDeal}
                    onEditDeal={handleOpenEditDeal}
                />
            </div>

            {/* --- MODAL OPERACIONAL (DEAL) --- */}
            {/* Este modal (DealModal) usa Overlay fixo e centralizado, padrão do app */}
            <DealModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSuccess}
                defaultStatus={defaultStatus}
                dealToEdit={dealToEdit}
                pipelineId={pipelineId}
            />

            {/* --- SIDEBAR DE CONFIGURAÇÃO (PIPELINE DRAWER) --- */}
            {/* DIFERENÇA CRUCIAL:
                Este componente está inserido AQUI dentro para herdar o contexto 'relative' do pai.
                Ele vai se posicionar como 'absolute top-0 right-0' DENTRO desta div principal.
                Resultado: Ele cobre o Kanban, mas respeita o Header e o Menu Lateral do CRM.
            */}
            <PipelineDrawer 
                isOpen={isPipelineDrawerOpen}
                onClose={onPipelineDrawerClose}
                onSave={onSavePipeline}
            />
        </div>
    );
};