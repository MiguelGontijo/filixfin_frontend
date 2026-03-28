'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { 
    FaCloudDownloadAlt, 
    FaHdd, 
    FaFileCode, 
    FaCodeBranch, 
    FaDesktop, 
    FaKey, 
    FaLink 
} from 'react-icons/fa';

// --- Inteligência de Domínio ---
import { ProductFormInput } from '../../../domain/schemas/productSchema';

interface DigitalFieldsProps {
    form: UseFormReturn<ProductFormInput>;
}

/**
 * ============================================================================
 * 💾 COMPONENTE: DigitalFields
 * @description Sub-formulário especializado para ativos digitais e software.
 * Opera via 'Deep Registration' no campo JSONB 'attributes'.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Google/Shopify Level):
 * 1. Uncontrolled Performance: Utiliza o 'register' nativo para garantir 
 * latência zero na digitação e preservação total do foco.
 * 2. Path-Based Binding: Mapeia as chaves do objeto 'attributes' diretamente 
 * para a estrutura esperada pelo Backend.
 * 3. Atomic UI: Mantém a estética metálica e o grid responsivo do ecossistema.
 * ============================================================================
 */
export const DigitalFields: React.FC<DigitalFieldsProps> = ({ form }) => {
    const { register, formState: { errors } } = form;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 📦 Tamanho do Arquivo */}
                <div className="space-y-1">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <FaHdd className="text-accent-primary/60" /> Tamanho do Arquivo (MB)
                    </label>
                    <input 
                        {...register('attributes.file_size_mb' as any)}
                        type="number"
                        step="0.1"
                        placeholder="Ex: 150.5"
                        className="w-full bg-black/40 border border-gray-800 p-3 rounded-lg text-sm text-white focus:border-accent-primary outline-none transition-all font-mono"
                    />
                </div>

                {/* 📄 Formato / Extensão */}
                <div className="space-y-1">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <FaFileCode className="text-accent-primary/60" /> Formato / Extensão
                    </label>
                    <input 
                        {...register('attributes.file_format' as any)}
                        type="text"
                        placeholder="PDF, ZIP, EPUB..."
                        className="w-full bg-black/40 border border-gray-800 p-3 rounded-lg text-sm text-white focus:border-accent-primary outline-none transition-all uppercase"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 📥 Limite de Downloads */}
                <div className="space-y-1">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <FaCloudDownloadAlt className="text-accent-secondary/60" /> Limite de Downloads
                    </label>
                    <input 
                        {...register('attributes.download_limit' as any)}
                        type="number"
                        placeholder="Ex: 5 (Vazio = Ilimitado)"
                        className="w-full bg-black/40 border border-gray-800 p-3 rounded-lg text-sm text-white focus:border-accent-primary outline-none transition-all"
                    />
                </div>

                {/* 🏷️ Versão */}
                <div className="space-y-1">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <FaCodeBranch className="text-accent-secondary/60" /> Versão / Build
                    </label>
                    <input 
                        {...register('attributes.version' as any)}
                        type="text"
                        placeholder="v1.0.0"
                        className="w-full bg-black/40 border border-gray-800 p-3 rounded-lg text-sm text-white focus:border-accent-primary outline-none transition-all font-mono"
                    />
                </div>
            </div>

            {/* 🖥️ Requisitos de Sistema */}
            <div className="space-y-1">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    <FaDesktop className="text-gray-500" /> Requisitos de Sistema
                </label>
                <input 
                    {...register('attributes.requirements_os' as any)}
                    type="text"
                    placeholder="Ex: Windows 10+, MacOS Monterey, Android 8+"
                    className="w-full bg-black/40 border border-gray-800 p-3 rounded-lg text-sm text-white focus:border-accent-primary outline-none transition-all"
                />
            </div>

            {/* 🛡️ Licenciamento (Boolean Switch Nivel Google) */}
            <div className="flex items-center justify-between p-4 bg-black/20 border border-gray-800 rounded-xl">
                <div className="flex items-center gap-3">
                    <FaKey className="text-accent-primary/50 text-xs" />
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-200">Exigir Chave de Licença</p>
                        <p className="text-[9px] text-gray-500">O sistema gerará ou solicitará uma key após a venda.</p>
                    </div>
                </div>
                <input 
                    {...register('attributes.requires_license_key' as any)}
                    type="checkbox"
                    className="w-5 h-5 rounded border-gray-700 text-accent-primary focus:ring-accent-primary bg-gray-800 transition-all cursor-pointer"
                />
            </div>

        </div>
    );
};