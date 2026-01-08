// src/modules/crm/components/client-widget/ClientSearchInput.tsx

import React from 'react';
import { FaSearch } from 'react-icons/fa';

interface ClientSearchInputProps {
    value: string;
    onChange: (newValue: string) => void;
    isLoading?: boolean;
}

/**
 * @component ClientSearchInput
 * @description Campo de busca visual com ícone e estado de loading opcional.
 * * Pure Component: Não possui lógica de negócio, apenas UI.
 */
export const ClientSearchInput: React.FC<ClientSearchInputProps> = ({ 
    value, 
    onChange,
    isLoading = false
}) => {
    return (
        <div className="p-3 border-b border-gray-700 bg-base-metallic">
            <div className="relative">
                {/* Ícone: Alterna entre Lupa e Spinner se estiver carregando */}
                <div className="absolute left-3 top-2.5 text-gray-500 w-4 h-4 flex items-center justify-center">
                    {isLoading ? (
                        <span className="animate-spin h-3 w-3 border-2 border-accent-secondary border-t-transparent rounded-full" />
                    ) : (
                        <FaSearch />
                    )}
                </div>
                
                <input 
                    type="text" 
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Buscar por nome, CPF ou CNPJ..." 
                    className="w-full bg-gray-900 text-sm text-white pl-9 pr-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-accent-secondary focus:ring-1 focus:ring-accent-secondary transition-all placeholder-gray-500"
                />
            </div>
        </div>
    );
};