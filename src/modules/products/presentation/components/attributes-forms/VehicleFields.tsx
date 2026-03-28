'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { 
    FaCar, 
    FaTachometerAlt, 
    FaGasPump, 
    FaCogs, 
    FaPalette, 
    FaDoorClosed, 
    FaHashtag,
    FaFingerprint
} from 'react-icons/fa';

// --- Inteligência de Domínio ---
import { ProductFormInput } from '../../../domain/schemas/productSchema';

interface VehicleFieldsProps {
    form: UseFormReturn<ProductFormInput>;
}

/**
 * ============================================================================
 * 🏎️ COMPONENTE: VehicleFields
 * @description Sub-formulário polimórfico para o setor automotivo.
 * Gerencia dados técnicos, mecânicos e de conformidade (FIPE/Placa).
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Marketplace/Inventory Level):
 * 1. Zero-Latency Input: Registro direto via 'attributes.field' para evitar re-renders.
 * 2. Dynamic Reference: Geração de range de anos para conformidade de frota.
 * 3. Atomic State Management: Elimina helpers manuais em favor do Hook Form puro.
 * ============================================================================
 */
export const VehicleFields: React.FC<VehicleFieldsProps> = ({ form }) => {
    const { register } = form;

    // 📅 Geração dinâmica de anos (Próximo ano até 100 anos atrás)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear + 1 - i);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-500">
            
            {/* --- SEÇÃO A: IDENTIFICAÇÃO E TEMPO --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Ano Modelo */}
                <div className="space-y-1">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <FaCar className="text-accent-primary/60" /> Ano Modelo
                    </label>
                    <select 
                        {...register('attributes.year' as any)}
                        className="w-full bg-black/40 border border-gray-800 p-3 rounded-lg text-sm text-white focus:border-accent-primary outline-none transition-all cursor-pointer"
                    >
                        <option value="">Selecione o ano...</option>
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                {/* Quilometragem */}
                <div className="space-y-1">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <FaTachometerAlt className="text-accent-primary/60" /> Km (Hodômetro)
                    </label>
                    <input 
                        {...register('attributes.mileage' as any)}
                        type="number"
                        placeholder="Ex: 50000"
                        className="w-full bg-black/40 border border-gray-800 p-3 rounded-lg text-sm text-white focus:border-accent-primary outline-none transition-all font-mono"
                    />
                </div>

                {/* Final da Placa */}
                <div className="space-y-1">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <FaHashtag className="text-accent-primary/60" /> Final da Placa
                    </label>
                    <select 
                        {...register('attributes.plate_end' as any)}
                        className="w-full bg-black/40 border border-gray-800 p-3 rounded-lg text-sm text-white focus:border-accent-primary outline-none transition-all text-center font-bold"
                    >
                        <option value="">-</option>
                        {[0,1,2,3,4,5,6,7,8,9].map(n => (
                            <option key={n} value={n.toString()}>{n}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* --- SEÇÃO B: ESPECIFICAÇÕES MECÂNICAS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-800/50">
                {/* Combustível */}
                <div className="space-y-1">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <FaGasPump className="text-accent-secondary/60" /> Propulsão
                    </label>
                    <select 
                        {...register('attributes.fuel' as any)}
                        className="w-full bg-black/40 border border-gray-800 p-3 rounded-lg text-sm text-white focus:border-accent-primary outline-none transition-all cursor-pointer"
                    >
                        <option value="">Selecione combustível...</option>
                        <option value="GASOLINE">Gasolina</option>
                        <option value="ETHANOL">Etanol</option>
                        <option value="DIESEL">Diesel</option>
                        <option value="FLEX">Flex</option>
                        <option value="HYBRID">Híbrido</option>
                        <option value="ELECTRIC">Elétrico</option>
                    </select>
                </div>

                {/* Câmbio */}
                <div className="space-y-1">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <FaCogs className="text-accent-secondary/60" /> Transmissão
                    </label>
                    <select 
                        {...register('attributes.transmission' as any)}
                        className="w-full bg-black/40 border border-gray-800 p-3 rounded-lg text-sm text-white focus:border-accent-primary outline-none transition-all cursor-pointer"
                    >
                        <option value="">Selecione o câmbio...</option>
                        <option value="MANUAL">Manual</option>
                        <option value="AUTOMATIC">Automático</option>
                        <option value="CVT">CVT</option>
                        <option value="DUAL_CLUTCH">Dupla Embreagem</option>
                    </select>
                </div>
            </div>

            {/* --- SEÇÃO C: ESTÉTICA E MERCADO --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Cor */}
                <div className="space-y-1">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <FaPalette className="text-gray-500" /> Cor Externa
                    </label>
                    <input 
                        {...register('attributes.color' as any)}
                        type="text"
                        placeholder="Ex: Branco Pérola"
                        className="w-full bg-black/40 border border-gray-800 p-3 rounded-lg text-sm text-white focus:border-accent-primary outline-none transition-all"
                    />
                </div>

                {/* Portas */}
                <div className="space-y-1">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <FaDoorClosed className="text-gray-500" /> Portas
                    </label>
                    <select 
                        {...register('attributes.doors' as any)}
                        className="w-full bg-black/40 border border-gray-800 p-3 rounded-lg text-sm text-white focus:border-accent-primary outline-none transition-all cursor-pointer"
                    >
                        <option value="">-</option>
                        <option value="2">2 Portas</option>
                        <option value="3">3 Portas</option>
                        <option value="4">4 Portas</option>
                        <option value="5">5 Portas</option>
                    </select>
                </div>

                {/* Código FIPE */}
                <div className="space-y-1">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <FaFingerprint className="text-gray-500" /> Código FIPE
                    </label>
                    <input 
                        {...register('attributes.fipe_code' as any)}
                        type="text"
                        placeholder="000000-0"
                        className="w-full bg-black/40 border border-gray-800 p-3 rounded-lg text-sm text-white focus:border-accent-primary outline-none transition-all font-mono"
                    />
                </div>
            </div>

        </div>
    );
};