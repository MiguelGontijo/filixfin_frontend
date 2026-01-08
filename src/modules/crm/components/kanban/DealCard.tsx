// src/modules/crm/components/kanban/DealCard.tsx

import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { CRMDeal } from '@/modules/crm/types';
import { FaBuilding } from 'react-icons/fa';

interface DealCardProps {
    deal: CRMDeal;
    index: number;
    onEdit: (deal: CRMDeal) => void; // <--- NOVO
}

export const DealCard: React.FC<DealCardProps> = ({ deal, index, onEdit }) => {
    
    const formattedValue = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(Number(deal.value));

    return (
        <Draggable draggableId={deal.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    // --- AÇÃO DE CLIQUE DUPLO PARA EDITAR ---
                    onDoubleClick={() => onEdit(deal)} 
                    className={`
                        bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-sm mb-3
                        hover:border-accent-secondary/50 transition-all group cursor-pointer
                        ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-accent-primary rotate-2 z-50' : ''}
                    `}
                    style={{
                        ...provided.draggableProps.style,
                    }}
                    title="Clique duas vezes para editar"
                >
                    {/* Título e Probabilidade */}
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-bold text-white line-clamp-2 leading-tight">
                            {deal.title}
                        </h4>
                        {deal.probability > 0 && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded 
                                ${deal.probability >= 70 ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'}
                            `}>
                                {deal.probability}%
                            </span>
                        )}
                    </div>

                    {/* Cliente */}
                    <div className="flex items-center text-xs text-gray-400 mb-3">
                        <FaBuilding className="mr-1.5 w-3 h-3 opacity-50" />
                        <span className="truncate max-w-[150px]">
                            {deal.client?.name || 'Cliente Desconhecido'}
                        </span>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center border-t border-gray-700/50 pt-2">
                        <div className="text-xs font-bold text-gray-200 flex items-center">
                            <span className="text-green-500 mr-1">$</span> {formattedValue}
                        </div>
                        
                        <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px] text-white border border-gray-600">
                            <span className="font-bold">V</span>
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
};