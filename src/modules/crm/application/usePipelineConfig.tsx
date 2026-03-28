import React, { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FaProjectDiagram, FaCheckCircle, FaStream } from 'react-icons/fa';

// --- Mundo 1: Motor CRUD V4 (Contratos de Infraestrutura) ---
import { CrudConfig } from '@/core/components/crud/types';

// --- Mundo 2: Domínio & Aplicação (CRM) ---
import { IPipeline } from '../domain/types/pipeline.types';
import { PipelineFormSchema, PipelineFormInput } from '../domain/schemas/pipelineSchema';

// --- Peças de LEGO: Micro-componentes Extraídos ---
import { StagesEditorInjector } from '../presentation/components/pipeline-manager/StagesEditorInjector';

/**
 * ============================================================================
 * 🏭 HOOK: usePipelineConfig (Manual de Instruções do Funil)
 * @description Centraliza as regras visuais, mapeamento de colunas e lógica de 
 * formulário para o domínio de Pipelines. Permite que o Motor CRUD desenhe 
 * interfaces de gestão de funis de forma padronizada.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Enterprise Design):
 * 1. Semantic Identity: Injeta ícones e nomenclaturas que reforçam a 
 * identidade do módulo de vendas.
 * 2. Visual Aggregation: Na tabela master, apresenta um dashboard minimalista 
 * das cores das etapas, permitindo reconhecimento imediato do fluxo.
 * 3. Form Injection: Utiliza o componente 'StagesEditorInjector' para 
 * acoplar a complexidade do Drag & Drop de forma limpa no formulário.
 * ============================================================================
 */
export function usePipelineConfig(): CrudConfig<IPipeline, PipelineFormInput> {
    
    return useMemo(() => {
        return {
            title: 'Funis de Vendas',
            description: 'Configure as esteiras comerciais e a progressão lógica de etapas.',
            icon: <FaStream />, // Identidade visual robusta para o cabeçalho
            schema: PipelineFormSchema as any,

            // ========================================================================
            // 👁️ VISÃO MASTER (A Tabela / Grid)
            // ========================================================================
            columns: [
                {
                    header: 'Estrutura do Funil',
                    accessor: (item: IPipeline) => (
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-800 rounded-lg border border-gray-700 text-accent-secondary flex-shrink-0">
                                <FaProjectDiagram className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-white tracking-tight leading-tight">
                                    {item.name}
                                </span>
                                <span className="text-[10px] text-gray-500 uppercase font-medium tracking-widest mt-0.5">
                                    ID: {item.id.split('-')[0]}...
                                </span>
                            </div>
                        </div>
                    )
                },
                {
                    header: 'Etapas (Flow)',
                    accessor: (item: IPipeline) => {
                        const stageCount = item.stages?.length || 0;
                        return (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center bg-gray-900/50 px-2 py-1 rounded border border-gray-700/50">
                                    <span className="text-xs font-black text-gray-300">
                                        {stageCount}
                                    </span>
                                </div>
                                {/* Mini Dashboard de Cores: Representação visual do fluxo de trabalho */}
                                <div className="flex items-center -space-x-1">
                                    {item.stages?.sort((a, b) => a.order - b.order).slice(0, 6).map((stage) => (
                                        <div 
                                            key={stage.id} 
                                            className="w-2.5 h-5 rounded-sm border border-gray-900 shadow-sm" 
                                            style={{ backgroundColor: stage.color }} 
                                            title={stage.name} 
                                        />
                                    ))}
                                    {stageCount > 6 && (
                                        <div className="w-5 h-5 flex items-center justify-center text-[8px] font-bold text-gray-600 bg-gray-800 rounded-sm">
                                            +{stageCount - 6}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    }
                },
                {
                    header: 'Status Lógico',
                    accessor: (item: IPipeline) => (
                        item.isDefault ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                <FaCheckCircle /> Principal
                            </div>
                        ) : (
                            <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold ml-1">
                                Alternativo
                            </span>
                        )
                    )
                }
            ],

            // ========================================================================
            // 📝 VISÃO DETAIL (O Formulário de Configuração)
            // ========================================================================
            fields: [
                { 
                    name: 'name', 
                    label: 'Nome Identificador do Funil', 
                    type: 'text', 
                    placeholder: 'Ex: Vendas High-Ticket, SDR-Outbound...' 
                },
                { 
                    name: 'isDefault', 
                    label: 'Definir como Funil Padrão', 
                    type: 'boolean', 
                    trueLabel: 'Sim, carregar automaticamente no Kanban', 
                    falseLabel: 'Não, manter como funil secundário' 
                },
                {
                    /**
                     * 💡 INJEÇÃO DE ELITE: Acoplamos o StagesEditorInjector para gerenciar 
                     * a complexidade do array de etapas reordenáveis.
                     */
                    name: 'stages' as any,
                    label: 'Mapeamento de Etapas (Arraste para definir a jornada do cliente)',
                    type: 'custom',
                    customRender: (form: UseFormReturn<any>) => <StagesEditorInjector form={form} />
                }
            ],

            // ========================================================================
            // 🗄️ GAVETA DE AUDITORIA (System Fields)
            // ========================================================================
            systemFields: [
                { name: 'id', label: 'UUID do Recurso', type: 'text' },
                { name: 'tenantId', label: 'ID da Organização (Tenant)', type: 'text' },
                { name: 'createdAt', label: 'Data de Criação', type: 'text' },
                { name: 'updatedAt', label: 'Última Modificação', type: 'text' }
            ]
        };
    }, []); 
}