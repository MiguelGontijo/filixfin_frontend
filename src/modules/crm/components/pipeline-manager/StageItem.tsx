// ===== FILE: src/modules/crm/components/pipeline-manager/StageItem.tsx =====

import React, { useState, useRef, useEffect } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { FaGripVertical, FaTrash, FaCheck } from 'react-icons/fa';

import { ConfigStage } from './StageList';
import { SYS_COLORS } from '@/core/constants/sysColors'; // 👈 Importamos o nosso Shared Kernel

interface StageItemProps {
    stage: ConfigStage;
    index: number;
    onUpdate: (id: string, field: keyof ConfigStage, value: any) => void;
    onDelete: (id: string) => void;
}

/**
 * @component StageItem
 * @description Representa uma única etapa (Stage) na configuração do Funil (Drag & Drop).
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Enterprise UX):
 * 1. UI Customizada (Popover): Remove o `<input type="color">` nativo do SO,
 * substituindo por um popover de cores curadas (Shared Kernel). Isso garante 
 * consistência visual no Design System e previne inserção de hexadecimais inválidos.
 * 2. Click-Outside Listener: Implementa fechamento inteligente do popover quando 
 * o usuário clica fora da área, garantindo uma navegação fluida e sem frustrações.
 */
export const StageItem: React.FC<StageItemProps> = ({ 
    stage, 
    index, 
    onUpdate, 
    onDelete 
}) => {
    
    // --- ESTADOS DO POPOVER DE COR ---
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    // 🛡️ CLICK-OUTSIDE HOOK: Fecha a paleta de cores se o usuário clicar fora dela.
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsColorPickerOpen(false);
            }
        };

        // Só adiciona o listener de documento se o popover estiver aberto (Otimização de Memória)
        if (isColorPickerOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isColorPickerOpen]);

    return (
        <Draggable draggableId={stage.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`
                        flex items-center gap-3 p-2 rounded-lg border transition-all group
                        ${snapshot.isDragging 
                            ? 'bg-gray-800 border-accent-primary shadow-2xl z-50 scale-[1.02]' 
                            : 'bg-gray-900 border-white/5 hover:border-white/10'
                        }
                    `}
                    style={provided.draggableProps.style}
                >
                    {/* 1. Drag Handle (A alça para arrastar) */}
                    <div 
                        {...provided.dragHandleProps}
                        className="text-gray-600 hover:text-gray-300 cursor-grab active:cursor-grabbing p-1 flex-shrink-0"
                        title="Arraste para reordenar"
                    >
                        <FaGripVertical />
                    </div>

                    {/* 2. Color Picker (O Popover Curado Padrão Big Tech) */}
                    <div className="relative flex-shrink-0" ref={popoverRef}>
                        
                        {/* Botão Gatilho (A Bolinha Colorida) */}
                        <button
                            type="button"
                            className="w-6 h-6 rounded-full cursor-pointer shadow-sm ring-2 ring-transparent hover:ring-white/30 transition-all focus:outline-none focus:ring-accent-primary flex items-center justify-center"
                            style={{ backgroundColor: stage.color }}
                            onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                            title="Alterar cor da etapa"
                        >
                            {/* Opcional: Um pequeno ícone de seta ou brilho poderia ir aqui */}
                        </button>

                        {/* O Popover (A Bandeja de Cores) */}
                        {isColorPickerOpen && (
                            <div className="absolute z-[9999] top-10 left-0 p-3 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-56 animate-fade-in">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-700 pb-2">
                                    Cor da Etapa
                                </p>
                                
                                {/* Grid de Cores (5 colunas x 4 linhas = 20 cores) */}
                                <div className="grid grid-cols-5 gap-2">
                                    {SYS_COLORS.map((sysColor) => {
                                        const isSelected = stage.color === sysColor.hex;
                                        return (
                                            <button
                                                key={sysColor.key}
                                                type="button"
                                                onClick={() => {
                                                    // Salva a cor exata do nosso dicionário e fecha o popover
                                                    onUpdate(stage.id, 'color', sysColor.hex);
                                                    setIsColorPickerOpen(false);
                                                }}
                                                className={`
                                                    w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none
                                                    ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800 shadow-lg' : 'hover:ring-2 hover:ring-white/50'}
                                                `}
                                                style={{ backgroundColor: sysColor.hex }}
                                                title={sysColor.name} // Tooltip com o nome amigável (ex: "Verde Esmeralda")
                                            >
                                                {/* Exibe um pequeno checkmark na cor selecionada */}
                                                {isSelected && <FaCheck className="text-white text-[10px] drop-shadow-md" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 3. Input de Nome da Fase */}
                    <input 
                        type="text"
                        value={stage.name}
                        onChange={(e) => onUpdate(stage.id, 'name', e.target.value)}
                        placeholder="Nome da etapa (ex: Em Negociação)"
                        className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-600 focus:outline-none font-bold"
                        autoFocus={stage.name === ''} // Foca automaticamente apenas se for uma etapa recém-criada
                    />

                    {/* 4. Botão de Excluir */}
                    <button 
                        type="button"
                        onClick={() => onDelete(stage.id)}
                        className="text-gray-600 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 flex-shrink-0"
                        title="Remover esta etapa"
                    >
                        <FaTrash size={12} />
                    </button>

                </div>
            )}
        </Draggable>
    );
};