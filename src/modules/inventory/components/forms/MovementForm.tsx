'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStockMovements } from '../../hooks/useStockMovements';
import { useWarehouses } from '../../hooks/useWarehouses';
import { RegisterMovementInput, TransactionType } from '../../types/InventoryTypes';

interface Props {
    tenantId: string;
    preSelectedVariantId?: string; // Opcional: Para quando viermos da tela de detalhes do produto
}

// Estado Inicial
const INITIAL_STATE: RegisterMovementInput = {
    warehouseId: '',
    variantId: '',
    type: TransactionType.IN_PURCHASE,
    quantity: 1,
    unitCost: 0,
    documentRef: '',
    notes: ''
};

export function MovementForm({ tenantId, preSelectedVariantId }: Props) {
    const router = useRouter();
    
    // Hooks do Módulo de Inventário
    const { registerMovement, isLoading } = useStockMovements();
    const { warehouses, fetchWarehouses, isLoading: isLoadingWarehouses } = useWarehouses();

    // Estado Local de Controle
    const [formData, setFormData] = useState<RegisterMovementInput>(INITIAL_STATE);
    const [isEntry, setIsEntry] = useState(true); // Controle visual (Entrada vs Saída)
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // 1. Carregar Depósitos ao montar
    useEffect(() => {
        fetchWarehouses();
    }, [fetchWarehouses]);

    // 2. Aplicar Pré-seleção de Produto (se houver)
    useEffect(() => {
        if (preSelectedVariantId) {
            setFormData(prev => ({ ...prev, variantId: preSelectedVariantId }));
        }
    }, [preSelectedVariantId]);

    // 3. Alternar Tipo (Entrada/Saída) e Resetar o Select de Tipo
    const handleTypeToggle = (entryMode: boolean) => {
        setIsEntry(entryMode);
        setFormData(prev => ({
            ...prev,
            // Reseta para o padrão daquele modo para evitar inconsistência
            type: entryMode ? TransactionType.IN_PURCHASE : TransactionType.OUT_CONSUMPTION
        }));
    };

    // 4. Handler Genérico
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 5. Submit com Validação Robusta
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        // Validações
        if (!formData.warehouseId) return setError('Selecione um local de estoque (Depósito).');
        if (!formData.variantId) return setError('O ID ou SKU do produto é obrigatório.');
        if (Number(formData.quantity) <= 0) return setError('A quantidade deve ser maior que zero.');
        
        // Validação de Custo (Opcional, mas recomendado para Entradas)
        if (isEntry && Number(formData.unitCost) < 0) return setError('O custo unitário não pode ser negativo.');

        try {
            await registerMovement({
                ...formData,
                quantity: Number(formData.quantity),
                unitCost: formData.unitCost ? Number(formData.unitCost) : 0
            });
            
            setSuccessMsg('Movimentação registrada com sucesso!');
            
            // Limpa o form (mas mantém o produto e depósito para facilitar lançamentos em série)
            setFormData(prev => ({
                ...INITIAL_STATE,
                warehouseId: prev.warehouseId,
                variantId: prev.variantId,
                type: prev.type
            }));

            // Opcional: Se quiser redirecionar, descomente abaixo
            // router.push(`/${tenantId}/dashboard/products`);
            
        } catch (err) {
            console.error(err);
            setError('Erro ao processar. Verifique se há saldo suficiente (para saídas) ou conexão.');
        }
    };

    // Opções de Select baseadas no Modo (Entrada vs Saída)
    const transactionOptions = isEntry 
        ? [
            { label: 'Compra (NF)', value: TransactionType.IN_PURCHASE },
            { label: 'Transferência (Entrada)', value: TransactionType.IN_TRANSFER },
            { label: 'Ajuste de Sobra (Inventário)', value: TransactionType.IN_ADJUSTMENT },
            { label: 'Devolução de Cliente', value: TransactionType.IN_RETURN },
          ]
        : [
            { label: 'Consumo Interno', value: TransactionType.OUT_CONSUMPTION },
            { label: 'Venda (Manual/S. Cupom)', value: TransactionType.OUT_SALE },
            { label: 'Perda / Quebra / Avaria', value: TransactionType.OUT_LOSS },
            { label: 'Transferência (Saída)', value: TransactionType.OUT_TRANSFER },
            { label: 'Ajuste de Falta (Inventário)', value: TransactionType.OUT_ADJUSTMENT },
          ];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-4xl mx-auto">
            
            <div className="mb-6 pb-4 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Nova Movimentação</h2>
                    <p className="text-sm text-gray-500 mt-1">Registre entradas ou saídas manuais de estoque.</p>
                </div>
                {/* Indicador Visual do Modo */}
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    isEntry ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {isEntry ? 'Modo Entrada (+)' : 'Modo Saída (-)'}
                </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Feedback */}
                {error && <div className="p-4 bg-red-50 text-red-700 rounded border border-red-100 text-sm font-medium">{error}</div>}
                {successMsg && <div className="p-4 bg-green-50 text-green-700 rounded border border-green-100 text-sm font-medium">{successMsg}</div>}

                {/* --- SELETOR DE MODO (TABS VISUAIS) --- */}
                <div className="flex p-1 bg-gray-100 rounded-lg">
                    <button
                        type="button"
                        onClick={() => handleTypeToggle(true)}
                        className={`flex-1 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                            isEntry 
                            ? 'bg-white text-green-700 shadow-sm ring-1 ring-black/5' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Entrada (+)
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTypeToggle(false)}
                        className={`flex-1 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                            !isEntry 
                            ? 'bg-white text-red-700 shadow-sm ring-1 ring-black/5' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Saída (-)
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Depósito */}
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Local de Estoque *</label>
                        <select
                            name="warehouseId"
                            value={formData.warehouseId}
                            onChange={handleInputChange}
                            disabled={isLoadingWarehouses}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                        >
                            <option value="">Selecione um depósito...</option>
                            {warehouses.map(w => (
                                <option key={w.id} value={w.id}>
                                    {w.name} {w.isDefault ? '(Padrão)' : ''}
                                </option>
                            ))}
                        </select>
                        {isLoadingWarehouses && <p className="text-xs text-gray-400 mt-1">Carregando locais...</p>}
                    </div>

                    {/* Tipo de Operação */}
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Natureza da Operação *</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm bg-white focus:ring-2 focus:ring-offset-1 ${
                                isEntry 
                                ? 'border-gray-300 focus:border-green-500 focus:ring-green-500' 
                                : 'border-gray-300 focus:border-red-500 focus:ring-red-500'
                            }`}
                        >
                            {transactionOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Produto (ID/SKU Temporário - Futuro: Autocomplete) */}
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Produto (ID ou SKU) *</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="variantId"
                                value={formData.variantId}
                                onChange={handleInputChange}
                                placeholder="Digite o ID do produto ou SKU..."
                                disabled={!!preSelectedVariantId} // Trava se já vier selecionado
                                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${preSelectedVariantId ? 'bg-gray-50 text-gray-500' : ''}`}
                            />
                            {/* Ícone de busca (Visual apenas por enquanto) */}
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                        {!preSelectedVariantId && (
                            <p className="text-xs text-gray-400 mt-1">
                                * No futuro, aqui teremos uma busca inteligente pelo nome do produto.
                            </p>
                        )}
                    </div>

                    {/* Quantidade e Custo */}
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade *</label>
                        <input
                            type="number"
                            name="quantity"
                            step="0.001"
                            min="0.001"
                            value={formData.quantity}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Custo Unitário (R$) 
                            <span className="text-gray-400 font-normal ml-1">(Opcional)</span>
                        </label>
                        <input
                            type="number"
                            name="unitCost"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={formData.unitCost || ''}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
                        />
                    </div>

                    {/* Detalhes Finais */}
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Referência / Documento</label>
                        <input
                            type="text"
                            name="documentRef"
                            value={formData.documentRef}
                            onChange={handleInputChange}
                            placeholder="Ex: NF-e 1234, Pedido #900"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                        <textarea
                            name="notes"
                            rows={3}
                            value={formData.notes}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Justificativa do ajuste ou detalhes adicionais..."
                        />
                    </div>
                </div>

                {/* Footer de Ações */}
                <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`px-6 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                            isEntry 
                            ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                            : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                        }`}
                    >
                        {isLoading ? 'Processando...' : isEntry ? 'Confirmar Entrada' : 'Confirmar Saída'}
                    </button>
                </div>
            </form>
        </div>
    );
}