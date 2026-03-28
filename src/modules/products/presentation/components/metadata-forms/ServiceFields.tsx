// src/modules/products/components/metadata-forms/ServiceFields.tsx

import React from 'react';
import { FaClock, FaGlobeAmericas, FaRedo, FaListUl } from 'react-icons/fa';
import { ServiceMetadata } from '../../../domain/types/metadata/service.types';

interface ServiceFieldsProps {
    metadata: ServiceMetadata;
    onChange: (data: ServiceMetadata) => void;
}

export const ServiceFields: React.FC<ServiceFieldsProps> = ({ metadata, onChange }) => {

    // Helper para atualizar campos individuais
    const updateField = (field: keyof ServiceMetadata, value: any) => {
        onChange({
            ...metadata,
            [field]: value
        });
    };

    // Helper para converter requisitos (string separada por vírgula -> array)
    const handleRequirementsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        // Divide por quebra de linha ou vírgula e limpa espaços vazios
        const reqArray = text.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
        updateField('requirements', reqArray);
    };

    // Valor atual dos requisitos para exibição no textarea
    const requirementsText = metadata.requirements?.join('\n') || '';

    return (
        <div className="space-y-4 animate-fade-in">
            
            <div className="grid grid-cols-2 gap-4">
                
                {/* Duração */}
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center">
                        <FaClock className="mr-1.5" /> Duração (Minutos) *
                    </label>
                    <input 
                        type="number" 
                        min="1"
                        value={metadata.duration_minutes || ''}
                        onChange={(e) => updateField('duration_minutes', parseInt(e.target.value) || 0)}
                        className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-accent-primary focus:outline-none"
                        placeholder="Ex: 60"
                    />
                    <p className="text-[9px] text-gray-500 mt-1">Tempo padrão de execução.</p>
                </div>

                {/* Recorrência */}
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center">
                        <FaRedo className="mr-1.5" /> Recorrência
                    </label>
                    <select 
                        value={metadata.recurrence || 'NONE'}
                        onChange={(e) => updateField('recurrence', e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-accent-primary focus:outline-none"
                    >
                        <option value="NONE">Pagamento Único (Sem recorrência)</option>
                        <option value="MONTHLY">Mensal (Assinatura)</option>
                        <option value="YEARLY">Anual (Renovação)</option>
                    </select>
                </div>
            </div>

            {/* Switch Remoto */}
            <div className="flex items-center space-x-3 bg-gray-800 p-3 rounded-lg border border-gray-700">
                <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${metadata.is_remote ? 'bg-accent-secondary' : 'bg-gray-600'}`}
                     onClick={() => updateField('is_remote', !metadata.is_remote)}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${metadata.is_remote ? 'left-5.5' : 'left-0.5'}`}></div>
                </div>
                <label className="text-sm text-gray-300 font-medium cursor-pointer select-none flex items-center" onClick={() => updateField('is_remote', !metadata.is_remote)}>
                    <FaGlobeAmericas className="mr-2 text-gray-400" />
                    Atendimento Remoto / Online
                </label>
            </div>

            {/* Requisitos */}
            <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center">
                    <FaListUl className="mr-1.5" /> Pré-requisitos (Opcional)
                </label>
                <textarea 
                    rows={3}
                    defaultValue={requirementsText}
                    onBlur={handleRequirementsChange}
                    className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:border-accent-primary focus:outline-none resize-none placeholder-gray-600"
                    placeholder="Liste o que é necessário para o serviço (um por linha)...&#10;Ex: Acesso ao servidor&#10;Backup realizado"
                />
            </div>

        </div>
    );
};