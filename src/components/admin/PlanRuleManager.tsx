// src/components/admin/PlanRuleManager.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { FaSave, FaTag, FaCalculator } from 'react-icons/fa';
import { useFeatures } from '@/hooks/useFeatures'; // Traz a lista de todas as Features
import { usePlanRules } from '@/hooks/usePlanRules'; // Traz as regras atuais do Plano
import { usePlanMutation } from '@/hooks/usePlanMutation'; // Hook para syncPlanRules
import { Feature, FeatureType, PlanFeatureRule } from '@/types/acl';

// Propriedades do Manager
interface PlanRuleManagerProps {
    planoId: string;
    onSyncSuccess: () => void; // Callback para o Modal
}

// Tipo de Estado da Regra (Combina Feature + Valor Atual)
interface RuleState {
    feature: Feature;
    limitValue: number;
    // O valor -1 será usado para representar o status "Ativo/Ilimitado" para booleanas ou quantity.
}

/**
 * @component PlanRuleManager
 * @description Interface para gerenciar as regras (PlanFeature) de um Plano específico.
 * Porquê: Centraliza a lógica de mapeamento, edição de limites e chamada transacional de sincronização.
 */
export const PlanRuleManager: React.FC<PlanRuleManagerProps> = ({ planoId, onSyncSuccess }) => {
    
    // Hooks de Leitura
    const { features, isLoading: loadingFeatures, error: featuresError } = useFeatures();
    const { rules, isLoading: loadingRules, error: rulesError, fetchRules } = usePlanRules(planoId);
    
    // Hooks de Mutação
    const { syncPlanRules, isLoading: isSyncing, error: syncError } = usePlanMutation();

    // Estado principal que armazena a lista de regras para edição
    const [ruleState, setRuleState] = useState<RuleState[]>([]);
    
    // --- LÓGICA DE MAPEAR REGRAS ---
    
    useEffect(() => {
        if (!loadingFeatures && features.length > 0) {
            // Mapeia todas as Features disponíveis (features)
            const initialRules: RuleState[] = features.map(feature => {
                // Encontra a regra atual (rules) para esta feature
                const currentRule = rules.find(r => r.featureId === feature.id);
                
                // Define o valor limite inicial:
                let initialLimit = 0; // Default: Inativo/Não permitido
                
                if (currentRule) {
                    initialLimit = currentRule.limitValue;
                } else if (feature.type === FeatureType.BOOLEAN) {
                    // Se a feature for booleana e não tem regra, setamos 0 (Inativo)
                    initialLimit = 0;
                }
                
                return {
                    feature,
                    limitValue: initialLimit,
                };
            });

            setRuleState(initialRules);
        }
    }, [features, rules, loadingFeatures, loadingRules]); // Dependências de recarregamento
    
    // --- FUNÇÕES DE AÇÃO E EDIÇÃO ---

    const handleLimitChange = (featureId: string, value: string) => {
        // Converte a entrada de texto (quantity) para número
        const numericValue = parseInt(value, 10);
        
        setRuleState(prev => prev.map(item => {
            if (item.feature.id === featureId) {
                return {
                    ...item,
                    // Garante que o valor seja um número válido ou -1 (Ilimitado)
                    limitValue: isNaN(numericValue) ? 0 : numericValue, 
                };
            }
            return item;
        }));
    };

    const handleBooleanToggle = (featureId: string, isActive: boolean) => {
        // Para booleanas, 1 é Ativo, 0 é Inativo
        const value = isActive ? 1 : 0;
        
        setRuleState(prev => prev.map(item => {
            if (item.feature.id === featureId) {
                return {
                    ...item,
                    limitValue: value,
                };
            }
            return item;
        }));
    };

    const handleSyncRules = async () => {
        // 1. Filtrar apenas as regras ATIVAS ou com LIMITES definidos (> 0 ou != 0)
        // Porquê: Não queremos enviar regras com limitValue = 0 ou null, 
        // a menos que seja uma booleana explícita.
        const rulesToSend: PlanFeatureRule[] = ruleState
            .filter(item => item.limitValue !== 0)
            .map(item => ({
                featureId: item.feature.id,
                limitValue: item.limitValue,
            }));

        try {
            // 2. Chamada de Sincronização Transacional
            await syncPlanRules(planoId, rulesToSend);
            alert("Regras do Plano salvas com sucesso!");
            
            // 3. Callback de sucesso e recarregamento da tela.
            await fetchRules(); // Revalida os dados da tabela de regras
            onSyncSuccess(); // Callback para o modal principal
            
        } catch (error) {
            console.error("Falha na sincronização:", error);
        }
    };
    
    // --- RENDERIZAÇÃO DE ESTADO ---
    if (loadingFeatures || loadingRules) {
        return <div className="text-center text-gray-400 py-4">Carregando Features e Regras...</div>;
    }
    
    if (featuresError || rulesError || syncError) {
        return <div className="p-3 bg-danger/20 text-danger rounded-lg">Erro: {featuresError || rulesError || syncError}</div>;
    }

    // --- RENDERIZAÇÃO DA TABELA DE REGRAS ---

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-base-text border-b border-gray-700 pb-2">
                Configuração de Limites por Feature
            </h3>
            
            <div className="overflow-x-auto bg-gray-800 rounded-lg">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-300">Feature</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-300">Tipo de Controle</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 w-1/4">Valor / Acesso</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {ruleState.map(item => (
                            <tr key={item.feature.id}>
                                {/* Nome da Feature */}
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="text-sm text-white">{item.feature.name}</div>
                                    <div className="text-xs text-gray-400 font-mono">{item.feature.key}</div>
                                </td>
                                
                                {/* Tipo de Controle (Badge) */}
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <span 
                                        className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${item.feature.type === FeatureType.QUANTITY ? 'bg-violet-900/40 text-accent-secondary' : 'bg-green-900/40 text-success'}`}
                                    >
                                        {item.feature.type === FeatureType.QUANTITY ? <FaCalculator className="w-3 h-3 mr-1" /> : <FaTag className="w-3 h-3 mr-1" />}
                                        {item.feature.type === FeatureType.QUANTITY ? 'Quantitativo' : 'Booleano'}
                                    </span>
                                </td>
                                
                                {/* Campo de Edição (Valor / Acesso) */}
                                <td className="px-4 py-3 whitespace-nowrap">
                                    {item.feature.type === FeatureType.BOOLEAN ? (
                                        // Toggle para Booleano
                                        <div className="flex items-center">
                                            <input
                                                id={`bool-${item.feature.id}`}
                                                type="checkbox"
                                                checked={item.limitValue === 1}
                                                onChange={(e) => handleBooleanToggle(item.feature.id, e.target.checked)}
                                                className="h-4 w-4 text-accent-secondary border-gray-600 rounded"
                                            />
                                            <label htmlFor={`bool-${item.feature.id}`} className="ml-2 text-sm text-gray-300">
                                                Permitir Acesso
                                            </label>
                                        </div>
                                    ) : (
                                        // Campo de Entrada para Quantidade
                                        <input
                                            type="number"
                                            value={item.limitValue}
                                            onChange={(e) => handleLimitChange(item.feature.id, e.target.value)}
                                            min="-1"
                                            className="block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white"
                                            placeholder="-1 (Ilimitado) ou Limite"
                                        />
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Botão de Sincronização */}
            <button
                onClick={handleSyncRules}
                disabled={isSyncing}
                className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-base-dark bg-accent-primary hover:bg-orange-500 transition disabled:bg-gray-500"
            >
                <FaSave className="w-4 h-4 mr-2" />
                {isSyncing ? 'Sincronizando Regras...' : 'Salvar Regras do Plano'}
            </button>
        </div>
    );
};