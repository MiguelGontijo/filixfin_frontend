// src/features/crm/presentation/CRMKanbanView.tsx

import React, { useState } from 'react';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { CRMDeal, DealStatus } from '../types';
import { FaSync, FaExclamationTriangle, FaPlus } from 'react-icons/fa';
import { DealModal } from '../components/deals/DealModal'; // <--- Import do Modal Suave

interface CRMKanbanViewProps {
    deals: CRMDeal[];
    isLoading: boolean;
    error: string | null;
    onDealMove: (dealId: string, newStatus: DealStatus) => void;
    onRefresh: () => void;
}

export const CRMKanbanView: React.FC<CRMKanbanViewProps> = ({ 
    deals, 
    isLoading, 
    error, 
    onDealMove,
    onRefresh 
}) => {
    
    // --- ESTADOS DO MODAL ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [defaultStatus, setDefaultStatus] = useState<DealStatus | undefined>(undefined);
    const [dealToEdit, setDealToEdit] = useState<CRMDeal | undefined>(undefined);

    // --- HANDLERS ---
    const handleOpenNewDeal = (status?: DealStatus) => {
        setDefaultStatus(status); // Se vier de uma coluna, já vem preenchido
        setIsModalOpen(true);
    };

    const handleOpenEditDeal = (deal: CRMDeal) => {
        setDealToEdit(deal); // Seta o deal para edição
        setDefaultStatus(undefined);
        setIsModalOpen(true);
    };
    
    const handleSuccess = () => {
        onRefresh(); // Recarrega o Kanban
        // O modal fecha automaticamente via props do DealModal
    };

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
                    <p className="text-sm mb-4">{error}</p>
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

    return (
        <div className="h-full flex flex-col relative">
            
            {/* Header Interno do Kanban */}
            <div className="flex justify-between items-center mb-4 px-1 flex-shrink-0">
                <div className="flex items-baseline space-x-3">
                    <h2 className="text-xl font-bold text-white">Pipeline de Vendas</h2>
                    <div className="text-xs text-gray-500">
                        {deals.length} oportunidades ativas
                    </div>
                </div>

                {/* Botão Global de Novo Deal */}
                <button 
                    onClick={() => handleOpenNewDeal()} // Sem status = Status Default (NEW)
                    className="flex items-center space-x-2 px-4 py-2 bg-accent-primary text-base-dark font-bold rounded-lg hover:bg-orange-500 transition shadow-lg transform active:scale-95"
                >
                    <FaPlus />
                    <span>Novo Deal</span>
                </button>
            </div>

            {/* O Board ocupa o resto da altura */}
            <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
                <KanbanBoard 
                    deals={deals} 
                    onDealMove={onDealMove} 
                    onAddDeal={handleOpenNewDeal}
                    onEditDeal={handleOpenEditDeal}
                />
            </div>

            {/* --- MODAL DE CRIAÇÃO --- */}
            <DealModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSuccess}
                defaultStatus={defaultStatus}
            />
        </div>
    );
};