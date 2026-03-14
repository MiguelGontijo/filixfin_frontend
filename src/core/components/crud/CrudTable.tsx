// ===== FILE: src/core/components/crud/CrudTable.tsx =====

import React from 'react';
import { FaEdit, FaTrash, FaInbox } from 'react-icons/fa';
import { CrudColumnConfig } from './types';

interface CrudTableProps<T> {
    data: T[];
    columns: CrudColumnConfig<T>[];
    isLoading: boolean;
    onEdit: (item: T) => void;
    onDelete: (id: string) => void;
}

/**
 * @component CrudTable
 * @description O Motor de Exibição (Grid). 
 * Renderiza os dados dinamicamente com base nas colunas configuradas.
 * Possui estados nativos de Loading e Empty (Vazio) aderentes ao Design System.
 */
export function CrudTable<T extends { id: string } & Record<string, any>>({
    data,
    columns,
    isLoading,
    onEdit,
    onDelete
}: CrudTableProps<T>) {

    // =========================================================================
    // 🎨 FORMATADOR POLIMÓRFICO DE CÉLULAS (Cell Renderer)
    // =========================================================================
    const renderCell = (item: T, col: CrudColumnConfig<T>) => {
        const value = item[col.key];

        // Proteção contra dados nulos
        if (value === null || value === undefined) {
            return <span className="text-gray-600">-</span>;
        }

        switch (col.type) {
            case 'boolean':
                // Desenha a Badge Enterprise (Verde/Vermelha) para booleanos
                const isTruthy = Boolean(value);
                return (
                    <span className={`
                        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border
                        ${isTruthy 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }
                    `}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isTruthy ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {isTruthy ? 'Ativo' : 'Inativo'}
                    </span>
                );

            case 'currency':
                // Formatação Monetária BR
                const numValue = Number(value);
                return (
                    <span className="font-mono text-green-400 font-medium">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(isNaN(numValue) ? 0 : numValue)}
                    </span>
                );

            case 'date':
                // Formatação de Data
                const dateValue = new Date(String(value));
                return (
                    <span className="text-gray-300">
                        {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(dateValue)}
                    </span>
                );

            case 'text':
            default:
                // Texto padrão com suporte a truncate se for muito longo
                return (
                    <span className="text-sm font-medium text-base-text transition-colors group-hover:text-accent-primary">
                        {String(value)}
                    </span>
                );
        }
    };

    // =========================================================================
    // 🖼️ RENDERIZAÇÃO DA TABELA
    // =========================================================================
    return (
        <div className="bg-base-metallic rounded-xl border border-gray-700 shadow-xl overflow-hidden animate-fade-in">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="min-w-full divide-y divide-gray-700">
                    
                    {/* CABEÇALHO (Thead) */}
                    <thead className="bg-gray-900/50">
                        <tr>
                            {columns.map((col) => (
                                <th 
                                    key={String(col.key)} 
                                    scope="col" 
                                    className={`px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-${col.align || 'left'}`}
                                >
                                    {col.label}
                                </th>
                            ))}
                            {/* Coluna fixa de Ações à direita */}
                            <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>

                    {/* CORPO DA TABELA (Tbody) */}
                    <tbody className="divide-y divide-gray-700/50">
                        
                        {/* ESTADO 1: CARREGANDO */}
                        {isLoading && data.length === 0 && (
                            <tr>
                                <td colSpan={columns.length + 1} className="px-6 py-12">
                                    <div className="flex flex-col items-center justify-center space-y-3 animate-pulse">
                                        <div className="h-8 w-8 rounded-full border-2 border-t-accent-primary border-r-transparent border-b-accent-primary/30 border-l-transparent animate-spin"></div>
                                        <span className="text-gray-500 text-sm font-medium tracking-wide">Carregando registros...</span>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* ESTADO 2: VAZIO (Nenhum registro) */}
                        {!isLoading && data.length === 0 && (
                            <tr>
                                <td colSpan={columns.length + 1} className="px-6 py-16">
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <div className="p-4 bg-gray-900 rounded-full mb-4 border border-gray-700 shadow-inner">
                                            <FaInbox className="w-8 h-8 text-gray-600" />
                                        </div>
                                        <h3 className="text-lg font-medium text-base-text mb-1">Nenhum registro encontrado</h3>
                                        <p className="text-gray-500 text-sm max-w-sm">
                                            Ainda não há dados cadastrados para esta entidade ou a sua busca não retornou resultados.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* ESTADO 3: LISTAGEM DE DADOS */}
                        {!isLoading && data.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-700/30 transition-colors duration-200 group">
                                
                                {/* Células Dinâmicas */}
                                {columns.map((col) => (
                                    <td 
                                        key={String(col.key)} 
                                        className={`px-6 py-4 whitespace-nowrap text-${col.align || 'left'}`}
                                    >
                                        {renderCell(item, col)}
                                    </td>
                                ))}

                                {/* Célula Fixa de Ações */}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {/* Botões ficam opacos até a linha receber hover (UX Clean) */}
                                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button 
                                            onClick={() => onEdit(item)}
                                            className="text-gray-400 hover:text-accent-primary p-1.5 hover:bg-gray-800 rounded transition-all" 
                                            title="Editar registro"
                                        >
                                            <FaEdit className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => onDelete(item.id)}
                                            className="text-gray-400 hover:text-rose-500 p-1.5 hover:bg-rose-500/10 rounded transition-all" 
                                            title="Excluir registro"
                                        >
                                            <FaTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                    </tbody>
                </table>
            </div>
            
            {/* RODAPÉ DO GRID (Contador) */}
            {!isLoading && data.length > 0 && (
                <div className="p-3 border-t border-gray-700 bg-gray-900/30 text-right">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                        {data.length} registro(s) listado(s)
                    </span>
                </div>
            )}
        </div>
    );
}