'use client';

import React, { ReactNode } from 'react';
import { FaEdit, FaTrash, FaInbox, FaSync } from 'react-icons/fa';

// --- Tipagens e Contratos ---
import { CrudConfig, CrudCardBadge } from '../../../types/engine.types';

export interface CrudCardListProps<T> {
    data: T[];
    config: CrudConfig<T, any>;
    isLoading?: boolean;
    onEdit: (item: T) => void;
    onDelete: (id: string) => void;
    
    // 💡 INJEÇÃO DE ESTADO (O Fio Condutor)
    // Permite que o componente saiba qual item está em foco no Palco Central,
    // aplicando o CSS de destaque (Fundo mais escuro e borda colorida).
    selectedItemId?: string; 

    // 💡 INJEÇÃO DE EVENTO (O Novo Fio de Visualização)
    // Desacopla o clique no corpo do card do clique no botão de edição isolado.
    onViewRequest?: (item: T) => void;
}

/**
 * ============================================================================
 * 🃏 OPERÁRIO VISUAL: CrudCardList (Modo Barra Lateral / Mobile)
 * @description O motor de renderização especializado em listas estreitas.
 * Consome a propriedade `cardConfig` do Manual de Instruções para desenhar
 * cards altamente responsivos.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Fidelidade Visual & Separação de Eventos):
 * - Design System Herdado: Restaura o layout, os hovers e a marcação de 
 * seleção exatos do antigo CRM, garantindo a mesma excelência visual (UI/UX).
 * - Separação de Intenções: O corpo do card dispara `onViewRequest` (para Dossiês),
 * enquanto as ações rápidas mantêm o `onEdit` seguro por trás do `e.stopPropagation()`.
 * ============================================================================
 */
export function CrudCardList<T extends { id: string }>({
    data,
    config,
    isLoading,
    onEdit,
    onDelete,
    selectedItemId, // Recebe o ID do item focado
    onViewRequest   // Recebe o fio de visualização passiva
}: CrudCardListProps<T>) {

    // ========================================================================
    // 🧮 MOTOR DE EXTRAÇÃO DE DADOS (Dynamic Accessors)
    // Lê as chaves dinâmicas ou executa as funções de renderização do config.
    // ========================================================================
    const evaluate = (item: T, accessor?: keyof T | ((item: T) => any)): any => {
        if (!accessor) return null;
        if (typeof accessor === 'function') return accessor(item);
        return item[accessor];
    };

    // ========================================================================
    // 🎨 MOTOR DE CORES DA BADGE (Design System Restabelecido)
    // Cores extraídas cirurgicamente do componente legado.
    // ========================================================================
    const getBadgeStyle = (variant?: string) => {
        switch (variant) {
            case 'success': return 'bg-green-900/20 text-green-400 border-green-900/30';
            case 'danger': return 'bg-red-900/20 text-red-400 border-red-900/30';
            case 'warning': return 'bg-yellow-900/20 text-yellow-400 border-yellow-900/30';
            case 'info': return 'bg-blue-900/20 text-blue-400 border-blue-900/30';
            default: return 'bg-gray-800 text-gray-400 border-gray-700';
        }
    };

    // ========================================================================
    // ⏳ ESTADOS DE CARREGAMENTO E VAZIO
    // ========================================================================
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4 p-4 bg-gray-900/20 rounded-xl border border-gray-800 border-dashed">
                <FaSync className="animate-spin text-accent-primary w-8 h-8" />
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest animate-pulse text-center">
                    Sincronizando Dados...
                </p>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 p-6 bg-gray-900/20 rounded-xl border border-gray-800 border-dashed text-center">
                <FaInbox className="text-gray-700 w-12 h-12 mb-3 opacity-30" />
                <p className="text-gray-500 text-sm font-medium">Nenhum registro encontrado.</p>
                <p className="text-[10px] mt-1 text-gray-600">Verifique os filtros ou adicione um novo registro.</p>
            </div>
        );
    }

    // ========================================================================
    // 🖼️ RENDERIZAÇÃO DA LISTA DE CARDS (O Padrão Ouro Restabelecido)
    // ========================================================================
    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2 relative h-full">
            {data.map((item) => {
                
                // Extração Segura dos slots do Card
                const cConf = config.cardConfig;
                const titleText = cConf?.title ? evaluate(item, cConf.title) : evaluate(item, config.columns[0]?.accessor);
                const subtitleNode = evaluate(item, cConf?.subtitle) as ReactNode;
                const avatarNode = evaluate(item, cConf?.avatar) as ReactNode;
                const badgeData = evaluate(item, cConf?.badge) as CrudCardBadge | null;

                // 💡 A LÓGICA DE SELEÇÃO E CSS HERDADA
                const isSelected = selectedItemId === item.id;
                const baseClasses = "p-3 rounded-lg cursor-pointer transition border group relative";
                const stateClasses = isSelected 
                    ? "bg-gray-800 border-accent-secondary shadow-md" 
                    : "border-transparent hover:bg-gray-700 hover:border-gray-600";

                return (
                    <div 
                        key={item.id}
                        // 🛡️ CORREÇÃO ARQUITETURAL: A separação do clique!
                        // Se o Maestro forneceu o onViewRequest, disparamos a visualização.
                        // Caso contrário, faz fallback seguro para a edição original.
                        onClick={() => onViewRequest ? onViewRequest(item) : onEdit(item)}
                        className={`${baseClasses} ${stateClasses}`}
                    >
                        <div className="flex justify-between items-start">
                            
                            {/* --- LADO ESQUERDO: Dados e Avatar --- */}
                            <div className="flex flex-1 min-w-0 pr-2 gap-3">
                                <div className="flex flex-col justify-center min-w-0">
                                    <h3 className={`text-sm font-bold truncate transition-colors ${isSelected ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                                        {titleText || 'Registro sem Título'}
                                    </h3>
                                    
                                    {subtitleNode && (
                                        <div className="mt-1 text-xs text-gray-400 truncate">
                                            {subtitleNode}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* --- LADO DIREITO: Status e Ações --- */}
                            <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                                
                                {/* Badge de Status */}
                                {badgeData && (
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${getBadgeStyle(badgeData.variant)}`}>
                                        {badgeData.text}
                                    </span>
                                )}

                                {/* Botões de Ação (Aparecem no Hover ou se Selecionado) */}
                                <div className={`flex space-x-1 transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                    <button 
                                        onClick={(e) => {
                                            // 🛡️ Mantém a propagação isolada. Este botão sempre editará.
                                            e.stopPropagation();
                                            onEdit(item);
                                        }}
                                        className="p-1.5 text-gray-400 hover:text-accent-secondary hover:bg-gray-600 rounded transition-colors"
                                        title="Editar Registro"
                                    >
                                        <FaEdit className="w-3.5 h-3.5" />
                                    </button>
                                    
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(item.id);
                                        }}
                                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded transition-colors"
                                        title="Excluir Registro"
                                    >
                                        <FaTrash className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                );
            })}
        </div>
    );
}