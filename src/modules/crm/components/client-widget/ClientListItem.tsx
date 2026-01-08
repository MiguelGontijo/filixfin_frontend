// src/modules/crm/components/client-widget/ClientListItem.tsx

import React from 'react';
import { FaBuilding, FaEnvelope, FaEdit, FaTrash, FaUndo } from 'react-icons/fa'; // Novos ícones
import { Client } from '@/core/types/client';

interface ClientListItemProps {
    client: Client;
    onClick: (client: Client) => void;
    isSelected?: boolean;
    // --- NOVAS PROPS DE AÇÃO ---
    onEdit?: (client: Client) => void;
    onDelete?: (client: Client) => void;
}

export const ClientListItem: React.FC<ClientListItemProps> = ({ 
    client, 
    onClick, 
    isSelected = false,
    onEdit,
    onDelete
}) => {
    
    const baseClasses = "p-3 rounded-lg cursor-pointer transition border group relative"; // Adicionado relative
    const stateClasses = isSelected 
        ? "bg-gray-800 border-accent-secondary shadow-md" 
        : "border-transparent hover:bg-gray-700 hover:border-gray-600";

    // Função auxiliar para evitar propagação do clique (selecionar o card)
    const handleAction = (e: React.MouseEvent, action?: (c: Client) => void) => {
        e.stopPropagation();
        if (action) action(client);
    };

    return (
        <div 
            onClick={() => onClick(client)}
            className={`${baseClasses} ${stateClasses}`}
        >
            <div className="flex justify-between items-start">
                
                {/* Lado Esquerdo: Dados */}
                <div className="flex-1 pr-2">
                    <h3 className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                        {client.name}
                    </h3>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                        {client.document || 'Lead (Sem Doc)'}
                    </p>
                    
                    {/* Informação Secundária */}
                    <div className="mt-2 flex items-center text-xs text-gray-400">
                        {client.email ? (
                            <>
                                <FaEnvelope className="mr-1.5 w-3 h-3 text-gray-600 group-hover:text-accent-primary transition-colors" />
                                <span className="truncate max-w-[140px]">{client.email}</span>
                            </>
                        ) : (
                            <>
                                <FaBuilding className="mr-1.5 w-3 h-3 text-gray-600" />
                                <span className="italic opacity-50">Sem contato</span>
                            </>
                        )}
                    </div>
                </div>
                
                {/* Lado Direito: Status e Ações */}
                <div className="flex flex-col items-end space-y-2">
                    
                    {/* Badge de Status */}
                    <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border ${
                        client.isActive 
                            ? 'bg-green-900/20 text-green-400 border-green-900/30' 
                            : 'bg-red-900/20 text-red-400 border-red-900/30'
                    }`}>
                        {client.isActive ? 'Ativo' : 'Inativo'}
                    </span>

                    {/* --- BOTÕES DE AÇÃO (Só aparecem no Hover ou se Selecionado) --- */}
                    <div className={`flex space-x-2 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200`}>
                        
                        {/* Botão Editar */}
                        <button 
                            onClick={(e) => handleAction(e, onEdit)}
                            className="p-1.5 text-gray-400 hover:text-accent-secondary hover:bg-gray-600 rounded transition"
                            title="Editar Cliente"
                        >
                            <FaEdit className="w-3 h-3" />
                        </button>

                        {/* Botão Excluir/Ativar */}
                        <button 
                            onClick={(e) => handleAction(e, onDelete)}
                            className={`p-1.5 rounded transition ${client.isActive 
                                ? 'text-gray-400 hover:text-danger hover:bg-gray-600' 
                                : 'text-gray-400 hover:text-success hover:bg-gray-600'}`}
                            title={client.isActive ? "Desativar (Lixeira)" : "Reativar"}
                        >
                            {client.isActive ? <FaTrash className="w-3 h-3" /> : <FaUndo className="w-3 h-3" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};