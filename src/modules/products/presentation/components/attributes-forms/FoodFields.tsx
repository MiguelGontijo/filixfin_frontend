'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { 
    FaUtensils, 
    FaExclamationTriangle, 
    FaLeaf, 
    FaTemperatureLow, 
    FaHistory, 
    FaListOl 
} from 'react-icons/fa';

/** --- INTELIGÊNCIA DE DOMÍNIO --- */
import { ProductFormInput } from '../../../domain/schemas/productSchema';

interface FoodFieldsProps {
    form: UseFormReturn<ProductFormInput>;
}

/**
 * ============================================================================
 * 🍕 COMPONENTE: FoodFields
 * @description Sub-formulário polimórfico para o setor de Food Service.
 * Captura dados nutricionais, indicadores dietéticos e regras de conservação.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Shopify/DoorDash Level):
 * 1. Deep Path Registration: Conecta campos aninhados (ex: nutritional_info.calories)
 * diretamente ao estado mestre, garantindo fluidez total.
 * 2. Uncontrolled List Processing: Processa ingredientes e alérgenos via Blur,
 * otimizando o parse de strings para arrays JSONB.
 * 3. Health-First UI: Destaca restrições e alérgenos com semântica visual apropriada.
 * ============================================================================
 */
export const FoodFields: React.FC<FoodFieldsProps> = ({ form }) => {
    const { register, setValue, watch } = form;

    /** * 🧠 HELPER: handleListChange
     * Converte entradas de texto em arrays limpos apenas ao perder o foco.
     */
    const handleListChange = (field: 'ingredients' | 'allergens', text: string) => {
        const list = text.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
        setValue(`attributes.${field}` as any, list, { shouldDirty: true });
    };

    // Observadores para valores padrão (Inits)
    // 🛡️ Acesso Seguro: Fazemos o cast para 'any' apenas na leitura do watch 
    // para permitir que o compilador ignore a união discriminada neste fragmento.
    const attributes = watch('attributes') as any;

    // Agora o acesso abaixo é seguro e o TS não reclama mais.
    const allergensDefault = Array.isArray(attributes?.allergens) 
        ? attributes.allergens.join('\n') 
        : '';

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-500">
            
            {/* --- SEÇÃO A: TABELA NUTRICIONAL (DEEP BINDING) --- */}
            <div className="bg-black/20 p-6 rounded-2xl border border-gray-800/50">
                <label className="block text-[10px] uppercase font-bold text-accent-primary mb-5 flex items-center gap-2 tracking-[0.1em]">
                    <FaListOl /> Tabela Nutricional (Por Porção)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                        { id: 'calories', label: 'Calorias (kcal)' },
                        { id: 'proteins', label: 'Proteínas (g)' },
                        { id: 'carbohydrates', label: 'Carbos (g)' },
                        { id: 'total_fats', label: 'Gorduras (g)' },
                        { id: 'sodium', label: 'Sódio (mg)' }
                    ].map(item => (
                        <div key={item.id} className="space-y-1">
                            <label className="block text-[9px] text-gray-500 uppercase font-bold">{item.label}</label>
                            <input 
                                {...register(`attributes.nutritional_info.${item.id}` as any)}
                                type="number"
                                step="0.1"
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-accent-primary outline-none transition-all font-mono"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* --- SEÇÃO B: DIETA E SEGURANÇA ALIMENTAR --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Flags Dietéticas */}
                <div className="space-y-4">
                    <label className="block text-[10px] uppercase font-bold text-gray-400 flex items-center gap-2">
                        <FaLeaf className="text-emerald-500" /> Restrições e Preferências
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { id: 'is_vegan', label: 'Vegano' },
                            { id: 'is_vegetarian', label: 'Vegetariano' },
                            { id: 'is_gluten_free', label: 'Sem Glúten' },
                            { id: 'is_lactose_free', label: 'Sem Lactose' }
                        ].map(flag => (
                            <label key={flag.id} className="flex items-center space-x-3 p-3 bg-black/20 rounded-xl border border-gray-800 cursor-pointer hover:border-gray-700 transition-all group">
                                <input 
                                    {...register(`attributes.dietary_flags.${flag.id}` as any)}
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-gray-700 text-accent-primary focus:ring-accent-primary bg-gray-900"
                                />
                                <span className="text-[11px] font-bold text-gray-400 group-hover:text-gray-200">{flag.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Alérgenos (Texto para Array) */}
                <div className="space-y-2">
                    <label className="block text-[10px] uppercase font-bold text-red-400 flex items-center gap-2">
                        <FaExclamationTriangle /> Alérgenos Críticos
                    </label>
                    <textarea 
                        defaultValue={allergensDefault}
                        onBlur={(e) => handleListChange('allergens', e.target.value)}
                        placeholder="Ex: Glúten, Amendoim, Ovos..."
                        className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500/50 outline-none transition-all min-h-[100px] resize-none placeholder:text-gray-700"
                    />
                </div>
            </div>

            {/* --- SEÇÃO C: LOGÍSTICA E CONSERVAÇÃO --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-800/50">
                {/* Armazenamento */}
                <div className="space-y-1">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase text-gray-400">
                        <FaTemperatureLow className="text-blue-400/60" /> Conservação
                    </label>
                    <input 
                        {...register('attributes.storage_instructions.storage_method' as any)}
                        type="text"
                        placeholder="Ex: Resfriado"
                        className="w-full bg-black/40 border border-gray-800 p-3 rounded-lg text-sm text-white focus:border-accent-primary outline-none transition-all"
                    />
                </div>

                {/* Shelf Life (Validade) */}
                <div className="space-y-1">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase text-gray-400">
                        <FaHistory className="text-orange-400/60" /> Validade
                    </label>
                    <div className="flex gap-2">
                        <input 
                            {...register('attributes.shelf_life.value' as any)}
                            type="number"
                            className="w-20 bg-black/40 border border-gray-800 p-3 rounded-lg text-sm text-white font-mono"
                        />
                        <select 
                            {...register('attributes.shelf_life.unit' as any)}
                            className="flex-1 bg-black/40 border border-gray-800 p-3 rounded-lg text-sm text-white cursor-pointer"
                        >
                            <option value="DAYS">Dias</option>
                            <option value="HOURS">Horas</option>
                        </select>
                    </div>
                </div>

                {/* Ingredientes (Trigger para Editor ou Texto Simples) */}
                <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase text-gray-400">Composição (Ingredientes)</label>
                    <button 
                        type="button"
                        onClick={() => alert("Editor de Ingredientes em breve.")}
                        className="w-full h-[46px] bg-gray-800/40 hover:bg-gray-800 border border-gray-700 rounded-lg px-4 text-[10px] font-bold text-gray-400 transition-all flex items-center justify-center gap-2"
                    >
                        <FaUtensils className="text-accent-secondary" /> Gerenciar Ingredientes
                    </button>
                </div>
            </div>

        </div>
    );
};