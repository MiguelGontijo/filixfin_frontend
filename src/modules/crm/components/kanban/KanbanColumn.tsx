import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { CRMDeal } from '@/modules/crm/types'; // Removemos DealStatus, não precisamos dele aqui
import { DealCard } from './DealCard';
import { FaPlus } from 'react-icons/fa';

// Ajustando para bater com o kanban.types.ts que definimos
interface KanbanColumnProps {
    id: string;          // UUID do Stage
    title: string;       // Nome do Stage
    color?: string;      // Cor da fase (Novo!)
    deals: CRMDeal[];
    totalValue: number;
    onAddDeal: () => void;
    onEditDeal: (deal: CRMDeal) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ 
    id,
    title, 
    color = '#cccccc', // Default visual
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
            
            {/* Header da Coluna com Indicador de Cor */}
            <div className="p-3 border-b border-gray-700/50 bg-gray-800/40 rounded-t-xl flex justify-between items-center relative overflow-hidden">
                
                {/* Faixa colorida no topo baseada na configuração do Pipeline */}
                <div className="absolute top-0 left-0 w-full h-[2px]" style={{ backgroundColor: color }}></div>

                <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-wider truncate max-w-[120px]" title={title}>
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

            {/* Área de Drop - Agora usa o ID do Stage (UUID) */}
            <Droppable droppableId={id}>
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

                        {/* Botão de Adicionar Rápido */}
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