'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWarehouses } from '../../hooks/useWarehouses';
import { CreateWarehouseInput, Warehouse } from '../../types/InventoryTypes';

interface Props {
    initialData?: Warehouse; // Se passado, é Edição. Se não, é Criação.
    tenantId: string; // Necessário para voltar a navegação correta
}

// Estado Inicial Limpo
const INITIAL_STATE: CreateWarehouseInput = {
    name: '',
    isDefault: false,
    allowsNegativeStock: false,
    addressInfo: { city: '', street: '' } // Inicializa objeto aninhado para evitar crash
};

export function WarehouseForm({ initialData, tenantId }: Props) {
    const router = useRouter();
    const { createWarehouse, updateWarehouse, isLoading } = useWarehouses();

    // 1. Estado Local (Regra: Sem libs externas, controle manual)
    const [formData, setFormData] = useState<CreateWarehouseInput>(INITIAL_STATE);
    const [error, setError] = useState<string>('');
    const [successMsg, setSuccessMsg] = useState<string>('');

    // 2. Popula dados se for Edição
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                isDefault: initialData.isDefault,
                allowsNegativeStock: initialData.allowsNegativeStock,
                addressInfo: initialData.addressInfo || { city: '', street: '' }
            });
        }
    }, [initialData]);

    // 3. Handlers de Input (Change Manual)
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Lógica para campos aninhados (ex: addressInfo.city)
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...(prev as any)[parent],
                    [child]: value
                }
            }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    // 4. Submit com Validação Manual
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        // Validação Simples
        if (!formData.name.trim()) {
            setError('O nome do depósito é obrigatório.');
            return;
        }

        try {
            if (initialData) {
                await updateWarehouse(initialData.id, formData);
                setSuccessMsg('Depósito atualizado com sucesso!');
            } else {
                await createWarehouse(formData);
                setSuccessMsg('Depósito criado com sucesso!');
            }

            // Opcional: Redirecionar após sucesso ou aguardar o usuário
            // router.push(`/${tenantId}/dashboard/inventory/warehouses`); 
        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao salvar. Tente novamente.');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-4xl mx-auto">
            
            <div className="mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-xl font-bold text-gray-800">
                    {initialData ? 'Editar Depósito' : 'Novo Depósito'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    Defina as regras de negócio para este local de estoque.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Feedback Visual de Erro/Sucesso */}
                {error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-100 text-sm">
                        {error}
                    </div>
                )}
                {successMsg && (
                    <div className="p-4 bg-green-50 text-green-700 rounded-md border border-green-100 text-sm">
                        {successMsg}
                    </div>
                )}

                {/* --- BLOCO 1: Informações Básicas --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome do Local *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Ex: Loja Matriz, Depósito Central, Carro de Vendas 01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cidade
                        </label>
                        <input
                            type="text"
                            name="addressInfo.city"
                            value={(formData.addressInfo as any).city}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Logradouro / Rua
                        </label>
                        <input
                            type="text"
                            name="addressInfo.street"
                            value={(formData.addressInfo as any).street}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                </div>

                {/* --- BLOCO 2: Regras de Negócio (Checkboxes) --- */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                        Configurações
                    </h3>
                    
                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="isDefault"
                                name="isDefault"
                                type="checkbox"
                                checked={formData.isDefault}
                                onChange={handleCheckboxChange}
                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="isDefault" className="font-medium text-gray-700">Depósito Principal</label>
                            <p className="text-gray-500">Se marcado, será usado automaticamente em vendas onde o local não for especificado.</p>
                        </div>
                    </div>

                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="allowsNegativeStock"
                                name="allowsNegativeStock"
                                type="checkbox"
                                checked={formData.allowsNegativeStock}
                                onChange={handleCheckboxChange}
                                className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300 rounded"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="allowsNegativeStock" className="font-medium text-gray-700">Permitir Estoque Negativo</label>
                            <p className="text-gray-500">Permite continuar vendendo mesmo que o saldo lógico seja zero. <span className="text-orange-600 font-semibold">(Cuidado)</span></p>
                        </div>
                    </div>
                </div>

                {/* --- FOOTER: Ações --- */}
                <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => router.back()} // Volta para a listagem usando o Router do Next
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Salvando...' : 'Salvar Depósito'}
                    </button>
                </div>
            </form>
        </div>
    );
}