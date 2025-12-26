// src/modules/inventory/components/MovementsList.tsx

'use client';

import React, { useEffect } from 'react';
import { 
    FaArrowUp, 
    FaArrowDown, 
    FaHistory, 
    FaBox,
    FaWarehouse
} from 'react-icons/fa';
import { useStockMovements } from '../hooks/useStockMovements';
import { TransactionType } from '../types/InventoryTypes';

interface Props {
    variantId?: string;
}

/**
 * @component MovementsList
 * @description Kardex Visual alinhado ao tema Dark/Metallic do CRM.
 */
export const MovementsList: React.FC<Props> = ({ variantId }) => {
    
    const { 
        transactions, 
        isLoading, 
        fetchMovements 
    } = useStockMovements();

    useEffect(() => {
        fetchMovements({ variantId });
    }, [variantId, fetchMovements]);

    // --- Formatadores ---

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit', month: '2-digit', year: '2-digit',
            hour: '2-digit', minute: '2-digit'
        }).format(new Date(dateString));
    };

    /**
     * Estilização Dark Mode para os Badges
     */
    const getTransactionStyle = (type: TransactionType) => {
        const isEntry = type.startsWith('IN_');
        
        if (isEntry) {
            return {
                icon: <FaArrowUp className="w-2.5 h-2.5" />,
                // Fundo translúcido verde, texto verde claro, borda sutil
                badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
                amountClass: 'text-emerald-400',
                label: getTransactionLabel(type)
            };
        }
        
        return {
            icon: <FaArrowDown className="w-2.5 h-2.5" />,
            // Fundo translúcido vermelho, texto vermelho claro
            badgeClass: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
            amountClass: 'text-rose-400',
            label: getTransactionLabel(type)
        };
    };

    const getTransactionLabel = (type: TransactionType) => {
        const labels: Record<string, string> = {
            IN_PURCHASE: 'Compra',
            IN_TRANSFER: 'Entrada Transf.',
            IN_ADJUSTMENT: 'Sobra de Inv.',
            IN_RETURN: 'Devolução',
            OUT_SALE: 'Venda',
            OUT_CONSUMPTION: 'Consumo',
            OUT_LOSS: 'Perda/Quebra',
            OUT_TRANSFER: 'Saída Transf.',
            OUT_ADJUSTMENT: 'Falta de Inv.'
        };
        return labels[type] || type;
    };

    // --- Loading State (Skeleton Dark) ---
    if (isLoading) {
        return (
            <div className="w-full p-8 flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-primary"></div>
                <span className="text-sm text-gray-500 animate-pulse">Sincronizando Kardex...</span>
            </div>
        );
    }

    // --- Empty State (Estilo CRM) ---
    if (!isLoading && transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-700/50 rounded-xl bg-gray-800/20">
                <div className="p-4 bg-gray-800 rounded-full mb-4">
                    <FaHistory className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-300">Sem histórico</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-xs">
                    Nenhuma movimentação de estoque registrada para este contexto até o momento.
                </p>
            </div>
        );
    }

    // --- Tabela Dark ---
    return (
        <div className="overflow-hidden rounded-xl border border-gray-700 bg-base-metallic shadow-lg">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700/50">
                    
                    {/* Cabeçalho Escuro */}
                    <thead className="bg-gray-800/50">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Data
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Natureza
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Item / Depósito
                            </th>
                            <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Qtd.
                            </th>
                            <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Saldo Final
                            </th>
                        </tr>
                    </thead>

                    {/* Corpo da Tabela */}
                    <tbody className="divide-y divide-gray-700/50">
                        {transactions.map((tx) => {
                            const style = getTransactionStyle(tx.type);
                            
                            return (
                                <tr key={tx.id} className="hover:bg-gray-700/30 transition-colors duration-150">
                                    {/* Data */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                                        {formatDate(tx.createdAt)}
                                    </td>

                                    {/* Badge de Tipo */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${style.badgeClass}`}>
                                            <span className="mr-2">{style.icon}</span>
                                            {style.label}
                                        </span>
                                    </td>

                                    {/* Detalhes (Produto + Depósito) */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col space-y-1">
                                            {/* Nome do Produto */}
                                            <span className="text-sm font-medium text-gray-200 flex items-center">
                                                <FaBox className="mr-2 text-gray-500 w-3 h-3" />
                                                {tx.variant?.product?.name || 'Item Removido'}
                                                {tx.variant?.name && (
                                                    <span className="ml-2 text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
                                                        {tx.variant.name}
                                                    </span>
                                                )}
                                            </span>
                                            {/* Nome do Depósito */}
                                            <span className="text-xs text-gray-500 flex items-center ml-5">
                                                <FaWarehouse className="mr-1.5 w-2.5 h-2.5" />
                                                {tx.warehouse?.name || 'N/A'}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Quantidade Colorida */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold font-mono">
                                        <span className={style.amountClass}>
                                            {tx.type.startsWith('IN_') ? '+' : ''}{tx.quantity}
                                        </span>
                                    </td>

                                    {/* Saldo (Neutro) */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-300 font-mono bg-gray-800/20">
                                        {tx.newBalance}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};