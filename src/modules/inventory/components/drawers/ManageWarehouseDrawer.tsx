import React, { useEffect, useState } from 'react';
import { useWarehouses } from '../../hooks/useWarehouses';
import { CreateWarehouseInput, Warehouse } from '../../types/InventoryTypes';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Warehouse;
}

// Estado inicial limpo para o formulário
const INITIAL_STATE: CreateWarehouseInput = {
    name: '',
    isDefault: false,
    allowsNegativeStock: false,
    addressInfo: {
        city: '',
        street: ''
    }
};

export function ManageWarehouseDrawer({ isOpen, onClose, initialData }: Props) {
    // Hooks do módulo de inventário
    const { createWarehouse, updateWarehouse, isLoading } = useWarehouses();
    
    // Gestão de Estado Manual (React Nativo)
    const [formData, setFormData] = useState<CreateWarehouseInput>(INITIAL_STATE);
    const [error, setError] = useState('');

    // Efeito: Quando o drawer abre, decide se popula (edição) ou limpa (criação)
    useEffect(() => {
        if (isOpen) {
            setError(''); // Limpa erros anteriores
            if (initialData) {
                // Modo Edição: Preenche o state com os dados recebidos
                setFormData({
                    name: initialData.name,
                    isDefault: initialData.isDefault,
                    allowsNegativeStock: initialData.allowsNegativeStock,
                    // Garante que addressInfo existe para evitar crash
                    addressInfo: initialData.addressInfo || { city: '', street: '' }
                });
            } else {
                // Modo Criação: Reseta para o estado inicial
                setFormData(INITIAL_STATE);
            }
        }
    }, [isOpen, initialData]);

    // Handler genérico para inputs de texto
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

        // Campos normais
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handler específico para Checkboxes (booleanos)
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    // Função de Salvar com Validação Manual
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // 1. Validação Básica
        if (!formData.name.trim()) {
            setError('O nome do depósito é obrigatório.');
            return;
        }

        try {
            // 2. Chama a API (Create ou Update)
            if (initialData) {
                await updateWarehouse(initialData.id, formData);
            } else {
                await createWarehouse(formData);
            }
            // 3. Fecha o drawer em caso de sucesso
            onClose(); 
        } catch (err) {
            console.error('Erro ao salvar depósito:', err);
            setError('Não foi possível salvar. Verifique os dados e tente novamente.');
        }
    };

    // Definição visual do Drawer (Slide-Over da direita)
    const drawerClasses = `fixed inset-y-0 right-0 w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col border-l border-gray-200 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
    }`;

    return (
        <>
            {/* Overlay Transparente:
               Serve apenas para capturar o clique fora e fechar o drawer.
               bg-transparent garante que NÃO HÁ tela preta de fundo.
            */}
            {isOpen && (
                <div 
                    onClick={onClose} 
                    className="fixed inset-0 bg-transparent z-40"
                    aria-hidden="true"
                />
            )}

            {/* O Painel Lateral */}
            <div className={drawerClasses}>
                
                {/* Cabeçalho */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-800">
                        {initialData ? 'Editar Local' : 'Novo Local'}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        type="button"
                    >
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>

                {/* Corpo do Formulário (Scrollável) */}
                <div className="flex-1 overflow-y-auto p-6">
                    <form id="warehouse-drawer-form" onSubmit={handleSave} className="space-y-6">
                        
                        {/* Exibição de Erro */}
                        {error && (
                            <div className="p-3 bg-red-50 text-red-700 text-sm rounded border border-red-100 animate-pulse">
                                {error}
                            </div>
                        )}

                        {/* Campo: Nome */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nome do Local *</label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                type="text"
                                placeholder="Ex: Almoxarifado Central"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border transition-colors"
                                autoFocus
                            />
                        </div>

                        {/* Grupo: Configurações (Checkboxes) */}
                        <div className="space-y-4 bg-gray-50 p-4 rounded-md border border-gray-100">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Regras</h3>
                            
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isDefault"
                                    checked={formData.isDefault}
                                    onChange={handleCheckboxChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-700">Depósito Padrão</span>
                            </label>

                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="allowsNegativeStock"
                                    checked={formData.allowsNegativeStock}
                                    onChange={handleCheckboxChange}
                                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-700">Permitir Estoque Negativo</span>
                            </label>
                        </div>

                        {/* Campo: Cidade (Exemplo de dado aninhado) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Cidade</label>
                            <input
                                name="addressInfo.city"
                                value={(formData.addressInfo as any).city || ''}
                                onChange={handleInputChange}
                                type="text"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            />
                        </div>

                    </form>
                </div>

                {/* Rodapé com Ações */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="warehouse-drawer-form"
                        disabled={isLoading}
                        className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Salvando...' : 'Salvar Local'}
                    </button>
                </div>
            </div>
        </>
    );
}