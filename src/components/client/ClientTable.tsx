// src/components/client/ClientTable.tsx

"use client";

import React, { useState } from 'react';
import { FaEdit, FaTrash, FaPlus, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useClients } from '@/hooks/useClients';
import { Client } from '@/types/client';
import { ClientModal } from './ClientModal'; // Modal de Criação/Edição

/**
 * @component ClientTable
 * @description Tabela de visualização e gerenciamento de Clientes (Entidade de Negócio).
 * Porquê: Implementa a interface principal para o usuário do Tenant.
 */
export const ClientTable: React.FC = () => {
    
    const { clients, isLoading, error, refreshData } = useClients();
    
    // --- ESTADO PARA MODAL ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Para futura edição, definiríamos: const [clientToEdit, setClientToEdit] = useState<Client | undefined>(undefined);
    // -------------------------

    // --- Funções de Ação ---
    
    const handleNewClient = () => {
        // setClientToEdit(undefined); // Criação
        setIsModalOpen(true);
    };

    const handleSuccess = () => {
        refreshData(); // Recarrega os dados após sucesso na criação
        setIsModalOpen(false);
    };
    
    // FUTURO: handleEdit e handleDelete (requerem useClientMutation.deleteClient)

    // --- Tratamento de Estado ---

    if (isLoading) {
        return (
            <div className="text-center py-12 text-accent-secondary">
                <span className="animate-spin text-xl">⏳</span> Carregando Clientes...
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
                    onClick={handleNewClient} 
                    className="flex items-center space-x-2 px-4 py-2 bg-accent-secondary text-white font-bold rounded-lg hover:bg-violet-600 transition duration-150 shadow-lg"
                >
                    <FaPlus />
                    <span>Novo Cliente</span>
                </button>
            </div>

            {/* Tabela Responsiva */}
            <div className="overflow-x-auto bg-base-metallic rounded-lg shadow-xl">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Nome / E-mail
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Documento
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
                        {clients.map((client) => (
                            <tr key={client.id} className="hover:bg-gray-700 transition duration-100">
                                {/* Nome / Email */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-white">{client.name}</div>
                                    <div className="text-xs text-gray-400">{client.email || 'Não fornecido'}</div>
                                </td>
                                
                                {/* Documento */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200 font-mono">
                                    {client.document}
                                </td>
                                
                                {/* Status */}
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                    {client.isActive ? (
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
                                
                                {/* Ações (FUTURO: Edição/Deleção) */}
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-3">
                                    <button 
                                        // onClick={() => handleEdit(client)}
                                        className="text-accent-secondary/50 cursor-not-allowed"
                                        title="Editar (Não Implementado)"
                                    >
                                        <FaEdit className="w-4 h-4" />
                                    </button>
                                    <button 
                                        // onClick={() => handleDelete(client)}
                                        className="text-danger/50 cursor-not-allowed"
                                        title="Deletar (Não Implementado)"
                                    >
                                        <FaTrash className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {clients.length === 0 && !isLoading && !error && (
                <div className="text-center py-8 text-gray-500">
                    Nenhum cliente cadastrado. Clique em Novo Cliente para começar!
                </div>
            )}

            {/* --- MODAL DE CRIAÇÃO --- */}
            <ClientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSuccess}
            />
            {/* ------------------------ */}
        </div>
    );
};