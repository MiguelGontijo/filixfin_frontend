// src/components/admin/TenantTable.tsx

"use client";

import React from 'react';
import { FaEdit, FaCheckCircle, FaTimesCircle, FaLink, FaBuilding, FaUserTie } from 'react-icons/fa';
import { useTenants } from '@/hooks/useTenants'; // Hook de dados
import { UserRole } from '@/types/user'; // Tipagem da Role
import { Tenant } from '@/types/tenant'; // Tipagem do Tenant

/**
 * @component TenantTable
 * @description Tabela de visualização e gerenciamento de Tenants (Empresas).
 * Porquê: Permite ao GLOBAL_ADMIN visualizar e gerenciar o status e os planos de cada Tenant.
 */
export const TenantTable: React.FC = () => {
    
    // 1. CONSUMO DO HOOK
    const { tenants, isLoading, error } = useTenants();

    // --- Funções de Ação Futuras ---
    const handleEdit = (tenant: Tenant) => {
        console.log("Abrir modal de edição/atualização de Plano para o Tenant:", tenant.razaoSocial);
        // FUTURO: Implementar modal de edição (incluindo alteração de plano e status).
    };

    const handleSoftDelete = (tenant: Tenant) => {
        const action = tenant.isActive ? 'desativar' : 'ativar';
        if (confirm(`Tem certeza que deseja ${action} o Tenant "${tenant.razaoSocial}"?`)) {
            console.log(`${action.toUpperCase()} o Tenant:`, tenant.id);
            // FUTURO: Chamar o Service de PATCH para mudar isActive.
        }
    };

    // --- Helpers de Visualização ---

    // Renderiza a tag de status (Ativo/Inativo)
    const renderStatusBadge = (isActive: boolean) => {
        const colorClass = isActive ? 'text-success bg-green-900/40' : 'text-danger bg-red-900/40';
        const icon = isActive ? <FaCheckCircle className="w-3 h-3" /> : <FaTimesCircle className="w-3 h-3" />;

        return (
            <span className={`inline-flex items-center space-x-1 px-3 py-1 text-xs font-medium rounded-full ${colorClass}`}>
                {icon}
                <span>{isActive ? 'Ativo' : 'Inativo'}</span>
            </span>
        );
    };

    // Renderiza a tag de Role (para Tenants, é sempre TENANT_ADMIN, mas o componente é genérico)
    const renderRoleBadge = (role: UserRole) => {
        const colorClass = role === UserRole.GLOBAL_ADMIN ? 'text-accent-secondary bg-violet-900/40' : 'text-accent-primary bg-orange-900/40';
        const icon = role === UserRole.GLOBAL_ADMIN ? <FaUserTie className="w-3 h-3" /> : <FaBuilding className="w-3 h-3" />;

        return (
            <span className={`inline-flex items-center space-x-1 px-3 py-1 text-xs font-medium rounded-full ${colorClass}`}>
                {icon}
                <span>{role}</span>
            </span>
        );
    };

    // --- Tratamento de Estado (Loading / Error) ---

    if (isLoading) {
        return (
            <div className="text-center py-12 text-accent-secondary">
                <span className="animate-spin text-xl">⏳</span> Carregando Lista de Tenants...
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
                                {/* Razão Social / Documento */}
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
            
            {tenants.length === 0 && !isLoading && !error && (
                <div className="text-center py-8 text-gray-500">
                    Nenhum Tenant cadastrado além do ambiente de teste.
                </div>
            )}
        </div>
    );
};