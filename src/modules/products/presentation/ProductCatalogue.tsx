import React, { useState } from 'react';
import { useParams } from 'next/navigation'; // Necessário para obter o contexto da URL
import { FaBoxOpen, FaPlus, FaSearch } from 'react-icons/fa';

// Hooks e Componentes
import { useProducts } from '@/modules/products/hooks/useProducts';
import { ProductListGrid } from '@/modules/products/components/ProductListGrid';
import { ProductForm } from '@/modules/products/components/ProductForm';
import { Product } from '@/modules/products/types';

/**
 * @component ProductCatalogue
 * @description View principal do catálogo.
 * Implementa o padrão Master-Detail: Lista em cima, Formulário embaixo.
 */
export const ProductCatalogue: React.FC = () => {
    // 1. Contexto: Captura o tenantId da rota atual (ex: /[tenantId]/dashboard/...)
    const params = useParams();
    const tenantId = params.tenantId as string;

    // 2. Estado local para forçar recarregamento se necessário
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    // 3. Hook de Dados (Consumo da API)
    const { 
        products, 
        isLoading, 
        error, 
        searchTerm, 
        setSearchTerm, 
        refreshProducts // CORREÇÃO: Nome atualizado conforme definição no hook useProducts.ts
    } = useProducts(refreshTrigger);

    // 4. Estados de UI (Seleção e Edição)
    const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
    const [isCreating, setIsCreating] = useState(false);

    // Flag derivada: Devemos mostrar o formulário?
    const showForm = !!selectedProduct || isCreating;

    // --- HANDLERS ---

    // Usuário clicou no lápis no Grid
    const handleSelectProduct = (product: Product) => {
        setIsCreating(false);
        setSelectedProduct(product);
        // UX: Scroll suave até a área de edição
        setTimeout(() => {
            document.getElementById('product-form-container')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    // Usuário clicou em "Novo Item"
    const handleNewProduct = () => {
        setSelectedProduct(undefined);
        setIsCreating(true);
        setTimeout(() => {
            document.getElementById('product-form-container')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    // Cancelar edição/criação
    const handleCancel = () => {
        setSelectedProduct(undefined);
        setIsCreating(false);
    };

    // Sucesso ao salvar (callback do form)
    const handleSuccess = () => {
        setRefreshTrigger(prev => prev + 1); // Força refresh da lista
        handleCancel(); // Fecha o form
    };

    const handleDelete = (id: string) => {
        // TODO: Conectar com hook de delete real
        console.log("Delete solicitado para ID:", id);
    };

    return (
        <div className="flex flex-col gap-2 h-full min-h-0 animate-fade-in">
            
            {/* --- CABEÇALHO --- */}
            <div className="flex justify-between items-end flex-shrink-0">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <FaBoxOpen className="mr-2 text-accent-secondary" /> Catálogo de Itens
                    </h2>
                    <p className="text-sm text-gray-400">Visualização e cadastro manual de produtos.</p>
                </div>
                
                <button 
                    onClick={handleNewProduct}
                    className="flex items-center space-x-2 px-4 py-2 bg-accent-primary hover:bg-orange-600 text-base-dark font-bold rounded-lg shadow-md transition transform active:scale-95 text-sm"
                >
                    <FaPlus />
                    <span>Novo Item</span>
                </button>
            </div>

            {/* --- LISTAGEM E BUSCA --- */}
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
                        placeholder="Buscar no catálogo (Nome, SKU...)"
                        className="bg-transparent border-none focus:ring-0 text-white w-full text-sm h-8 placeholder-gray-500"
                    />
                </div>

                {/* Grid de Produtos */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <ProductListGrid 
                        products={products}
                        isLoading={isLoading}
                        tenantId={tenantId}          // Passando o contexto obrigatório
                        onDelete={handleDelete}
                        onSelect={handleSelectProduct} // Habilita o modo de seleção local
                        selectedId={selectedProduct?.id} // Habilita o destaque visual
                    />
                    
                    {error && (
                        <div className="mt-2 text-xs text-red-400 bg-red-900/10 p-2 rounded text-center border border-red-900/30">
                            {error} - <button onClick={() => refreshProducts()} className="underline hover:text-white">Tentar novamente</button>
                        </div>
                    )}
                </div>
            </div>

            {/* --- FORMULÁRIO (ÁREA DE DETALHES) --- */}
            <div id="product-form-container" className="flex-1 min-h-[450px] flex flex-col transition-all duration-500 pb-1">
                {showForm ? (
                    <div className="h-full flex flex-col animate-fade-in-up">
                        {/* Indicador Visual */}
                        <div className="flex items-center gap-2 mb-2 px-4 opacity-50">
                            <div className="w-0.5 h-4 bg-gray-600"></div>
                            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">
                                {isCreating ? 'Novo Cadastro' : 'Editando Item Selecionado'}
                            </span>
                        </div>

                        {/* O Componente de Formulário */}
                        <ProductForm 
                            product={selectedProduct} // undefined = Criação, objeto = Edição
                            onSuccess={handleSuccess}
                            onCancel={handleCancel}
                        />
                    </div>
                ) : (
                    // Estado Vazio (Placeholder)
                    <div className="h-full border-t-2 border-dashed border-gray-800 bg-base-metallic/20 rounded-xl flex flex-col items-center justify-center text-gray-600">
                        <FaBoxOpen className="w-16 h-16 mb-4 opacity-20" />
                        <h3 className="text-lg font-bold opacity-50">Editor de Detalhes</h3>
                        <p className="text-sm max-w-md text-center opacity-40 mt-2">
                            Selecione um produto na lista acima para editar seus detalhes aqui mesmo.
                        </p>
                    </div>
                )}
            </div>

        </div>
    );
};