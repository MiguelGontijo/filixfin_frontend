// ===== FILE: src/modules/inventory/registries/WarehouseRegistry.tsx =====

'use client';

import React from 'react';
import { CrudLayout } from '@/core/components/crud/CrudLayout';
import { CrudConfig } from '@/core/components/crud/types';
import { 
    FaCheckCircle, 
    FaTimesCircle, 
    FaStar, 
    FaExclamationTriangle
} from 'react-icons/fa';

// --- Contratos e Validações ---
import { Warehouse } from '../types/InventoryTypes';
import { UpdateWarehouseSchema, WarehouseFormInput } from '../schemas/warehouseSchema';

// --- Motores de Dados (CQRS Hooks) ---
import { useWarehouses } from '../hooks/useWarehouses';
import { useWarehouseMutation } from '../hooks/useWarehouseMutation';

/**
 * @component WarehouseRegistry
 * @description Central de Gerenciamento de Locais de Estoque (Warehouses).
 * CLASSE OURO: Consome hooks separados para leitura e escrita (CQRS), 
 * unificando os estados de loading e erro para a interface de forma transparente.
 */
export function WarehouseRegistry() {
    // 1. Instanciamos o motor de LEITURA (Query)
    const { 
        warehouses, 
        isLoading: isReading, 
        error: readError, 
        refreshWarehouses 
    } = useWarehouses();

    // 2. Instanciamos o motor de ESCRITA (Command)
    const { 
        createWarehouse, 
        updateWarehouse, 
        deleteWarehouse, 
        isLoading: isWriting, 
        error: writeError 
    } = useWarehouseMutation();

    // =========================================================================
    // ⚙️ CONFIGURAÇÃO CLASSE OURO (O Manual do Maestro)
    // =========================================================================
    const config: CrudConfig<Warehouse, WarehouseFormInput> = {
        title: 'Depósitos e Logística',
        description: 'Gerencie seus centros de distribuição, lojas físicas e locais de armazenagem.',
        schema: UpdateWarehouseSchema,

        // --- COLUNAS DA TABELA ---
        columns: [
            {
                header: 'Nome do Depósito',
                accessor: (item) => (
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-200">{item.name}</span>
                        {item.isDefault && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-500 border border-amber-500/30">
                                <FaStar className="w-2 h-2" /> Padrão
                            </span>
                        )}
                    </div>
                )
            },
            {
                header: 'Endereço',
                accessor: (item) => {
                    const addr = item.addressInfo;
                    if (!addr?.city) return <span className="text-gray-600 italic text-xs">Não informado</span>;
                    return (
                        <span className="text-xs text-gray-400">
                            {addr.city}{addr.state ? ` / ${addr.state}` : ''}
                        </span>
                    );
                }
            },
            {
                header: 'Estoque Negativo',
                accessor: (item) => item.allowsNegativeStock ? (
                    <span className="flex items-center gap-1.5 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                        <FaExclamationTriangle className="w-3 h-3" /> Permitido
                    </span>
                ) : (
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                        Bloqueado
                    </span>
                )
            },
            {
                header: 'Status',
                accessor: (item) => item.isActive ? (
                    <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                        <FaCheckCircle /> Ativo
                    </span>
                ) : (
                    <span className="flex items-center gap-1.5 text-red-400 text-xs font-bold uppercase tracking-wider">
                        <FaTimesCircle /> Inativo
                    </span>
                )
            }
        ],

        // --- CAMPOS DO FORMULÁRIO (A Impressora 3D) ---
        fields: [
            {
                name: 'name',
                label: 'Identificação do Depósito',
                type: 'text',
                placeholder: 'Ex: CD Principal, Loja Centro, Estoque Trânsito'
            },
            {
                name: 'isDefault',
                label: 'Depósito Principal?',
                type: 'boolean',
                trueLabel: 'Sim, usar como padrão para vendas',
                falseLabel: 'Não, apenas depósito auxiliar'
            },
            {
                name: 'allowsNegativeStock',
                label: 'Permitir Estoque Negativo?',
                type: 'boolean',
                trueLabel: 'Sim (Risco: Pode causar furos de estoque)',
                falseLabel: 'Não (Seguro: Bloqueia venda sem saldo)'
            },
            {
                name: 'isActive',
                label: 'Status da Operação',
                type: 'boolean'
            },
            
            // Bloco de Endereço (Mapeamento direto para JSONB)
            {
                name: 'addressInfo.street' as any,
                label: 'Logradouro / Rua',
                type: 'text',
                placeholder: 'Av. Paulista, 1000'
            },
            {
                name: 'addressInfo.city' as any,
                label: 'Cidade',
                type: 'text',
                placeholder: 'São Paulo'
            },
            {
                name: 'addressInfo.state' as any,
                label: 'UF',
                type: 'text',
                placeholder: 'SP'
            }
        ],

        // --- DADOS DE SISTEMA (Auditoria) ---
        systemFields: [
            { name: 'id', label: 'UUID do Depósito', type: 'text' },
            { name: 'createdAt', label: 'Criado em', type: 'text' },
            { name: 'updatedAt', label: 'Última Movimentação', type: 'text' }
        ]
    };

    // =========================================================================
    // 🔌 ROTEAMENTO DE AÇÕES (Unindo Leitura e Escrita)
    // =========================================================================
    return (
        <div className="h-full w-full animate-fade-in">
            <CrudLayout<Warehouse, WarehouseFormInput>
                config={config}
                hooks={{
                    data: warehouses,
                    // 💡 COMBINAÇÃO DE ESTADOS: A tela carrega se estiver lendo OU escrevendo
                    isLoading: isReading || isWriting,
                    // 💡 COMBINAÇÃO DE ERROS: Exibe o erro de quem falhou
                    error: writeError || readError,
                    onCreate: async (data) => {
                        await createWarehouse(data);
                    },
                    onUpdate: async (id, data) => {
                        await updateWarehouse(id, data);
                    },
                    onDelete: async (id) => {
                        await deleteWarehouse(id);
                    },
                    onRefresh: refreshWarehouses
                }}
            />
        </div>
    );
}