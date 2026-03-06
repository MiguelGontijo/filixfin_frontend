import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaMicrophone, FaPaperclip, FaSpinner } from 'react-icons/fa';
import { useFilixAI } from '../../context/FilixAIContext';

// --- IMPORTAÇÃO DOS FILHOS (Dumb Components) ---
import { StagingArea } from './StagingArea';
import { AutoResizeTextarea } from './AutoResizeTextarea';
import { RecordingOverlay } from './RecordingOverlay';

// --- IMPORTAÇÃO DOS SERVIÇOS E HOOKS (Trabalhadores Invisíveis) ---
import { compressImage } from '../../utils/imageCompressor';
import { useSpeechToText } from '../../hooks/useSpeechToText';

interface AgentInputProps {
    onSend: (message: string, attachments?: File[]) => Promise<void>;
    mode?: 'chat' | 'compose';
    isLoading?: boolean;
    placeholder?: string;
}

/**
 * @component AgentInput
 * @description O Maestro da Entrada Multimodal.
 * [FASE 3 ATIVA]: Integração completa com Web Speech API (Ditado de Voz).
 * Orquestra texto, recortes pesados (Smart Paste) e áudio numa única interface.
 */
export const AgentInput: React.FC<AgentInputProps> = ({ 
    onSend, 
    mode = 'chat', 
    isLoading = false, 
    placeholder = "Digite, anexe um ficheiro ou grave um áudio..." 
}) => {
    // --- 1. CONTEXTO GLOBAL ---
    const { inputDraft, setInputDraft } = useFilixAI();

    // --- 2. ESTADOS LOCAIS (A Mesa de Rascunho) ---
    const [text, setText] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isCompressing, setIsCompressing] = useState(false);
    
    // Controle visual da tela de gravação (diferente de estar efetivamente a gravar)
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);
    
    // Referências
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- 3. O TRABALHADOR DE VOZ (O Ouvido da IA) ---
    const { 
        transcript, 
        error: speechError, 
        startRecording, 
        stopRecording, 
        clearTranscript 
    } = useSpeechToText();

    // --- 4. EFEITOS DE SINCRONIZAÇÃO ---
    useEffect(() => {
        if (inputDraft && inputDraft.trim() !== '') {
            setText(prev => prev + (prev ? ' ' : '') + inputDraft); 
            setInputDraft('');
        }
    }, [inputDraft, setInputDraft]);

    // --- 5. LÓGICA DE NEGÓCIO: VOZ ---

    /** Abre a tela preta e manda o navegador ligar o microfone */
    const handleStartRecording = () => {
        setIsOverlayOpen(true);
        startRecording();
    };

    /** O utilizador desistiu da gravação (Clica em Cancelar) */
    const handleCancelRecording = () => {
        stopRecording();
        clearTranscript();
        setIsOverlayOpen(false);
    };

    /** O utilizador gostou do texto ditado (Clica em Concluir) */
    const handleConfirmRecording = () => {
        if (transcript) {
            // Inteligência UX: Se já houver texto na caixa, adiciona um espaço antes de colar o áudio
            setText(prev => prev + (prev.endsWith(' ') || !prev ? '' : ' ') + transcript);
        }
        stopRecording();
        clearTranscript();
        setIsOverlayOpen(false);
    };

    // --- 6. LÓGICA DE NEGÓCIO: ARQUIVOS E ENVIO ---

    const processAndAddFiles = async (rawFiles: File[]) => {
        setIsCompressing(true);
        try {
            const processedFiles = await Promise.all(
                rawFiles.map(file => compressImage(file))
            );
            setAttachments(prev => [...prev, ...processedFiles]);
        } catch (error) {
            console.error("❌ [AgentInput] Falha na compressão. Usando originais.", error);
            setAttachments(prev => [...prev, ...rawFiles]);
        } finally {
            setIsCompressing(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            await processAndAddFiles(Array.from(e.target.files));
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleRemoveAttachment = (indexToRemove: number) => {
        setAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async () => {
        const trimmedText = text.trim();
        
        if ((!trimmedText && attachments.length === 0) || isLoading || isCompressing) return;

        const messageToSend = trimmedText;
        const filesToSend = [...attachments]; 

        setText(''); 
        setAttachments([]);
        
        // Garante que se havia gravação pendente, ela é morta
        if (isOverlayOpen) handleCancelRecording();

        await onSend(messageToSend, filesToSend);
    };

    // --- 7. RENDERIZAÇÃO ---
    
    const canSend = text.trim().length > 0 || attachments.length > 0;
    const isBusy = isLoading || isCompressing || isOverlayOpen;

    return (
        <div className={`
            relative flex flex-col rounded-xl border transition-all
            ${mode === 'compose' ? 'min-h-[100px]' : ''}
            border-base-metallic bg-base-metallic/30 focus-within:border-accent-primary/50 focus-within:bg-base-metallic/60
            ${isCompressing ? 'opacity-80 pointer-events-none' : ''}
        `}>
            
            <StagingArea 
                files={attachments} 
                onRemove={handleRemoveAttachment} 
            />

            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple 
                onChange={handleFileSelect}
            />

            <div className="flex items-end gap-2 p-2">
                
                <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()} 
                    disabled={isBusy}
                    className="p-2 text-gray-400 hover:text-base-text transition-colors rounded-full hover:bg-base-metallic disabled:opacity-50 focus:outline-none"
                    title="Anexar documento ou imagem"
                >
                    <FaPaperclip size={16} />
                </button>

                <AutoResizeTextarea 
                    value={text}
                    onChange={setText}
                    onEnterSubmit={handleSubmit}
                    onPasteFiles={(files) => processAndAddFiles(files)} 
                    placeholder={attachments.length > 0 ? "Adicione um comentário (opcional)..." : placeholder}
                    disabled={isBusy}
                />

                <div className="flex gap-2 shrink-0">
                    {canSend ? (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isBusy}
                            className="p-2 bg-accent-primary text-base-dark rounded-full hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-wait mb-1 shadow-md shadow-accent-primary/20 focus:outline-none"
                            title="Enviar mensagem"
                        >
                            {isCompressing ? <FaSpinner className="animate-spin" size={16} /> : <FaPaperPlane size={16} />}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleStartRecording}
                            disabled={isBusy}
                            className="p-2 text-gray-400 hover:text-base-text transition-colors rounded-full hover:bg-base-metallic disabled:opacity-50 mb-1 focus:outline-none"
                            title="Gravar áudio"
                        >
                            <FaMicrophone size={16} />
                        </button>
                    )}
                </div>
            </div>
            
            {/* O TIJOLO VISUAL DA VOZ */}
            {isOverlayOpen && (
                <RecordingOverlay 
                    transcript={transcript}
                    error={speechError}
                    onCancel={handleCancelRecording} 
                    onConfirm={handleConfirmRecording}
                />
            )}
        </div>
    );
};