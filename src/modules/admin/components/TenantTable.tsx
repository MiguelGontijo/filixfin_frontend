"use client";

import React, { useState } from 'react';
import { FaEdit, FaCheckCircle, FaTimesCircle, FaLink, FaBuilding, FaUserTie, FaPlus } from 'react-icons/fa';
import { useTenants } from '@/core/hooks/useTenants';
import { UserRole } from '@/core/types/user'; 
import { TenantWithPlan } from '@/core/types/tenant';
import { TenantModal } from './TenantModal';
import { useTenantAdminMutation } from '@/core/hooks/useTenantAdminMutation';
import { useNavigation } from '@/core/hooks/useNavigation';

/**
 * @component TenantTable
 * @description Tabela de visualização e gerenciamento de Tenants (Empresas).
 * Porquê: Permite ao GLOBAL_ADMIN visualizar e gerenciar o status e os planos de cada Tenant.
 */
export const TenantTable: React.FC = () => {
    
    // 1. ESTADO PARA MODAL E DADOS DE EDIÇÃO
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tenantToEdit, setTenantToEdit] = useState<TenantWithPlan | undefined>(undefined);

    // Hooks de Dados e Mutação
    const { tenants, isLoading: loadingTenants, error, refreshData } = useTenants();
    // Assumindo refreshData para recarregar
    const { toggleActiveStatus, isLoading: isToggling } = useTenantAdminMutation();
    // --- NOVO: Hook de Roteamento ---
    // MODIFICAÇÃO: Usamos o hook useNavigation.
    const { toRegister } = useNavigation();
    // Recarrega os dados após sucesso na mutação
    const handleSuccess = () => {
        console.log("Tenant alterado. Recarregando dados.");
    // FUTURO: Chamar refreshData()
        setIsModalOpen(false);
        setTenantToEdit(undefined);
    };
    // --- Funções de Ação ---
    const handleCreateNewTenant = () => {
        // Redireciona o Admin Global para a tela de Registro/Criação de Conta.
        // MODIFICAÇÃO: Usa o método centralizado toRegister.
        toRegister();
    };

    const handleEdit = (tenant: TenantWithPlan) => {
        setTenantToEdit(tenant);
        // Define o tenant a ser editado
        setIsModalOpen(true);
    };
    const handleSoftDelete = async (tenant: TenantWithPlan) => {
        const action = tenant.isActive ? 'desativar' : 'ativar';
        if (confirm(`Tem certeza que deseja ${action} o Tenant "${tenant.razaoSocial}"?`)) {
            try {
                // Chamada de Mutação Soft Delete
                await toggleActiveStatus(tenant.id, tenant.isActive);
                console.log(`Tenant ${tenant.razaoSocial} ${action} com sucesso.`);
                // FUTURO: Chamar refreshData()
            } catch (error) {
                console.error(`Falha ao ${action} o Tenant:`, error);
            }
        }
    };
    // --- Helpers de Visualização ---
    const renderStatusBadge = (isActive: boolean) => {
        const colorClass = isActive ?'text-success bg-green-900/40' : 'text-danger bg-red-900/40';
        const icon = isActive ? <FaCheckCircle className="w-3 h-3" /> : <FaTimesCircle className="w-3 h-3" />;
        return (
            <span className={`inline-flex items-center space-x-1 px-3 py-1 text-xs font-medium rounded-full ${colorClass}`}>
                {icon}
                <span>{isActive ? 'Ativo' : 'Inativo'}</span>
            </span>
        );
    };

    // A Role Badge não é usada para Tenants, mas o helper é mantido.
    const renderRoleBadge = (role: typeof UserRole[keyof typeof UserRole]) => {
        const colorClass = role === UserRole.GLOBAL_ADMIN ? 'text-accent-secondary bg-violet-900/40' : 'text-accent-primary bg-orange-900/40';
        const icon = role === UserRole.GLOBAL_ADMIN ? <FaUserTie className="w-3 h-3" /> : <FaBuilding className="w-3 h-3" />;

        return (
            <span className={`inline-flex items-center space-x-1 px-3 py-1 text-xs font-medium rounded-full ${colorClass}`}>
                {icon}
                <span>{role}</span>
            </span>
        );
    };

    // --- Tratamento de Estado ---
    if (loadingTenants || isToggling) {
        return (
            <div className="text-center py-12 text-accent-secondary">
                <span className="animate-spin text-xl">⏳</span> {isToggling ? 'Alterando Status...' : 'Carregando Lista de Tenants...'}
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
            
            {/* Botão de Criação (Placeholder - Criação de Tenant é pelo /register) */}
            <div className="flex justify-end">
                <button 
                    // NOTE: A criação de tenant é via /register. Mantemos o placeholder inativo.
                    onClick={handleCreateNewTenant} 
                    className="flex items-center space-x-2 px-4 py-2 bg-accent-primary text-base-dark font-bold rounded-lg hover:bg-orange-500 transition duration-150 shadow-lg"                >
                    <FaPlus />
                    <span>Novo Tenant</span>
                </button>
            </div>

            {/* Tabela Responsiva */}
            <div className="overflow-x-auto bg-base-metallic rounded-lg shadow-xl">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Razão Social / Documento
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                               Plano Atual
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Contato
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
                        {tenants.map((tenant) => (
                            <tr key={tenant.id} className="hover:bg-gray-700 transition duration-100">
                                {/* Nome / Documento */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-white">{tenant.razaoSocial}</div>
                                    <div className="text-xs text-gray-400 font-mono">CNPJ/CPF: {tenant.cnpjCpf}</div>
                                </td>
                           
                                  {/* Plano Atual */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-accent-secondary">
                                    {tenant.plan ? tenant.plan.name : 'N/A'}
                                </td>
                                
                                {/* Contato */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                                    {tenant.emailContato}
                                </td>
                                
                                {/* Status */}
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    {renderStatusBadge(tenant.isActive)}
                                </td>
        
                                {/* Ações (CRUD) */}
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-3">
                                    <button 
                                        onClick={() => handleEdit(tenant)}
                                        className="text-accent-primary hover:text-orange-500"
                                        title="Editar Plano e Dados"
                                    >
                                    <FaEdit className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleSoftDelete(tenant)}
                                        disabled={isToggling}
                                        className={tenant.isActive ? 'text-danger hover:text-red-600' : 'text-success hover:text-green-500'}
                                        title={tenant.isActive ? 'Desativar Tenant' : 'Ativar Tenant'}
                                    >
                                        <FaLink className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {tenants.length === 0 && !loadingTenants && !error && (
                <div className="text-center py-8 text-gray-500">
                    Nenhum Tenant cadastrado além do ambiente de teste.
                </div>
            )}

            {/* --- MODAL DE CRIAÇÃO/EDIÇÃO --- */}
            {isModalOpen && tenantToEdit && (
                <TenantModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    currentTenant={tenantToEdit}
                    onSuccess={handleSuccess}
                />
            )}
            {/* ------------------------------- */}
        </div>
    );
};