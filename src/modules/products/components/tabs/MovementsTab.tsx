import React, { useEffect } from 'react';
import { useStockMovements } from '@/modules/inventory/hooks/useStockMovements';
import { TransactionType } from '@/modules/inventory/types/InventoryTypes';
import { MovementsList } from '@/modules/inventory/components/MovementsList';

// Definimos APENAS o que este componente precisa receber do Pai
interface Props {
    variantId?: string; 
}

export function MovementsTab({ variantId }: Props) {
    // Usando o Hook Real que você me enviou
    const { fetchKardex, transactions, isLoading } = useStockMovements();

    // Ao montar a aba (ou mudar o ID), busca os dados reais no Backend
    useEffect(() => {
        if (variantId) {
            fetchKardex(variantId);
        }
    }, [variantId, fetchKardex]);

    // Função auxiliar renderizar Badge (Visual Dark/Neon)
    const renderTypeBadge = (type: TransactionType) => {
        const isEntry = type.startsWith('IN_');
        return (
            <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                isEntry 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
                {isEntry ? 'Entrada' : 'Saída'}
            </span>
        );
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-400 animate-pulse">Carregando histórico...</div>;
    }

    if (!transactions || transactions.length === 0) {
        // Empty State Dark
        return (
            <div className="p-8 text-center bg-base-metallic rounded-lg border border-dashed border-gray-700">
                <p className="text-gray-400">Nenhuma movimentação registrada para este produto.</p>
            </div>
        );
    }

    if (!variantId) {
        return (
            <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-base-text">Kardex Global</h3>
                    <span className="text-xs text-gray-400 bg-gray-800 border border-gray-700 px-2 py-1 rounded">
                        Todas as Movimentações
                    </span>
                </div>
                
                {/* Reutiliza a lista do módulo de inventário (que já está Dark) */}
                <MovementsList />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-base-text">Histórico de Movimentações (Kardex)</h3>
            
            {/* Tabela Dark/Metallic */}
            <div className="overflow-hidden bg-base-metallic border border-gray-700 rounded-lg shadow-lg">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-900/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tipo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Local</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Qtd</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Doc</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-gray-700/30 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                                    {new Date(tx.createdAt).toLocaleString('pt-BR')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {renderTypeBadge(tx.type)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                                    {tx.warehouse?.name || 'Local Indefinido'}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right font-mono ${
                                    Number(tx.quantity) > 0 ? 'text-emerald-400' : 'text-rose-400'
                                }`}>
                                    {Number(tx.quantity) > 0 ? '+' : ''}{tx.quantity}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {tx.documentRef || '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}