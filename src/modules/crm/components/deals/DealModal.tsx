// src/modules/crm/components/deals/DealModal.tsx

import React from 'react';
import { FaTimes, FaHandshake } from 'react-icons/fa';
import { DealForm } from './DealForm';
import { DealStatus, CRMDeal } from '@/modules/crm/domain/types';

interface DealModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    defaultStatus?: DealStatus;
    
    // --- PROPS PARA EDIÇÃO ---
    dealToEdit?: CRMDeal; // Ajustei o nome para bater com o que vimos no CRMKanbanView (lá estava dealToEdit)
    
    // --- NOVO PROP: Contexto do Funil ---
    pipelineId?: string;
}

export const DealModal: React.FC<DealModalProps> = ({ 
    isOpen, 
    onClose, 
    onSuccess,
    defaultStatus,
    dealToEdit, // Usando o nome mais comum vindo do pai
    pipelineId  // <--- Recebendo o ID
}) => {
    
    if (!isOpen) return null;

    const isEditing = !!dealToEdit;

    return (
        <div className="fixed inset-0 bg-base-dark/70 backdrop-blur-sm z-[9999] flex items-center justify-center transition-all animate-fade-in p-4">
            
            <div 
                className="bg-base-metallic w-full max-w-2xl rounded-xl shadow-2xl border border-gray-600 flex flex-col max-h-[90vh] transform scale-100 transition-all"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-700 bg-gray-800/50 rounded-t-xl">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-accent-secondary/20 rounded-lg text-accent-secondary">
                            <FaHandshake size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">
                                {isEditing ? 'Editar Oportunidade' : 'Nova Oportunidade'}
                            </h2>
                            <p className="text-xs text-gray-400">Defina os detalhes e itens do negócio.</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-white hover:bg-gray-700 p-2 rounded-full transition"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Corpo */}
                <div className="flex-1 overflow-hidden p-6">
                    <DealForm 
                        deal={dealToEdit} // Passa o objeto de edição
                        initialStatus={defaultStatus}
                        
                        // --- AQUI ESTÁ A CONEXÃO ---
                        // Passamos o ID do funil para o formulário saber onde salvar
                        pipelineId={pipelineId}
                        
                        onSuccess={() => { onSuccess(); onClose(); }}
                        onCancel={onClose}
                    />
                </div>
            </div>
        </div>
    );
};