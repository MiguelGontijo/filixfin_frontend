// src/core/components/client/ClientModal.tsx

import React from 'react';
import { FaTimes, FaUserPlus, FaUserEdit } from 'react-icons/fa';
import { Client } from '@/core/client/types/client';
import { ClientForm } from './ClientForm'; // Importa o formulário unificado

interface ClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    /**
     * Callback para recarregar os dados da lista pai após sucesso.
     */
    onSuccess: () => void; 
    /**
     * Se fornecido, o modal entra em modo de EDIÇÃO. Se undefined, modo CRIAÇÃO.
     */
    currentClient?: Client;
}

/**
 * @component ClientModal
 * @description Modal container que renderiza o formulário de cliente (ClientForm).
 * @update Refatorado para usar o componente ClientForm unificado, eliminando código duplicado.
 */
export const ClientModal: React.FC<ClientModalProps> = ({ 
    isOpen, 
    onClose, 
    onSuccess,
    currentClient 
}) => {
    
    const isEditing = !!currentClient;

    // Handler intermediário para garantir que o modal feche após o sucesso do form
    const handleSuccess = () => {
        onSuccess(); // Notifica o pai (refresh na tabela)
        onClose();   // Fecha o modal
    };
    
    if (!isOpen) return null;

    return (
        // Overlay com Backdrop Blur (Padrão Visual Glassmorphism)
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center transition-all animate-fade-in p-4">
            
            {/* Container do Modal */}
            <div 
                className="bg-base-metallic p-6 rounded-xl shadow-2xl w-full max-w-lg border border-gray-600 transform transition-all scale-100 flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                
                {/* Header */}
                <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        {isEditing ? (
                            <>
                                <FaUserEdit className="mr-3 text-accent-secondary" /> 
                                <span className="truncate max-w-[300px]">Editar: {currentClient.name}</span>
                            </>
                        ) : (
                            <>
                                <FaUserPlus className="mr-3 text-accent-primary" />
                                Novo Cliente / Lead
                            </>
                        )}
                    </h2>
                    
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-white hover:bg-gray-700 rounded-full p-2 transition duration-200 focus:outline-none"
                        title="Fechar (Esc)"
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                {/* Corpo (Scrollável se necessário) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    {/* Renderiza o Formulário Unificado */}
                    <ClientForm 
                        client={currentClient}
                        onSuccess={handleSuccess}
                        showSubmitButton={true} // No modal, o botão fica dentro do form
                    />
                </div>

            </div>
        </div>
    );
};