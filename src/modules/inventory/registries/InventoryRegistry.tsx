// ===== FILE: src/modules/inventory/registries/InventoryRegistry.tsx =====

'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FaBoxOpen, FaHistory, FaArrowUp, FaArrowDown, FaExclamationTriangle } from 'react-icons/fa';

// --- Motor CRUD V4 ---
import { CrudLayout } from '@/core/components/crud/CrudLayout';
import { CrudConfig } from '@/core/components/crud/types';

// --- Contratos e Validações ---
import { InventoryStock, InventoryTransaction, TransactionType } from '../types/InventoryTypes';
import { RegisterMovementSchema, InventoryFormInput } from '../schemas/inventorySchema';

// --- Motores de Dados (CQRS Hooks) ---
import { useBalances } from '../hooks/useBalances';
import { useStockMovements } from '../hooks/useStockMovements';
import { useStockMovementMutation } from '../hooks/useStockMovementMutation';
import { useWarehouses } from '../hooks/useWarehouses';

/**
 * ============================================================================
 * 🧩 COMPONENTE INJETÁVEL: O DASHBOARD MASTER-DETAIL
 * Renderizado via `customRender` no topo do formulário quando um item é clicado.
 * ============================================================================
 */
const StockDashboardInjection = ({ form }: { form: UseFormReturn<any> }) => {
    // 1. Rastreamos se estamos no modo "Edição/Detail" (tem ID) ou "Novo" (sem ID)
    const stockId = form.watch('id');
    const variantId = form.watch('variantId');
    const warehouseId = form.watch('warehouseId');

    // 2. Isolamos o snapshot num estado para que ele não se perca 
    // quando limparmos os campos do formulário abaixo.
    const [snapshot, setSnapshot] = useState({
        balance: 0,
        reserved: 0,
        productName: '',
        warehouseName: ''
    });

    // 3. O Motor do Kardex (Detail)
    const { transactions, fetchKardex, isLoading: loadingKardex } = useStockMovements();

    // 4. O Efeito de Hidratação e Limpeza Segura
    useEffect(() => {
        if (stockId) {
            // A. Salva os dados de saldo originais na memória do componente
            setSnapshot({
                balance: Number(form.getValues('quantity') || 0),
                reserved: Number(form.getValues('reservedQuantity') || 0),
                productName: form.getValues('variant')?.product?.name || form.getValues('variant')?.sku || 'Produto',
                warehouseName: form.getValues('warehouse')?.name || 'Depósito'
            });

            // B. 🧹 GHOST-BUSTER: Limpa o input de quantidade!
            // Como o CrudForm injeta o 'quantity' do saldo no formulário, precisamos limpá-lo 
            // para que a validação exija que o usuário digite uma nova quantidade para o ajuste.
            setTimeout(() => {
                form.setValue('quantity', undefined as any);
                form.setValue('type', '');
                form.setValue('notes', '');
            }, 50); // Timeout ínfimo apenas para esperar o reset() do RHF terminar.

            // C. Dispara a busca do histórico deste produto específico
            fetchKardex(variantId);
        }
    }, [stockId, variantId, fetchKardex, form]);

    // Se for "Nova Movimentação" livre (sem clicar na grid), não desenha o dashboard.
    if (!stockId) return null;

    const availableBalance = snapshot.balance - snapshot.reserved;
    const isCritical = availableBalance <= 0;

    return (
        <div className="mb-8 space-y-6 animate-fade-in">
            {/* CABEÇALHO DO PRODUTO */}
            <div className="flex items-center gap-4 pb-4 border-b border-gray-800">
                <div className="p-3 bg-accent-primary/10 text-accent-primary rounded-xl">
                    <FaBoxOpen className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-white tracking-tight">{snapshot.productName}</h2>
                    <p className="text-sm font-medium text-gray-500">{snapshot.warehouseName}</p>
                </div>
            </div>

            {/* CARDS DE SALDO (A Tríade de Inteligência) */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 shadow-inner">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Físico (Prateleira)</p>
                    <p className="text-2xl font-black text-gray-200">{snapshot.balance}</p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 shadow-inner">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Reservado (Pedidos)</p>
                    <p className="text-2xl font-black text-yellow-500/80">{snapshot.reserved}</p>
                </div>
                <div className={`p-4 rounded-xl border shadow-inner ${isCritical ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isCritical ? 'text-red-400' : 'text-emerald-400'}`}>
                        Saldo Disponível
                    </p>
                    <div className="flex items-center gap-2">
                        <p className={`text-2xl font-black ${isCritical ? 'text-red-400' : 'text-emerald-400'}`}>
                            {availableBalance}
                        </p>
                        {isCritical && <FaExclamationTriangle className="text-red-400 w-4 h-4 animate-pulse" />}
                    </div>
                </div>
            </div>

            {/* KARDEX (Mini-Histórico) */}
            <div className="bg-gray-900/30 rounded-xl border border-gray-800 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-800 bg-gray-800/20 flex items-center gap-2">
                    <FaHistory className="text-gray-500" />
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Últimas Movimentações</h3>
                </div>
                
                {loadingKardex ? (
                    <div className="p-6 flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-primary"></div></div>
                ) : transactions.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-500 italic">Nenhum histórico contábil encontrado.</div>
                ) : (
                    <ul className="divide-y divide-gray-800 max-h-48 overflow-y-auto custom-scrollbar">
                        {transactions.slice(0, 10).map((t, i) => {
                            const isEntry = t.type.startsWith('IN_');
                            return (
                                <li key={i} className="flex items-center justify-between px-4 py-3 hover:bg-gray-800/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className={`p-1.5 rounded-full ${isEntry ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {isEntry ? <FaArrowUp className="w-3 h-3" /> : <FaArrowDown className="w-3 h-3" />}
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-300">{t.type}</span>
                                            <span className="text-[10px] text-gray-500">{new Date(t.createdAt).toLocaleString('pt-BR')}</span>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col">
                                        <span className={`text-sm font-black ${isEntry ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {isEntry ? '+' : '-'}{t.quantity}
                                        </span>
                                        <span className="text-[10px] text-gray-500">Saldo: {t.newBalance}</span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {/* SEPARADOR PARA O FORMULÁRIO NATIVO */}
            <div className="pt-6 mt-6 border-t border-gray-800 border-dashed">
                <h3 className="text-sm font-bold text-accent-primary mb-1 uppercase tracking-widest">Registrar Ajuste Manual</h3>
                <p className="text-xs text-gray-500 mb-4">Preencha os campos abaixo para lançar uma nova entrada ou saída contábil para este produto.</p>
            </div>
        </div>
    );
};


/**
 * ============================================================================
 * 🏭 COMPONENTE PRINCIPAL: INVENTORY REGISTRY
 * @description O Orquestrador. O Grid exibe Saldos. O Form registra Movimentos.
 * ============================================================================
 */
export function InventoryRegistry() {
    // 1. O Motor Master (A Tela Principal)
    const { balances, isLoading: loadingBalances, fetchBalances } = useBalances();

    // 2. O Motor de Mutação (A Caneta do Contador)
    const { registerMovement, isLoading: writing, error: writeError } = useStockMovementMutation();

    // 3. Dependências (Para selects manuais)
    const { warehouses } = useWarehouses();

    const warehouseOptions = useMemo(() => warehouses.map(w => ({ label: w.name, value: w.id })), [warehouses]);
    const typeOptions = [
        { label: '📦 Entrada por Compra', value: TransactionType.IN_PURCHASE },
        { label: '➕ Ajuste de Entrada (Sobra)', value: TransactionType.IN_ADJUSTMENT },
        { label: '🛒 Venda (Saída)', value: TransactionType.OUT_SALE },
        { label: '➖ Ajuste de Saída (Perda)', value: TransactionType.OUT_LOSS },
        { label: '🏢 Consumo Interno', value: TransactionType.OUT_CONSUMPTION },
    ];

    // =========================================================================
    // ⚙️ CONFIGURAÇÃO CLASSE OURO (O Manual do CrudLayout)
    // =========================================================================
    const config: CrudConfig<InventoryStock, InventoryFormInput> = {
        title: 'Posição de Estoque (Saldos)',
        description: 'Visão em tempo real da prateleira. Clique em um registro para ver o histórico ou lançar ajustes.',
        schema: RegisterMovementSchema,

        // --- VISÃO MASTER (GRID DE SALDOS) ---
        columns: [
            {
                header: 'Produto / SKU',
                accessor: (item) => (
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">
                            {item.variant?.product?.name || 'Produto não identificado'}
                        </span>
                        <span className="text-[11px] font-mono text-gray-500">
                            SKU: {item.variant?.sku || 'N/A'}
                        </span>
                    </div>
                )
            },
            {
                header: 'Localização',
                accessor: (item) => (
                    <span className="text-sm text-gray-400 font-medium">
                        {item.warehouse?.name || 'N/A'}
                    </span>
                )
            },
            {
                header: 'Físico / Reservado',
                accessor: (item) => (
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-200">{item.quantity}</span>
                        <span className="text-xs font-medium text-yellow-500/80" title="Reservado para pedidos">
                            (-{item.reservedQuantity})
                        </span>
                    </div>
                )
            },
            {
                header: 'Disponível',
                accessor: (item) => {
                    const available = item.quantity - item.reservedQuantity;
                    const isCritical = available <= 0;
                    return (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-black uppercase tracking-widest border ${
                            isCritical 
                            ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                            {available} {isCritical && <FaExclamationTriangle />}
                        </span>
                    );
                }
            }
        ],

        // --- VISÃO DETAIL (O FORMULÁRIO HÍBRIDO) ---
        fields: [
            // O Dashboard Injetado (Só aparece no modo "Edição")
            {
                name: 'dashboard_view' as any,
                label: '',
                type: 'custom',
                customRender: (form) => <StockDashboardInjection form={form} />
            },
            
            // Os inputs nativos para registro (Ficam abaixo do Dashboard ou preenchem a tela no "Novo")
            {
                name: 'warehouseId',
                label: 'Depósito / Local',
                type: 'select',
                options: warehouseOptions,
                // O Motor RHF permite reatividade. Se já estiver no detail, o usuário não pode mudar o depósito.
                customRender: (form) => {
                    const isEdit = !!form.watch('id' as any);
                    return (
                        <select {...form.register('warehouseId')} disabled={isEdit} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-accent-primary disabled:opacity-50">
                            <option value="">Selecione...</option>
                            {warehouseOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    );
                }
            },
            {
                name: 'variantId',
                label: 'UUID do Produto (SKU)',
                type: 'text',
                placeholder: 'Cole o ID da variante...',
                customRender: (form) => {
                    const isEdit = !!form.watch('id' as any);
                    return <input type="text" {...form.register('variantId')} disabled={isEdit} placeholder="UUID do Produto" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-accent-primary disabled:opacity-50" />
                }
            },
            { name: 'type', label: 'Natureza da Operação', type: 'select', options: typeOptions },
            { name: 'quantity', label: 'Quantidade do Ajuste', type: 'number', placeholder: 'Ex: 10' },
            { name: 'notes', label: 'Motivo / Observação', type: 'textarea', placeholder: 'Justifique esta movimentação...' }
        ]
    };

    // =========================================================================
    // 🔌 ROTEAMENTO DE AÇÕES (Unindo Leitura e Escrita CQRS)
    // =========================================================================
    return (
        <div className="h-full w-full animate-fade-in">
            <CrudLayout<InventoryStock, InventoryFormInput>
                config={config}
                hooks={{
                    data: balances,
                    isLoading: loadingBalances || writing,
                    error: writeError,
                    
                    // 💡 O TRUQUE DE MESTRE: O "Update" falso.
                    // Quando o usuário clica num saldo existente e tenta "Salvar" o formulário,
                    // ele não está atualizando o saldo, ele está postando uma Nova Movimentação para aquele item.
                    onUpdate: async (id, data) => {
                        await registerMovement(data);
                        fetchBalances(); // Atualiza a vitrine de saldos!
                    },
                    
                    onCreate: async (data) => {
                        await registerMovement(data);
                        fetchBalances();
                    },
                    
                    // Bloqueio imutável
                    onDelete: async () => {
                        alert('⚠️ Acesso Negado: Saldos não podem ser excluídos. Faça um ajuste de saída.');
                    },
                    
                    onRefresh: fetchBalances
                }}
            />
        </div>
    );
}