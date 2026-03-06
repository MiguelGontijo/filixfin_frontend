import React from 'react';
import { FaTimes, FaFileAlt, FaFilePdf, FaImage } from 'react-icons/fa';

interface StagingAreaProps {
    /** Lista de arquivos físicos atualmente na memória (Mesa de Rascunho) */
    files: File[];
    /** Função delegada para remover um arquivo específico pelo índice */
    onRemove: (indexToRemove: number) => void;
}

/**
 * @component StagingArea
 * @description A Bandeja de Preparação Multimodal.
 * Um "Dumb Component" (Componente Burro) que apenas renderiza os arquivos 
 * que estão aguardando envio. Isola a complexidade visual do input principal.
 */
export const StagingArea: React.FC<StagingAreaProps> = ({ files, onRemove }) => {
    
    // Se não houver arquivos, o componente "desaparece" sem quebrar o layout do pai
    if (!files || files.length === 0) return null;

    /**
     * @helper getFileIcon
     * @description Inspeciona o MIME type do arquivo e devolve o ícone semântico apropriado.
     * Utiliza as cores de acento do Design System para fácil identificação visual.
     */
    const getFileIcon = (fileType: string) => {
        if (fileType.includes('pdf')) {
            return <FaFilePdf className="text-danger" />; // PDF = Vermelho (Padrão Adobe)
        }
        if (fileType.includes('image')) {
            return <FaImage className="text-accent-secondary" />; // Imagem = Roxo do Tema
        }
        // Fallback genérico para planilhas, docs, etc.
        return <FaFileAlt className="text-gray-400" />; 
    };

    return (
        // Container principal da bandeja. 
        // border-b sutil separa a bandeja da área de digitação que ficará logo abaixo.
        <div className="flex flex-wrap gap-2 p-3 border-b border-base-metallic/50 bg-base-dark/30 rounded-t-xl">
            
            {files.map((file, index) => (
                <div 
                    // Usamos index no key porque arquivos podem ter o mesmo nome, 
                    // e a ordem na bandeja importa.
                    key={`${file.name}-${index}`} 
                    className="flex items-center gap-2 bg-base-metallic px-2.5 py-1.5 rounded-lg border border-gray-700 shadow-sm animate-fade-in-down"
                >
                    {/* 1. Ícone Semântico */}
                    {getFileIcon(file.type)}
                    
                    {/* 2. Nome do Arquivo com Truncate (evita quebrar o layout se o nome for gigante) */}
                    <span 
                        className="text-xs font-medium text-base-text truncate max-w-[120px] select-none" 
                        title={file.name} // Tooltip nativo para ler o nome completo no hover
                    >
                        {file.name}
                    </span>
                    
                    {/* 3. Botão de Remoção (O Poder do Arrependimento) */}
                    <button 
                        onClick={() => onRemove(index)}
                        className="ml-1 text-gray-500 hover:text-danger hover:bg-danger/10 p-1 rounded-md transition-colors focus:outline-none"
                        title="Remover anexo"
                        type="button" // Evita submeter formulários acidentalmente
                    >
                        <FaTimes size={10} />
                    </button>
                </div>
            ))}
        </div>
    );
};