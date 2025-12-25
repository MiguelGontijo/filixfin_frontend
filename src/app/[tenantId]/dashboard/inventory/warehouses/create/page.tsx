import React from 'react';
import { WarehouseForm } from '@/modules/inventory/components/forms/WarehouseForm';

interface Props {
    params: {
        tenantId: string;
    };
}

/**
 * Rota: /dashboard/inventory/warehouses/create
 * Responsabilidade: Página dedicada para cadastro de novos depósitos.
 * Comportamento: "Dumb Component" - Apenas renderiza o formulário do módulo.
 */
export default function CreateWarehousePage({ params }: Props) {
    return (
        <main className="flex-1 w-full h-full p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                {/* Breadcrumb simplificado visualmente (opcional) 
                  Pode ser substituído pelo seu componente de Breadcrumb oficial se houver.
                */}
                <div className="mb-6 flex items-center text-sm text-gray-500">
                    <span>Inventário</span>
                    <span className="mx-2">/</span>
                    <span>Depósitos</span>
                    <span className="mx-2">/</span>
                    <span className="font-medium text-gray-900">Novo</span>
                </div>

                {/* Renderiza o Formulário Inteligente */}
                <WarehouseForm tenantId={params.tenantId} />
            </div>
        </main>
    );
}