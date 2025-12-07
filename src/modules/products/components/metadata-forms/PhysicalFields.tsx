// src/features/products/components/metadata-forms/PhysicalFields.tsx

import React from 'react';
import { FaWeightHanging, FaRulerCombined, FaPalette, FaTshirt, FaBarcode } from 'react-icons/fa';
import { PhysicalMetadata } from '../../types';

interface PhysicalFieldsProps {
    metadata: PhysicalMetadata;
    onChange: (data: PhysicalMetadata) => void;
}

export const PhysicalFields: React.FC<PhysicalFieldsProps> = ({ metadata, onChange }) => {

    const updateField = (field: keyof PhysicalMetadata, value: any) => {
        onChange({ ...metadata, [field]: value });
    };

    const updateDimension = (dim: 'height_cm' | 'width_cm' | 'depth_cm', value: number) => {
        onChange({
            ...metadata,
            dimensions: {
                height_cm: metadata.dimensions?.height_cm || 0,
                width_cm: metadata.dimensions?.width_cm || 0,
                depth_cm: metadata.dimensions?.depth_cm || 0,
                [dim]: value
            }
        });
    };

    return (
        <div className="space-y-4 animate-fade-in">
            
            {/* Logística */}
            <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center">
                        <FaWeightHanging className="mr-1.5" /> Peso (Kg)
                    </label>
                    <input 
                        type="number" min="0" step="0.001"
                        value={metadata.weight_kg || ''}
                        onChange={(e) => updateField('weight_kg', parseFloat(e.target.value))}
                        className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-accent-primary focus:outline-none"
                    />
                </div>
                <div className="col-span-1">
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center">
                        <FaRulerCombined className="mr-1.5" /> Altura (cm)
                    </label>
                    <input 
                        type="number" min="0"
                        value={metadata.dimensions?.height_cm || ''}
                        onChange={(e) => updateDimension('height_cm', parseFloat(e.target.value))}
                        className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-accent-primary focus:outline-none"
                    />
                </div>
                <div className="col-span-1">
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Largura (cm)</label>
                    <input 
                        type="number" min="0"
                        value={metadata.dimensions?.width_cm || ''}
                        onChange={(e) => updateDimension('width_cm', parseFloat(e.target.value))}
                        className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-accent-primary focus:outline-none"
                    />
                </div>
                <div className="col-span-1">
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Profund. (cm)</label>
                    <input 
                        type="number" min="0"
                        value={metadata.dimensions?.depth_cm || ''}
                        onChange={(e) => updateDimension('depth_cm', parseFloat(e.target.value))}
                        className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-accent-primary focus:outline-none"
                    />
                </div>
            </div>

            {/* Variações e Moda */}
            <div className="grid grid-cols-3 gap-4 border-t border-gray-700 pt-4">
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center">
                        <FaPalette className="mr-1.5" /> Cor
                    </label>
                    <input 
                        type="text"
                        value={metadata.color || ''}
                        onChange={(e) => updateField('color', e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-accent-primary focus:outline-none"
                        placeholder="Ex: Azul Marinho"
                    />
                </div>
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center">
                        <FaTshirt className="mr-1.5" /> Tamanho
                    </label>
                    <input 
                        type="text"
                        value={metadata.size || ''}
                        onChange={(e) => updateField('size', e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-accent-primary focus:outline-none"
                        placeholder="Ex: M, 42, GG"
                    />
                </div>
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Material</label>
                    <input 
                        type="text"
                        value={metadata.material || ''}
                        onChange={(e) => updateField('material', e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-accent-primary focus:outline-none"
                        placeholder="Ex: Algodão, Couro"
                    />
                </div>
            </div>

            {/* Segmentação (Google Taxonomy) */}
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Gênero</label>
                    <select 
                        value={metadata.gender || ''}
                        onChange={(e) => updateField('gender', e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-accent-primary focus:outline-none"
                    >
                        <option value="">Indiferente</option>
                        <option value="male">Masculino</option>
                        <option value="female">Feminino</option>
                        <option value="unisex">Unissex</option>
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Faixa Etária</label>
                    <select 
                        value={metadata.age_group || ''}
                        onChange={(e) => updateField('age_group', e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-accent-primary focus:outline-none"
                    >
                        <option value="">Adulto (Padrão)</option>
                        <option value="newborn">Recém-nascido</option>
                        <option value="infant">Bebê</option>
                        <option value="toddler">Criança pequena</option>
                        <option value="kids">Infantil</option>
                        <option value="adult">Adulto</option>
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center">
                        <FaBarcode className="mr-1.5" /> Modelo (Fabr.)
                    </label>
                    <input 
                        type="text"
                        value={metadata.model_code || ''}
                        onChange={(e) => updateField('model_code', e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-accent-primary focus:outline-none"
                        placeholder="Código do fabricante"
                    />
                </div>
            </div>
        </div>
    );
};