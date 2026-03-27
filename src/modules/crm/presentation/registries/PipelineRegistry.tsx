'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FaProjectDiagram, FaCheckCircle, FaSync } from 'react-icons/fa';

// --- Mundo 1: Motor CRUD V4 (Contratos Globais) ---
import { CrudLayout } from '@/core/components/crud/CrudLayout';
import { CrudConfig, CrudHooks } from '@/core/components/crud/types';

// --- Mundo 2: Domínio & Aplicação (CRM) ---
import { IPipeline } from '../../domain/types/pipeline.types';
import { PipelineFormSchema, PipelineFormInput } from '../../domain/schemas/pipelineSchema';

// --- Motores de Dados (CQRS) ---
import { usePipelines, usePipelineDetails } from '../../application/hooks/usePipelines';
import { usePipelineMutation } from '../../application/hooks/usePipelineMutation'; // 💡 Novo Braço de Comando

// --- Componentes de Apresentação ---
import { StageList, ConfigStage } from '../components/pipeline-manager/StageList';

/**
 * ============================================================================
 * 🧩 COMPONENTE INJETÁVEL: STAGE LOADER (O Guardião de Estado)
 * @description Injetado no motor V4, este componente gerencia o ciclo de vida 
 * das etapas (Stages) do funil, blindando o React Hook Form contra vazamentos.
 * ============================================================================
 */
const StagesEditorInjector = ({ form }: { form: UseFormReturn<any> }) => {
    // Escuta o ID atual para saber se estamos no modo Criação (null) ou Edição (UUID)
    const pipelineId = form.watch('id');
    const { pipeline, isLoadingPipeline } = usePipelineDetails(pipelineId);

    // 🛡️ O GUARDIÃO: Uma referência de memória que sobrevive a re-renderizações.
    // Usado para garantir que a injeção/limpeza ocorra apenas uma vez por transição de tela.
    const syncRef = useRef<string | null>(null);

    useEffect(() => {
        // Define o estado atual ('NEW_PIPELINE' ou o UUID do funil em edição)
        const currentMode = pipelineId || 'NEW_PIPELINE';

        // Só age se o usuário trocou de tela (ex: Cancelou e clicou em "Novo")
        if (syncRef.current !== currentMode) {
            
            if (currentMode === 'NEW_PIPELINE') {
                // 🧹 GHOST-BUSTER: MODO CRIAÇÃO
                // Se entramos num form novo, força a limpeza do array para matar
                // "fantasmas" de edições anteriores que ficaram presos na memória do RHF.
                form.setValue('stages', [], { shouldValidate: false });
                syncRef.current = currentMode;
                
            } else if (pipeline && pipeline.id === pipelineId) {
                // 💧 HIDRATAÇÃO: MODO EDIÇÃO
                // A API terminou de carregar o funil correto. Injetamos as etapas no formulário.
                form.setValue('stages', pipeline.stages || [], { shouldValidate: true });
                syncRef.current = currentMode;
            }
        }
    }, [pipelineId, pipeline, form]);

    const currentStages = form.watch('stages') || [];

    // ⏳ LOADING STATE (Proteção contra Race Conditions)
    if (pipelineId && isLoadingPipeline && syncRef.current !== pipelineId) {
        return (
            <div className="mt-4 p-8 flex flex-col items-center justify-center bg-gray-800/30 border border-gray-700/50 rounded-xl text-gray-500">
                <FaSync className="animate-spin mb-3 text-accent-primary w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Sincronizando Etapas da API...</span>
            </div>
        );
    }

    return (
        <div className="mt-4 p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl shadow-inner animate-fade-in">
            <StageList 
                stages={currentStages as ConfigStage[]} 
                onChange={(newStages) => {
                    // Sincroniza as mudanças do Drag & Drop com o motor do formulário
                    form.setValue('stages', newStages, { shouldValidate: true, shouldDirty: true });
                }}
            />
        </div>
    );
};

/**
 * ============================================================================
 * 🏭 COMPONENTE PRINCIPAL: PIPELINE REGISTRY
 * @description O Orquestrador de Funis de Venda (Master Data).
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Enterprise Grade):
 * 1. CQRS Bridge: Conecta hooks de Query e Mutation ao CrudLayout universal.
 * 2. Type-Safety: Resolve inconsistências de retorno de Promises entre Mundos.
 * 3. Injeção de Componentes: Utiliza o portal 'custom' do Motor V4 para embutir
 * o gestor de etapas reordenável.
 * ============================================================================
 */
export function PipelineRegistry() {
    
    // 📡 Mundo Application: Leitura e Escrita segregadas
    const { pipelines, isLoadingPipelines, errorPipelines, refreshPipelines } = usePipelines();
    const { createPipeline, updatePipeline, isLoading: isMutating, error: mutationError } = usePipelineMutation();

    // =========================================================================
    // ⚙️ CONFIGURAÇÃO CLASSE OURO (O Manual do CrudLayout)
    // =========================================================================
    const config: CrudConfig<IPipeline, PipelineFormInput> = useMemo(() => ({
        title: 'Funis de Vendas (Pipelines)',
        description: 'Configure as esteiras comerciais e suas respectivas etapas (Kanban).',
        schema: PipelineFormSchema as any,

        // --- VISÃO MASTER (GRID DE FUNIS) ---
        columns: [
            {
                header: 'Nome do Funil',
                accessor: (item: IPipeline) => (
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-800 rounded-lg border border-gray-700 text-accent-secondary flex-shrink-0">
                            <FaProjectDiagram className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-white tracking-tight">
                            {item.name}
                        </span>
                    </div>
                )
            },
            {
                header: 'Etapas (Stages)',
                accessor: (item: IPipeline) => {
                    const stageCount = item.stages?.length || 0;
                    return (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-300 bg-gray-800 px-2 py-1 rounded-md border border-gray-700">
                                {stageCount} Etapas
                            </span>
                            <div className="hidden sm:flex items-center gap-0.5">
                                {item.stages?.slice(0, 5).map((stage, i) => (
                                    <div key={i} className="w-2 h-4 rounded-sm shadow-sm" style={{ backgroundColor: stage.color }} title={stage.name} />
                                ))}
                                {stageCount > 5 && <span className="text-[10px] text-gray-500 ml-1">...</span>}
                            </div>
                        </div>
                    );
                }
            },
            {
                header: 'Funil Padrão',
                accessor: (item: IPipeline) => (
                    item.isDefault ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <FaCheckCircle /> Padrão
                        </span>
                    ) : (
                        <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Secundário</span>
                    )
                )
            }
        ],

        // --- VISÃO DETAIL (O FORMULÁRIO) ---
        fields: [
            { name: 'name', label: 'Nome do Funil', type: 'text', placeholder: 'Ex: Vendas B2B...' },
            { name: 'isDefault', label: 'Funil Padrão', type: 'boolean', trueLabel: 'Sim, é o padrão', falseLabel: 'Não' },
            {
                name: 'stages',
                label: 'Configuração das Etapas (Arraste para reordenar)',
                type: 'custom',
                customRender: (form: UseFormReturn<any>) => <StagesEditorInjector form={form} />
            }
        ],

        // --- GAVETA DE AUDITORIA ---
        systemFields: [
            { name: 'id', label: 'UUID do Funil', type: 'text' },
            { name: 'tenantId', label: 'Tenant ID', type: 'text' },
        ]

    }), []);

    // =========================================================================
    // 🔌 ROTEAMENTO DE AÇÕES (CQRS Bridge)
    // =========================================================================
    const crudHooks: CrudHooks<IPipeline, PipelineFormInput> = {
        data: pipelines,
        isLoading: isLoadingPipelines || isMutating,
        error: (mutationError || (errorPipelines ? String(errorPipelines) : null)),
        
        // 💡 CONFORMIDADE CLASSE OURO: O Zod garante a tipagem correta no .transform()
        onCreate: async (data) => {
            return createPipeline(data as any);
        },
        
        onUpdate: async (id, data) => {
            return updatePipeline(id, data as any);
        },
        
        onDelete: async () => {
            alert('⚠️ Operação bloqueada: A exclusão de funis requer desvinculação prévia de Deals.');
        },
        
        onRefresh: refreshPipelines
    };

    return (
        <div className="h-full w-full animate-fade-in">
            <CrudLayout<IPipeline, PipelineFormInput>
                config={config}
                hooks={crudHooks}
            />
        </div>
    );
}