'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { 
    FaWeightHanging, 
    FaRulerCombined, 
    FaPalette, 
    FaTshirt, 
    FaBarcode, 
    FaVenusMars, 
    FaUserGraduate 
} from 'react-icons/fa';

// --- Inteligência de Domínio ---
import { ProductFormInput } from '../../../domain/schemas/productSchema';

interface PhysicalFieldsProps {
    form: UseFormReturn<ProductFormInput>;
}

/**
 * ============================================================================
 * 📦 COMPONENTE: PhysicalFields
 * @description Sub-formulário especializado para bens de consumo físicos gerais.
 * Gerencia logística (peso/dimensões) e atributos de moda/varejo.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Shopify/Amazon Level):
 * 1. Deep Path Registration: Registra campos aninhados (ex: dimensions.width_cm) 
 * diretamente no Hook Form, eliminando helpers de atualização manual.
 * 2. Uncontrolled Sync: Mantém a performance nativa e o foco estável ao digitar.
 * 3. Type Coercion Ready: Inputs numéricos preparados para o 'z.coerce.number()'.
 * ============================================================================
 */
export const PhysicalFields: React.FC<PhysicalFieldsProps> = ({ form }) => {
    const { register, formState: { errors } } = form;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-500">
            
            {/* --- SEÇÃO A: MÉTRICAS LOGÍSTICAS (PESO E DIMENSÕES) --- */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-accent-secondary opacity-60">
                    <FaRulerCombined className="text-[10px]" /> Logística e Cubagem
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Peso */}
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-500 uppercase flex items-center gap-1.5">
                            <FaWeightHanging /> Peso (Kg)
                        </label>
                        <input 
                            {...register('attributes.weight_kg' as any)}
                            type="number"
                            step="0.001"
                            placeholder="0.000"
                            className="w-full bg-black/40 border border-gray-800 p-2.5 rounded-lg text-sm text-white focus:border-accent-primary outline-none transition-all font-mono"
                        />
                    </div>

                    {/* Altura */}
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-500 uppercase">Altura (cm)</label>
                        <input 
                            {...register('attributes.dimensions.height_cm' as any)}
                            type="number"
                            placeholder="0"
                            className="w-full bg-black/40 border border-gray-800 p-2.5 rounded-lg text-sm text-white focus:border-accent-primary outline-none transition-all font-mono"
                        />
                    </div>

                    {/* Largura */}
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-500 uppercase">Largura (cm)</label>
                        <input 
                            {...register('attributes.dimensions.width_cm' as any)}
                            type="number"
                            placeholder="0"
                            className="w-full bg-black/40 border border-gray-800 p-2.5 rounded-lg text-sm text-white focus:border-accent-primary outline-none transition-all font-mono"
                        />
                    </div>

                    {/* Profundidade */}
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-500 uppercase">Profund. (cm)</label>
                        <input 
                            {...register('attributes.dimensions.depth_cm' as any)}
                            type="number"
                            placeholder="0"
                            className="w-full bg-black/40 border border-gray-800 p-2.5 rounded-lg text-sm text-white focus:border-accent-primary outline-none transition-all font-mono"
                        />
                    </div>
                </div>
            </div>

            {/* --- SEÇÃO B: ESTILO E VARIAÇÕES VISUAIS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-800/50">
                {/* Cor */}
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2">
                        <FaPalette className="text-accent-primary/50" /> Cor Predominante
                    </label>
                    <input 
                        {...register('attributes.color' as any)}
                        type="text"
                        placeholder="Ex: Azul Royal"
                        className="w-full bg-black/40 border border-gray-800 p-3 rounded-lg text-sm text-white focus:border-accent-primary outline-none transition-all"
                    />
                </div>

                {/* Tamanho */}
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2">
                        <FaTshirt className="text-accent-primary/50" /> Tamanho / Grade
                    </label>
                    <input 
                        {...register('attributes.size' as any)}
                        type="text"
                        placeholder="Ex: GG, 42, 10"
                        className="w-full bg-black/40 border border-gray-800 p-3 rounded-lg text-sm text-white focus:border-accent-primary outline-none transition-all font-bold"
                    />
                </div>

                {/* Material */}
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Composição / Material</label>
                    <input 
                        {...register('attributes.material' as any)}
                        type="text"
                        placeholder="Ex: 100% Algodão"
                        className="w-full bg-black/40 border border-gray-800 p-3 rounded-lg text-sm text-white focus:border-accent-primary outline-none transition-all"
                    />
                </div>
            </div>

            {/* --- SEÇÃO C: SEGMENTAÇÃO DE PÚBLICO --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Gênero */}
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2">
                        <FaVenusMars className="text-gray-500" /> Gênero
                    </label>
                    <select 
                        {...register('attributes.gender' as any)}
                        className="w-full bg-black/40 border border-gray-800 p-3 rounded-lg text-sm text-white focus:border-accent-primary outline-none transition-all cursor-pointer"
                    >
                        <option value="">Indiferente / Unissex</option>
                        <option value="male">Masculino</option>
                        <option value="female">Feminino</option>
                    </select>
                </div>

                {/* Faixa Etária */}
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2">
                        <FaUserGraduate className="text-gray-500" /> Público-Alvo
                    </label>
                    <select 
                        {...register('attributes.age_group' as any)}
                        className="w-full bg-black/40 border border-gray-800 p-3 rounded-lg text-sm text-white focus:border-accent-primary outline-none transition-all cursor-pointer"
                    >
                        <option value="adult">Adulto (Padrão)</option>
                        <option value="kids">Infantil / Kids</option>
                        <option value="newborn">Recém-nascido</option>
                        <option value="infant">Bebê</option>
                    </select>
                </div>

                {/* Modelo Fabr. */}
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2">
                        <FaBarcode className="text-gray-500" /> Ref. Fabricante (MPN)
                    </label>
                    <input 
                        {...register('attributes.model_code' as any)}
                        type="text"
                        placeholder="Código de fábrica"
                        className="w-full bg-black/40 border border-gray-800 p-3 rounded-lg text-sm text-white focus:border-accent-primary outline-none transition-all font-mono"
                    />
                </div>
            </div>

        </div>
    );
};