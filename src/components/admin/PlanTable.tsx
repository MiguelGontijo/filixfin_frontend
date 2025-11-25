// src/components/admin/PlanTable.tsx

"use client";

import React from 'react';
import { usePlans } from '@/hooks/usePlans';
import { FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaDollarSign, FaPlus } from 'react-icons/fa';

// Usamos o tipo do hook
interface Plan {
    id: string;
    name: string;
    description: string | null;
    price: number;
    isActive: boolean;
    createdAt: string;
}

/**
 * @component PlanTable
 * @description Tabela de visualização e gerenciamento de Planos de Assinatura.
 * Porquê: Centraliza a interface CRUD e a representação visual dos dados de ACL.
 */
export const PlanTable: React.FC = () => {
    
    const { plans, isLoading, error } = usePlans();
    
    // --- Funções de Ação Futuras ---
    const handleEdit = (plan: Plan) => {
        console.log("Abrir modal de edição para o plano:", plan.name);
        // FUTURO: Implementar modal de edição.
    };
    
    const handleDelete = (plan: Plan) => {
        if (confirm(`Tem certeza que deseja deletar o plano "${plan.name}"?`)) {
            console.log("Deletar o plano:", plan.name);
            // FUTURO: Chamar o Service de Delete no Backend.
        }
    };

    // --- Tratamento de Estado ---

    if (isLoading) {
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
        </div>
    );
};