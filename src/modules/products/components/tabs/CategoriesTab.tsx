'use client';

import React, { useState } from 'react';
import { 
    FaPlus, 
    FaSearch, 
    FaEdit, 
    FaTrash, 
    FaTags 
} from 'react-icons/fa';

// Importando o Hook de Negócio existente (Reuso de Lógica)
import { useCategories } from '@/modules/categories/hooks/useCategories';
import { useCategoryMutation } from '@/modules/categories/hooks/useCategoryMutation';
import { Category } from '@/modules/categories/types';

// Importando o componente local do Drawer
import { CategoryFormDrawer } from './CategoryFormDrawer';

/**
 * @component CategoriesTab
 * @description Gestão de Categorias embarcada no módulo de Produtos.
 * @style Dark/Metallic (Design System)
 */
export const CategoriesTab: React.FC = () => {
    // Integração com a Camada de Dados (Leitura e Escrita)
    const { categories, isLoading } = useCategories();
    const { deleteCategory } = useCategoryMutation();
    
    // Estados Locais de Interface (UI State)
    const [searchTerm, setSearchTerm] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Filtragem Local (Client-Side)
    const filteredCategories = categories?.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    // Handlers
    const handleNewCategory = () => {
        setEditingCategory(null); // Limpa seleção para criar novo
        setIsDrawerOpen(true);
    };

    const handleEditCategory = (category: Category) => {
        setEditingCategory(category); // Passa dados para edição
        setIsDrawerOpen(true);
    };

    const handleDelete = async (id: string) => {
        // Futuro: Substituir por Modal de Confirmação customizado ou IA
        if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
            await deleteCategory(id);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4 animate-pulse">
                <div className="h-8 w-8 bg-gray-700 rounded-full"></div>
                <span className="text-gray-400">Carregando categorias...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            
            {/* --- Toolbar (Busca e Ações) --- */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                
                {/* Barra de Busca Dark */}
                <div className="relative w-full md:w-96 group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-500 group-focus-within:text-accent-primary transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar categoria..."
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-700 rounded-lg leading-5 bg-gray-900 text-base-text placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-primary focus:border-accent-primary sm:text-sm transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Botão de Criação */}
                <button
                    onClick={handleNewCategory}
                    className="flex items-center justify-center gap-2 bg-accent-primary hover:bg-accent-primary/90 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-black/20 active:scale-95"
                >
                    <FaPlus className="w-3 h-3" />
                    <span>Nova Categoria</span>
                </button>
            </div>

            {/* --- Tabela de Categorias --- */}
            <div className="bg-base-metallic rounded-xl border border-gray-700 shadow-xl overflow-hidden">
                
                {filteredCategories.length === 0 ? (
                    // Empty State Dark
                    <div className="flex flex-col items-center justify-center p-16 text-center">
                        <div className="p-4 bg-gray-900 rounded-full mb-4 border border-gray-700">
                            <FaTags className="w-8 h-8 text-gray-600" />
                        </div>
                        <h3 className="text-lg font-medium text-base-text">Nenhuma categoria encontrada</h3>
                        <p className="text-gray-400 mt-1">Crie categorias para organizar seus produtos.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            
                            {/* THEAD */}
                            <thead className="bg-gray-900/50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Nome</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>

                            {/* TBODY */}
                            <tbody className="divide-y divide-gray-700/50">
                                {filteredCategories.map((category) => (
                                    <tr key={category.id} className="hover:bg-gray-700/30 transition-colors group">
                                        
                                        {/* Coluna Nome */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 flex-shrink-0 bg-gray-800 rounded flex items-center justify-center border border-gray-600 text-gray-400">
                                                    <span className="text-xs font-bold">{category.name.substring(0, 2).toUpperCase()}</span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-base-text group-hover:text-accent-primary transition-colors">
                                                        {category.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Coluna Status */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                                                category.isActive 
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${category.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                                {category.isActive ? 'Ativa' : 'Inativa'}
                                            </span>
                                        </td>

                                        {/* Coluna Ações */}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleEditCategory(category)}
                                                    className="text-gray-400 hover:text-accent-primary transition-colors" 
                                                    title="Editar"
                                                >
                                                    <FaEdit className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(category.id)}
                                                    className="text-gray-400 hover:text-danger transition-colors" 
                                                    title="Excluir"
                                                >
                                                    <FaTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Integração do Drawer de Formulário */}
            <CategoryFormDrawer 
                isOpen={isDrawerOpen} 
                onClose={() => setIsDrawerOpen(false)}
                initialData={editingCategory}
            />
        </div>
    );
};