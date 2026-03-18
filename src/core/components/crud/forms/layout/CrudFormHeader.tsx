import React from 'react';
import { FaTimes } from 'react-icons/fa';

// --- Tipagens do Core ---
import { PresentationMode } from '../../types';

/**
 * @interface CrudFormHeaderProps
 * @description Contrato rigoroso de dependências do Cabeçalho.
 * O componente só recebe o que estritamente precisa para ser desenhado.
 */
export interface CrudFormHeaderProps {
    /** Nome do módulo/entidade (Ex: Oportunidades) */
    title: string;
    /** Descrição opcional abaixo do título */
    description?: string;
    /** Define se o texto será "Novo" ou "Editar" */
    isEdit: boolean;
    /** Roteador visual para saber se deve exibir o botão de Fechar */
    presentationMode: PresentationMode;
    /** Ação disparada ao clicar no X */
    onClose: () => void;
}

/**
 * ============================================================================
 * 🧩 CRUD FORM: HEADER (O Cabeçalho do Formulário)
 * @description Componente isolado puramente visual (Dumb Component). 
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (SOLID):
 * - Altamente testável, não possui estados internos (useState).
 * - Delega a ação de fechamento (onClose) para o Maestro que o chamou.
 * ============================================================================
 */
export const CrudFormHeader: React.FC<CrudFormHeaderProps> = ({
    title,
    description,
    isEdit,
    presentationMode,
    onClose
}) => {
    return (
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-800/30 flex-shrink-0">
            <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                    {isEdit ? `Editar ${title}` : `Novo(a) ${title}`}
                </h2>
                {description && (
                    <p className="text-xs text-gray-500 mt-1 animate-fade-in">
                        {description}
                    </p>
                )}
            </div>
            
            {/* * 🛡️ Regra de Negócio Visual: 
              * Em modo 'inline' (como no Cockpit), o formulário não tem botão de fechar, 
              * pois o painel central do próprio Cockpit já gerencia o roteamento de saída.
              */}
            {presentationMode !== 'inline' && (
                <button 
                    type="button"
                    onClick={onClose} 
                    className="text-gray-500 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors focus:outline-none"
                    title="Fechar Formulário"
                >
                    <FaTimes size={18} />
                </button>
            )}
        </div>
    );
};