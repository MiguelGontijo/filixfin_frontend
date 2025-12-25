import React, { useEffect } from 'react';
import { useStockMovements } from '@/modules/inventory/hooks/useStockMovements';
import { TransactionType } from '@/modules/inventory/types/InventoryTypes';

// Definimos APENAS o que este componente precisa receber do Pai
// Isso não é um Type de Banco, é um contrato de comunicação entre componentes React.
interface Props {
    variantId: string; 
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

    // Função auxiliar simples para renderizar Badge (Apenas Visual)
    const renderTypeBadge = (type: TransactionType) => {
        const isEntry = type.startsWith('IN_');
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                isEntry 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
                {isEntry ? 'Entrada' : 'Saída'}
            </span>
        );
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500 animate-pulse">Carregando histórico...</div>;
    }

    if (!transactions || transactions.length === 0) {
        return (
            <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">Nenhuma movimentação registrada para este produto.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Histórico de Movimentações (Kardex)</h3>
            
            <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Local</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qtd</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doc</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(tx.createdAt).toLocaleString('pt-BR')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {renderTypeBadge(tx.type)}
                                    {/* Exibe detalhe do tipo se necessário, ex: tx.type */}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {/* Aqui usamos o objeto Warehouse real que vem da Transaction */}
                                    {tx.warehouse?.name || 'Local Indefinido'}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${
                                    Number(tx.quantity) > 0 ? 'text-green-600' : 'text-red-600'
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