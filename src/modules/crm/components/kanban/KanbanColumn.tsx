// src/features/crm/components/kanban/KanbanColumn.tsx

import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { CRMDeal, DealStatus } from '@/modules/crm/types';
import { DealCard } from './DealCard';
import { FaPlus } from 'react-icons/fa';

interface KanbanColumnProps {
    status: DealStatus;
    title: string;
    deals: CRMDeal[];
    totalValue: number;
    onAddDeal: () => void; // <--- NOVO: Callback para adicionar nesta coluna
    onEditDeal: (deal: CRMDeal) => void; // <--- NOVO
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ 
    status, 
    title, 
    deals, 
    totalValue,
    onAddDeal,
    onEditDeal
}) => {
    
    const formattedTotal = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        notation: 'compact', 
    }).format(totalValue);

    return (
        <div className="flex flex-col h-full w-72 min-w-[288px] bg-base-metallic/30 rounded-xl border border-gray-700/50 flex-shrink-0">
            
            {/* Header da Coluna */}
            <div className="p-3 border-b border-gray-700/50 bg-gray-800/40 rounded-t-xl flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                        {title}
                    </span>
                    <span className="bg-gray-700 text-gray-400 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                        {deals.length}
                    </span>
                </div>
                <div className="text-xs font-bold text-accent-primary">
                    {formattedTotal}
                </div>
            </div>

            {/* Área de Drop */}
            <Droppable droppableId={status}>
                {(provided, snapshot) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`flex-1 p-2 overflow-y-auto custom-scrollbar transition-colors flex flex-col ${
                            snapshot.isDraggingOver ? 'bg-gray-800/50' : ''
                        }`}
                    >
                        {deals.map((deal, index) => (
                            <DealCard 
                                key={deal.id} 
                                deal={deal} 
                                index={index} 
                                onEdit={onEditDeal}
                            />
                        ))}
                        {provided.placeholder}

                        {/* Botão de Adicionar Rápido (No corpo da coluna) */}
                        <button 
                            onClick={onAddDeal}
                            className="mt-2 flex items-center justify-center w-full py-2 border border-dashed border-gray-600 rounded-lg text-gray-500 hover:text-white hover:border-accent-secondary hover:bg-accent-secondary/10 transition group"
                        >
                            <FaPlus className="w-3 h-3 mr-1 group-hover:scale-110 transition-transform" /> 
                            <span className="text-xs font-bold">Novo Deal</span>
                        </button>
                    </div>
                )}
            </Droppable>
        </div>
    );
};