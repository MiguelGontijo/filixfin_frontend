// src/features/crm/components/client-widget/ClientListItem.tsx

import React from 'react';
import { FaBuilding, FaEnvelope } from 'react-icons/fa';
import { Client } from '@/core/types/client';

interface ClientListItemProps {
    client: Client;
    onClick: (client: Client) => void;
    isSelected?: boolean;
}

/**
 * @component ClientListItem
 * @description Card visual de um cliente individual na lista.
 * * Pure Component: Apenas renderiza os dados recebidos via props.
 */
export const ClientListItem: React.FC<ClientListItemProps> = ({ 
    client, 
    onClick, 
    isSelected = false 
}) => {
    
    // Define estilos condicionais baseados na seleção
    const baseClasses = "p-3 rounded-lg cursor-pointer transition border group";
    const stateClasses = isSelected 
        ? "bg-gray-800 border-accent-secondary shadow-md" 
        : "border-transparent hover:bg-gray-700 hover:border-gray-600";

    return (
        <div 
            onClick={() => onClick(client)}
            className={`${baseClasses} ${stateClasses}`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h3 className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                        {client.name}
                    </h3>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                        {client.document}
                    </p>
                </div>
                
                {/* Badge de Status */}
                <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border ${
                    client.isActive 
                        ? 'bg-green-900/20 text-green-400 border-green-900/30' 
                        : 'bg-red-900/20 text-red-400 border-red-900/30'
                }`}>
                    {client.isActive ? 'Ativo' : 'Inativo'}
                </span>
            </div>

            {/* Informação Secundária (Email ou Empresa se houver) */}
            <div className="mt-2 flex items-center text-xs text-gray-400">
                {client.email ? (
                    <>
                        <FaEnvelope className="mr-1.5 w-3 h-3 text-gray-600 group-hover:text-accent-primary transition-colors" />
                        <span className="truncate max-w-[180px]">{client.email}</span>
                    </>
                ) : (
                    <>
                        <FaBuilding className="mr-1.5 w-3 h-3 text-gray-600" />
                        <span className="italic opacity-50">Sem contato</span>
                    </>
                )}
            </div>
        </div>
    );
};