'use client';

import React, { useMemo, useEffect } from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { FaUserTie, FaDollarSign, FaTrash, FaPlus } from 'react-icons/fa';

// --- Motor CRUD V4 ---
import { CrudLayout } from '@/core/components/crud/CrudLayout';
import { CrudConfig, CrudHooks } from '@/core/components/crud/types';

// --- Contratos e Tipos ---
import { CRMDeal, DealStatus, DealSource } from '../types';
import { DealFormSchema, DealFormInput } from '../schemas/dealSchema';
import { IPipeline } from '../types/pipeline.types';

// --- Motores de Dados (CQRS) ---
import { useDeals } from '../hooks/useDeals';
import { usePipelines } from '../hooks/usePipelines';
import { useClients } from '@/core/client/hooks/useClients';
import { useDealMutation } from '../hooks/useDealMutation';

/**
 * ============================================================================
 * 🧩 INJETOR 1: SELETOR EM CASCATA (Pipeline -> Stage)
 * @description Garante a integridade relacional na UI. O dropdown de "Etapa" 
 * só exibe as opções válidas para o "Funil" selecionado. Limpa a etapa se o 
 * funil for alterado, prevenindo relacionamentos órfãos no banco de dados.
 * ============================================================================
 */
const PipelineStageSelector = ({ form, pipelines }: { form: UseFormReturn<any>, pipelines: IPipeline[] }) => {
    const selectedPipelineId = form.watch('pipelineId');
    const selectedStageId = form.watch('currentStageId');

    // Memoriza o funil ativo para extrair suas etapas sem re-processamento desnecessário
    const activePipeline = useMemo(() => 
        pipelines.find(p => p.id === selectedPipelineId), 
    [pipelines, selectedPipelineId]);

    // 🛡️ GUARDIÃO DE ESTADO: Reseta a etapa atual se o usuário trocar o funil base
    useEffect(() => {
        if (activePipeline && selectedStageId) {
            const stageExistsInNewPipeline = activePipeline.stages?.some(s => s.id === selectedStageId);
            if (!stageExistsInNewPipeline) {
                // shouldValidate: true avisa o Zod sobre a mudança imediatamente
                form.setValue('currentStageId', '', { shouldValidate: true });
            }
        }
    }, [selectedPipelineId, activePipeline, form, selectedStageId]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl shadow-inner">
            <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Funil de Vendas</label>
                <select 
                    {...form.register('pipelineId')}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none transition-all"
                >
                    <option value="">Selecione um funil...</option>
                    {pipelines.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Etapa Atual</label>
                <select 
                    {...form.register('currentStageId')}
                    disabled={!selectedPipelineId}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <option value="">Selecione uma etapa...</option>
                    {activePipeline?.stages?.sort((a, b) => a.order - b.order).map(stage => (
                        <option key={stage.id} value={stage.id}>{stage.name}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

/**
 * ============================================================================
 * 🧩 INJETOR 2: EDITOR DE ITENS DINÂMICO (Produtos/Serviços)
 * @description Utiliza o `useFieldArray` nativo do React Hook Form. 
 * Manipula o DOM de forma isolada, permitindo adicionar/remover linhas 
 * de orçamento com performance máxima (60 FPS).
 * ============================================================================
 */
const DealItemsEditor = ({ form }: { form: UseFormReturn<any> }) => {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'items' // A chave DEVE bater exatamente com o Zod Schema
    });

    // Watchers para o Motor Matemático Visual
    const watchedItems = form.watch('items') || [];
    const watchedManualValue = form.watch('value') || 0;

    // 🧮 MOTOR VISUAL: Exibe o cálculo ao vivo para o vendedor. 
    // Lembrete: O Zod refaz esse cálculo no backend/transform para evitar fraudes.
    const computedTotal = useMemo(() => {
        if (watchedItems.length > 0) {
            return watchedItems.reduce((acc: number, item: any) => acc + ((item.quantity || 0) * (item.unitPrice || 0)), 0);
        }
        return watchedManualValue;
    }, [watchedItems, watchedManualValue]);

    return (
        <div className="mt-6 border border-gray-700/50 rounded-xl overflow-hidden bg-gray-800/20">
            {/* Header da Mini-Tabela */}
            <div className="bg-gray-800/80 px-4 py-3 flex justify-between items-center border-b border-gray-700/50">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <FaDollarSign className="text-accent-secondary" /> Escopo Comercial
                </h4>
                <div className="text-sm font-black text-green-400 drop-shadow-md">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(computedTotal)}
                </div>
            </div>

            {/* Grid de Linhas Dinâmicas */}
            <div className="p-2 space-y-2">
                {fields.length === 0 ? (
                    <div className="p-4 text-center">
                        <p className="text-xs text-gray-500 mb-1">Nenhum produto ou serviço detalhado.</p>
                        <p className="text-[10px] text-gray-600">O valor manual global da oportunidade será utilizado.</p>
                    </div>
                ) : (
                    fields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-2 bg-gray-900/50 p-2 rounded-lg border border-gray-700/30 group transition-all hover:border-gray-500">
                            <input 
                                {...form.register(`items.${index}.description` as const)} 
                                placeholder="Descrição do Produto/Serviço..."
                                className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-600 px-2 py-1 focus:outline-none focus:bg-gray-800 rounded transition-colors"
                            />
                            <input 
                                type="number" 
                                step="0.01"
                                {...form.register(`items.${index}.quantity` as const)} 
                                placeholder="Qtd"
                                className="w-20 bg-transparent text-sm text-center text-gray-200 placeholder-gray-600 px-2 py-1 focus:outline-none focus:bg-gray-800 rounded transition-colors border-l border-gray-700/50"
                            />
                            <input 
                                type="number" 
                                step="0.01"
                                {...form.register(`items.${index}.unitPrice` as const)} 
                                placeholder="R$ Unitário"
                                className="w-28 bg-transparent text-sm text-right text-gray-200 placeholder-gray-600 px-2 py-1 focus:outline-none focus:bg-gray-800 rounded transition-colors border-l border-gray-700/50"
                            />
                            <button 
                                type="button" 
                                onClick={() => remove(index)}
                                className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                title="Remover item"
                            >
                                <FaTrash size={12} />
                            </button>
                        </div>
                    ))
                )}
                
                {/* Botão Adicionar Linha */}
                <button 
                    type="button"
                    onClick={() => append({ id: `temp-${Date.now()}`, description: '', quantity: 1, unitPrice: 0, type: 'SERVICE' })}
                    className="w-full py-2.5 mt-2 flex items-center justify-center gap-2 text-xs font-bold text-gray-500 hover:text-accent-secondary border border-dashed border-gray-700 hover:border-accent-secondary/50 rounded-lg hover:bg-gray-800/50 transition-all"
                >
                    <FaPlus size={10} /> Adicionar Produto / Serviço
                </button>
            </div>
        </div>
    );
};

/**
 * ============================================================================
 * 🏭 COMPONENTE PRINCIPAL: DEAL REGISTRY (Auditoria e Gestão)
 * @description A Visão "Master Data" das oportunidades. 
 * Desenhada para o Gerente de Vendas auditar o funil inteiro de forma global.
 * ============================================================================
 */
export function DealRegistry() {
    
    // --- 📡 Conexão de Dados (Cross-Domain) ---
    // O Deal é o centro da teia, então precisamos dos Deals, Clientes e Funis
    const { deals, isLoading: loadingDeals, error: errorDeals, refreshDeals } = useDeals();
    const { createDeal, updateDeal } = useDealMutation();
    const { clients, isLoading: loadingClients } = useClients();
    const { pipelines, isLoadingPipelines } = usePipelines();

    const isGlobalLoading = loadingDeals || loadingClients || isLoadingPipelines;

    // =========================================================================
    // ⚙️ CONFIGURAÇÃO CLASSE OURO (Motor Crud V4)
    // =========================================================================
    const config: CrudConfig<CRMDeal, DealFormInput> = useMemo(() => {
        
        // Mapeamentos de DTO para os Selects Nativos do CrudLayout
        const clientOptions = clients.map(c => ({ value: c.id, label: c.name }));
        const statusOptions = Object.values(DealStatus).map(s => ({ value: s, label: s }));
        const sourceOptions = Object.values(DealSource).map(s => ({ value: s, label: s }));

        return {
            title: 'Gestão de Oportunidades (Deals)',
            description: 'Auditoria central de todas as negociações da plataforma.',
            schema: DealFormSchema as any, 

            // --- 👁️ VISÃO MASTER (A Tabela do Gerente) ---
            columns: [
                {
                    header: 'Oportunidade',
                    accessor: (item) => (
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-bold text-white leading-tight">{item.title}</span>
                            <span className="text-xs text-gray-500 flex items-center gap-1.5 truncate max-w-[250px]">
                                <FaUserTie className="opacity-60" /> {item.client?.name || 'Cliente Removido'}
                            </span>
                        </div>
                    )
                },
                {
                    header: 'Posicionamento',
                    accessor: (item) => {
                        const pipe = pipelines.find(p => p.id === item.pipelineId);
                        const stage = pipe?.stages?.find(s => s.id === item.currentStageId);
                        return (
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{pipe?.name || 'Sem Funil Vinculado'}</span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    {/* Indicador Visual Rápido da Etapa */}
                                    <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: stage?.color || '#555' }} />
                                    <span className="text-xs text-gray-300 truncate max-w-[150px]">{stage?.name || item.status}</span>
                                </div>
                            </div>
                        );
                    }
                },
                {
                    header: 'Previsão Financeira',
                    accessor: (item) => (
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-sm font-black text-green-400 drop-shadow-md">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.value))}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                item.probability >= 70 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                                item.probability >= 30 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                                'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                                {item.probability}% Chance
                            </span>
                        </div>
                    )
                }
            ],

            // --- 📝 VISÃO DETAIL (O Formulário de Auditoria) ---
            fields: [
                { name: 'title', label: 'Título da Oportunidade', type: 'text', placeholder: 'Ex: Consultoria Plena Anual' },
                { name: 'clientId', label: 'Cliente Vinculado', type: 'select', options: clientOptions },
                
                // 💡 INJEÇÃO 1: Selects de Roteamento em Cascata
                {
                    name: 'pipeline_routing' as any,
                    label: 'Roteamento Comercial',
                    type: 'custom',
                    customRender: (form) => <PipelineStageSelector form={form} pipelines={pipelines} />
                },

                // Agrupamento de Previsões em Linha
                { name: 'probability', label: 'Probabilidade de Fechamento (%)', type: 'number', placeholder: '0 a 100' },
                { name: 'expectedCloseDate', label: 'Previsão de Fechamento', type: 'date' },
                
                // Agrupamento de Origem/Status em Linha
                { name: 'status', label: 'Status Lógico', type: 'select', options: statusOptions },
                { name: 'source', label: 'Origem do Lead', type: 'select', options: sourceOptions },
                
                // 💡 INJEÇÃO 2: Tabela de Produtos/Serviços Dinâmica
                {
                    name: 'items_editor' as any,
                    label: 'Precificação Detalhada',
                    type: 'custom',
                    customRender: (form) => <DealItemsEditor form={form} />
                },
                
                // Fallback de Valor (Ignorado pelo Zod se houver itens)
                { name: 'value', label: 'Valor Manual Global (Apenas para vendas simples)', type: 'number' },
            ],

            // --- 🗄️ GAVETA DE AUDITORIA ---
            systemFields: [
                { name: 'id', label: 'UUID da Oportunidade', type: 'text' },
                { name: 'lossReason', label: 'Motivo de Perda (Diagnóstico Churn)', type: 'textarea' },
            ]

        };
    }, [clients, pipelines]); // Recalcula o config apenas se as listas de relacionamentos mudarem

    // =========================================================================
    // 🔌 ROTEAMENTO DE AÇÕES E BYPASS SEGURO (CQRS)
    // =========================================================================
    const crudHooks: CrudHooks<CRMDeal, DealFormInput> = {
        data: deals,
        isLoading: isGlobalLoading,
        error: errorDeals ? String(errorDeals) : null,
        
        // 💡 O Zod transform() envia o payload matemático perfeitamente calculado
        onCreate: async (data) => { return createDeal(data as any); },
        onUpdate: async (id, data) => { return updateDeal(id, data as any); },
        
        // Auditoria: Excluir negócios falsifica relatórios históricos.
        onDelete: async () => { alert('⚠️ Operação bloqueada: Oportunidades não devem ser excluídas para preservar a rastreabilidade comercial. Altere o status para "LOST" (Perdido).'); },
        
        onRefresh: refreshDeals
    };

    return (
        <div className="h-full w-full animate-fade-in">
            <CrudLayout<CRMDeal, DealFormInput>
                config={config}
                hooks={crudHooks}
            />
        </div>
    );
}