// src/modules/products/components/metadata-forms/VehicleFields.tsx

import React from 'react';
import { FaCar, FaTachometerAlt, FaGasPump, FaCogs, FaPalette, FaDoorClosed, FaHashtag } from 'react-icons/fa';
import { VehicleMetadata } from '../../../domain/types';

interface VehicleFieldsProps {
    metadata: VehicleMetadata;
    onChange: (data: VehicleMetadata) => void;
}

export const VehicleFields: React.FC<VehicleFieldsProps> = ({ metadata, onChange }) => {

    const updateField = (field: keyof VehicleMetadata, value: any) => {
        onChange({
            ...metadata,
            [field]: value
        });
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear + 1 - i); // Próximo ano até 100 anos atrás

    return (
        <div className="space-y-4 animate-fade-in">
            
            {/* Linha 1: Dados Principais */}
            <div className="grid grid-cols-3 gap-4">
                
                {/* Ano */}
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center">
                        <FaCar className="mr-1.5" /> Ano Modelo *
                    </label>
                    <select 
                        value={metadata.year || ''}
                        onChange={(e) => updateField('year', parseInt(e.target.value))}
                        className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-accent-primary focus:outline-none"
                    >
                        <option value="">Selecione...</option>
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                {/* Quilometragem */}
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center">
                        <FaTachometerAlt className="mr-1.5" /> Km (Hodômetro) *
                    </label>
                    <input 
                        type="number" 
                        min="0"
                        value={metadata.mileage !== undefined ? metadata.mileage : ''}
                        onChange={(e) => updateField('mileage', parseInt(e.target.value) || 0)}
                        className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-accent-primary focus:outline-none"
                        placeholder="Ex: 50000"
                    />
                </div>

                {/* Final da Placa */}
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center">
                        <FaHashtag className="mr-1.5" /> Final Placa
                    </label>
                    <select 
                        value={metadata.plate_end || ''}
                        onChange={(e) => updateField('plate_end', e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-accent-primary focus:outline-none text-center"
                    >
                        <option value="">-</option>
                        {[0,1,2,3,4,5,6,7,8,9].map(n => (
                            <option key={n} value={n.toString()}>{n}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Linha 2: Mecânica */}
            <div className="grid grid-cols-2 gap-4">
                
                {/* Combustível */}
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center">
                        <FaGasPump className="mr-1.5" /> Combustível *
                    </label>
                    <select 
                        value={metadata.fuel || ''}
                        onChange={(e) => updateField('fuel', e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-accent-primary focus:outline-none"
                    >
                        <option value="">Selecione...</option>
                        <option value="GASOLINE">Gasolina</option>
                        <option value="ETHANOL">Etanol</option>
                        <option value="DIESEL">Diesel</option>
                        <option value="FLEX">Flex</option>
                        <option value="HYBRID">Híbrido</option>
                        <option value="ELECTRIC">Elétrico</option>
                    </select>
                </div>

                {/* Câmbio */}
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center">
                        <FaCogs className="mr-1.5" /> Câmbio *
                    </label>
                    <select 
                        value={metadata.transmission || ''}
                        onChange={(e) => updateField('transmission', e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-accent-primary focus:outline-none"
                    >
                        <option value="">Selecione...</option>
                        <option value="MANUAL">Manual</option>
                        <option value="AUTOMATIC">Automático</option>
                        <option value="CVT">CVT</option>
                        <option value="DUAL_CLUTCH">Dupla Embreagem</option>
                    </select>
                </div>
            </div>

            {/* Linha 3: Detalhes */}
            <div className="grid grid-cols-3 gap-4">
                
                {/* Cor */}
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center">
                        <FaPalette className="mr-1.5" /> Cor
                    </label>
                    <input 
                        type="text" 
                        value={metadata.color || ''}
                        onChange={(e) => updateField('color', e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-accent-primary focus:outline-none"
                        placeholder="Ex: Prata"
                    />
                </div>

                {/* Portas */}
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center">
                        <FaDoorClosed className="mr-1.5" /> Portas
                    </label>
                    <select 
                        value={metadata.doors || ''}
                        onChange={(e) => updateField('doors', parseInt(e.target.value))}
                        className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-accent-primary focus:outline-none"
                    >
                        <option value="">-</option>
                        <option value="2">2 Portas</option>
                        <option value="3">3 Portas</option>
                        <option value="4">4 Portas</option>
                        <option value="5">5 Portas</option>
                    </select>
                </div>

                {/* Fipe */}
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Código FIPE</label>
                    <input 
                        type="text" 
                        value={metadata.fipe_code || ''}
                        onChange={(e) => updateField('fipe_code', e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-accent-primary focus:outline-none font-mono text-xs"
                        placeholder="000000-0"
                    />
                </div>
            </div>
        </div>
    );
};