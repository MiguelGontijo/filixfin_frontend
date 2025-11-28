// src/components/admin/FeatureTable.tsx

"use client";

import React, { useState } from 'react'; // Importar useState
import { useFeatures } from '@/hooks/useFeatures';
import { FaEdit, FaTrash, FaPlus, FaTag, FaCalculator } from 'react-icons/fa';
import { Feature } from '@/types/acl'; // Tipagem correta (de acl)
import { FeatureModal } from './FeatureModal'; // Importar o Modal
import { useFeatureMutation } from '@/hooks/useFeatureMutation'; // Hook de C/U/D
import { FeatureType } from '@/types/acl'; // Tipagem do Tipo (BOOLEAN/QUANTITY)


/**
 * @component FeatureTable
 * @description Tabela de visualização e gerenciamento do Catálogo de Features (Permissões).
 * Porquê: Permite ao Admin Global visualizar e editar as permissões que podem ser atribuídas aos Planos.
 */
export const FeatureTable: React.FC = () => {
    
    // Hooks de Dados e Mutação
    const { features, isLoading, error } = useFeatures(); // FUTURO: Assumindo refreshData
    // const { features, isLoading, error, refreshData } = useFeatures(); // FUTURO: Assumindo refreshData
    const { deleteFeature, isLoading: isDeleting } = useFeatureMutation();

    // --- ESTADO PARA MODAL ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [featureToEdit, setFeatureToEdit] = useState<Feature | undefined>(undefined);
    // -------------------------

    // --- Funções de Callback ---

    // FUTURO: Se houvesse um método refreshData no useFeatures, ele seria invocado aqui.
    // Simulação do sucesso para fechar o modal.
    const handleSuccess = () => {
        // [Implementação Futura: Recarregar dados após sucesso]
        console.log("Feature alterada. Recarregando dados.");
        // refreshData(); 
        setIsModalOpen(false); 
        setFeatureToEdit(undefined);
    };

    // --- Funções de Ação ---
    
    const handleNewFeature = () => {
        setFeatureToEdit(undefined); // Criação de um novo
        setIsModalOpen(true);
    };

    const handleEdit = (feature: Feature) => {
        setFeatureToEdit(feature); // Define a feature a ser editada
        setIsModalOpen(true);
    };
    
    const handleDelete = async (feature: Feature) => {
        // 1. Confirmação
        if (confirm(`Tem certeza que deseja DELETAR a Feature "${feature.name}"? Isso pode quebrar Planos vinculados.`)) {
            
            try {
                // 2. Chamada de Mutação DELETE
                await deleteFeature(feature.id);
                console.log(`Feature ${feature.name} deletada com sucesso.`);
                // [Implementação Futura: Recarregar dados]
                // refreshData();
            } catch (error) {
                // O erro já é tratado no useFeatureMutation, mas podemos logar.
                console.error("Falha ao deletar:", error);
            }
        }
    };

    // --- Helpers de Visualização ---
    const renderTypeBadge = (type: FeatureType) => {
        const isQuantity = type === FeatureType.QUANTITY;
        const colorClass = isQuantity ? 'text-accent-secondary bg-violet-900/40' : 'text-success bg-green-900/40';
        const icon = isQuantity ? <FaCalculator className="w-3 h-3" /> : <FaTag className="w-3 h-3" />;

        return (
            <span className={`inline-flex items-center space-x-1 px-3 py-1 text-xs font-medium rounded-full ${colorClass}`}>
                {icon}
                <span>{isQuantity ? 'Quantitativa' : 'Booleana'}</span>
            </span>
        );
    };

    // --- Tratamento de Estado (Loading / Error) ---

    if (isLoading || isDeleting) {
        return (
            <div className="text-center py-12 text-accent-secondary">
                <span className="animate-spin text-xl">⏳</span> {isDeleting ? 'Deletando Feature...' : 'Carregando Catálogo de Features...'}
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
                    onClick={handleNewFeature} 
                    className="flex items-center space-x-2 px-4 py-2 bg-accent-primary text-base-dark font-bold rounded-lg hover:bg-orange-500 transition duration-150 shadow-lg"
                >
                    <FaPlus />
                    <span>Nova Feature</span>
                </button>
            </div>

            {/* Tabela Responsiva */}
            <div className="overflow-x-auto bg-base-metallic rounded-lg shadow-xl">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Nome / Descrição
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Chave (Key)
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Tipo
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {features.map((feature) => (
                            <tr key={feature.id} className="hover:bg-gray-700 transition duration-100">
                                {/* Nome / Descrição */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-white">{feature.name}</div>
                                    <div className="text-xs text-gray-400 max-w-sm truncate">{feature.description || 'Nenhuma descrição.'}</div>
                                </td>
                                
                                {/* Chave (Key) */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200 font-mono">
                                    {feature.key}
                                </td>
                                
                                {/* Tipo */}
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    {renderTypeBadge(feature.type)}
                                </td>
                                
                                {/* Ações (CRUD) */}
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-3">
                                    <button 
                                        onClick={() => handleEdit(feature)}
                                        className="text-accent-secondary hover:text-violet-400"
                                        title="Editar Feature"
                                    >
                                        <FaEdit className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(feature)}
                                        className="text-danger hover:text-red-600"
                                        title="Deletar Feature"
                                    >
                                        <FaTrash className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {features.length === 0 && !isLoading && !error && (
                <div className="text-center py-8 text-gray-500">
                    Nenhuma Feature cadastrada. Você deve inserir as Features essenciais via Migration.
                </div>
            )}

            {/* --- MODAL DE CRIAÇÃO/EDIÇÃO --- */}
            <FeatureModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                currentFeature={featureToEdit}
                onSuccess={handleSuccess}
            />
            {/* ------------------------------- */}
        </div>
    );
};