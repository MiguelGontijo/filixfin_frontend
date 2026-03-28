import React from 'react';

// --- Mundo 1: Motor CRUD V4 (Orquestração de Formulários) ---
import { CrudFormOrchestrator } from '@/core/components/crud/views/form/CrudFormOrchestrator';
import { CrudConfig, FormMode } from '@/core/components/crud/types';

// --- Mundo 2: Domínio & Aplicação (CRM) ---
import { CRMDeal, DealStatus } from '../../../domain/types';
import { IPipelineStage } from '../../../domain/types/pipeline.types';

// --- Componentes Visuais ---
import { KanbanBoard } from './KanbanBoard';

/**
 * @type KanbanViewMode
 * @description Define o estado de projeção do corpo do Kanban.
 */
export type KanbanViewMode = 
    | { type: 'BOARD' }
    | { type: 'DEAL_FORM'; data?: CRMDeal | Partial<CRMDeal> }
    | { type: 'PIPELINE_FORM'; data?: any };

/**
 * @interface KanbanBodyProps
 * @description Contrato de propriedades para o roteador de conteúdo do Kanban.
 */
interface KanbanBodyProps {
    /** Modo ativo de visualização (Board ou Formulário Inline) */
    mode: KanbanViewMode;
    /** Lista de oportunidades para renderização do board */
    deals: CRMDeal[];
    /** Estrutura de colunas baseada no funil selecionado */
    stages: IPipelineStage[];
    /** Configuração do formulário de Deal (Manual de Instruções V4) */
    dealConfig: CrudConfig<CRMDeal, any>;
    /** Configuração do formulário de Pipeline (Manual de Instruções V4) */
    pipelineConfig: CrudConfig<any, any>;
    /** Ações do Ciclo de Vida */
    onDealMove: (dealId: string, newStageId: string, newStatus?: DealStatus) => void;
    onEditDeal: (deal: CRMDeal) => void;
    onAddDeal: (status?: DealStatus) => void;
    onCloseForm: () => void;
    onSaveSuccess: () => void;
}

/**
 * ============================================================================
 * 🎭 COMPONENTE: KanbanBody (O Roteador do Palco)
 * @description Responsável por alternar entre a visão de colunas (Drag & Drop) 
 * e os formulários de edição/criação utilizando o Motor CRUD V4.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO:
 * 1. Interface Polymorphism: Suporta múltiplos tipos de formulários (Deal/Pipeline) 
 * mantendo a consistência visual do palco.
 * 2. Key Forcing Strategy: Utiliza chaves dinâmicas nos formulários para garantir 
 * o reset absoluto de estado entre edições de itens diferentes.
 * 3. Layout Integrity: Garante que a transição entre Board e Form seja fluída 
 * e não quebre a estrutura de scroll da página.
 * ============================================================================
 */
export const KanbanBody: React.FC<KanbanBodyProps> = ({
    mode,
    deals,
    stages,
    dealConfig,
    pipelineConfig,
    onDealMove,
    onEditDeal,
    onAddDeal,
    onCloseForm,
    onSaveSuccess
}) => {

    // ========================================================================
    // 🏗️ ESTADO 1: O BOARD (Drag & Drop)
    // ========================================================================
    if (mode.type === 'BOARD') {
        return (
            <div className="flex-1 min-h-0 overflow-hidden animate-fade-in">
                <KanbanBoard 
                    deals={deals}
                    stages={stages}
                    onDealMove={onDealMove}
                    onEditDeal={onEditDeal}
                    onAddDeal={onAddDeal}
                />
            </div>
        );
    }

    // ========================================================================
    // 📝 ESTADO 2: FORMULÁRIO DE OPORTUNIDADE (DEAL)
    // ========================================================================
    if (mode.type === 'DEAL_FORM') {
        return (
            <div className="flex-1 w-full max-w-5xl mx-auto bg-gray-900/80 rounded-2xl border border-gray-700/80 flex flex-col overflow-hidden animate-fade-in-up shadow-2xl relative">
                <CrudFormOrchestrator<CRMDeal, any>
                    /** 💡 KEY FORCING: Identificador único garante que o form limpe ao trocar de item */
                    key={`deal-kanban-form-${(mode.data as any)?.id || 'new'}`}
                    isOpen={true}
                    onClose={onCloseForm}
                    config={dealConfig}
                    initialData={mode.data as any}
                    presentationMode="inline"
                    formMode={FormMode.EDIT}
                    onSubmit={async (data) => {
                        // A lógica de persistência é injetada via Maestro (CRMKanbanView)
                        onSaveSuccess();
                    }}
                />
            </div>
        );
    }

    // ========================================================================
    // ⚙️ ESTADO 3: FORMULÁRIO DE CONFIGURAÇÃO (PIPELINE)
    // ========================================================================
    if (mode.type === 'PIPELINE_FORM') {
        return (
            <div className="flex-1 w-full max-w-4xl mx-auto bg-gray-900/80 rounded-2xl border border-gray-700/80 flex flex-col overflow-hidden animate-fade-in-up shadow-2xl relative">
                <CrudFormOrchestrator<any, any>
                    key={`pipeline-kanban-form-${mode.data?.id || 'current'}`}
                    isOpen={true}
                    onClose={onCloseForm}
                    config={pipelineConfig}
                    initialData={mode.data}
                    presentationMode="inline"
                    formMode={FormMode.EDIT}
                    onSubmit={async (data) => {
                        onSaveSuccess();
                    }}
                />
            </div>
        );
    }

    return null;
};