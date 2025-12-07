'use client';

import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useFeatureMutation } from '@/core/hooks/useFeatureMutation';
import { Feature, FeatureKey, FeatureType } from '@/core/types/acl';

// Propriedades do Modal
interface FeatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    // Se estiver em modo de edição, 'feature' terá dados
    currentFeature?: Feature; 
    onSuccess: () => void; // Callback para recarregar a tabela após sucesso
}

/**
 * @component FeatureModal
 * @description Modal de Criação e Edição de Features para o Admin Global.
 * Porquê: Centraliza o formulário e a lógica de mutação (POST/PATCH/DELETE).
 */
export const FeatureModal: React.FC<FeatureModalProps> = ({ 
    isOpen, 
    onClose, 
    currentFeature, 
    onSuccess 
}) => {
    
    // 1. ESTADO DO FORMULÁRIO
    const isEditing = !!currentFeature;
    const { createFeature, updateFeature, isLoading, error } = useFeatureMutation();
    
    const [formData, setFormData] = useState({
        key: currentFeature?.key || '' as FeatureKey,
        name: currentFeature?.name || '',
        description: currentFeature?.description || '',
        type: currentFeature?.type || FeatureType.BOOLEAN, // Default: Booleana
    });
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Sincroniza o formulário ao trocar a feature de edição
    useEffect(() => {
        setFormData({
            key: currentFeature?.key || '' as FeatureKey,
            name: currentFeature?.name || '',
            description: currentFeature?.description || '',
            type: currentFeature?.type || FeatureType.BOOLEAN,
        });
        setSubmitError(null);
    }, [currentFeature, isOpen]);

    // Lida com a mudança nos campos do formulário
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    // 2. LÓGICA DE SUBMISSÃO
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        try {
            if (isEditing && currentFeature) {
                // Rota PATCH: Edição
                await updateFeature(currentFeature.id, formData);
                
            } else {
                // Rota POST: Criação
                // Validação sênior: Garantir que 'key' não está vazia na criação
                if (!formData.key) {
                    setSubmitError('A chave da Feature é obrigatória para a criação.');
                    return;
                }
                await createFeature(formData as any); // Usamos 'as any' para forçar o tipo, o Backend valida
            }
            
            onSuccess(); // Chama a recarga da tabela
            onClose();   // Fecha o modal
            
        } catch (err: any) {
            // Usa o erro retornado pelo hook (que já mapeia o erro do Backend)
            setSubmitError(error || err.response?.data?.message || 'Ocorreu um erro desconhecido.');
        }
    };
    
    if (!isOpen) return null;

    // 3. RENDERIZAÇÃO
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-base-metallic p-6 rounded-lg shadow-2xl w-full max-w-lg">
                
                {/* Cabeçalho do Modal */}
                <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
                    <h2 className="text-xl font-bold text-white">
                        {isEditing ? `Editar Feature: ${currentFeature?.name}` : 'Criar Nova Feature'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                {/* Mensagens de Erro */}
                {(submitError || error) && (
                    <div className="p-3 mb-4 text-sm font-medium text-danger bg-red-900/50 rounded-md">
                        {submitError || error}
                    </div>
                )}

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Campo KEY (Somente leitura na Edição) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300">
                            Chave Única (Key)
                        </label>
                        <input
                            type="text"
                            name="key"
                            value={formData.key}
                            onChange={handleChange}
                            readOnly={isEditing} 
                            required
                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm bg-gray-700 text-white 
                                ${isEditing ? 'cursor-not-allowed bg-gray-600' : ''}`}
                            placeholder="EX: CLIENTE_ADD"
                        />
                    </div>

                    {/* Campo Nome */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300">
                            Nome Amigável
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white"
                            placeholder="Ex: Adicionar Novo Cliente"
                        />
                    </div>
                    
                    {/* Campo Tipo (Booleana/Quantitativa) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300">
                            Tipo de Controle
                        </label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white"
                        >
                            <option value={FeatureType.BOOLEAN}>Booleana (Sim/Não)</option>
                            <option value={FeatureType.QUANTITY}>Quantitativa (Limite Numérico)</option>
                        </select>
                    </div>

                    {/* Campo Descrição */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300">
                            Descrição (Opcional)
                        </label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white"
                            placeholder="Detalhe o uso da feature"
                        />
                    </div>
                    
                    {/* Botão de Ação */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-base-dark bg-accent-secondary hover:bg-violet-600 transition disabled:bg-gray-500"
                    >
                        {isLoading ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Criar Feature')}
                    </button>
                </form>
            </div>
        </div>
    );
};