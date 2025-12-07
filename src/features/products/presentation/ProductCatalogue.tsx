// src/features/products/presentation/ProductCatalogue.tsx

import React, { useState } from 'react';
import { FaBoxOpen, FaPlus, FaSearch } from 'react-icons/fa';
import { useProducts } from '@/features/products/hooks/useProducts';
import { ProductListGrid } from '@/features/products/components/ProductListGrid';
import { ProductForm } from '@/features/products/components/ProductForm';
import { Product } from '@/features/products/types';

/**
 * @component ProductCatalogue
 * @description View de Catálogo (Master-Detail).
 * Contém o Grid de Listagem e o Formulário de Edição.
 * @usage Renderizado dentro do ProductContainer (Aba: Catálogo).
 */
export const ProductCatalogue: React.FC = () => {
    
    // 1. Hooks de Dados
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const { 
        products, 
        isLoading, 
        error, 
        searchTerm, 
        setSearchTerm, 
        refreshData 
    } = useProducts(refreshTrigger);

    // 2. Estado de Controle da UI
    const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
    const [isCreating, setIsCreating] = useState(false);

    // Derivado: O formulário deve aparecer?
    const showForm = !!selectedProduct || isCreating;

    // --- HANDLERS ---

    const handleSelectProduct = (product: Product) => {
        setIsCreating(false);
        setSelectedProduct(product);
        // Scroll suave até o formulário (UX)
        setTimeout(() => {
            document.getElementById('product-form-container')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleNewProduct = () => {
        setSelectedProduct(undefined);
        setIsCreating(true);
        setTimeout(() => {
            document.getElementById('product-form-container')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleCancel = () => {
        setSelectedProduct(undefined);
        setIsCreating(false);
    };

    const handleSuccess = () => {
        // Recarrega o grid e fecha o formulário
        setRefreshTrigger(prev => prev + 1);
        handleCancel();
    };

    return (
        <div className="flex flex-col gap-2 h-full min-h-0 animate-fade-in">
            
            {/* --- CABEÇALHO DA VIEW (Ações Específicas do Catálogo) --- */}
            <div className="flex justify-between items-end flex-shrink-0">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <FaBoxOpen className="mr-2 text-accent-secondary" /> Catálogo de Itens
                    </h2>
                    <p className="text-sm text-gray-400">
                        Visualização e cadastro manual de produtos e serviços.
                    </p>
                </div>
                
                <button 
                    onClick={handleNewProduct}
                    className="flex items-center space-x-2 px-4 py-2 bg-accent-primary hover:bg-orange-600 text-base-dark font-bold rounded-lg shadow-md transition transform active:scale-95 text-sm"
                >
                    <FaPlus />
                    <span>Novo Item</span>
                </button>
            </div>

            {/* --- SEÇÃO SUPERIOR: LISTAGEM E BUSCA --- */}
            <div className="flex flex-col gap-4 min-h-[350px] flex-shrink-0">
                
                {/* Barra de Busca */}
                <div className="bg-base-metallic p-2 rounded-lg border border-gray-700 flex items-center">
                    <div className="pl-3 pr-2 text-gray-500">
                        {isLoading ? <span className="animate-spin text-accent-secondary">⏳</span> : <FaSearch />}
                    </div>
                    <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar no catálogo (Nome, SKU, Características)..."
                        className="bg-transparent border-none focus:ring-0 text-white w-full text-sm placeholder-gray-500 h-8"
                    />
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <ProductListGrid 
                        products={products}
                        isLoading={isLoading}
                        onSelect={handleSelectProduct}
                        selectedId={selectedProduct?.id}
                    />
                    
                    {error && (
                        <div className="mt-2 text-xs text-red-400 bg-red-900/10 p-2 rounded text-center border border-red-900/30">
                            {error} - <button onClick={() => refreshData()} className="underline hover:text-white">Tentar novamente</button>
                        </div>
                    )}
                </div>
            </div>

            {/* --- SEÇÃO INFERIOR: DETALHES (MASTER-DETAIL) --- */}
            <div id="product-form-container" className="flex-1 min-h-[450px] flex flex-col transition-all duration-500 pb-1">
                {showForm ? (
                    <div className="h-full flex flex-col animate-fade-in-up">
                        {/* Indicador Visual de Conexão */}
                        <div className="flex items-center gap-2 mb-2 px-4 opacity-50">
                            <div className="w-0.5 h-4 bg-gray-600"></div>
                            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">
                                {isCreating ? 'Área de Criação' : 'Editando Item Selecionado'}
                            </span>
                        </div>

                        {/* O Formulário */}
                        <ProductForm 
                            product={selectedProduct} // Se undefined = Criação
                            onSuccess={handleSuccess}
                            onCancel={handleCancel}
                        />
                    </div>
                ) : (
                    // Placeholder quando nada selecionado
                    <div className="h-full border-t-2 border-dashed border-gray-800 bg-base-metallic/20 rounded-xl flex flex-col items-center justify-center text-gray-600">
                        <FaBoxOpen className="w-16 h-16 mb-4 opacity-20" />
                        <h3 className="text-lg font-bold opacity-50">Editor de Detalhes</h3>
                        <p className="text-sm max-w-md text-center opacity-40 mt-2">
                            Selecione um produto na lista acima para editar seus detalhes, ou clique em "Novo Item".
                        </p>
                    </div>
                )}
            </div>

        </div>
    );
};