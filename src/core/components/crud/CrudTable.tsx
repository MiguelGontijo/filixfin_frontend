'use client';

import React from 'react';
import { FaEdit, FaTrash, FaInbox } from 'react-icons/fa';
import { CrudColumn } from './types'; 

interface CrudTableProps<T> {
    data: T[];
    columns: CrudColumn<T>[]; 
    isLoading?: boolean;
    onEdit: (item: T) => void;
    onDelete: (id: string) => void;
    
    // 💡 INJEÇÃO DE EVENTO (O Novo Fio de Visualização)
    // Permite que a Tabela Master Data também acesse o Dashboard/Dossiê ao clicar na linha
    onViewRequest?: (item: T) => void;
}

/**
 * @component CrudTable
 * @description Um Grid de dados universal de alta performance.
 * Implementa a tecnologia de 'Dynamic Accessors' para permitir renderizações
 * complexas via configuração, mantendo o componente agnóstico e puro.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Paridade Arquitetural):
 * - Simetria de Eventos: A linha inteira responde à intenção de visualização (`onViewRequest`), 
 * enquanto os botões de ação na última coluna isolam as mutações (`onEdit`/`onDelete`) 
 * usando e.stopPropagation() para evitar vazamento de cliques (Event Bubbling).
 */
export function CrudTable<T extends { id: string }>({
    data,
    columns,
    isLoading,
    onEdit,
    onDelete,
    onViewRequest // Recebe o fio de visualização passiva
}: CrudTableProps<T>) {

    /**
     * @function renderCell
     * @description O motor de renderização da célula. 
     * Decide entre exibir um valor primitivo ou executar um componente funcional.
     */
    const renderCell = (item: T, column: CrudColumn<T>) => { 
        const { accessor } = column;

        // Se o accessor for uma função, delegamos a renderização para ela (Classe Ouro)
        if (typeof accessor === 'function') {
            return accessor(item);
        }

        // Se for uma string (chave), garantimos a renderização segura do valor
        const value = item[accessor as keyof T];
        
        if (typeof value === 'boolean') {
            return value ? 'Sim' : 'Não';
        }

        return String(value ?? '-');
    };

    // --- ESTADO DE CARREGAMENTO (Skeleton/Spinner) ---
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4 bg-gray-900/20 rounded-xl border border-gray-800 border-dashed">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent-primary"></div>
                <p className="text-gray-500 text-sm font-medium animate-pulse">Sincronizando dados...</p>
            </div>
        );
    }

    // --- ESTADO VAZIO ---
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-900/20 rounded-xl border border-gray-800 border-dashed">
                <FaInbox className="text-gray-700 w-12 h-12 mb-3 opacity-20" />
                <p className="text-gray-500 text-sm">Nenhum registro encontrado.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto custom-scrollbar border border-gray-800 rounded-xl bg-gray-900/10 shadow-inner h-full">
            <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-gray-800/50 sticky top-0 z-10 backdrop-blur-md">
                    <tr>
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                scope="col"
                                className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest"
                            >
                                {column.header}
                            </th>
                        ))}
                        <th scope="col" className="px-6 py-4 text-right text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                            Ações
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 bg-transparent">
                    {data.map((item) => (
                        <tr 
                            key={item.id} 
                            // 🛡️ O Roteamento de Intenção na Linha:
                            // Transforma a linha em um conduíte para o Dossiê/Dashboard.
                            onClick={() => onViewRequest ? onViewRequest(item) : onEdit(item)}
                            className="group hover:bg-accent-primary/5 transition-colors duration-150 cursor-pointer"
                        >
                            {columns.map((column, index) => (
                                <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {renderCell(item, column)}
                                </td>
                            ))}
                            
                            {/* --- COLUNA DE AÇÕES --- */}
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            // 🛡️ Prevenção de Event Bubbling: Garante que clicar no Lápis não acione a linha (Dossiê).
                                            e.stopPropagation();
                                            onEdit(item);
                                        }}
                                        className="p-2 text-gray-400 hover:text-accent-primary hover:bg-gray-800 rounded-lg transition-all"
                                        title="Editar registro"
                                    >
                                        <FaEdit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            // 🛡️ Prevenção de Event Bubbling.
                                            e.stopPropagation();
                                            onDelete(item.id);
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all"
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
    );
}