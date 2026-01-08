import React from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { FaPlus } from 'react-icons/fa';
import { StageItem } from './StageItem';

// Definição do formato de uma Fase neste contexto de configuração
export interface ConfigStage {
    id: string; // Pode ser um UUID temporário para fases novas
    name: string;
    color: string;
    order: number;
}

interface StageListProps {
    stages: ConfigStage[];
    onChange: (stages: ConfigStage[]) => void;
}

export const StageList: React.FC<StageListProps> = ({ stages, onChange }) => {
    
    // --- LÓGICA DE REORDENAÇÃO ---
    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        // Cria uma cópia da lista
        const items = Array.from(stages);
        // Remove do índice original
        const [reorderedItem] = items.splice(result.source.index, 1);
        // Insere no novo índice
        items.splice(result.destination.index, 0, reorderedItem);

        // Atualiza a propriedade 'order' (boa prática para garantir consistência)
        const updatedStages = items.map((stage, index) => ({
            ...stage,
            order: index
        }));

        onChange(updatedStages);
    };

    // --- LÓGICA DE CRUD ---
    
    const handleAddStage = () => {
        const newStage: ConfigStage = {
            id: `temp-${Date.now()}`, // ID provisório para a key do React
            name: '',
            color: '#FF5E1A', // Começa com a cor primária (Laranja)
            order: stages.length
        };
        onChange([...stages, newStage]);
    };

    const handleUpdateStage = (id: string, field: keyof ConfigStage, value: any) => {
        const newStages = stages.map(s => 
            s.id === id ? { ...s, [field]: value } : s
        );
        onChange(newStages);
    };

    const handleDeleteStage = (id: string) => {
        onChange(stages.filter(s => s.id !== id));
    };

    return (
        <div className="space-y-3">
            
            {/* Contexto de Drag and Drop */}
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="pipeline-stages-config">
                    {(provided) => (
                        <div 
                            {...provided.droppableProps} 
                            ref={provided.innerRef}
                            className="space-y-2"
                        >
                            {stages.map((stage, index) => (
                                <StageItem 
                                    key={stage.id}
                                    stage={stage}
                                    index={index}
                                    onUpdate={handleUpdateStage}
                                    onDelete={handleDeleteStage}
                                />
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            {/* Botão de Adicionar Nova Fase */}
            <button
                onClick={handleAddStage}
                className="w-full py-3 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center text-gray-500 hover:text-accent-secondary hover:border-accent-secondary/50 hover:bg-white/5 transition-all group"
            >
                <FaPlus className="mr-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold">Adicionar Fase</span>
            </button>

            {/* Mensagem de Ajuda se a lista estiver vazia */}
            {stages.length === 0 && (
                <p className="text-xs text-center text-gray-600 mt-2">
                    Adicione pelo menos uma fase para criar o funil.
                </p>
            )}
        </div>
    );
};