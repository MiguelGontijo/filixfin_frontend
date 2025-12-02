
import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useClientMutation } from '@/core/hooks/useClientMutation';

// DTO e Propriedades do Modal
interface ClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; // Callback para recarregar a lista
    // FUTURO: currentClient?: Client para edição
}

/**
 * @component ClientModal
 * @description Modal de Criação de Cliente (Formulário).
 * Porquê: Interage com a ACL e a lógica de isolamento no Backend.
 */
export const ClientModal: React.FC<ClientModalProps> = ({ 
    isOpen, 
    onClose, 
    onSuccess 
}) => {
    
    // 1. ESTADO E HOOKS
    const { createClient, isLoading, error: mutationError } = useClientMutation();
    const [formData, setFormData] = useState({
        name: '',
        document: '',
        email: '',
    });
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Lida com a mudança nos campos
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 2. LÓGICA DE SUBMISSÃO
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        try {
            // Chamada de Criação
            await createClient(formData);
            
            onSuccess(); // Chama recarga da lista
            onClose();   // Fecha o modal
            
        } catch (err: any) {
            // O erro pode ser do Backend (limite excedido 422, conflito 409)
            setSubmitError(mutationError || err.response?.data?.message || 'Falha ao cadastrar cliente.');
        }
    };
    
    if (!isOpen) return null;

    // 3. RENDERIZAÇÃO
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-base-metallic p-6 rounded-lg shadow-2xl w-full max-w-md">
                
                {/* Cabeçalho do Modal */}
                <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
                    <h2 className="text-xl font-bold text-white">
                        Novo Cliente
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                {/* Mensagens de Erro */}
                {submitError && (
                    <div className="p-3 mb-4 text-sm font-medium text-danger bg-red-900/50 rounded-md">
                        {submitError}
                    </div>
                )}

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Nome */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Nome Completo *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white"
                        />
                    </div>
                    
                    {/* Documento (CPF/CNPJ) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300">CPF/CNPJ *</label>
                        <input
                            type="text"
                            name="document"
                            value={formData.document}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white"
                        />
                    </div>

                    {/* Email (Opcional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300">E-mail</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white"
                        />
                    </div>

                    {/* Botão de Ação */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-base-dark bg-accent-secondary hover:bg-violet-600 transition disabled:bg-gray-500"
                    >
                        {isLoading ? 'Cadastrando...' : 'Cadastrar Cliente'}
                    </button>
                </form>
            </div>
        </div>
    );
};