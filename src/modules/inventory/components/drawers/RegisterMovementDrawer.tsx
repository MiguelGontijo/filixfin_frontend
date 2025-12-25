import React, { useEffect, useState } from 'react';
import { useStockMovements } from '../../hooks/useStockMovements';
import { useWarehouses } from '../../hooks/useWarehouses';
import { RegisterMovementInput, TransactionType } from '../../types/InventoryTypes';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    preSelectedVariantId?: string; // Se vier preenchido, trava o campo de produto
    onSuccess?: () => void; // Callback para atualizar a lista pai
}

// Estado inicial limpo
const INITIAL_STATE: RegisterMovementInput = {
    warehouseId: '',
    variantId: '',
    type: TransactionType.IN_PURCHASE, // Padrão inicial
    quantity: 1,
    unitCost: 0,
    documentRef: '',
    notes: ''
};

export function RegisterMovementDrawer({ isOpen, onClose, preSelectedVariantId, onSuccess }: Props) {
    // Hooks do domínio
    const { registerMovement, isLoading } = useStockMovements();
    const { warehouses, fetchWarehouses } = useWarehouses();
    
    // Controle de Estado Nativo
    const [formData, setFormData] = useState<RegisterMovementInput>(INITIAL_STATE);
    const [isEntryMode, setIsEntryMode] = useState(true); // Controla visualmente se é Entrada (+) ou Saída (-)
    const [error, setError] = useState('');

    // Ao abrir o Drawer
    useEffect(() => {
        if (isOpen) {
            fetchWarehouses();
            setError('');
            
            // Reseta o formulário mantendo o ID do produto se for passado
            setFormData({
                ...INITIAL_STATE,
                variantId: preSelectedVariantId || '',
                type: TransactionType.IN_PURCHASE
            });
            setIsEntryMode(true);
        }
    }, [isOpen, fetchWarehouses, preSelectedVariantId]);

    // Handler Genérico de Input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Alterna entre Modos (Entrada vs Saída) e reseta o Tipo de Transação compatível
    const handleModeToggle = (isEntry: boolean) => {
        setIsEntryMode(isEntry);
        setFormData(prev => ({
            ...prev,
            // Seta um valor padrão válido para o novo modo para evitar inconsistência
            type: isEntry ? TransactionType.IN_PURCHASE : TransactionType.OUT_SALE
        }));
    };

    // Validação e Envio Manual
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validações
        if (!formData.warehouseId) {
            setError('Selecione o Local de Estoque.');
            return;
        }
        if (!formData.variantId) {
            setError('O Produto é obrigatório.');
            return;
        }
        if (Number(formData.quantity) <= 0) {
            setError('A quantidade deve ser maior que zero.');
            return;
        }

        try {
            // Garante conversão de números antes de enviar
            await registerMovement({
                ...formData,
                quantity: Number(formData.quantity),
                unitCost: Number(formData.unitCost || 0)
            });

            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error('Erro ao movimentar:', err);
            setError('Erro ao registrar movimentação. Verifique os dados.');
        }
    };

    // Listas de Tipos para o Select (Filtradas pelo Modo)
    const entryOptions = [
        { label: 'Compra (NF)', value: TransactionType.IN_PURCHASE },
        { label: 'Transferência (Entrada)', value: TransactionType.IN_TRANSFER },
        { label: 'Ajuste de Sobra', value: TransactionType.IN_ADJUSTMENT },
        { label: 'Devolução de Cliente', value: TransactionType.IN_RETURN },
    ];

    const exitOptions = [
        { label: 'Venda', value: TransactionType.OUT_SALE },
        { label: 'Consumo Interno', value: TransactionType.OUT_CONSUMPTION },
        { label: 'Perda / Quebra', value: TransactionType.OUT_LOSS },
        { label: 'Transferência (Saída)', value: TransactionType.OUT_TRANSFER },
        { label: 'Ajuste de Falta', value: TransactionType.OUT_ADJUSTMENT },
    ];

    const currentOptions = isEntryMode ? entryOptions : exitOptions;

    // Classes CSS Dinâmicas
    const drawerClasses = `fixed inset-y-0 right-0 w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col border-l border-gray-200 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
    }`;

    const headerColorClass = isEntryMode ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800';

    return (
        <>
            {/* Overlay Transparente (Sem tela preta) */}
            {isOpen && (
                <div onClick={onClose} className="fixed inset-0 bg-transparent z-40" aria-hidden="true" />
            )}

            <div className={drawerClasses}>
                
                {/* Cabeçalho com cor dinâmica */}
                <div className={`px-6 py-4 border-b flex items-center justify-between ${headerColorClass}`}>
                    <div>
                        <h2 className="text-lg font-bold">
                            {isEntryMode ? 'Registrar Entrada' : 'Registrar Saída'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <form id="movement-drawer-form" onSubmit={handleSave} className="space-y-5">
                        
                        {error && (
                            <div className="p-3 bg-red-50 text-red-700 text-sm border border-red-100 rounded animate-pulse">
                                {error}
                            </div>
                        )}

                        {/* Toggle de Modo (Tabs Visuais) */}
                        <div className="flex rounded-md bg-gray-100 p-1">
                            <button
                                type="button"
                                onClick={() => handleModeToggle(true)}
                                className={`flex-1 py-2 text-sm font-medium rounded transition-all ${
                                    isEntryMode ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Entrada (+)
                            </button>
                            <button
                                type="button"
                                onClick={() => handleModeToggle(false)}
                                className={`flex-1 py-2 text-sm font-medium rounded transition-all ${
                                    !isEntryMode ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Saída (-)
                            </button>
                        </div>

                        {/* Se o produto não veio pré-selecionado, mostra input */}
                        {!preSelectedVariantId && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Produto (ID/SKU)</label>
                                <input
                                    name="variantId"
                                    value={formData.variantId}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    placeholder="Digite o ID..."
                                />
                            </div>
                        )}

                        {/* Seleção de Depósito */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Local de Estoque *</label>
                            <select
                                name="warehouseId"
                                value={formData.warehouseId}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white"
                            >
                                <option value="">Selecione...</option>
                                {warehouses.map(w => (
                                    <option key={w.id} value={w.id}>
                                        {w.name} {w.isDefault ? '(Padrão)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Tipo de Transação (Opções mudam conforme o modo) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Motivo *</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white"
                            >
                                {currentOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Quantidade e Custo */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Qtd *</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Custo Unit.</label>
                                <input
                                    type="number"
                                    name="unitCost"
                                    value={formData.unitCost}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {/* Observações */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Observação</label>
                            <textarea
                                name="notes"
                                rows={2}
                                value={formData.notes}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            />
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="movement-drawer-form"
                        disabled={isLoading}
                        className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none disabled:opacity-50 ${
                            isEntryMode 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-red-600 hover:bg-red-700'
                        }`}
                    >
                        {isLoading ? '...' : 'Confirmar'}
                    </button>
                </div>
            </div>
        </>
    );
}