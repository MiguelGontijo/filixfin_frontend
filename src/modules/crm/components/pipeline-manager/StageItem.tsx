import React, { useRef } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { FaGripVertical, FaTrash } from 'react-icons/fa';
import { ConfigStage } from './StageList';

interface StageItemProps {
    stage: ConfigStage;
    index: number;
    onUpdate: (id: string, field: keyof ConfigStage, value: any) => void;
    onDelete: (id: string) => void;
}

export const StageItem: React.FC<StageItemProps> = ({ 
    stage, 
    index, 
    onUpdate, 
    onDelete 
}) => {
    
    // Ref para acionar o input de cor nativo ao clicar na bolinha
    const colorInputRef = useRef<HTMLInputElement>(null);

    return (
        <Draggable draggableId={stage.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`
                        flex items-center gap-3 p-2 rounded-lg border transition-all group
                        ${snapshot.isDragging 
                            ? 'bg-base-dark border-accent-primary shadow-xl z-50 scale-105' 
                            : 'bg-base-dark border-white/5 hover:border-white/10'
                        }
                    `}
                    style={provided.draggableProps.style}
                >
                    {/* 1. Drag Handle (A alça para arrastar) */}
                    <div 
                        {...provided.dragHandleProps}
                        className="text-gray-600 hover:text-gray-300 cursor-grab active:cursor-grabbing p-1"
                    >
                        <FaGripVertical />
                    </div>

                    {/* 2. Color Picker (Visual Customizado + Input Oculto) */}
                    <div className="relative">
                        <div 
                            className="w-6 h-6 rounded-full cursor-pointer shadow-sm ring-1 ring-white/10 hover:scale-110 transition-transform"
                            style={{ backgroundColor: stage.color }}
                            onClick={() => colorInputRef.current?.click()}
                            title="Alterar cor da fase"
                        />
                        <input
                            ref={colorInputRef}
                            type="color"
                            value={stage.color}
                            onChange={(e) => onUpdate(stage.id, 'color', e.target.value)}
                            className="absolute opacity-0 w-0 h-0 -z-10" // Escondido, mas funcional
                        />
                    </div>

                    {/* 3. Input de Nome da Fase */}
                    <input 
                        type="text"
                        value={stage.name}
                        onChange={(e) => onUpdate(stage.id, 'name', e.target.value)}
                        placeholder="Nome da fase (ex: Negociação)"
                        className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-600 focus:outline-none font-medium"
                        autoFocus={stage.name === ''} // Foca automático se for novo
                    />

                    {/* 4. Botão de Excluir */}
                    <button 
                        onClick={() => onDelete(stage.id)}
                        className="text-gray-600 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Remover fase"
                    >
                        <FaTrash size={12} />
                    </button>

                </div>
            )}
        </Draggable>
    );
};