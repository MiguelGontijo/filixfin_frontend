'use client';

import React, { useState, useEffect } from 'react';
import { FaTimes, FaDollarSign, FaListUl } from 'react-icons/fa';
import { usePlanMutation } from '@/core/hooks/usePlanMutation';
import { PlanRuleManager } from './PlanRuleManager';
import { Plan } from '@/core/types/acl'; 


// Propriedades do Modal (inalterado)
interface PlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPlan?: Plan; 
    onSuccess: () => void;
}

// Tipos de Aba
type PlanModalTab = 'DETAILS' | 'RULES';

/**
 * @component PlanModal
 * @description Modal de Criação e Edição de Planos para o Admin Global.
 */
export const PlanModal: React.FC<PlanModalProps> = ({ 
    isOpen, 
    onClose, 
    currentPlan, 
    onSuccess 
}) => {
    
    // 1. ESTADO DO FORMULÁRIO E HOOKS
    const isEditing = !!currentPlan;
    const { createPlan, updatePlan, isLoading, error } = usePlanMutation();
    
    // --- ESTADO DE ABAS E FORM ---
    const [currentTab, setCurrentTab] = useState<PlanModalTab>('DETAILS');
    const [formData, setFormData] = useState({
        name: currentPlan?.name || '',
        description: currentPlan?.description || '',
        price: currentPlan?.price || 0.00,
        isActive: currentPlan?.isActive ?? true,
    });
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Sincroniza o formulário ao trocar o plano de edição
    useEffect(() => {
        setFormData({
            name: currentPlan?.name || '',
            description: currentPlan?.description || '',
            price: currentPlan?.price || 0.00,
            isActive: currentPlan?.isActive ?? true,
        });
        setSubmitError(null);
        // Ao abrir o modal (ou mudar o plano), volta para a aba Detalhes
        setCurrentTab('DETAILS'); 
    }, [currentPlan, isOpen]);

    // Lida com a mudança nos campos do formulário (inalterado)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' 
                      ? parseFloat(value) || 0 
                      : type === 'checkbox' 
                        ? (e.target as HTMLInputElement).checked 
                        : value,
        }));
    };

    // 2. LÓGICA DE SUBMISSÃO (Apenas Detalhes)
    const handleSubmitDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        try {
            if (isEditing && currentPlan) {
                await updatePlan(currentPlan.id, formData);
            } else {
                // A criação de um plano deve ser simples, sem regras ainda.
                await createPlan(formData as any); 
            }
            
            // Se estiver editando, apenas salva os detalhes e permanece no modal,
            // permitindo que o Admin clique na aba RULES para configurar.
            if(isEditing) {
                 alert("Detalhes do Plano salvos. Configure as Regras de Feature.");
                 // Move para a aba de regras após salvar os detalhes
                 setCurrentTab('RULES'); 
            } else {
                 // Após criar, fecha o modal e recarrega
                 onSuccess();   
                 onClose();
            }
            
        } catch (err: any) {
            setSubmitError(error || err.response?.data?.message || 'Ocorreu um erro desconhecido.');
        }
    };
    
    // Helper para Abas
    const getTabClass = (tab: PlanModalTab) => {
        return `px-4 py-2 text-sm font-medium rounded-t-lg transition duration-150 
            ${currentTab === tab 
                ? 'bg-gray-800 text-accent-primary border-b-2 border-accent-primary' 
                : 'text-gray-400 hover:bg-gray-700'
            }`;
    };

    if (!isOpen) return null;

    // 3. RENDERIZAÇÃO
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-base-metallic p-6 rounded-lg shadow-2xl w-full max-w-lg">
                
                {/* Cabeçalho do Modal */}
                <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
                    <h2 className="text-xl font-bold text-white">
                        {isEditing ? `Gerenciar Plano: ${currentPlan?.name}` : 'Criar Novo Plano'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                {/* --- Navegação por Abas (Apenas na Edição) --- */}
                {isEditing && (
                    <div className="flex mb-4 border-b border-gray-700 -mx-6 px-6">
                        <button 
                            onClick={() => setCurrentTab('DETAILS')}
                            className={getTabClass('DETAILS')}
                        >
                             <FaDollarSign className="inline w-3 h-3 mr-1" /> Detalhes Básicos
                        </button>
                        <button 
                            onClick={() => setCurrentTab('RULES')}
                            className={getTabClass('RULES')}
                        >
                            <FaListUl className="inline w-3 h-3 mr-1" /> Regras de Feature
                        </button>
                    </div>
                )}


                {/* Mensagens de Erro */}
                {(submitError || error) && (
                    <div className="p-3 mb-4 text-sm font-medium text-danger bg-red-900/50 rounded-md">
                        {submitError || error}
                    </div>
                )}
                
                {/* --- CONTEÚDO PRINCIPAL (BASEADO NA ABA) --- */}
                
                {/* ABA 1: DETALHES DO PLANO */}
                {currentTab === 'DETAILS' && (
                    <form onSubmit={handleSubmitDetails} className="space-y-4">
                        
                        {/* Campos de Nome, Preço, Descrição, Ativo */}
                        {/* ... (CÓDIGO DOS CAMPOS INALTERADO) */}
                        
                        {/* Campo Nome */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300">
                                Nome do Plano
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white"
                                placeholder="Ex: Plano Profissional"
                            />
                        </div>
                        
                        {/* Campo Preço */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300">
                                Preço (R$)
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price.toFixed(2)} 
                                onChange={handleChange}
                                required
                                min="0.00"
                                step="0.01"
                                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white"
                                placeholder="Ex: 99.90"
                            />
                        </div>

                        {/* Campo Descrição */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300">
                                Descrição (Opcional)
                            </label>
                            <textarea
                                name="description"
                                value={formData.description || ''}
                                onChange={handleChange}
                                rows={3}
                                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white"
                                placeholder="Recursos incluídos no plano..."
                            />
                        </div>
                        
                        {/* Campo Status (Apenas Edição) */}
                        {isEditing && (
                            <div className="flex items-center space-x-3 pt-2">
                                <input
                                    id="isActive"
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-accent-secondary border-gray-600 rounded"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-gray-300">
                                    Plano Ativo (Permitir novos Tenants)
                                </label>
                            </div>
                        )}
                        
                        {/* Botão de Ação */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-base-dark bg-accent-secondary hover:bg-violet-600 transition disabled:bg-gray-500"
                        >
                            {isLoading ? 'Salvando Detalhes...' : (isEditing ? 'Salvar Detalhes' : 'Criar Plano')}
                        </button>
                    </form>
                )}

                {/* ABA 2: GERENCIAMENTO DE REGRAS */}
                {currentTab === 'RULES' && isEditing && currentPlan && (
                    <PlanRuleManager 
                        planoId={currentPlan.id} 
                        onSyncSuccess={onSuccess} // Usa o callback principal do modal
                    />
                )}
                {/* --------------------------------------------- */}
            </div>
        </div>
    );
};