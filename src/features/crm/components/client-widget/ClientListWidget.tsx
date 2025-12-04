// src/features/crm/components/client-widget/ClientListWidget.tsx

import React, { useState } from 'react';
import { FaUser, FaPlus, FaExclamationTriangle } from 'react-icons/fa';
import { useClients } from '@/core/hooks/useClients';
import { Client } from '@/core/types/client';
import { ClientModal } from '@/core/components/client/ClientModal';
import { ClientSearchInput } from './ClientSearchInput';
import { ClientListItem } from './ClientListItem';
// NOVO IMPORT: Hook de Mutação para o Delete
import { useClientMutation } from '@/core/hooks/useClientMutation';

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

    // Hook de Mutação para ações destrutivas/edição
    const { deleteClient, updateClient, isLoading: isMutating } = useClientMutation();

    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    
    
    // --- HANDLERS ---

    /**
     * @method handleSelect
     * @description Gerencia a seleção e "deseleção" (Toggle) de um cliente.
     * @update Agora verifica se o ID já está selecionado para limpar o estado (Toggle).
     */
    const handleSelect = (client: Client) => {
        // Verifica se o cliente clicado JÁ É o que estava selecionado
        if (selectedClientId === client.id) {
            // CENÁRIO: Desmarcar (Limpar Seleção)
            setSelectedClientId(null);
            if (onSelectClient) {
                onSelectClient(null); // Avisa ao pai que não tem mais contexto
            }
        } else {
            // CENÁRIO: Marcar Novo
            setSelectedClientId(client.id);
            if (onSelectClient) {
                onSelectClient(client);
            }
        }
    };

    const handleSuccessCreateOrUpdate = () => {
        refreshData(); // Atualiza a lista
    };

    const handleNewClient = () => {
        onNewClient();
    };

    const handleEdit = (client: Client) => {
        onEditClient(client);
    };

/**
     * @method handleDelete
     * @description Agora atua como um Toggle Inteligente (Ativar/Desativar).
     */
    const handleDelete = async (client: Client) => {
        const isActive = client.isActive;
        const actionText = isActive ? 'mover para a lixeira' : 'reativar';
        const confirmText = `Tem certeza que deseja ${actionText} o cliente "${client.name}"?`;

        if (confirm(confirmText)) {
            try {
                if (isActive) {
                    // Se está ativo, desativa (Soft Delete)
                    await deleteClient(client.id);
                } else {
                    // Se está inativo, reativa (Update simples)
                    await updateClient(client.id, { isActive: true });
                }
                // Atualiza a lista visualmente
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
                        // NOVAS PROPS CONECTADAS
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ))}
            </div>

            <div className="p-2 border-t border-gray-700 bg-gray-800/50 text-[10px] text-gray-500 text-center flex-shrink-0">
                {clients.length} registro(s) carregado(s)
            </div>

        </div>
    );
};