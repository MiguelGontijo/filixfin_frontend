'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useWarehouses } from '../hooks/useWarehouses';
import { Warehouse } from '../types/InventoryTypes';

interface Props {
    tenantId: string;
}

export function WarehousesList({ tenantId }: Props) {
    const { warehouses, isLoading, fetchWarehouses } = useWarehouses();

    // Busca os dados ao montar o componente
    useEffect(() => {
        fetchWarehouses();
    }, [fetchWarehouses]);

    // Renderização de Carregamento (Skeleton Simples)
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-40 bg-gray-100 rounded-lg border border-gray-200"></div>
                ))}
            </div>
        );
    }

    // Renderização de Estado Vazio
    if (!isLoading && warehouses.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum depósito cadastrado</h3>
                <p className="mt-1 text-sm text-gray-500">Comece criando o local onde seus produtos são armazenados.</p>
                <div className="mt-6">
                    <Link
                        href={`/dashboard/inventory/warehouses/create`}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                        Criar Primeiro Depósito
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header da Seção */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Locais de Estoque</h2>
                    <p className="text-sm text-gray-500">Gerencie seus depósitos físicos, lojas e áreas de reserva.</p>
                </div>
                <Link
                    href={`/dashboard/inventory/warehouses/create`}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                >
                    + Novo Local
                </Link>
            </div>

            {/* Grid de Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {warehouses.map((warehouse) => (
                    <div 
                        key={warehouse.id} 
                        className={`relative group bg-white rounded-lg border transition-shadow hover:shadow-md ${
                            warehouse.isDefault ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-200'
                        }`}
                    >
                        {/* Badge de Padrão */}
                        {warehouse.isDefault && (
                            <div className="absolute top-0 right-0 -mt-2 -mr-2">
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 shadow-sm">
                                    Padrão
                                </span>
                            </div>
                        )}

                        <div className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center">
                                    <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900">{warehouse.name}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${warehouse.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {warehouse.isActive ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
                                {/* Informação: Estoque Negativo */}
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Estoque Negativo:</span>
                                    {warehouse.allowsNegativeStock ? (
                                        <span className="text-orange-600 font-medium flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            Permitido
                                        </span>
                                    ) : (
                                        <span className="text-green-600 font-medium flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Bloqueado
                                        </span>
                                    )}
                                </div>

                                {/* Informação: Localização */}
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Localização:</span>
                                    <span className="text-gray-900 truncate max-w-[150px]">
                                        {(warehouse.addressInfo as any)?.city || '-'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Footer do Card com Ações */}
                        <div className="bg-gray-50 px-6 py-3 rounded-b-lg border-t border-gray-200 flex justify-end space-x-3">
                            {/* Obs: Link para Edição - Rota que criaremos no futuro se necessário */}
                            <Link 
                                href={`/dashboard/inventory/warehouses/${warehouse.id}`}
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                Detalhes / Editar
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}