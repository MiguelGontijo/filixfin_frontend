import React from 'react';
import { MovementsList } from '@/modules/inventory/components/MovementsList';

interface Props {
    params: {
        tenantId: string;
    };
}

/**
 * Rota: /dashboard/inventory/movements
 * Responsabilidade: Exibir o histórico global de transações de estoque (Kardex).
 */
export default function MovementsPage({ params }: Props) {
    return (
        <main className="flex-1 w-full h-full p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
                {/* Breadcrumb Simples */}
                <div className="mb-6 flex items-center text-sm text-gray-500">
                    <span>Inventário</span>
                    <span className="mx-2">/</span>
                    <span className="font-medium text-gray-900">Histórico de Movimentações</span>
                </div>

                {/* Componente da Lista (Módulo) */}
                <MovementsList tenantId={params.tenantId} />
            </div>
        </main>
    );
}