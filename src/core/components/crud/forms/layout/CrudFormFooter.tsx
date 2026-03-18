import React from 'react';
import { FaSave } from 'react-icons/fa';

/**
 * @interface CrudFormFooterProps
 * @description Contrato rigoroso de dependências do Rodapé.
 * Isola a lógica de botões e estado de submissão do resto do formulário.
 */
export interface CrudFormFooterProps {
    /** Define o texto do botão principal ('Atualizar' vs 'Cadastrar') */
    isEdit: boolean;
    /** Estado de transação em andamento, bloqueia duplo clique e exibe spinner */
    isSubmitting: boolean;
    /** Ação de cancelamento ou fechamento do painel */
    onClose: () => void;
}

/**
 * ============================================================================
 * 🧩 CRUD FORM: FOOTER (As Ações do Formulário)
 * @description Componente isolado responsável pelas chamadas de ação (CTA).
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Performance e Acessibilidade):
 * - O botão de submit fica bloqueado (disabled) durante transações de rede, 
 * prevenindo a criação de registros duplicados no banco de dados.
 * - Feedback visual de loading (Spinner) integrado sem depender de bibliotecas externas.
 * ============================================================================
 */
export const CrudFormFooter: React.FC<CrudFormFooterProps> = ({
    isEdit,
    isSubmitting,
    onClose
}) => {
    return (
        <div className="p-5 border-t border-gray-800 bg-gray-900/80 flex justify-end gap-3 flex-shrink-0">
            
            {/* 🛑 Botão Secundário: Abortar Operação */}
            <button 
                type="button" 
                onClick={onClose} 
                disabled={isSubmitting}
                className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Cancelar operação"
            >
                Cancelar
            </button>

            {/* 🚀 Botão Principal: Submeter Dados */}
            <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-8 py-2.5 bg-accent-primary hover:bg-orange-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                aria-busy={isSubmitting}
            >
                {isSubmitting ? (
                    <span className="flex items-center">
                        {/* Spinner CSS puro de alta performance */}
                        <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span> 
                        Salvando...
                    </span>
                ) : (
                    <>
                        <FaSave /> 
                        {isEdit ? 'Atualizar' : 'Cadastrar'}
                    </>
                )}
            </button>
        </div>
    );
};