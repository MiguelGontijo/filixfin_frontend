
import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaMicrophone, FaPaperclip, FaStop } from 'react-icons/fa';
import { useFilixAI } from '../context/FilixAIContext';

interface AgentInputProps {
    onSend: (message: string, attachments?: File[]) => Promise<void>;
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
    // --- 1. CONTEXTO GLOBAL ---
    const { inputDraft, setInputDraft } = useFilixAI();

    // --- 2. ESTADOS LOCAIS ---
    const [text, setText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // --- 3. EFEITOS ---

    // Monitora o Rascunho Global
    useEffect(() => {
        if (inputDraft && inputDraft.trim() !== '') {
            setText(inputDraft); 
            if (textareaRef.current) {
                textareaRef.current.focus();
            }
            setInputDraft('');
        }
    }, [inputDraft, setInputDraft]);

    // Auto-resize inteligente (Expande conforme digita, mas respeita se o usuário redimensionar)
    useEffect(() => {
        if (textareaRef.current) {
            // Apenas aplica o auto-resize se a altura do scroll for maior que o tamanho atual,
            // garantindo que não vamos "brigar" com o redimensionamento manual do usuário.
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [text]);

    // --- 4. HANDLERS ---

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!text.trim() || isLoading) return;

        const messageToSend = text;
        setText(''); 
        
        // Reseta altura para o mínimo após o envio
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        await onSend(messageToSend);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Envia com Enter (sem Shift). Permite pular linha com Shift+Enter.
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

            {/* --- ÁREA DE TEXTO (Atualizada) --- 
                - 'resize-y' ativado: O usuário pode puxar a caixa para baixo para ver textões.
                - 'min-h-[44px]': Acaba com o bug da barra de rolagem apertada da imagem.
                - 'max-h-[40vh]': Limite máximo razoável de expansão automática.
            */}
            <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={isLoading || isRecording}
                rows={1}
                className="flex-1 bg-transparent border-none outline-none text-gray-200 placeholder-gray-500 py-2 min-h-[44px] max-h-[40vh] resize-y overflow-y-auto custom-scrollbar"
            />

            {/* Ações da Direita (Microfone ou Enviar) */}
            <div className="flex gap-2 shrink-0">
                {text.trim() ? (
                    <button
                        onClick={() => handleSubmit()}
                        disabled={isLoading}
                        className="p-2 bg-accent-primary text-base-dark rounded-full hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-1"
                        title="Enviar"
                    >
                        <FaPaperPlane size={16} />
                    </button>
                ) : (
                    <button
                        onClick={() => setIsRecording(!isRecording)}
                        className={`
                            p-2 rounded-full transition-all mb-1
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
            
            {/* Overlay de Gravação */}
            {isRecording && (
                <div className="absolute inset-0 bg-gray-900/90 rounded-xl flex items-center justify-center gap-3 z-20 backdrop-blur-sm">
                    <span className="text-red-400 font-medium animate-pulse">Gravando... 00:00</span>
                </div>
            )}
        </div>
    );
};