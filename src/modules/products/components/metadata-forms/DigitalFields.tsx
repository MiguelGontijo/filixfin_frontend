// src/features/products/components/metadata-forms/DigitalFields.tsx

import React from 'react';
import { FaCloudDownloadAlt, FaHdd, FaFileCode, FaCodeBranch, FaDesktop } from 'react-icons/fa';
import { DigitalMetadata } from '../../types';

interface DigitalFieldsProps {
    metadata: DigitalMetadata;
    onChange: (data: DigitalMetadata) => void;
}

export const DigitalFields: React.FC<DigitalFieldsProps> = ({ metadata, onChange }) => {

    const updateField = (field: keyof DigitalMetadata, value: any) => {
        onChange({ ...metadata, [field]: value });
    };

    return (
        <div className="space-y-4 animate-fade-in">
            
            <div className="grid grid-cols-2 gap-4">
                {/* Tamanho */}
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center">
                        <FaHdd className="mr-1.5" /> Tamanho do Arquivo (MB)
                    </label>
                    <input 
                        type="number" min="0" step="0.1"
                        value={metadata.file_size_mb || ''}
                        onChange={(e) => updateField('file_size_mb', parseFloat(e.target.value))}
                        className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-accent-primary focus:outline-none"
                    />
                </div>

                {/* Formato */}
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center">
                        <FaFileCode className="mr-1.5" /> Formato / Extensão
                    </label>
                    <input 
                        type="text"
                        value={metadata.file_format || ''}
                        onChange={(e) => updateField('file_format', e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-accent-primary focus:outline-none uppercase"
                        placeholder="PDF, ZIP, EPUB..."
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Limite de Download */}
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center">
                        <FaCloudDownloadAlt className="mr-1.5" /> Limite de Downloads
                    </label>
                    <input 
                        type="number" min="0"
                        value={metadata.download_limit || ''}
                        onChange={(e) => updateField('download_limit', parseInt(e.target.value))}
                        className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-accent-primary focus:outline-none"
                        placeholder="Ex: 5 (Vazio = Ilimitado)"
                    />
                </div>

                {/* Versão */}
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center">
                        <FaCodeBranch className="mr-1.5" /> Versão
                    </label>
                    <input 
                        type="text"
                        value={metadata.version || ''}
                        onChange={(e) => updateField('version', e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-accent-primary focus:outline-none"
                        placeholder="v1.0.0"
                    />
                </div>
            </div>

            {/* Requisitos */}
            <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center">
                    <FaDesktop className="mr-1.5" /> Requisitos de Sistema
                </label>
                <input 
                    type="text"
                    value={metadata.requirements_os || ''}
                    onChange={(e) => updateField('requirements_os', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-accent-primary focus:outline-none"
                    placeholder="Ex: Windows 10+, MacOS Monterey, Android 8+"
                />
            </div>

        </div>
    );
};