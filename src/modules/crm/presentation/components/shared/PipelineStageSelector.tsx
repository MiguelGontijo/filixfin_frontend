import React, { useMemo } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { IPipeline } from '../../../domain/types/pipeline.types';

/**
 * @interface PipelineStageSelectorProps
 * @description Contrato de propriedades para o seletor em cascata de Funis e Etapas.
 */
interface PipelineStageSelectorProps {
    /** Instância do formulário vinda do React Hook Form (Motor V4) */
    form: UseFormReturn<any>;
    /** Lista de pipelines disponíveis para seleção, injetada via Application Layer */
    pipelines: IPipeline[];
}

/**
 * ============================================================================
 * 🧩 MICRO-COMPONENTE: PipelineStageSelector
 * @description Gerencia a interdependência entre Funil (Pipeline) e Etapa (Stage).
 * Implementa a regra de negócio de reset reativo: se o funil for alterado, 
 * a etapa atual é limpa para evitar inconsistência de dados (Etapa X no Funil Y).
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO:
 * 1. UI Reactivity: Utiliza 'useWatch' para monitorar mudanças no ID do funil 
 * sem causar re-renderizações desnecessárias no formulário pai.
 * 2. Data Integrity: Garante que a etapa selecionada sempre pertença ao funil ativo.
 * 3. UX Consistency: Mantém a identidade visual padrão de inputs do ecossistema.
 * ============================================================================
 */
export const PipelineStageSelector: React.FC<PipelineStageSelectorProps> = ({ form, pipelines }) => {
    
    // Monitoramento passivo do ID do Pipeline selecionado no formulário
    const selectedPipelineId = useWatch({ 
        control: form.control, 
        name: 'pipelineId' 
    });
    
    // Localiza o objeto completo do Pipeline ativo para extrair seus estágios
    const activePipeline = useMemo(() => 
        pipelines.find(p => p.id === selectedPipelineId), 
    [pipelines, selectedPipelineId]);

    // Extração controlada do registro para interceptar o evento de mudança (onChange)
    const { onChange: onPipelineChange, ...pipelineRegister } = form.register('pipelineId');

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl shadow-inner animate-fade-in">
            
            {/* --- SELETOR DE FUNIL --- */}
            <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider ml-1">
                    Funil de Vendas
                </label>
                <select 
                    {...pipelineRegister}
                    onChange={(e) => {
                        // Executa o registro padrão do RHF
                        onPipelineChange(e);
                        // 🛡️ REGRA DE OURO: Reseta a etapa sempre que o funil mudar para evitar salvar lixo
                        form.setValue('currentStageId', '', { shouldValidate: true, shouldDirty: true });
                    }}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none transition-all cursor-pointer"
                >
                    <option value="">Selecione um funil...</option>
                    {pipelines.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>

            {/* --- SELETOR DE ETAPA (STAGES) --- */}
            <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider ml-1">
                    Etapa Atual
                </label>
                <select 
                    {...form.register('currentStageId')}
                    disabled={!selectedPipelineId}
                    className={`w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none transition-all ${
                        !selectedPipelineId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                >
                    <option value="">Selecione uma etapa...</option>
                    {activePipeline?.stages?.sort((a, b) => a.order - b.order).map(stage => (
                        <option key={stage.id} value={stage.id}>
                            {stage.name}
                        </option>
                    ))}
                </select>
                {!selectedPipelineId && (
                    <p className="text-[9px] text-gray-500 italic mt-1 ml-1">Selecione um funil primeiro</p>
                )}
            </div>
        </div>
    );
};