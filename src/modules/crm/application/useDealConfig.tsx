'use client';

import React, { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form'; 
import { FaUserTie, FaHandshake } from 'react-icons/fa';

/** * --- MOTORES DO CORE CRUD V4 ---
 * O Config agora é 100% declarativo, delegando a inteligência de dados 
 * para o processamento automático da DataEngine no CrudLayout.
 */
import { CrudConfig } from '@/core/components/crud/types';

/** * --- DOMÍNIO & ESPECIFICAÇÕES (CRM) --- */
import { CRMDeal, DealStatus, DealSource } from '../domain/types';
import { DealFormSchema, DealFormInput } from '../domain/schemas/dealSchema';
import { IPipeline } from '../domain/types/pipeline.types';
import { Client } from '@/core/client/domain/types/client';

/** * --- PEÇAS DE LEGO: Micro-componentes de Elite (Injetados) --- */
import { DealItemsTable } from '../presentation/components/shared/DealItemsTable';
import { DealValueInput } from '../presentation/components/shared/DealValueInput';
import { PipelineStageSelector } from '../presentation/components/shared/PipelineStageSelector';

/**
 * ============================================================================
 * 🏭 HOOK PRINCIPAL: useDealConfig (Manual de Instruções de Oportunidades)
 * @description Centraliza todas as regras visuais, mapeamento de colunas e 
 * orquestração de campos customizados do módulo de Deals.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Netflix/Shopify Level):
 * 1. Dependency Injection: Recebe estados externos para manter a pureza lógica.
 * 2. Visual Soul: Injeta o ícone FaHandshake nativamente para coerência no Header.
 * 3. Atomic Rendering: Gerencia componentes complexos (Sub-tabelas e Seletores 
 * em Cascata) através do padrão de renderização customizada da Engine V4.
 * ============================================================================
 */
export function useDealConfig(
    clients: Client[], 
    pipelines: IPipeline[], 
    isCompact: boolean = false
): CrudConfig<CRMDeal, DealFormInput> {
    
    return useMemo(() => {
        
        // Construtores de Opções para os Selects (Normalização de Dicionários)
        const clientOptions = clients.map(c => ({ value: c.id, label: c.name }));
        const statusOptions = Object.values(DealStatus).map(s => ({ value: s, label: s }));
        const sourceOptions = Object.values(DealSource).map(s => ({ value: s, label: s }));

        return {
            // Identidade e Roteamento Visual
            title: isCompact ? 'Deals' : 'Gestão de Oportunidades',
            description: isCompact ? '' : 'Auditoria central e orquestração de todas as negociações comerciais.',
            icon: <FaHandshake className="text-accent-primary" />,
            schema: DealFormSchema as any, 

            // ====================================================================
            // 👁️ VISÃO MASTER (A Vitrine Financeira - Tabela)
            // ====================================================================
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
                                        <FaUserTie className="opacity-60 text-[10px]" /> {clientInfo?.name || 'Cliente Não Encontrado'}
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
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{pipe?.name || 'Sem Funil'}</span>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: stage?.color || '#333' }} />
                                    <span className="text-xs text-gray-300 font-medium truncate max-w-[150px]">{stage?.name || item.status}</span>
                                </div>
                            </div>
                        );
                    }
                },
                {
                    header: 'Previsão / Valor',
                    accessor: (item: CRMDeal) => (
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-sm font-black text-green-400 drop-shadow-md">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.value))}
                            </span>
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase tracking-tighter ${
                                item.probability >= 70 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                                item.probability >= 30 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                                'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                                {item.probability}% Probabilidade
                            </span>
                        </div>
                    )
                }
            ],

            // ====================================================================
            // 📝 VISÃO DETAIL (O Formulário de Alta Fidelidade)
            // ====================================================================
            fields: [
                { 
                    name: 'title', 
                    label: 'Título da Oportunidade', 
                    type: 'text', 
                    placeholder: 'Ex: Contrato de Consultoria Anual' 
                },
                { 
                    name: 'clientId', 
                    label: 'Cliente Vinculado', 
                    type: 'select', 
                    options: clientOptions 
                },
                
                {
                    /** 🔌 CONEXÃO: Seletor de Etapas (Cascata Inteligente) */
                    name: 'currentStageId',
                    label: 'Roteamento no Funil de Vendas',
                    type: 'custom',
                    customRender: (form: UseFormReturn<any>) => <PipelineStageSelector form={form} pipelines={pipelines} />
                },

                { 
                    name: 'probability', 
                    label: 'Probabilidade (%)', 
                    type: 'number', 
                    placeholder: '0 a 100' 
                },
                { 
                    name: 'expectedCloseDate', 
                    label: 'Previsão de Fechamento', 
                    type: 'date' 
                },
                
                { 
                    name: 'status', 
                    label: 'Status do Negócio', 
                    type: 'select', 
                    options: statusOptions 
                },
                { 
                    name: 'source', 
                    label: 'Origem da Oportunidade', 
                    type: 'select', 
                    options: sourceOptions 
                },
                
                {
                    /** ⚙️ CONEXÃO: Tabela de Itens (Composição de Valor) */
                    name: 'items',
                    label: 'Detalhamento de Produtos e Serviços',
                    type: 'custom',
                    colSpan: 'full',
                    customRender: (form: UseFormReturn<any>) => <DealItemsTable form={form} />
                },
                
                { 
                    /** 🛡️ CONEXÃO: Input de Valor Global (Segurança Financeira) */
                    name: 'value', 
                    label: 'Valor Total do Negócio (Ajuste Manual)', 
                    type: 'custom',
                    customRender: (form: UseFormReturn<any>) => <DealValueInput form={form} />
                },
            ],

            // ====================================================================
            // 🗄️ AUDITORIA (Gaveta Oculta de Sistema)
            // ====================================================================
            systemFields: [
                { name: 'id', label: 'UUID da Oportunidade', type: 'text' },
                { name: 'lossReason', label: 'Motivo de Perda / Declínio', type: 'textarea' },
                { name: 'createdAt', label: 'Data de Registro', type: 'text' },
                { name: 'updatedAt', label: 'Última Atualização', type: 'text' }
            ]

        };
    }, [clients, pipelines, isCompact]); 
}