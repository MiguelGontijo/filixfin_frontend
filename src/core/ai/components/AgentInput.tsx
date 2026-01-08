// src/core/ai/components/AgentInput.tsx

import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaMicrophone, FaPaperclip, FaStop } from 'react-icons/fa';

interface AgentInputProps {
    /**
     * Função chamada quando o usuário envia a mensagem.
     * Pode receber texto e/ou anexos.
     */
    onSend: (message: string, attachments?: File[]) => Promise<void>;
    
    /**
     * Define o estilo visual.
     * 'chat' = Uma linha (compacto, estilo WhatsApp).
     * 'compose' = Bloco maior (estilo Email/Nota do CRM).
     */
    mode?: 'chat' | 'compose';
    
    isLoading?: boolean;
    placeholder?: string;
}

export const AgentInput: React.FC<AgentInputProps> = ({ 
    onSend, 
    mode = 'chat', 
    isLoading = false,
    placeholder = "Digite sua mensagem ou grave um áudio..." 
}) => {
    const [text, setText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize do textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [text]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!text.trim() || isLoading) return;

        const messageToSend = text;
        setText(''); // Limpa instantaneamente para UX fluida
        
        // Reseta altura
        if (textareaRef.current) textareaRef.current.style.height = 'auto';

        await onSend(messageToSend);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Envia com Enter (sem Shift)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className={`
            relative flex items-end gap-2 p-2 rounded-xl border border-gray-700 bg-gray-800/50
            ${mode === 'compose' ? 'min-h-[100px]' : ''}
            focus-within:border-accent-primary/50 focus-within:bg-gray-800 transition-all
        `}>
            {/* Botão de Anexo (Clip) */}
            <button 
                type="button"
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-700"
                title="Anexar arquivo"
            >
                <FaPaperclip size={16} />
            </button>

            {/* Área de Texto Expansível */}
            <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={isLoading || isRecording}
                rows={1}
                className="flex-1 bg-transparent border-none outline-none text-gray-200 placeholder-gray-500 resize-none py-2 max-h-[200px] overflow-y-auto custom-scrollbar"
                style={{ minHeight: '24px' }}
            />

            {/* Ações da Direita (Microfone ou Enviar) */}
            <div className="flex gap-2">
                {text.trim() ? (
                    // Se tem texto, mostra botão ENVIAR
                    <button
                        onClick={() => handleSubmit()}
                        disabled={isLoading}
                        className="p-2 bg-accent-primary text-base-dark rounded-full hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Enviar"
                    >
                        <FaPaperPlane size={16} />
                    </button>
                ) : (
                    // Se não tem texto, mostra botão MICROFONE
                    <button
                        onClick={() => setIsRecording(!isRecording)}
                        className={`
                            p-2 rounded-full transition-all 
                            ${isRecording 
                                ? 'bg-red-500/20 text-red-500 animate-pulse' 
                                : 'text-gray-400 hover:text-white hover:bg-gray-700'}
                        `}
                        title={isRecording ? "Parar gravação" : "Gravar áudio"}
                    >
                        {isRecording ? <FaStop size={16} /> : <FaMicrophone size={16} />}
                    </button>
                )}
            </div>
            
            {/* Overlay de Gravação (Visualização futura) */}
            {isRecording && (
                <div className="absolute inset-0 bg-gray-900/90 rounded-xl flex items-center justify-center gap-3 z-20 backdrop-blur-sm">
                    <span className="text-red-400 font-medium animate-pulse">Gravando... 00:00</span>
                    {/* Aqui entraria a visualização da onda de áudio */}
                </div>
            )}
        </div>
    );
};