import React from 'react';
import { 
    FaUtensils, FaExclamationTriangle, FaLeaf, 
    FaTemperatureLow, FaHistory, FaListOl 
} from 'react-icons/fa';
import { FoodMetadata } from '../../../domain/types/metadata/food.types';

interface FoodFieldsProps {
    metadata: FoodMetadata;
    onChange: (data: FoodMetadata) => void;
}

/**
 * ============================================================================
 * 🍕 COMPONENTE: FoodFields
 * @description Sub-formulário polimórfico para capturar metadados do setor 
 * de alimentação. Alimenta o campo JSONB 'metadata' no banco de dados.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO:
 * 1. Semantic UX: Agrupa dados por contexto (Nutricional, Dieta, Logística).
 * 2. Array Management: Gerencia listas de ingredientes e alérgenos via 
 * strings separadas por vírgula ou quebra de linha (UX facilitada).
 * 3. Atomic Updates: Utiliza o padrão de imutabilidade para disparar o 
 * onChange apenas com o payload sanitizado.
 * ============================================================================
 */
export const FoodFields: React.FC<FoodFieldsProps> = ({ metadata, onChange }) => {

    /**
     * @method updateField
     * @description Atualiza uma chave de primeiro nível no objeto de metadados.
     */
    const updateField = <K extends keyof FoodMetadata>(field: K, value: FoodMetadata[K]) => {
        onChange({ ...metadata, [field]: value });
    };

    /**
     * @method handleListChange
     * @description Converte entradas de texto em arrays limpos (Ingredientes/Alérgenos).
     */
    const handleListChange = (field: 'ingredients' | 'allergens', text: string) => {
        const list = text.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
        updateField(field, list);
    };

    /**
     * @method updateNutritional
     * @description Atualiza campos aninhados do objeto nutricional.
     */
    const updateNutritional = (field: string, value: number) => {
        updateField('nutritional_info', {
            ...(metadata.nutritional_info || { 
                calories: 0, proteins: 0, carbohydrates: 0, total_fats: 0, sodium: 0 
            }),
            [field]: value
        });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            
            {/* --- SEÇÃO 1: INFORMAÇÕES NUTRICIONAIS --- */}
            <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-700/50">
                <label className="block text-[10px] uppercase font-bold text-accent-primary mb-4 flex items-center gap-2">
                    <FaListOl /> Tabela Nutricional (Por Porção)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                        { id: 'calories', label: 'Calorias (kcal)', icon: null },
                        { id: 'proteins', label: 'Proteínas (g)', icon: null },
                        { id: 'carbohydrates', label: 'Carbos (g)', icon: null },
                        { id: 'total_fats', label: 'Gorduras (g)', icon: null },
                        { id: 'sodium', label: 'Sódio (mg)', icon: null }
                    ].map(item => (
                        <div key={item.id}>
                            <label className="block text-[9px] text-gray-500 uppercase mb-1 font-bold">{item.label}</label>
                            <input 
                                type="number"
                                value={(metadata.nutritional_info as any)?.[item.id] || ''}
                                onChange={(e) => updateNutritional(item.id, parseFloat(e.target.value) || 0)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-accent-primary focus:outline-none transition-all"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* --- SEÇÃO 2: DIETA E RESTRIÇÕES --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bandeiras Dietéticas */}
                <div className="space-y-3">
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
                            <label key={flag.id} className="flex items-center space-x-3 p-3 bg-gray-900/50 rounded-xl border border-gray-700/50 cursor-pointer hover:bg-gray-800 transition-colors">
                                <input 
                                    type="checkbox"
                                    checked={(metadata.dietary_flags as any)?.[flag.id] || false}
                                    onChange={(e) => updateField('dietary_flags', { ...metadata.dietary_flags, [flag.id]: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-700 text-accent-primary focus:ring-accent-primary bg-gray-800"
                                />
                                <span className="text-xs font-bold text-gray-300">{flag.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Alérgenos */}
                <div>
                    <label className="block text-[10px] uppercase font-bold text-red-400 mb-2 flex items-center gap-2">
                        <FaExclamationTriangle /> Alérgenos (Um por linha)
                    </label>
                    <textarea 
                        defaultValue={metadata.allergens?.join('\n')}
                        onBlur={(e) => handleListChange('allergens', e.target.value)}
                        placeholder="Ex: Amendoim, Frutos do Mar..."
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500/50 focus:outline-none transition-all min-h-[100px] resize-none"
                    />
                </div>
            </div>

            {/* --- SEÇÃO 3: LOGÍSTICA E CONSERVAÇÃO --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-2 flex items-center gap-2">
                        <FaTemperatureLow /> Armazenamento
                    </label>
                    <input 
                        type="text"
                        value={metadata.storage_instructions?.storage_method || ''}
                        onChange={(e) => updateField('storage_instructions', { ...metadata.storage_instructions, storage_method: e.target.value })}
                        placeholder="Ex: Sob refrigeração"
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:border-accent-primary focus:outline-none"
                    />
                </div>
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-2 flex items-center gap-2">
                        <FaHistory /> Validade (Shelf Life)
                    </label>
                    <div className="flex gap-2">
                        <input 
                            type="number"
                            value={metadata.shelf_life?.value || ''}
                            onChange={(e) => updateField('shelf_life', { ...metadata.shelf_life, value: parseInt(e.target.value) || 0 })}
                            className="w-20 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white"
                        />
                        <select 
                            value={metadata.shelf_life?.unit || 'DAYS'}
                            onChange={(e) => updateField('shelf_life', { ...metadata.shelf_life, unit: e.target.value as any })}
                            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                        >
                            <option value="HOURS">Horas</option>
                            <option value="DAYS">Dias</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-2">Ingredientes</label>
                    <button 
                        type="button"
                        onClick={() => alert("Editor de Ingredientes Avançado em breve.")}
                        className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl px-4 py-2 text-xs font-bold text-gray-400 transition-all flex items-center justify-center gap-2"
                    >
                        <FaUtensils size={12} /> Editar Lista ({metadata.ingredients?.length || 0})
                    </button>
                </div>
            </div>
        </div>
    );
};