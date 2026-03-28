import React, { useEffect, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FaSync } from 'react-icons/fa';

// --- Mundo 2: Aplicação (CRM) ---
import { usePipelineDetails } from '../../../application/hooks/usePipelines';

// --- Componentes Internos de Configuração ---
import { StageList, ConfigStage } from './StageList';

/**
 * @interface StagesEditorInjectorProps
 * @description Contrato para injeção do gerenciador de etapas no Motor V4.
 */
interface StagesEditorInjectorProps {
    /** Instância do formulário vinda do React Hook Form */
    form: UseFormReturn<any>;
}

/**
 * ============================================================================
 * 🧩 MICRO-COMPONENTE: StagesEditorInjector
 * @description Atua como um Middleware Visual. Gerencia o ciclo de vida das 
 * etapas (Stages) do funil, realizando o Lazy Loading e a Hidratação do 
 * formulário de forma isolada.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO:
 * 1. Ghost-Buster Logic: Utiliza uma referência de memória (syncRef) para 
 * detectar transições de modo (Criação vs Edição) e forçar a limpeza do 
 * estado do formulário, impedindo vazamento de dados entre funis.
 * 2. Race Condition Protection: Bloqueia a interação enquanto os dados 
 * profundos da API não são totalmente reconciliados com o formulário.
 * 3. Atomic Updates: Sincroniza as mudanças do Drag & Drop (StageList) 
 * diretamente no campo 'stages' do esquema Zod.
 * ============================================================================
 */
export const StagesEditorInjector: React.FC<StagesEditorInjectorProps> = ({ form }) => {
    // Monitora o ID para distinguir entre Novo Funil (undefined) e Edição (UUID)
    const pipelineId = form.watch('id');
    const { pipeline, isLoadingPipeline } = usePipelineDetails(pipelineId);

    /** 🛡️ O GUARDIÃO: Referência persistente para controle de ciclo de vida.
     * Impede disparos duplicados de setValue durante o re-render.
     */
    const syncRef = useRef<string | null>(null);

    useEffect(() => {
        // Identifica o modo operacional atual
        const currentMode = pipelineId || 'NEW_PIPELINE';

        // Só executa a lógica de sincronização se o usuário mudou de contexto/tela
        if (syncRef.current !== currentMode) {
            
            if (currentMode === 'NEW_PIPELINE') {
                /** 🧹 MODO CRIAÇÃO:
                 * Garante que o array de etapas nasça vazio e limpo.
                 */
                form.setValue('stages', [], { shouldValidate: false });
                syncRef.current = currentMode;
                
            } else if (pipeline && pipeline.id === pipelineId) {
                /** 💧 MODO EDIÇÃO:
                 * Hidrata o formulário assim que a API devolve os estágios legítimos.
                 */
                form.setValue('stages', pipeline.stages || [], { shouldValidate: true });
                syncRef.current = currentMode;
            }
        }
    }, [pipelineId, pipeline, form]);

    const currentStages = form.watch('stages') || [];

    // ⏳ LOADING STATE: Proteção contra manipulação de dados parciais ou inexistentes
    if (pipelineId && isLoadingPipeline && syncRef.current !== pipelineId) {
        return (
            <div className="mt-4 p-8 flex flex-col items-center justify-center bg-gray-800/30 border border-gray-700/50 rounded-xl text-gray-500 animate-pulse">
                <FaSync className="animate-spin mb-3 text-accent-primary w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Sincronizando Etapas com a Nuvem...</span>
            </div>
        );
    }

    return (
        <div className="mt-4 p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl shadow-inner animate-fade-in">
            <StageList 
                stages={currentStages as ConfigStage[]} 
                onChange={(newStages) => {
                    /** ⚙️ SINCRONIA REATIVA:
                     * Atualiza o React Hook Form em tempo real. 'shouldDirty' garante
                     * que o motor perceba a mudança e habilite o botão de salvamento.
                     */
                    form.setValue('stages', newStages, { shouldValidate: true, shouldDirty: true });
                }}
            />
        </div>
    );
};