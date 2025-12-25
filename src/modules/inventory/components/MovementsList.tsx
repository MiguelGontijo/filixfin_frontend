'use client';

import React, { useState } from 'react'; // Adicionei useState para mocks temporários se o hook não tiver fetchAll
import Link from 'next/link';
import { TransactionType, InventoryTransaction } from '../types/InventoryTypes';

// Importando tipos, mas simulando dados por enquanto caso o hook de listagem global não esteja pronto
// Em produção: import { useStockMovements } from '../hooks/useStockMovements';

interface Props {
    tenantId: string;
}

export function MovementsList({ tenantId }: Props) {
    // TODO: Conectar com endpoint real de listagem global (GET /movements)
    // const { movements, isLoading } = useStockMovements(); 
    
    // Mock de dados para visualização imediata da interface
    const [movements] = useState<InventoryTransaction[]>([
        {
            id: '1',
            warehouseId: 'w1',
            variantId: 'v1',
            type: TransactionType.IN_PURCHASE,
            quantity: 100,
            unitCost: 12.50,
            totalValue: 1250.00,
            createdAt: new Date().toISOString(),
            previousBalance: 0,
            newBalance: 100,
            createdBy: 'admin',
            warehouse: { name: 'Depósito Central', id: 'w1', isActive: true, isDefault: true, allowsNegativeStock: false },
            variant: { name: 'Coca-Cola 2L', sku: 'BEB-001' },
            documentRef: 'NF-5501'
        },
        {
            id: '2',
            warehouseId: 'w1',
            variantId: 'v1',
            type: TransactionType.OUT_SALE,
            quantity: -5,
            unitCost: 12.50,
            totalValue: 0,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            previousBalance: 100,
            newBalance: 95,
            createdBy: 'admin',
            warehouse: { name: 'Depósito Central', id: 'w1', isActive: true, isDefault: true, allowsNegativeStock: false },
            variant: { name: 'Coca-Cola 2L', sku: 'BEB-001' },
            documentRef: 'PDV-10'
        }
    ]);

    // Helper de Formatação
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // Helper de Badges (Cores por Tipo)
    const getTypeBadge = (type: TransactionType) => {
        const styles: Record<string, string> = {
            [TransactionType.IN_PURCHASE]: 'bg-green-100 text-green-800 border-green-200',
            [TransactionType.IN_TRANSFER]: 'bg-blue-100 text-blue-800 border-blue-200',
            [TransactionType.IN_ADJUSTMENT]: 'bg-indigo-100 text-indigo-800 border-indigo-200',
            [TransactionType.IN_RETURN]: 'bg-teal-100 text-teal-800 border-teal-200',
            
            [TransactionType.OUT_SALE]: 'bg-gray-100 text-gray-800 border-gray-200',
            [TransactionType.OUT_CONSUMPTION]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            [TransactionType.OUT_LOSS]: 'bg-red-100 text-red-800 border-red-200',
            [TransactionType.OUT_ADJUSTMENT]: 'bg-orange-100 text-orange-800 border-orange-200',
            [TransactionType.OUT_TRANSFER]: 'bg-blue-50 text-blue-600 border-blue-100',
        };

        const labels: Record<string, string> = {
            [TransactionType.IN_PURCHASE]: 'Compra',
            [TransactionType.IN_TRANSFER]: 'Transf. Entrada',
            [TransactionType.IN_ADJUSTMENT]: 'Sobras',
            [TransactionType.IN_RETURN]: 'Devolução',
            [TransactionType.OUT_SALE]: 'Venda',
            [TransactionType.OUT_CONSUMPTION]: 'Consumo',
            [TransactionType.OUT_LOSS]: 'Perda/Quebra',
            [TransactionType.OUT_ADJUSTMENT]: 'Faltas',
            [TransactionType.OUT_TRANSFER]: 'Transf. Saída',
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[type] || 'bg-gray-100 text-gray-800'}`}>
                {labels[type] || type}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Histórico de Movimentações</h2>
                    <p className="text-sm text-gray-500">Auditoria completa de entradas e saídas.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
                        Exportar
                    </button>
                    <Link
                        href={`/dashboard/inventory/movements/create`}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                        + Nova Movimentação
                    </Link>
                </div>
            </div>

            {/* Tabela */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Local</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd.</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doc.</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {movements.length > 0 ? (
                            movements.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(tx.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{tx.variant?.name || 'Item Removido'}</div>
                                        <div className="text-xs text-gray-500">{tx.variant?.sku || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getTypeBadge(tx.type)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {tx.warehouse?.name}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${tx.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {tx.quantity > 0 ? '+' : ''}{tx.quantity}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        {tx.documentRef || '-'}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                                    Nenhuma movimentação registrada neste período.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}