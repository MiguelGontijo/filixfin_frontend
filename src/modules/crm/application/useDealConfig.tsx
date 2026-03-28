import React, { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form'; 
import { FaUserTie, FaTrash, FaHandshake } from 'react-icons/fa';

// --- Mundo 1: Motor CRUD V4 (Contratos Globais) ---
import { CrudConfig } from '@/core/components/crud/types';

// --- Mundo 2: Domínio & Aplicação (CRM) ---
import { CRMDeal, DealStatus, DealSource } from '../domain/types';
import { DealFormSchema, DealFormInput } from '../domain/schemas/dealSchema';
import { IPipeline } from '../domain/types/pipeline.types';
import { Client } from '@/core/client/types/client';

// --- Peças de LEGO: Micro-componentes de Elite (Extraídos) ---
import { DealItemsTable } from '../presentation/components/shared/DealItemsTable';
import { DealValueInput } from '../presentation/components/shared/DealValueInput';
import { PipelineStageSelector } from '../presentation/components/shared/PipelineStageSelector';

/**
 * ============================================================================
 * 🏭 HOOK PRINCIPAL: useDealConfig (Manual de Instruções de Oportunidades)
 * @description Centraliza todas as regras visuais, mapeamento de colunas da 
 * tabela e inputs do formulário do módulo de Oportunidades.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Injeção de Dependência):
 * Recebe dados externos (clients, pipelines) via parâmetros para manter a
 * pureza e evitar acoplamento com o estado global de loading do Registry.
 * ============================================================================
 */
export function useDealConfig(
    clients: Client[], 
    pipelines: IPipeline[], 
    isCompact: boolean = false
): CrudConfig<CRMDeal, DealFormInput> {
    
    return useMemo(() => {
        
        // Construtores de Opções para os Selects nativos do Motor V4
        const clientOptions = clients.map(c => ({ value: c.id, label: c.name }));
        const statusOptions = Object.values(DealStatus).map(s => ({ value: s, label: s }));
        const sourceOptions = Object.values(DealSource).map(s => ({ value: s, label: s }));

        return {
            // Roteamento visual baseado no polimorfismo do componente pai
            title: isCompact ? 'Oportunidades' : 'Gestão de Oportunidades',
            description: isCompact ? '' : 'Auditoria central de todas as negociações da plataforma.',
            icon: <FaHandshake />,
            schema: DealFormSchema as any, 

            // ========================================================================
            // 👁️ VISÃO MASTER (A Tabela)
            // ========================================================================
            columns: [
                {
                    header: 'Oportunidade',
                    accessor: (item: CRMDeal) => {
                        const clientInfo = item.client || clients.find(c => c.id === item.clientId);
                        return (
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-bold text-white leading-tight">{item.title}</span>
                                {!isCompact && (
                                    <span className="text-xs text-gray-500 flex items-center gap-1.5 truncate max-w-[250px]">
                                        <FaUserTie className="opacity-60" /> {clientInfo?.name || 'Cliente Não Encontrado'}
                                    </span>
                                )}
                            </div>
                        );
                    }
                },
                {
                    header: 'Posicionamento',
                    accessor: (item: CRMDeal) => {
                        const pipe = pipelines.find(p => p.id === item.pipelineId);
                        const stage = pipe?.stages?.find(s => s.id === item.currentStageId);
                        return (
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{pipe?.name || 'Sem Funil'}</span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: stage?.color || '#555' }} />
                                    <span className="text-xs text-gray-300 truncate max-w-[150px]">{stage?.name || item.status}</span>
                                </div>
                            </div>
                        );
                    }
                },
                {
                    header: 'Previsão',
                    accessor: (item: CRMDeal) => (
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-sm font-black text-green-400 drop-shadow-md">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.value))}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                item.probability >= 70 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                                item.probability >= 30 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                                'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                                {item.probability}%
                            </span>
                        </div>
                    )
                }
            ],

            // ========================================================================
            // 🃏 CONFIGURAÇÃO DE CARDS (Para Barra Lateral e Kanban)
            // ========================================================================
            cardConfig: {
                title: (item: CRMDeal) => item.title,
                subtitle: (item: CRMDeal) => {
                    const pipe = pipelines.find(p => p.id === item.pipelineId);
                    const stage = pipe?.stages?.find(s => s.id === item.currentStageId);
                    const formattedValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.value));
                    
                    return (
                        <div className="flex flex-col gap-1 mt-0.5">
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_4px_rgba(255,255,255,0.1)]" style={{ backgroundColor: stage?.color || '#555' }} />
                                <span className="text-[10px] text-gray-500 truncate font-medium">
                                    {stage?.name || item.status}
                                </span>
                            </div>
                            <span className="text-xs font-bold text-green-400 drop-shadow-sm">
                                {formattedValue}
                            </span>
                        </div>
                    );
                },
                avatar: () => (
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-accent-primary/10 text-accent-primary flex-shrink-0 shadow-inner">
                        <FaHandshake className="w-3.5 h-3.5" />
                    </div>
                ),
                badge: (item: CRMDeal) => {
                    const isHigh = item.probability >= 70;
                    const isMedium = item.probability >= 30;
                    return {
                        text: `${item.probability}%`,
                        variant: isHigh ? 'success' : isMedium ? 'warning' : 'danger'
                    };
                }
            },

            // ========================================================================
            // 📝 VISÃO DETAIL (O Formulário de Auditoria)
            // ========================================================================
            fields: [
                { name: 'title', label: 'Título da Oportunidade', type: 'text', placeholder: 'Ex: Consultoria Plena Anual' },
                { name: 'clientId', label: 'Cliente Vinculado', type: 'select', options: clientOptions },
                
                {
                    /** 🔌 CONEXÃO: Seletor de Etapas (Cascata) */
                    name: 'currentStageId',
                    label: 'Roteamento Comercial',
                    type: 'custom',
                    customRender: (form: UseFormReturn<any>) => <PipelineStageSelector form={form} pipelines={pipelines} />
                },

                { name: 'probability', label: 'Probabilidade de Fechamento (%)', type: 'number', placeholder: '0 a 100' },
                { name: 'expectedCloseDate', label: 'Previsão de Fechamento', type: 'date' },
                
                { name: 'status', label: 'Status Lógico', type: 'select', options: statusOptions },
                { name: 'source', label: 'Origem do Lead', type: 'select', options: sourceOptions },
                
                {
                    /** ⚙️ CONEXÃO: Tabela de Itens Dinâmica */
                    name: 'items',
                    label: 'Precificação Detalhada',
                    type: 'custom',
                    customRender: (form: UseFormReturn<any>) => <DealItemsTable form={form} />
                },
                
                { 
                    /** 🛡️ CONEXÃO: Input de Valor com trava de integridade */
                    name: 'value', 
                    label: 'Valor Manual Global (Apenas para vendas simples)', 
                    type: 'custom',
                    customRender: (form: UseFormReturn<any>) => <DealValueInput form={form} />
                },
            ],

            // ========================================================================
            // 🗄️ GAVETA DE AUDITORIA
            // ========================================================================
            systemFields: [
                { name: 'id', label: 'UUID da Oportunidade', type: 'text' },
                { name: 'lossReason', label: 'Motivo de Perda', type: 'textarea' },
                { name: 'createdAt', label: 'Data de Registro', type: 'text' },
                { name: 'updatedAt', label: 'Última Atualização', type: 'text' }
            ]

        };
    }, [clients, pipelines, isCompact]); 
}