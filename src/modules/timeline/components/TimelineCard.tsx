// ===== FILE: src/modules/timeline/components/TimelineCard.tsx =====

import React from 'react';
import { 
    FaPhone, 
    FaEnvelope, 
    FaStickyNote, 
    FaRobot, 
    FaWhatsapp, 
    FaMicrophone, 
    FaPaperclip,
    FaThumbtack,
    FaTrashAlt,
    FaClock
} from 'react-icons/fa';
import { TimelineEvent, TimelineEntryType } from '../types/TimelineTypes';

interface TimelineCardProps {
    event: TimelineEvent;
    onTogglePin: (id: string) => void;
    onDelete: (id: string) => void;
}

/**
 * @component TimelineCard
 * @description O componente polimórfico que renderiza um único evento.
 * Adapta seu visual (ícone, cor, borda) baseado no `event.type`.
 */
export const TimelineCard: React.FC<TimelineCardProps> = ({ 
    event, 
    onTogglePin, 
    onDelete 
}) => {

    // --- 1. Lógica Visual (Polimorfismo de UI) ---
    
    /**
     * Define a identidade visual do card baseado no tipo de evento.
     * Retorna ícone, cores e labels.
     */
    const getVisuals = (type: TimelineEntryType) => {
        switch (type) {
            case 'CALL':
                return { 
                    icon: FaPhone, 
                    color: 'text-blue-400', 
                    bgColor: 'bg-blue-500/10', // Mantendo consistência do tema
                    borderColor: 'border-blue-500/20',
                    label: 'Ligação'
                };
            case 'EMAIL':
                return { 
                    icon: FaEnvelope, 
                    color: 'text-yellow-400', 
                    bgColor: 'bg-yellow-500/10',
                    borderColor: 'border-yellow-500/20',
                    label: 'E-mail'
                };
            case 'WHATSAPP':
                return { 
                    icon: FaWhatsapp, 
                    color: 'text-green-400', 
                    bgColor: 'bg-green-500/10',
                    borderColor: 'border-green-500/20',
                    label: 'WhatsApp'
                };
            case 'AI_INSIGHT':
                return { 
                    icon: FaRobot, 
                    color: 'text-accent-primary', 
                    bgColor: 'bg-accent-primary/10',
                    borderColor: 'border-accent-primary/30',
                    label: 'Análise IA'
                };
            case 'AUDIO':
                return { 
                    icon: FaMicrophone, 
                    color: 'text-pink-400', 
                    bgColor: 'bg-pink-500/10',
                    borderColor: 'border-pink-500/20',
                    label: 'Áudio'
                };
            case 'FILE':
                return { 
                    icon: FaPaperclip, 
                    color: 'text-cyan-400', 
                    bgColor: 'bg-cyan-500/10',
                    borderColor: 'border-cyan-500/20',
                    label: 'Anexo'
                };
            case 'NOTE':
            default:
                return { 
                    icon: FaStickyNote, 
                    color: 'text-gray-400', 
                    bgColor: 'bg-gray-700/30',
                    borderColor: 'border-gray-700',
                    label: 'Nota'
                };
        }
    };

    const visuals = getVisuals(event.type);
    const Icon = visuals.icon;
    
    // Formata a hora (ex: 14:30)
    const timeString = new Date(event.occurredAt).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });

    // --- 2. Renderização ---

    return (
        <div className={`
            group relative flex gap-3 
            ${event.isPinned ? 'z-10' : ''} /* Traz pra frente se pinado */
        `}>
            
            {/* COLUNA ESQUERDA: Ícone/Avatar */}
            <div className="flex flex-col items-center">
                <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center shrink-0
                    border ${visuals.borderColor} ${visuals.bgColor} ${visuals.color}
                    shadow-sm z-10
                `}>
                    {/* Se estiver pinado, mostra o alfinete no lugar do ícone do tipo */}
                    {event.isPinned ? (
                        <FaThumbtack className="w-3.5 h-3.5 animate-pulse text-yellow-400" />
                    ) : (
                        <Icon className="w-3.5 h-3.5" />
                    )}
                </div>
                
                {/* Linha Conectora Vertical (Só visual) */}
                <div className="w-px h-full bg-gray-800 -mt-2 mb-2 group-last:hidden"></div>
            </div>

            {/* COLUNA DIREITA: Conteúdo do Card */}
            <div className="flex-1 min-w-0 pb-4">
                
                {/* O Card em si */}
                <div className={`
                    relative rounded-lg border p-3 transition-all duration-200
                    ${event.isPinned 
                        ? 'bg-gray-800/80 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.05)]' // Estilo Destaque
                        : `bg-gray-800/40 border-gray-700/50 hover:border-gray-600`
                    }
                `}>
                    
                    {/* HEADER DO CARD: Autor, Tipo e Ações */}
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                            {/* Nome do Autor */}
                            <span className="text-xs font-bold text-gray-200 truncate">
                                {event.creator?.name || 'Usuário'}
                            </span>
                            
                            {/* Badge de Tipo */}
                            <span className={`
                                text-[10px] uppercase font-bold px-1.5 py-0.5 rounded
                                bg-gray-900 border border-gray-700 text-gray-400 tracking-wider
                            `}>
                                {visuals.label}
                            </span>

                            {/* Hora */}
                            <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono ml-1">
                                <FaClock size={8} />
                                {timeString}
                            </div>
                        </div>

                        {/* AÇÕES (Hover Only) */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            
                            {/* Botão PIN */}
                            <button 
                                onClick={() => onTogglePin(event.id)}
                                className={`
                                    p-1.5 rounded hover:bg-gray-700 transition-colors
                                    ${event.isPinned ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}
                                `}
                                title={event.isPinned ? "Desafixar" : "Fixar no topo"}
                            >
                                <FaThumbtack size={10} />
                            </button>

                            {/* Botão DELETE */}
                            <button 
                                onClick={() => onDelete(event.id)}
                                className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-red-400 transition-colors"
                                title="Excluir registro"
                            >
                                <FaTrashAlt size={10} />
                            </button>
                        </div>
                    </div>

                    {/* CORPO DO TEXTO */}
                    {event.content && (
                        <div className="text-sm text-gray-300 whitespace-pre-wrap break-words leading-relaxed font-sans">
                            {event.content}
                        </div>
                    )}

                    {/* METADADOS ESPECIAIS (Ex: Tags da IA) */}
                    {event.metadata && event.metadata.tags && Array.isArray(event.metadata.tags) && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                            {event.metadata.tags.map((tag: string, idx: number) => (
                                <span 
                                    key={idx} 
                                    className="px-2 py-0.5 text-[10px] font-medium text-accent-primary bg-accent-primary/5 border border-accent-primary/20 rounded-md"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* ANEXOS (Se houver) */}
                    {event.attachments && event.attachments.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-gray-700/50 space-y-1">
                            {event.attachments.map(att => (
                                <a 
                                    key={att.id} 
                                    href={att.url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-center gap-2 p-2 rounded bg-gray-900/50 hover:bg-gray-900 border border-transparent hover:border-gray-700 transition-all group/att"
                                >
                                    <div className="p-1.5 rounded bg-gray-800 text-cyan-400">
                                        <FaPaperclip size={10} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-300 truncate font-medium group-hover/att:text-cyan-400 transition-colors">
                                            {att.originalName}
                                        </p>
                                        <p className="text-[10px] text-gray-600">
                                            {(att.sizeBytes / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};