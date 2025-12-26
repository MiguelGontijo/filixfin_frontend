import React, { useEffect, useState } from 'react';
import { useWarehouses } from '@/modules/inventory/hooks/useWarehouses'; // Hook correto no módulo inventory
import { Warehouse } from '@/modules/inventory/types/InventoryTypes';
import { ManageWarehouseDrawer } from '@/modules/inventory/components/drawers/ManageWarehouseDrawer'; // Vamos implementar este modal a seguir

export function WarehousesTab() {
    // Integração com o Hook
    const { warehouses, isLoading, fetchWarehouses } = useWarehouses();
    
    // Estado local para controle do Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | undefined>(undefined);

    // Carrega os dados ao montar a aba
    useEffect(() => {
        fetchWarehouses();
    }, [fetchWarehouses]);

    // Handlers
    const handleOpenCreate = () => {
        setSelectedWarehouse(undefined); // Limpa seleção para criar novo
        setIsModalOpen(true);
    };

    const handleOpenEdit = (warehouse: Warehouse) => {
        setSelectedWarehouse(warehouse); // Passa os dados para edição
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        // Opcional: Recarregar a lista se o modal retornar sucesso (geralmente o hook já atualiza o estado local)
    };

    return (
        <div className="space-y-6 animate-fade-in">
            
            {/* --- CABEÇALHO DA ABA --- */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-base-text">Locais de Estoque</h2>
                    <p className="text-sm text-gray-400">
                        Gerencie depósitos físicos (CDs, Lojas) e virtuais (Avarias, Reservas).
                    </p>
                </div>
                <button 
                    onClick={handleOpenCreate}
                    className="inline-flex items-center px-4 py-2 bg-accent-primary border border-transparent rounded-md font-medium text-white hover:bg-accent-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary transition-colors shadow-sm"
                >
                    <svg className="w-5 h-5 mr-2 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Novo Local
                </button>
            </div>

            {/* --- CONTEÚDO DA LISTA --- */}
            {isLoading ? (
                // SKELETON LOADING (Dark Mode)
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 bg-gray-800 rounded-lg animate-pulse border border-gray-700"></div>
                    ))}
                </div>
            ) : warehouses.length === 0 ? (
                // EMPTY STATE (Dark Mode)
                <div className="text-center py-12 bg-base-metallic rounded-lg border border-dashed border-gray-700">
                    <div className="mx-auto h-12 w-12 text-gray-500">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-base-text">Nenhum local cadastrado</h3>
                    <p className="mt-1 text-sm text-gray-400">Comece criando seu Depósito Principal ou Loja Física.</p>
                    <div className="mt-6">
                        <button 
                            onClick={handleOpenCreate}
                            className="inline-flex items-center px-4 py-2 border border-accent-primary/20 shadow-sm text-sm font-medium rounded-md text-accent-primary bg-accent-primary/10 hover:bg-accent-primary/20 focus:outline-none"
                        >
                            Criar Primeiro Depósito
                        </button>
                    </div>
                </div>
            ) : (
                // LISTA DE DEPÓSITOS (GRID DARK)
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {warehouses.map((warehouse) => (
                        <div 
                            key={warehouse.id} 
                            className={`relative bg-base-metallic rounded-lg border shadow-sm transition-all hover:shadow-md ${
                                warehouse.isDefault ? 'border-accent-primary/50 ring-1 ring-accent-primary/20' : 'border-gray-700'
                            }`}
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center">
                                        <div className={`p-2 rounded-lg ${warehouse.isDefault ? 'bg-accent-primary/10 text-accent-primary' : 'bg-gray-800 text-gray-400'}`}>
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-medium text-base-text flex items-center gap-2">
                                                {warehouse.name}
                                                {warehouse.isDefault && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent-primary/20 text-accent-primary border border-accent-primary/20">
                                                        Padrão
                                                    </span>
                                                )}
                                            </h3>
                                            <p className="text-sm text-gray-400">
                                                {warehouse.isActive ? 'Operacional' : 'Inativo'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 border-t border-gray-700 pt-4 space-y-2">
                                    {/* Regra de Negócio Visual */}
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400">Estoque Negativo:</span>
                                        {warehouse.allowsNegativeStock ? (
                                            <span className="text-yellow-400 font-medium flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                Permitido
                                            </span>
                                        ) : (
                                            <span className="text-emerald-400 font-medium flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Bloqueado
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* Placeholder para Endereço */}
                                    {warehouse.addressInfo && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-400">Localização:</span>
                                            <span className="text-gray-300 truncate max-w-[150px]">
                                                {(warehouse.addressInfo as any).city || 'N/A'}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 flex gap-3">
                                    <button 
                                        onClick={() => handleOpenEdit(warehouse)}
                                        className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-300 bg-transparent hover:bg-gray-700 hover:text-white focus:outline-none"
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-accent-primary bg-accent-primary/10 hover:bg-accent-primary/20 focus:outline-none"
                                    >
                                        Ver Estoque
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- MODAL (Renderizado Condicionalmente) --- */}
            {isModalOpen && (
                <ManageWarehouseDrawer 
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    initialData={selectedWarehouse}
                />
            )}
        </div>
    );
}