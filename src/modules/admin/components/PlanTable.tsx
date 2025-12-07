"use client";

import React, { useState } from 'react';
import { usePlans } from '@/core/hooks/usePlans';
import { FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaDollarSign, FaPlus } from 'react-icons/fa';
import { Plan } from '@/core/types/acl'; 
import { PlanModal } from '@/modules/admin/components/PlanModal';

/**
 * @component PlanTable
 * @description Tabela de visualização e gerenciamento de Planos de Assinatura.
 * Porquê: Centraliza a interface CRUD e a representação visual dos dados de ACL.
 */
export const PlanTable: React.FC = () => {
    
    // --- Definição do Estado do Modal ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [planToEdit, setPlanToEdit] = useState<Plan | undefined>(undefined);
    // -------------------------------------------------

    const { plans, isLoading, error, refreshData } = usePlans();
    // FUTURO: Integração do hook de mutação
    // const { deletePlan, isLoading: isDeleting } = usePlanMutation();
    const isDeleting = false; // Placeholder
    
    // Recarrega os dados após sucesso na mutação (FUTURO: Deve chamar refreshData do usePlans)
    const handleSuccess = () => {
        console.log("Plano alterado. Recarregando dados.");
        refreshData();
        setIsModalOpen(false);
        setPlanToEdit(undefined);
    };

    // --- Funções de Ação Futuras ---
    
    const handleNewPlan = () => {
        setPlanToEdit(undefined); // Criação de um novo plano (passa undefined)
        setIsModalOpen(true);
    };

    const handleEdit = (plan: Plan) => { // O tipo Plan é o importado de @/types/acl
        setPlanToEdit(plan);
        setIsModalOpen(true);
    };
    
    const handleDelete = (plan: Plan) => {
        if (confirm(`Tem certeza que deseja deletar o plano "${plan.name}"?`)) {
            console.log("Deletar o plano:", plan.name);
            // FUTURO: Chamar o Service de Delete no Backend.
        }
    };

    // --- Tratamento de Estado ---

    if (isLoading || isDeleting) {
        return (
            <div className="text-center py-12 text-accent-secondary">
                <span className="animate-spin text-xl">⏳</span> Carregando Planos...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-danger/20 border border-danger rounded-lg text-danger">
                {error}
            </div>
        );
    }
    
    return (
        <div className="space-y-4">
            
            {/* Botão de Criação */}
            <div className="flex justify-end">
                <button 
                    onClick={handleNewPlan}
                    className="flex items-center space-x-2 px-4 py-2 bg-accent-primary text-base-dark font-bold rounded-lg hover:bg-orange-500 transition duration-150 shadow-lg"
                >
                    <FaPlus />
                    <span>Novo Plano</span>
                </button>
            </div>

            {/* Tabela Responsiva (Excelência) */}
            <div className="overflow-x-auto bg-base-metallic rounded-lg shadow-xl">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Nome / Descrição
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Preço
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {plans.map((plan) => (
                            <tr key={plan.id} className="hover:bg-gray-700 transition duration-100">
                                {/* Nome / Descrição */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-white">{plan.name}</div>
                                    <div className="text-xs text-gray-400 max-w-sm truncate">{plan.description || 'Nenhuma descrição fornecida.'}</div>
                                </td>
                                
                                {/* Preço */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-bold">
                                    <span className="flex items-center">
                                        <FaDollarSign className="w-3 h-3 mr-1" />
                                        {plan.price.toFixed(2)}
                                    </span>
                                </td>
                                
                                {/* Status */}
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                    {plan.isActive ? (
                                        <span className="inline-flex items-center space-x-1 px-3 py-1 bg-success/20 text-success rounded-full">
                                            <FaCheckCircle className="w-3 h-3" />
                                            <span>Ativo</span>
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center space-x-1 px-3 py-1 bg-danger/20 text-danger rounded-full">
                                            <FaTimesCircle className="w-3 h-3" />
                                            <span>Inativo</span>
                                        </span>
                                    )}
                                </td>
                                
                                {/* Ações (CRUD) */}
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-3">
                                    <button 
                                        onClick={() => handleEdit(plan)}
                                        className="text-accent-secondary hover:text-violet-400"
                                        title="Editar Plano"
                                    >
                                        <FaEdit className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(plan)}
                                        className="text-danger hover:text-red-600"
                                        title="Deletar Plano"
                                    >
                                        <FaTrash className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {plans.length === 0 && !isLoading && !error && (
                <div className="text-center py-8 text-gray-500">
                    Nenhum plano cadastrado. Comece criando o seu primeiro plano!
                </div>
            )}
            
            {/* --- MODAL DE CRIAÇÃO/EDIÇÃO (FUTURO) --- */}
            {/* O Modal precisa ser renderizado aqui para o estado funcionar */}
            {/* Exemplo de integração (assumindo que PlanModal foi importado e props definidos): */}
            <PlanModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                currentPlan={planToEdit}
                onSuccess={handleSuccess}
            />
        </div>
    );
};