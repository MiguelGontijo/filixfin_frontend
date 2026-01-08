import React, { useEffect, useState } from 'react';
import { DragDropContext, DropResult, Droppable } from '@hello-pangea/dnd';
import { CRMDeal, DealStatus } from '@/modules/crm/types';
import { IPipelineStage } from '@/modules/crm/types/pipeline.types';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
    deals: CRMDeal[];
    stages: IPipelineStage[]; // <--- NOVO: Recebe as fases dinâmicas
    onDealMove: (dealId: string, newStageId: string, newStatus?: DealStatus) => void;
    onAddDeal: (status: DealStatus) => void;
    onEditDeal: (deal: CRMDeal) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
    deals, 
    stages, 
    onDealMove, 
    onAddDeal, 
    onEditDeal 
}) => {
    const [isBrowser, setIsBrowser] = useState(false);

    useEffect(() => {
        setIsBrowser(true);
    }, []);

    const handleDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        // O droppableId agora é o ID do Stage (UUID), não mais o Status fixo
        const newStageId = destination.droppableId;
        
        // Encontramos o stage para saber qual o 'code' (status) correspondente
        const targetStage = stages.find(s => s.id === newStageId);
        const newStatus = targetStage?.code as DealStatus || DealStatus.NEW;

        onDealMove(draggableId, newStageId, newStatus);
    };

    if (!isBrowser) return <div className="flex h-full items-center justify-center text-gray-500">Carregando Kanban...</div>;

    // Se não vier stages (ex: carregando ou erro), mostramos estado vazio
    if (!stages || stages.length === 0) {
        return <div className="flex h-full items-center justify-center text-gray-500">Selecione um funil para visualizar.</div>;
    }

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex h-full space-x-4 overflow-x-auto pb-4 px-2">
                {/* Agora iteramos sobre os STAGES dinâmicos, não mais colunas fixas */}
                {stages.map(stage => {
                    // Filtra os deals desta coluna
                    // Nota: Idealmente filtramos pelo stageId. Se o backend ainda não salva stageId, usamos o status (code) como fallback
                    const columnDeals = deals.filter(d => 
                        d.currentStageId === stage.id || (!d.currentStageId && d.status === stage.code)
                    );
                    
                    const totalValue = columnDeals.reduce((acc, curr) => acc + Number(curr.value), 0);

                    return (
                        <KanbanColumn 
                            key={stage.id} // UUID do stage
                            id={stage.id}  // UUID usado pelo DragDrop
                            title={stage.name}
                            deals={columnDeals}
                            color={stage.color} // Cor vinda do banco
                            totalValue={totalValue}
                            onAddDeal={() => onAddDeal(stage.code as DealStatus)}
                            onEditDeal={onEditDeal}
                        />
                    );
                })}
            </div>
        </DragDropContext>
    );
};