// src/features/crm/components/kanban/KanbanBoard.tsx

import React, { useEffect, useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { CRMDeal, DealStatus } from '@/modules/crm/types';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
    deals: CRMDeal[];
    onDealMove: (dealId: string, newStatus: DealStatus) => void;
    onAddDeal: (status: DealStatus) => void;
    onEditDeal: (deal: CRMDeal) => void; // <--- NOVO
}

const COLUMNS: { id: DealStatus; label: string }[] = [
    { id: DealStatus.NEW, label: 'Novos Leads' },
    { id: DealStatus.QUALIFIED, label: 'Qualificados' },
    { id: DealStatus.PROPOSAL, label: 'Proposta Enviada' },
    { id: DealStatus.NEGOTIATION, label: 'Em Negociação' },
    { id: DealStatus.WON, label: 'Fechado (Ganho)' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ deals, onDealMove, onAddDeal, onEditDeal }) => {
    
    const [isBrowser, setIsBrowser] = useState(false);
    useEffect(() => { setIsBrowser(true); }, []);

    const handleDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const newStatus = destination.droppableId as DealStatus;
        const oldStatus = source.droppableId as DealStatus;

        if (newStatus !== oldStatus) {
            onDealMove(draggableId, newStatus);
        }
    };

    if (!isBrowser) return <div className="flex h-full items-center justify-center text-gray-500">Carregando Kanban...</div>;

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex h-full space-x-4 overflow-x-auto pb-4 px-2">
                {COLUMNS.map(col => {
                    const columnDeals = deals.filter(d => d.status === col.id);
                    const totalValue = columnDeals.reduce((sum, d) => sum + Number(d.value), 0);

                    return (
                        <KanbanColumn 
                            key={col.id}
                            status={col.id}
                            title={col.label}
                            deals={columnDeals}
                            totalValue={totalValue}
                            onAddDeal={() => onAddDeal(col.id)}
                            onEditDeal={onEditDeal} // <--- Repassa
                        />
                    );
                })}
            </div>
        </DragDropContext>
    );
};