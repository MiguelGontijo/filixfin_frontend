'use client';

import React, { useEffect, useState } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import { useCategoryMutation } from '@/modules/categories/hooks/useCategoryMutation';
import { Category } from '@/modules/categories/types';

interface CategoryFormDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Category | null;
}

/**
 * @component CategoryFormDrawer
 * @description Painel lateral deslizante para Criação/Edição de Categorias.
 * @style Dark/Metallic (Design System)
 */
export const CategoryFormDrawer: React.FC<CategoryFormDrawerProps> = ({ 
    isOpen, 
    onClose, 
    initialData 
}) => {
    // Hooks de Mutação
    const { createCategory, updateCategory } = useCategoryMutation();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estado do Formulário
    const [name, setName] = useState('');
    const [isActive, setIsActive] = useState(true);

    // Efeito: Popula o formulário ao abrir ou trocar o item selecionado
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Modo Edição
                setName(initialData.name);
                // Garante que o toggle reflita o estado real do banco
                setIsActive(initialData.isActive);
            } else {
                // Modo Criação (Reset)
                setName('');
                setIsActive(true);
            }
        }
    }, [isOpen, initialData]);

    // Handler de Submissão
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name.trim()) return;

        setIsSubmitting(true);
        try {
            // Montamos o payload completo para respeitar o Toggle da UI
            const payload = { name, isActive };

            if (initialData) {
                // Update: Obrigatório enviar isActive, senão não conseguimos inativar/ativar
                await updateCategory(initialData.id, payload);
            } else {
                // Create: Enviamos para respeitar caso o usuário crie já inativo
                await createCategory(payload);
            }
            onClose(); // Fecha o drawer após sucesso
        } catch (error) {
            console.error('Erro ao salvar categoria:', error);
            // Idealmente aqui entraria um Toast de erro
        } finally {
            setIsSubmitting(false);
        }
    };

    // Se não estiver aberto, não renderiza nada
    if (!isOpen) return null;

    return (
        // Overlay (Backdrop)
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Fundo escurecido (Clica fora para fechar) */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            ></div>

            {/* O Drawer em si (Painel Lateral) */}
            <div className="relative w-full max-w-md h-full bg-base-metallic border-l border-gray-700 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col">
                
                {/* Cabeçalho */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-700 bg-gray-900/50">
                    <h3 className="text-lg font-semibold text-base-text">
                        {initialData ? 'Editar Categoria' : 'Nova Categoria'}
                    </h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                {/* Corpo do Formulário (Scrollável) */}
                <form id="category-form" onSubmit={handleSubmit} className="flex-1 p-6 space-y-6 overflow-y-auto">
                    
                    {/* Campo: Nome */}
                    <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-400">
                            Nome da Categoria <span className="text-accent-primary">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Bebidas, Eletrônicos..."
                            className="block w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-base-text placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all"
                            autoFocus
                        />
                    </div>

                    {/* Campo: Status (Toggle Visual) */}
                    <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-base-text">Status Ativo</span>
                            <span className="text-xs text-gray-500">Categorias inativas não aparecem no catálogo.</span>
                        </div>
                        
                        <button
                            type="button"
                            onClick={() => setIsActive(!isActive)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-gray-900 ${
                                isActive ? 'bg-emerald-500' : 'bg-gray-600'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    isActive ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>

                </form>

                {/* Rodapé (Ações Fixas) */}
                <div className="p-6 border-t border-gray-700 bg-gray-900/30 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-300 bg-transparent border border-gray-600 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="category-form"
                        disabled={isSubmitting || !name.trim()}
                        className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-accent-primary rounded-lg hover:bg-accent-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-accent-primary/20"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                <span>Salvando...</span>
                            </>
                        ) : (
                            <>
                                <FaSave className="w-4 h-4" />
                                <span>{initialData ? 'Atualizar' : 'Salvar'}</span>
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};