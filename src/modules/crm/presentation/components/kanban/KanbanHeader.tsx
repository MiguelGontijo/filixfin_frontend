import React from 'react';
import { FaFilter, FaPlus, FaCog, FaSearch } from 'react-icons/fa';

// --- Mundo 2: Domínio & Aplicação (CRM) ---
import { IPipeline } from '../../../domain/types/pipeline.types';

/**
 * @interface KanbanHeaderProps
 * @description Contrato de comunicação entre o cabeçalho e o Maestro do Kanban.
 */
interface KanbanHeaderProps {
    pipelines: IPipeline[];
    selectedPipelineId?: string;
    onPipelineChange: (pipelineId: string) => void;
    /** Gatilho para criação de um novo funil via atalho no seletor */
    onCreatePipeline: () => void; 
    onDealRequest: () => void;
    onPipelineConfigRequest: () => void;
    dealCount: number;
}

/**
 * ============================================================================
 * 🎛️ COMPONENTE: KanbanHeader (Refinado com Atalho de Expansão)
 * @description Centro de comando tático. Agora com suporte à criação de funis 
 * diretamente pelo seletor de contexto (Opção Funcional).
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO:
 * 1. Functional Options: Injeta uma opção de 'Trigger' no select que não 
 * representa um dado, mas sim uma ação de sistema (Inversão de Intenção).
 * 2. Event Interception: Intercepta o 'onChange' para distinguir entre 
 * navegação (troca de ID) e execução (abrir formulário de novo funil).
 * 3. Semantic UI: Utiliza estilização diferenciada na opção de criação para 
 * guiar o olhar do usuário (Affordance).
 * ============================================================================
 */
export const KanbanHeader: React.FC<KanbanHeaderProps> = ({
    pipelines,
    selectedPipelineId,
    onPipelineChange,
    onCreatePipeline,
    onDealRequest,
    onPipelineConfigRequest,
    dealCount
}) => {
    
    /**
     * @method handleSelectChange
     * @description Gerenciador de roteamento do select. Filtra se o usuário 
     * quer trocar de funil ou criar um novo.
     */
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        
        if (value === 'NEW_PIPELINE_TRIGGER') {
            onCreatePipeline();
            return;
        }
        
        onPipelineChange(value);
    };

    return (
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 animate-fade-in">
            
            {/* --- LADO ESQUERDO: SELEÇÃO DE CONTEXTO --- */}
            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative group flex-1 md:flex-none">
                    <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-accent-primary transition-colors" />
                    
                    <select 
                        value={selectedPipelineId || ''}
                        onChange={handleSelectChange}
                        className="pl-10 pr-10 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-gray-200 focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none hover:bg-gray-800 transition-all cursor-pointer appearance-none min-w-[240px] shadow-inner font-medium"
                    >
                        {/* 1. Listagem Dinâmica de Funis Existentes */}
                        <optgroup label="Funis Ativos" className="bg-gray-900 text-gray-500">
                            {pipelines.map(p => (
                                <option key={p.id} value={p.id} className="text-gray-200 bg-gray-900">
                                    {p.name}
                                </option>
                            ))}
                        </optgroup>

                        {/* 2. Atalho Estrutural (Ação de Expansão) */}
                        <optgroup label="Gerenciamento" className="bg-gray-900 text-gray-500">
                            <option 
                                value="NEW_PIPELINE_TRIGGER" 
                                className="text-accent-primary font-black bg-gray-900"
                            >
                                ➕ Criar Novo Funil...
                            </option>
                        </optgroup>

                        {pipelines.length === 0 && (
                            <option value="" disabled>Nenhum funil disponível</option>
                        )}
                    </select>

                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                <div className="hidden lg:flex flex-col border-l border-gray-800 pl-4">
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest leading-none">Status do Funil</span>
                    <span className="text-xs font-bold text-accent-secondary mt-1">
                        {dealCount} {dealCount === 1 ? 'Oportunidade' : 'Oportunidades'}
                    </span>
                </div>
            </div>

            {/* --- LADO DIREITO: BARRA DE FERRAMENTAS E AÇÕES --- */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <div className="relative hidden sm:block">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input 
                        type="text" 
                        placeholder="Buscar deal..." 
                        className="bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-xs text-gray-400 focus:border-gray-500 focus:outline-none transition-all w-40 focus:w-60"
                    />
                </div>

                <button 
                    onClick={onPipelineConfigRequest}
                    className="p-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-gray-400 hover:text-white transition-all shadow-sm"
                    title="Configurar etapas deste funil"
                >
                    <FaCog className="w-4 h-4" />
                </button>

                <button 
                    onClick={onDealRequest}
                    className="flex items-center gap-2 px-5 py-2.5 bg-accent-primary hover:bg-orange-600 text-base-dark font-black rounded-xl transition-all shadow-lg shadow-orange-900/20 transform active:scale-95 text-sm"
                >
                    <FaPlus />
                    <span>Nova Deal</span>
                </button>
            </div>
        </div>
    );
};