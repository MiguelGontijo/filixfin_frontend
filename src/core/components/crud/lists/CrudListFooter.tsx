import React from 'react';

// --- Contratos ---
import { ListMode } from '../types';

/**
 * @interface CrudListFooterProps
 * @description Contrato estrito de dependências do Rodapé da Listagem.
 * * 🏆 PADRÃO CLASSE OURO (SOLID - Princípio do Menor Privilégio):
 * O rodapé não recebe a matriz de dados (array) nem o objeto de configuração. 
 * Ele recebe estritamente um número inteiro (totalItems), garantindo máxima performance 
 * e nenhuma re-renderização desnecessária.
 */
export interface CrudListFooterProps {
    /** @description Número total de registros visíveis após os filtros locais */
    totalItems: number;
    /** @description O Roteador Visual: Define se renderiza o rodapé compacto ou o modo Tabela */
    listMode: ListMode;
}

/**
 * ============================================================================
 * 🦶 OPERÁRIO VISUAL: CrudListFooter (O Rodapé Metadados)
 * @description Isola a lógica visual da base das listagens.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO:
 * - Modo Cards (Compacto): Reproduz pixel a pixel o rodapé original do widget, 
 * com alinhamento centralizado, borda superior sutil e texto minúsculo (text-[10px]).
 * - Modo Tabela (Master): Layout espaçado e flexível, preparado estruturalmente
 * para receber componentes de paginação (Pagination) no futuro.
 * ============================================================================
 */
export function CrudListFooter({ totalItems, listMode }: CrudListFooterProps) {
    
    // ========================================================================
    // 🃏 ESTRATÉGIA 1: MODO COMPACTO (A Barra Lateral)
    // ========================================================================
    if (listMode === 'cards') {
        return (
            <div className="p-3 border-t border-gray-800 bg-gray-900/50 text-center flex-shrink-0">
                <span className="text-[10px] font-medium text-gray-500">
                    {totalItems} registro(s) carregado(s)
                </span>
            </div>
        );
    }

    // ========================================================================
    // 📊 ESTRATÉGIA 2: MODO MASTER DATA (Tabela em Tela Cheia)
    // ========================================================================
    return (
        <div className="p-4 border-t border-gray-800 bg-gray-900/30 flex justify-between items-center flex-shrink-0 mt-2 rounded-b-xl transition-colors">
            <span className="text-xs font-medium text-gray-400">
                Total de <strong className="text-gray-300">{totalItems}</strong> registro(s) encontrado(s)
            </span>
            
            {/* 🚀 Ponto de Extensão Futura (Open/Closed Principle):
                Controles de Paginação (Next/Prev) entrarão neste slot sem a 
                necessidade de refatorar o componente pai (CrudLayout). 
            */}
            <div className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">
                Fim da Lista
            </div>
        </div>
    );
}