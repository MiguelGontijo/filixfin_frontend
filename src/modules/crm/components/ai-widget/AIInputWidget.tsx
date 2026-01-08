// src/modules/crm/components/ai-widget/AIInputWidget.tsx

import React, { useState } from 'react';
import { FaMicrophone, FaPaperPlane, FaMagic, FaBrain } from 'react-icons/fa';

interface AIInputWidgetProps {
    onAnalyze: (text: string) => void;
    isAnalyzing: boolean;
    // --- NOVAS PROPS PARA CONTROLE DE ESTADO ---
    value: string;
    onChange: (text: string) => void;
}

/**
 * @component AIInputWidget
 * @description Console de entrada multimodal (Texto/Voz).
 * @update Refatorado para ser um componente CONTROLADO (Controlled Component).
 * O estado do texto agora reside no pai (CRMPage), permitindo limpeza externa.
 */
export const AIInputWidget: React.FC<AIInputWidgetProps> = ({ 
    onAnalyze, 
    isAnalyzing,
    value,      // Recebe do pai
    onChange    // Notifica o pai
}) => {
    
    // O estado local 'text' foi removido. Usamos 'value'.
    const [isRecording, setIsRecording] = useState(false);

    const handleSend = () => {
        if (!value.trim()) return;
        onAnalyze(value);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleMicClick = () => {
        setIsRecording(!isRecording);
        if (!isRecording) {
            console.log("Microfone ativado...");
            // Futuro: Implementar Web Speech API aqui e chamar onChange(transcrição)
        }
    };

    return (
        <div className="bg-base-metallic border-t border-gray-700 p-3 flex flex-col h-full">
            
            {/* Header do Widget */}
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                    <FaBrain className="text-accent-primary w-4 h-4" />
                    <label className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                        Filix IA
                    </label>
                </div>
                
                {isAnalyzing && (
                    <span className="text-[10px] text-accent-secondary flex items-center animate-pulse font-bold">
                        <FaMagic className="mr-1" /> Processando...
                    </span>
                )}
            </div>

            <div className="flex-1 relative">
                <textarea
                    value={value} // Controlado pelo Pai
                    onChange={(e) => onChange(e.target.value)} // Atualiza o Pai
                    onKeyDown={handleKeyDown}
                    className="w-full h-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm text-white resize-none focus:ring-1 focus:ring-accent-primary focus:border-accent-primary focus:outline-none scrollbar-thin scrollbar-thumb-gray-700 placeholder-gray-500"
                    placeholder="Digite uma nota, cole um e-mail ou use o microfone..."
                    disabled={isAnalyzing}
                />
                
                <button 
                    onClick={handleMicClick}
                    className={`absolute bottom-2 right-2 p-2 rounded-full transition ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500'}`}
                    title="Gravar Áudio"
                >
                    <FaMicrophone className="w-3 h-3" />
                </button>
            </div>

            <div className="mt-2">
                <button
                    onClick={handleSend}
                    disabled={isAnalyzing || !value.trim()}
                    className="w-full flex items-center justify-center py-2 bg-accent-primary hover:bg-orange-600 text-base-dark font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-xs shadow-lg transform active:scale-95"
                >
                    {isAnalyzing ? 'Analisando...' : <><FaPaperPlane className="mr-2" /> Enviar para Análise</>}
                </button>
            </div>
        </div>
    );
};