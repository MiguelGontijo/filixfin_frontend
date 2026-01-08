// src/modules/products/components/metadata-forms/RealEstateFields.tsx

import React from 'react';
import { FaHome, FaRulerCombined, FaBed, FaBath, FaCar, FaMoneyBillWave, FaListUl } from 'react-icons/fa';
import { RealEstateMetadata } from '../../types';

interface RealEstateFieldsProps {
    metadata: RealEstateMetadata;
    onChange: (data: RealEstateMetadata) => void;
}

export const RealEstateFields: React.FC<RealEstateFieldsProps> = ({ metadata, onChange }) => {

    const updateField = (field: keyof RealEstateMetadata, value: any) => {
        onChange({ ...metadata, [field]: value });
    };

    const handleFeaturesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        const featuresArray = text.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
        updateField('features', featuresArray);
    };

    const featuresText = metadata.features?.join('\n') || '';

    return (
        <div className="space-y-4 animate-fade-in">
            
            {/* Tipo e Área */}
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center">
                        <FaHome className="mr-1.5" /> Tipo *
                    </label>
                    <select 
                        value={metadata.property_type || ''}
                        onChange={(e) => updateField('property_type', e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-accent-primary focus:outline-none"
                    >
                        <option value="">Selecione...</option>
                        <option value="HOUSE">Casa</option>
                        <option value="APARTMENT">Apartamento</option>
                        <option value="LAND">Terreno/Lote</option>
                        <option value="COMMERCIAL">Comercial</option>
                        <option value="FARM">Fazenda/Sítio</option>
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center">
                        <FaRulerCombined className="mr-1.5" /> Área Total (m²) *
                    </label>
                    <input 
                        type="number" min="0"
                        value={metadata.area_total_m2 !== undefined ? metadata.area_total_m2 : ''}
                        onChange={(e) => updateField('area_total_m2', parseFloat(e.target.value))}
                        className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-accent-primary focus:outline-none"
                    />
                </div>
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Área Útil (m²)</label>
                    <input 
                        type="number" min="0"
                        value={metadata.area_useful_m2 !== undefined ? metadata.area_useful_m2 : ''}
                        onChange={(e) => updateField('area_useful_m2', parseFloat(e.target.value))}
                        className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-accent-primary focus:outline-none"
                    />
                </div>
            </div>

            {/* Cômodos */}
            <div className="grid grid-cols-4 gap-4 bg-gray-800 p-3 rounded-lg border border-gray-700">
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center">
                        <FaBed className="mr-1.5" /> Quartos *
                    </label>
                    <input 
                        type="number" min="0"
                        value={metadata.bedrooms !== undefined ? metadata.bedrooms : ''}
                        onChange={(e) => updateField('bedrooms', parseInt(e.target.value))}
                        className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-white focus:border-accent-primary focus:outline-none text-center"
                    />
                </div>
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Suítes</label>
                    <input 
                        type="number" min="0"
                        value={metadata.suites !== undefined ? metadata.suites : ''}
                        onChange={(e) => updateField('suites', parseInt(e.target.value))}
                        className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-white focus:border-accent-primary focus:outline-none text-center"
                    />
                </div>
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center">
                        <FaBath className="mr-1.5" /> Banheiros *
                    </label>
                    <input 
                        type="number" min="0"
                        value={metadata.bathrooms !== undefined ? metadata.bathrooms : ''}
                        onChange={(e) => updateField('bathrooms', parseInt(e.target.value))}
                        className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-white focus:border-accent-primary focus:outline-none text-center"
                    />
                </div>
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center">
                        <FaCar className="mr-1.5" /> Vagas *
                    </label>
                    <input 
                        type="number" min="0"
                        value={metadata.parking_spaces !== undefined ? metadata.parking_spaces : ''}
                        onChange={(e) => updateField('parking_spaces', parseInt(e.target.value))}
                        className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-white focus:border-accent-primary focus:outline-none text-center"
                    />
                </div>
            </div>

            {/* Custos Adicionais */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center">
                        <FaMoneyBillWave className="mr-1.5 text-green-500" /> Condomínio (R$)
                    </label>
                    <input 
                        type="number" min="0" step="0.01"
                        value={metadata.condo_value !== undefined ? metadata.condo_value : ''}
                        onChange={(e) => updateField('condo_value', parseFloat(e.target.value))}
                        className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-green-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center">
                        <FaMoneyBillWave className="mr-1.5 text-yellow-500" /> IPTU (Anual - R$)
                    </label>
                    <input 
                        type="number" min="0" step="0.01"
                        value={metadata.iptu_value !== undefined ? metadata.iptu_value : ''}
                        onChange={(e) => updateField('iptu_value', parseFloat(e.target.value))}
                        className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-yellow-500 focus:outline-none"
                    />
                </div>
            </div>

            {/* Características / Lazer */}
            <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center">
                    <FaListUl className="mr-1.5" /> Características / Lazer
                </label>
                <textarea 
                    rows={3}
                    defaultValue={featuresText}
                    onBlur={handleFeaturesChange}
                    className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:border-accent-primary focus:outline-none resize-none placeholder-gray-600"
                    placeholder="Piscina, Churrasqueira, Portaria 24h, Varanda Gourmet..."
                />
            </div>
        </div>
    );
};