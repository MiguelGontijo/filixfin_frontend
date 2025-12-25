import React from 'react';
import { WarehousesList } from '@/modules/inventory/components/WarehousesList';

interface Props {
    params: {
        tenantId: string;
    };
}

/**
 * Rota: /dashboard/inventory/warehouses
 * Exibe a grade de depósitos cadastrados.
 */
export default function WarehousesListPage({ params }: Props) {
    return (
        <main className="flex-1 w-full h-full p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex items-center text-sm text-gray-500">
                    <span>Inventário</span>
                    <span className="mx-2">/</span>
                    <span className="font-medium text-gray-900">Depósitos</span>
                </div>

                <WarehousesList tenantId={params.tenantId} />
            </div>
        </main>
    );
}