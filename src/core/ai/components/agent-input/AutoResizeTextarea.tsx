import React, { useRef, useEffect } from 'react';

interface AutoResizeTextareaProps {
    /** O texto atual (Controlled Component). A fonte da verdade é o Pai. */
    value: string;
    
    /** Emite o novo texto para o Pai toda vez que o usuário digita algo. */
    onChange: (newValue: string) => void;
    
    /** Emite um sinal para o Pai quando o usuário aperta 'Enter' (sem o Shift). */
    onEnterSubmit: () => void;
    
    /** [NOVO] Emite um sinal para o Pai contendo os arquivos colados (Ctrl+V) */
    onPasteFiles?: (files: File[]) => void;
    
    placeholder?: string;
    disabled?: boolean;
}

/**
 * @component AutoResizeTextarea
 * @description O Cérebro da Caixa de Texto.
 * Encapsula a lógica de manipulação direta de DOM para o auto-resize e 
 * [NOVO] intercepta a Área de Transferência (Clipboard) para o Smart Paste.
 */
export const AutoResizeTextarea: React.FC<AutoResizeTextareaProps> = ({
    value,
    onChange,
    onEnterSubmit,
    onPasteFiles,
    placeholder,
    disabled = false
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // =========================================================================
    // 🧠 O MOTOR DE REDIMENSIONAMENTO (A Mágica do Auto-Resize)
    // =========================================================================
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;

        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
        
    }, [value]);

    // =========================================================================
    // ⌨️ INTERCEPTADORES DE TECLADO E ÁREA DE TRANSFERÊNCIA
    // =========================================================================
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); 
            if (value.trim().length > 0) {
                onEnterSubmit();
            }
        }
    };

    /**
     * @method handlePaste
     * @description O "Smart Paste". Inspeciona o que o usuário colou.
     * Se for texto, o navegador lida normalmente. Se for um Arquivo (print/imagem),
     * nós interceptamos e enviamos para a Bandeja.
     */
    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        // Verifica se existem arquivos na área de transferência
        if (e.clipboardData.files && e.clipboardData.files.length > 0) {
            // Evita que o navegador tente colar a imagem como se fosse texto (o que não funciona)
            e.preventDefault(); 
            
            const pastedFiles = Array.from(e.clipboardData.files);
            
            // Avisa o Maestro que arquivos chegaram pelo Ctrl+V
            if (onPasteFiles) {
                onPasteFiles(pastedFiles);
            }
        }
    };

    return (
        <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste} // [NOVO] O Ouvinte do Ctrl+V
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent border-none outline-none text-base-text placeholder-gray-500 py-2 min-h-[44px] max-h-[40vh] resize-y overflow-y-auto custom-scrollbar"
        />
    );
};