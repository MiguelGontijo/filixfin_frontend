import React, { useEffect, useRef } from 'react';
import { FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

interface RecordingOverlayProps {
    /** Função delegada para descartar a gravação atual */
    onCancel: () => void;
    /** Função delegada para aceitar o texto e inseri-lo no rascunho */
    onConfirm: () => void;
    /** O texto que está a ser reconhecido em tempo real (Ditado) */
    transcript?: string;
    /** Mensagem de erro, caso o utilizador negue o microfone */
    error?: string | null;
}

/**
 * @component RecordingOverlay
 * @description A Camada de Feedback de Voz (Fase 3).
 * Exibe o estado da gravação, os erros de hardware e o texto a ser ditado em tempo real.
 * Mantém-se 100% Stateless (Dumb Component), recebendo tudo do Maestro.
 */
export const RecordingOverlay: React.FC<RecordingOverlayProps> = ({ 
    onCancel,
    onConfirm,
    transcript = "",
    error = null
}) => {
    // Referência para fazer o auto-scroll caso o utilizador dite um texto muito longo
    const textContainerRef = useRef<HTMLDivElement>(null);

    // Efeito de Qualidade Extrema (UX): Mantém o scroll sempre no final 
    // enquanto o utilizador vai falando novas palavras.
    useEffect(() => {
        if (textContainerRef.current) {
            textContainerRef.current.scrollTop = textContainerRef.current.scrollHeight;
        }
    }, [transcript]);

    return (
        // Layout flex-col para separar o cabeçalho (Ações) do corpo (Texto)
        <div className="absolute inset-0 bg-base-dark/95 rounded-xl flex flex-col justify-start p-3 z-20 backdrop-blur-sm border border-danger/30 animate-fade-in shadow-inner shadow-danger/10">
            
            {/* --- CABEÇALHO: STATUS E AÇÕES --- */}
            <div className="flex items-center justify-between mb-2 shrink-0 border-b border-gray-700/50 pb-2">
                
                {/* Lado Esquerdo: Indicador Visual */}
                <div className="flex items-center gap-3">
                    {!error && (
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-danger"></span>
                        </span>
                    )}
                    <span className={`text-xs font-bold tracking-wide uppercase ${error ? 'text-danger' : 'text-danger'}`}>
                        {error ? 'Erro no Microfone' : 'Escutando...'}
                    </span>
                </div>

                {/* Lado Direito: Botões de Controle */}
                <div className="flex items-center gap-4">
                    <button 
                        type="button"
                        onClick={onCancel}
                        className="text-xs font-semibold text-gray-400 hover:text-danger flex items-center gap-1.5 transition-colors focus:outline-none"
                        title="Descartar gravação"
                    >
                        <FaTimes size={12} /> Cancelar
                    </button>
                    
                    {!error && (
                        <button 
                            type="button"
                            onClick={onConfirm}
                            className="text-xs font-bold text-accent-primary hover:brightness-125 flex items-center gap-1.5 transition-colors focus:outline-none"
                            title="Aceitar texto"
                        >
                            <FaCheck size={12} /> Concluir
                        </button>
                    )}
                </div>
            </div>

            {/* --- CORPO: TRANSCRIÇÃO EM TEMPO REAL OU ERRO --- */}
            <div 
                ref={textContainerRef}
                className="flex-1 overflow-y-auto custom-scrollbar text-sm"
            >
                {error ? (
                    <div className="flex flex-col items-center justify-center h-full text-danger/80 gap-2 mt-2">
                        <FaExclamationTriangle size={20} />
                        <span className="text-center text-xs px-4">{error}</span>
                    </div>
                ) : (
                    <p className="text-base-text/90 italic leading-relaxed">
                        {transcript || <span className="text-gray-500">Pode começar a falar...</span>}
                    </p>
                )}
            </div>
            
        </div>
    );
};