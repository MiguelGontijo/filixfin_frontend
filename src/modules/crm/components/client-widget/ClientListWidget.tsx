// src/modules/crm/components/client-widget/ClientListWidget.tsx

import React, { useState } from 'react';
import { FaUser, FaPlus, FaExclamationTriangle } from 'react-icons/fa';
import { useClients } from '@/core/client/hooks/useClients';
import { Client } from '@/core/client/types/client';
// REMOVIDO: import { ClientModal } ... (O modal não deve mais existir aqui)
import { ClientSearchInput } from './ClientSearchInput';
import { ClientListItem } from './ClientListItem';
import { useClientMutation } from '@/core/client/hooks/useClientMutation';

interface ClientListWidgetProps {
    onSelectClient?: (client: Client | null) => void;
    refreshTrigger?: number;
    onNewClient: () => void;
    onEditClient: (client: Client) => void;
}

export const ClientListWidget: React.FC<ClientListWidgetProps> = ({ 
    onSelectClient,
    refreshTrigger = 0,
    onNewClient,
    onEditClient
}) => {
    
    const { 
        clients, 
        isLoading, 
        error, 
        searchTerm, 
        setSearchTerm, 
        refreshData 
    } = useClients(refreshTrigger);

    const { deleteClient, updateClient, isLoading: isMutating } = useClientMutation();
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    
    // REMOVIDO: Estado local do modal (isModalOpen) - A página pai gerencia isso agora.

    // --- HANDLERS ---

    const handleSelect = (client: Client) => {
        if (selectedClientId === client.id) {
            setSelectedClientId(null);
            if (onSelectClient) {
                onSelectClient(null);
            }
        } else {
            setSelectedClientId(client.id);
            if (onSelectClient) {
                onSelectClient(client);
            }
        }
    };

    // Handler direto: Apenas repassa a intenção para o Pai (CRMPage)
    const handleNewClient = () => {
        onNewClient(); 
    };

    const handleEdit = (client: Client) => {
        onEditClient(client);
    };

    const handleDelete = async (client: Client) => {
        const isActive = client.isActive;
        const actionText = isActive ? 'mover para a lixeira' : 'reativar';
        const confirmText = `Tem certeza que deseja ${actionText} o cliente "${client.name}"?`;

        if (confirm(confirmText)) {
            try {
                if (isActive) {
                    await deleteClient(client.id);
                } else {
                    await updateClient(client.id, { isActive: true });
                }
                refreshData();
            } catch (error) {
                console.error("Falha ao alterar status:", error);
                alert(`Erro ao ${actionText} cliente.`);
            }
        }
    };

    return (
        <div className="col-span-3 bg-base-metallic rounded-xl border border-gray-700 flex flex-col overflow-hidden shadow-lg h-full">
            
            {/* Header */}
            <div className="p-4 border-b border-gray-700 bg-gray-800 flex justify-between items-center flex-shrink-0">
                <h2 className="font-bold text-white flex items-center">
                    <FaUser className="mr-2 text-accent-secondary" /> Clientes
                </h2>
                <button 
                    onClick={handleNewClient}
                    className="text-xs bg-accent-secondary hover:bg-violet-600 text-white px-2 py-1 rounded flex items-center transition shadow-sm"
                    title="Adicionar Novo Cliente"
                >
                    <FaPlus className="mr-1" /> Novo
                </button>
            </div>

            {/* Input de Busca */}
            <div className="flex-shrink-0">
                <ClientSearchInput 
                    value={searchTerm} 
                    onChange={setSearchTerm} 
                    isLoading={isLoading || isMutating} 
                />
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2 relative">
                
                {error && (
                    <div className="p-4 text-center text-xs text-red-400 bg-red-900/10 rounded-lg border border-red-900/30">
                        <FaExclamationTriangle className="mx-auto mb-2 w-5 h-5 opacity-50" />
                        <p>{error}</p>
                        <button onClick={() => refreshData()} className="mt-2 text-accent-primary hover:underline">
                            Tentar novamente
                        </button>
                    </div>
                )}

                {!isLoading && !error && clients.length === 0 && (
                    <div className="text-center py-10 text-gray-500 text-sm">
                        <p>Nenhum cliente encontrado.</p>
                        {searchTerm && <p className="text-xs mt-1 opacity-70">Tente outro termo de busca.</p>}
                    </div>
                )}

                {clients.map(client => (
                    <ClientListItem
                        key={client.id}
                        client={client}
                        onClick={handleSelect}
                        isSelected={selectedClientId === client.id}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ))}
            </div>

            <div className="p-2 border-t border-gray-700 bg-gray-800/50 text-[10px] text-gray-500 text-center flex-shrink-0">
                {clients.length} registro(s) carregado(s)
            </div>

            {/* REMOVIDO: <ClientModal ... /> - Não renderizamos mais o modal aqui */}
        </div>
    );
};