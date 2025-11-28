// src/components/admin/TenantModal.tsx

import React, { useState, useEffect } from 'react';
import { FaTimes, FaLink } from 'react-icons/fa';
import { Tenant, TenantModalProps, UpdateTenantAdminDto } from '@/types/tenant'; // Assumindo Tenant e UpdateTenantAdminDto estão aqui
import { Plan } from '@/types/acl'; // Lista de Planos para o select
import { useTenantAdminMutation } from '@/hooks/useTenantAdminMutation';
import { usePlans } from '@/hooks/usePlans'; // Para popular o SELECT de Planos



// --- NOVO: Função de Auxílio para Renderizar as Opções de Plano ---
const renderPlanOptions = (plans: Plan[]) => {
    return plans.map((plan: Plan) => (
        <option 
            key={plan.id} 
            value={plan.id} 
            // Regra: Não permitir selecionar Planos inativos
            disabled={!plan.isActive}
        >
            {plan.name} {plan.isActive ? '' : '(Inativo)'}
        </option>
    ));
};

/**
 * @component TenantModal
 * @description Modal de Edição/Soft Delete de Tenants, usado pelo GLOBAL_ADMIN.
 */
export const TenantModal: React.FC<TenantModalProps> = ({ 
    isOpen, 
    onClose, 
    currentTenant, 
    onSuccess 
}) => {
    
    // 1. HOOKS DE DADOS E MUTATION
    const { updateTenant, toggleActiveStatus, isLoading: isMutating, error: mutationError } = useTenantAdminMutation();
    const { plans, isLoading: loadingPlans, error: plansError } = usePlans();
    
    // 2. ESTADO DO FORMULÁRIO
    const [formData, setFormData] = useState<UpdateTenantAdminDto>({
        razaoSocial: currentTenant.razaoSocial,
        nomeFantasia: currentTenant.nomeFantasia || '',
        planoId: currentTenant.planoId,
        isActive: currentTenant.isActive,
    });
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Sincroniza o formulário ao abrir ou se o Tenant mudar
    useEffect(() => {
        setFormData({
            razaoSocial: currentTenant.razaoSocial,
            nomeFantasia: currentTenant.nomeFantasia || '',
            planoId: currentTenant.planoId,
            isActive: currentTenant.isActive,
        });
        setSubmitError(null);
    }, [currentTenant, isOpen]);

    // Lida com a mudança nos campos
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' 
                      ? (e.target as HTMLInputElement).checked 
                      : value,
        }));
    };
    
    // 3. LÓGICA DE SUBMISSÃO (Edição)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        try {
            // Apenas envia campos que foram modificados no formulário
            const changes: UpdateTenantAdminDto = {};
            if (formData.razaoSocial !== currentTenant.razaoSocial) changes.razaoSocial = formData.razaoSocial;
            if (formData.nomeFantasia !== currentTenant.nomeFantasia) changes.nomeFantasia = formData.nomeFantasia;
            if (formData.planoId !== currentTenant.planoId) changes.planoId = formData.planoId;
            // isActive é tratado pelo toggleStatus

            if (Object.keys(changes).length > 0) {
                 await updateTenant(currentTenant.id, changes);
            }
            
            onSuccess(); // Chama a recarga da tabela
            onClose();   // Fecha o modal
            
        } catch (err: any) {
            setSubmitError(mutationError || err.response?.data?.message || 'Falha ao salvar edições.');
        }
    };
    
    // 4. LÓGICA DE SOFT DELETE/ATIVE
    const handleToggleStatus = async () => {
        try {
            await toggleActiveStatus(currentTenant.id, currentTenant.isActive);
            onSuccess();
        } catch (err) {
             setSubmitError(mutationError || 'Falha ao alterar o status do Tenant.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-base-metallic p-6 rounded-lg shadow-2xl w-full max-w-lg">
                
                {/* Cabeçalho do Modal */}
                <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
                    <h2 className="text-xl font-bold text-white">
                        Gerenciar Tenant: {currentTenant.razaoSocial}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                {/* Mensagens de Erro e Loading */}
                {(submitError || mutationError || plansError) && (
                    <div className="p-3 mb-4 text-sm font-medium text-danger bg-red-900/50 rounded-md">
                        {submitError || mutationError || plansError}
                    </div>
                )}

                {/* Status Atual e Ação Soft Delete */}
                <div className={`p-3 mb-4 rounded-lg flex justify-between items-center ${currentTenant.isActive ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                    <span className="font-semibold">
                        Status Atual: {currentTenant.isActive ? 'ATIVO' : 'INATIVO'}
                    </span>
                    <button 
                        onClick={handleToggleStatus}
                        disabled={isMutating || loadingPlans}
                        className="flex items-center space-x-2 px-3 py-1 text-sm font-medium rounded-lg border border-current hover:opacity-80 transition"
                    >
                        <FaLink className="w-4 h-4" />
                        <span>{currentTenant.isActive ? 'Desativar Conta' : 'Reativar Conta'}</span>
                    </button>
                </div>


                {/* Formulário de Edição */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Razão Social */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Razão Social</label>
                        <input
                            type="text"
                            name="razaoSocial"
                            value={formData.razaoSocial}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white"
                        />
                    </div>
                    
                    {/* Nome Fantasia */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Nome Fantasia</label>
                        <input
                            type="text"
                            name="nomeFantasia"
                            value={formData.nomeFantasia || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white"
                        />
                    </div>
                    
                    {/* Seleção de Plano */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Alterar Plano de Assinatura</label>
                        <select
                            name="planoId"
                            value={formData.planoId}
                            onChange={handleChange}
                            disabled={loadingPlans || isMutating}
                            className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white disabled:bg-gray-600"
                        >
                            {loadingPlans ? (
                                <option>Carregando Planos...</option>
                            ) : (
                                // --- CORREÇÃO: Chamada à função auxiliar ---
                                renderPlanOptions(plans) 
                                // ------------------------------------------
                            )}
                        </select>
                    </div>

                    {/* Botão de Ação */}
                    <button
                        type="submit"
                        disabled={isMutating || loadingPlans}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-base-dark bg-accent-secondary hover:bg-violet-600 transition disabled:bg-gray-500"
                    >
                        {isMutating ? 'Salvando...' : 'Salvar Detalhes do Tenant'}
                    </button>
                </form>
            </div>
        </div>
    );
};