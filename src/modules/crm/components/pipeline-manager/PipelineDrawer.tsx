// src/modules/crm/components/pipeline-manager/PipelineDrawer.tsx

import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaStream } from 'react-icons/fa';
import { StageList, ConfigStage } from './StageList';

interface PipelineDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (pipelineData: { name: string; stages: ConfigStage[] }) => void;
    initialData?: { name: string; stages: ConfigStage[] };
}

export const PipelineDrawer: React.FC<PipelineDrawerProps> = ({ 
    isOpen, 
    onClose, 
    onSave,
    initialData 
}) => {
    
    // Estados para controlar o formulário
    const [name, setName] = useState('');
    const [stages, setStages] = useState<ConfigStage[]>([]);
    
    // Resetar/Carregar dados quando abrir
    useEffect(() => {
        if (isOpen) {
            setName(initialData?.name || '');
            setStages(initialData?.stages || []);
        }
    }, [isOpen, initialData]);

    return (
        <div 
            className={`
                absolute top-0 right-0 h-full w-full max-w-md z-30 
                bg-base-metallic border-l border-white/5 shadow-2xl 
                flex flex-col 
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'}
            `}
        >
            
            {/* --- HEADER --- */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-base-metallic">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-base-dark rounded-lg border border-white/5 text-accent-primary">
                        <FaStream />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-100 leading-tight">
                            {initialData ? 'Editar Funil' : 'Novo Funil'}
                        </h2>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Configuração do Pipeline
                        </p>
                    </div>
                </div>
                
                <button 
                    onClick={onClose}
                    className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
                >
                    <FaTimes />
                </button>
            </div>

            {/* --- BODY (Scrollável) --- */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-base-metallic">
                
                {/* Input: Nome do Funil */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                        Nome do Funil
                    </label>
                    <input 
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Vendas Externas, Recrutamento..."
                        className="w-full bg-base-dark text-gray-100 p-3 rounded-xl border border-white/10 focus:border-accent-primary focus:ring-1 focus:ring-accent-primary outline-none transition-all placeholder-gray-600"
                        autoFocus={isOpen} // Foca apenas se estiver aberto
                    />
                </div>

                {/* Divisor Visual */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-white/5"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="px-3 bg-base-metallic text-xs font-medium text-gray-500">
                            Etapas do Processo
                        </span>
                    </div>
                </div>

                {/* Lista de Estágios (Componente Dedicado) */}
                <StageList 
                    stages={stages}
                    onChange={setStages}
                />

            </div>

            {/* --- FOOTER (Ações Fixas) --- */}
            <div className="p-6 border-t border-white/5 bg-base-metallic">
                <div className="flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                    >
                        Cancelar
                    </button>
                    
                    <button 
                        onClick={() => onSave({ name, stages })}
                        disabled={!name.trim() || stages.length === 0}
                        className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-white bg-accent-primary hover:bg-orange-600 shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaSave />
                        <span>Salvar Funil</span>
                    </button>
                </div>
            </div>

        </div>
    );
};