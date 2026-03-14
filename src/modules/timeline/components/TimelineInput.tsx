// ===== FILE: src/modules/timeline/components/TimelineInput.tsx =====

import React, { useState, useRef, KeyboardEvent } from 'react';
import { 
    FaPaperPlane, 
    FaPaperclip, 
    FaMicrophone, 
    FaSpinner 
} from 'react-icons/fa';
import { TimelineEntryType, TimelineEventType } from '../types/TimelineTypes';

interface TimelineInputProps {
    /**
     * Callback acionado quando o usuário confirma o envio.
     * Retorna o texto e, futuramente, arquivos.
     */
    onSubmit: (content: string, type: TimelineEntryType) => Promise<void>;
    
    /**
     * Estado de carregamento vindo do hook (bloqueia digitação duplicada).
     */
    isSubmitting: boolean;

    /**
     * Placeholder customizável (ex: "Escreva uma nota..." ou "Registre a ligação...")
     */
    placeholder?: string;
}

/**
 * @component TimelineInput
 * @description O "Composer" da Timeline. Área de texto enriquecida.
 * * FEATURES:
 * - Auto-grow (altura dinâmica - simulado via rows).
 * - Atalho Ctrl+Enter para enviar.
 * - Bloqueio de UI durante envio.
 */
export const TimelineInput: React.FC<TimelineInputProps> = ({ 
    onSubmit, 
    isSubmitting,
    placeholder = "Escreva uma nota ou atualização..."
}) => {
    
    // --- Estado Local ---
    const [content, setContent] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    
    // Por padrão, toda entrada rápida é uma NOTA. 
    // Futuramente podemos adicionar um dropdown aqui para mudar para CALL/MEETING.
    const [entryType] = useState<TimelineEntryType>(TimelineEventType.NOTE); 
    
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // --- Handlers ---

    const handleSubmit = async () => {
        if (!content.trim() || isSubmitting) return;

        // Chama o pai e aguarda a conclusão (Promise)
        await onSubmit(content, entryType);
        
        // Limpa apenas se tiver sucesso (o pai lança erro se falhar)
        setContent('');
        
        // Retorna o foco para digitação contínua (Power User flow)
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };

    /**
     * Detecta "Ctrl + Enter" ou "Cmd + Enter" para envio rápido.
     */
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault(); // Evita quebra de linha
            handleSubmit();
        }
    };

    // --- Renderização ---

    return (
        <div className={`
            relative rounded-xl border transition-all duration-200 bg-gray-800/50
            ${isFocused 
                ? 'border-accent-primary/50 shadow-[0_0_0_2px_rgba(139,92,246,0.1)] bg-gray-800' 
                : 'border-gray-700 hover:border-gray-600'
            }
            ${isSubmitting ? 'opacity-70 pointer-events-none' : ''}
        `}>
            
            {/* ÁREA DE TEXTO */}
            <div className="p-3">
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    rows={isFocused || content.length > 0 ? 3 : 1} // Expande suavemente
                    disabled={isSubmitting}
                    className="
                        w-full bg-transparent text-sm text-gray-200 placeholder-gray-500
                        resize-none focus:outline-none custom-scrollbar leading-relaxed
                        transition-[rows] duration-200 ease-in-out
                    "
                />
            </div>

            {/* TOOLBAR (Rodapé do Input) */}
            <div className={`
                flex justify-between items-center px-2 pb-2 pt-1
                border-t border-gray-700/50 mx-2
                ${!isFocused && !content ? 'hidden' : 'flex'} // Esconde toolbar se vazio e sem foco (Minimalismo)
            `}>
                
                {/* Lado Esquerdo: Ferramentas (Anexos/Voz) */}
                <div className="flex gap-1">
                    <button 
                        type="button"
                        className="p-2 rounded-lg text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                        title="Anexar arquivo (Em breve)"
                        disabled // Desabilitado até implementarmos o upload real
                    >
                        <FaPaperclip size={14} />
                    </button>
                    <button 
                        type="button"
                        className="p-2 rounded-lg text-gray-500 hover:text-pink-400 hover:bg-pink-500/10 transition-colors"
                        title="Gravar áudio (Em breve)"
                        disabled
                    >
                        <FaMicrophone size={14} />
                    </button>
                </div>

                {/* Lado Direito: Ação Primária */}
                <div className="flex items-center gap-3">
                    
                    {/* Dica de Atalho (Aparece só para Desktop) */}
                    <span className="hidden md:block text-[10px] text-gray-600 font-medium select-none">
                        Ctrl + Enter para enviar
                    </span>

                    <button
                        onClick={handleSubmit}
                        disabled={!content.trim() || isSubmitting}
                        className={`
                            flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg
                            text-xs font-bold uppercase tracking-wide transition-all
                            ${content.trim() && !isSubmitting
                                ? 'bg-accent-primary text-white hover:bg-accent-primary-hover shadow-lg shadow-accent-primary/20 cursor-pointer'
                                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            }
                        `}
                    >
                        {isSubmitting ? (
                            <>
                                <FaSpinner className="animate-spin" /> Enviando...
                            </>
                        ) : (
                            <>
                                Enviar <FaPaperPlane />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};