'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
// Uso do alias conforme solicitado
import { WarehouseForm } from '@/modules/inventory/components/forms/WarehouseForm';
import { useWarehouses } from '@/modules/inventory/hooks/useWarehouses';

interface Props {
    params: {
        tenantId: string;
        id: string;
    };
}

/**
 * Rota: /dashboard/inventory/warehouses/[id]
 * Responsabilidade: Página de Edição. Busca o dado e alimenta o formulário.
 */
export default function EditWarehousePage({ params }: Props) {
    const router = useRouter();
    const { warehouses, isLoading, fetchWarehouses } = useWarehouses();

    // 1. Garante que os dados estão carregados
    useEffect(() => {
        fetchWarehouses();
    }, [fetchWarehouses]);

    // 2. Busca o depósito específico na lista carregada
    const warehouse = useMemo(() => {
        return warehouses.find((w) => w.id === params.id);
    }, [warehouses, params.id]);

    // 3. Renderização Condicional (Loading / Not Found / Form)
    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center p-12">
                <div className="text-gray-400 text-sm animate-pulse">Carregando dados do depósito...</div>
            </div>
        );
    }

    if (!isLoading && !warehouse) {
        return (
            <main className="flex-1 w-full h-full p-6">
                <div className="max-w-4xl mx-auto text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900">Depósito não encontrado</h3>
                    <p className="mt-1 text-sm text-gray-500">O local que você está tentando editar não existe ou foi removido.</p>
                    <button
                        onClick={() => router.back()}
                        className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                        Voltar
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="flex-1 w-full h-full p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6 flex items-center text-sm text-gray-500">
                    <span>Inventário</span>
                    <span className="mx-2">/</span>
                    <span>Depósitos</span>
                    <span className="mx-2">/</span>
                    <span className="font-medium text-gray-900">Editar: {warehouse?.name}</span>
                </div>

                {/* Renderiza o Formulário com os dados iniciais (initialData) */}
                <WarehouseForm 
                    tenantId={params.tenantId} 
                    initialData={warehouse} 
                />
            </div>
        </main>
    );
}