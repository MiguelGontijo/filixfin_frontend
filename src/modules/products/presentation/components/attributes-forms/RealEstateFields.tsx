'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { 
    FaHome, 
    FaRulerCombined, 
    FaBed, 
    FaBath, 
    FaCar, 
    FaMoneyBillWave, 
    FaListUl,
    FaSwimmingPool
} from 'react-icons/fa';

/** --- INTELIGÊNCIA DE DOMÍNIO --- */
import { ProductFormInput } from '../../../domain/schemas/productSchema';

interface RealEstateFieldsProps {
    form: UseFormReturn<ProductFormInput>;
}

/**
 * ============================================================================
 * 🏠 COMPONENTE: RealEstateFields
 * @description Sub-formulário especializado para o setor imobiliário.
 * Gerencia tipagem de ativos, métricas espaciais e indicadores fiscais.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Zillow/Realtor Level):
 * 1. Deep registration: Conecta inputs diretamente ao 'attributes.field' via RHF.
 * 2. Uncontrolled Performance: Garante fluidez total na inserção de metragens.
 * 3. Feature Mapping: Processa a lista de características via evento de desfoco (Blur),
 * otimizando o parse de arrays para o banco de dados.
 * ============================================================================
 */
export const RealEstateFields: React.FC<RealEstateFieldsProps> = ({ form }) => {
    const { register, setValue, watch } = form;

    /** * 🧠 HELPER: handleFeaturesChange
     * Processa a entrada de texto e converte em array apenas quando o usuário
     * termina a edição, poupando processamento do motor de validação.
     */
    const handleFeaturesChange = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        const featuresArray = text.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
        setValue('attributes.features' as any, featuresArray, { shouldDirty: true });
    };

    // Observamos apenas para exibir o texto formatado no textarea inicial (caso venha do banco)
    const currentFeatures = watch('attributes.features' as any) || [];
    const featuresDefaultValue = Array.isArray(currentFeatures) ? currentFeatures.join('\n') : '';

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-500">
            
            {/* --- SEÇÃO A: CLASSIFICAÇÃO E ÁREA --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tipo de Propriedade */}
                <div className="space-y-1">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <FaHome className="text-accent-primary/60" /> Tipo de Ativo
                    </label>
                    <select 
                        {...register('attributes.property_type' as any)}
                        className="w-full bg-black/40 border border-gray-800 p-3 rounded-lg text-sm text-white focus:border-accent-primary outline-none transition-all cursor-pointer"
                    >
                        <option value="">Selecione...</option>
                        <option value="HOUSE">Casa</option>
                        <option value="APARTMENT">Apartamento</option>
                        <option value="LAND">Terreno / Lote</option>
                        <option value="COMMERCIAL">Comercial</option>
                        <option value="FARM">Fazenda / Sítio</option>
                    </select>
                </div>

                {/* Área Total */}
                <div className="space-y-1">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <FaRulerCombined className="text-accent-primary/60" /> Área Total (m²)
                    </label>
                    <input 
                        {...register('attributes.area_total_m2' as any)}
                        type="number"
                        placeholder="0.00"
                        className="w-full bg-black/40 border border-gray-800 p-3 rounded-lg text-sm text-white focus:border-accent-primary outline-none transition-all font-mono"
                    />
                </div>

                {/* Área Útil */}
                <div className="space-y-1">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <FaRulerCombined className="text-accent-primary/60 opacity-50" /> Área Útil (m²)
                    </label>
                    <input 
                        {...register('attributes.area_useful_m2' as any)}
                        type="number"
                        placeholder="0.00"
                        className="w-full bg-black/40 border border-gray-800 p-3 rounded-lg text-sm text-white focus:border-accent-primary outline-none transition-all font-mono"
                    />
                </div>
            </div>

            {/* --- SEÇÃO B: COMPOSIÇÃO INTERNA (O "DNA" DO IMÓVEL) --- */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-black/20 border border-gray-800 rounded-2xl">
                {/* Quartos */}
                <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase flex items-center gap-1.5">
                        <FaBed /> Quartos
                    </label>
                    <input 
                        {...register('attributes.bedrooms' as any)}
                        type="number"
                        className="w-full bg-gray-900/50 border border-gray-700 p-2 rounded-lg text-sm text-white focus:border-accent-primary outline-none text-center"
                    />
                </div>

                {/* Suítes */}
                <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase flex items-center gap-1.5">
                        <FaBed className="text-accent-secondary/50" /> Suítes
                    </label>
                    <input 
                        {...register('attributes.suites' as any)}
                        type="number"
                        className="w-full bg-gray-900/50 border border-gray-700 p-2 rounded-lg text-sm text-white focus:border-accent-primary outline-none text-center"
                    />
                </div>

                {/* Banheiros */}
                <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase flex items-center gap-1.5">
                        <FaBath /> Banheiros
                    </label>
                    <input 
                        {...register('attributes.bathrooms' as any)}
                        type="number"
                        className="w-full bg-gray-900/50 border border-gray-700 p-2 rounded-lg text-sm text-white focus:border-accent-primary outline-none text-center"
                    />
                </div>

                {/* Vagas */}
                <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase flex items-center gap-1.5">
                        <FaCar /> Vagas
                    </label>
                    <input 
                        {...register('attributes.parking_spaces' as any)}
                        type="number"
                        className="w-full bg-gray-900/50 border border-gray-700 p-2 rounded-lg text-sm text-white focus:border-accent-primary outline-none text-center"
                    />
                </div>
            </div>

            {/* --- SEÇÃO C: INDICADORES FINANCEIROS E EXTRAS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Condomínio e IPTU */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase text-gray-400">
                            <FaMoneyBillWave className="text-emerald-500/60" /> Condomínio (R$)
                        </label>
                        <input 
                            {...register('attributes.condo_value' as any)}
                            type="number"
                            step="0.01"
                            className="w-full bg-black/40 border border-gray-800 p-3 rounded-lg text-sm text-emerald-400 font-mono focus:border-accent-primary outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase text-gray-400">
                            <FaMoneyBillWave className="text-orange-500/60" /> IPTU Anual (R$)
                        </label>
                        <input 
                            {...register('attributes.iptu_value' as any)}
                            type="number"
                            step="0.01"
                            className="w-full bg-black/40 border border-gray-800 p-3 rounded-lg text-sm text-orange-400 font-mono focus:border-accent-primary outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Features / Amenidades */}
                <div className="space-y-1">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <FaListUl className="text-accent-secondary/60" /> Diferenciais (Features)
                    </label>
                    <textarea 
                        defaultValue={featuresDefaultValue}
                        onBlur={handleFeaturesChange}
                        placeholder="Piscina, Churrasqueira, Academia... (Um por linha ou vírgula)"
                        rows={2}
                        className="w-full bg-black/40 border border-gray-800 p-3 rounded-lg text-sm text-white focus:border-accent-primary outline-none transition-all resize-none placeholder:text-gray-700"
                    />
                </div>
            </div>

        </div>
    );
};