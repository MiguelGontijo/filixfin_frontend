// src/features/products/components/ProductListGrid.tsx

import React from 'react';
import { FaBox, FaImage, FaCheckCircle, FaTimesCircle, FaExclamationCircle } from 'react-icons/fa';
import { Product, ProductAvailability } from '../types';

interface ProductListGridProps {
    products: Product[];
    isLoading: boolean;
    onSelect: (product: Product) => void;
    selectedId?: string;
}

/**
 * @component ProductListGrid
 * @description Tabela densa para listagem de produtos.
 * Suporta seleção de linha para abrir o detalhe (Master-Detail).
 */
export const ProductListGrid: React.FC<ProductListGridProps> = ({ 
    products, 
    isLoading, 
    onSelect,
    selectedId 
}) => {

    // Helper de Formatação de Preço
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    // Helper de Badge de Status
    const renderStatusBadge = (availability: ProductAvailability) => {
        switch (availability) {
            case ProductAvailability.IN_STOCK:
                return <span className="text-green-400 bg-green-900/30 px-2 py-1 rounded text-[10px] font-bold border border-green-800 flex items-center w-fit"><FaCheckCircle className="mr-1" /> Em Estoque</span>;
            case ProductAvailability.OUT_OF_STOCK:
                return <span className="text-red-400 bg-red-900/30 px-2 py-1 rounded text-[10px] font-bold border border-red-800 flex items-center w-fit"><FaTimesCircle className="mr-1" /> Esgotado</span>;
            case ProductAvailability.PREORDER:
                return <span className="text-blue-400 bg-blue-900/30 px-2 py-1 rounded text-[10px] font-bold border border-blue-800 flex items-center w-fit"><FaExclamationCircle className="mr-1" /> Pré-venda</span>;
            default:
                return <span className="text-gray-400 bg-gray-800 px-2 py-1 rounded text-[10px] border border-gray-700">{availability}</span>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 animate-pulse">
                <FaBox className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs">Carregando catálogo...</p>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 border border-dashed border-gray-700 rounded-lg bg-gray-800/20">
                <FaBox className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm font-medium">Nenhum produto encontrado.</p>
                <p className="text-xs opacity-60 mt-1">Utilize o botão "Novo Produto" para começar.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto bg-base-metallic rounded-lg border border-gray-700 shadow-lg">
            <table className="min-w-full divide-y divide-gray-700 text-left">
                <thead className="bg-gray-800 sticky top-0 z-10">
                    <tr>
                        <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider w-16">Img</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Produto / SKU</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Marca</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider w-32">Preço</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-center w-32">Status</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-center w-24">Tipo</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {products.map((product) => {
                        const isSelected = selectedId === product.id;
                        // Pega a primeira imagem ou null
                        const coverImage = product.images && product.images.length > 0 ? product.images[0] : null;

                        return (
                            <tr 
                                key={product.id} 
                                onClick={() => onSelect(product)}
                                className={`
                                    group cursor-pointer transition-all duration-150
                                    ${isSelected ? 'bg-gray-700/80 border-l-4 border-accent-primary' : 'hover:bg-gray-800 border-l-4 border-transparent'}
                                `}
                            >
                                {/* Imagem (Thumbnail) */}
                                <td className="px-4 py-3">
                                    <div className="w-10 h-10 rounded bg-gray-900 border border-gray-700 flex items-center justify-center overflow-hidden relative">
                                        {coverImage ? (
                                            <img src={coverImage} alt={product.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <FaImage className="text-gray-600 w-4 h-4" />
                                        )}
                                    </div>
                                </td>

                                {/* Título e SKU */}
                                <td className="px-4 py-3">
                                    <div className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                                        {product.title}
                                    </div>
                                    <div className="text-[10px] text-gray-500 font-mono mt-0.5 flex items-center gap-2">
                                        {product.sku ? <span className="bg-gray-800 px-1 rounded">SKU: {product.sku}</span> : <span className="italic opacity-50">Sem SKU</span>}
                                    </div>
                                </td>

                                {/* Marca */}
                                <td className="px-4 py-3 text-xs text-gray-400">
                                    {product.brand || '-'}
                                </td>

                                {/* Preço */}
                                <td className="px-4 py-3">
                                    <div className="text-sm font-bold text-green-400">
                                        {formatCurrency(product.price)}
                                    </div>
                                    {product.promotionalPrice && (
                                        <div className="text-[10px] text-gray-500 line-through decoration-red-500/50">
                                            {formatCurrency(product.promotionalPrice)}
                                        </div>
                                    )}
                                </td>

                                {/* Status */}
                                <td className="px-4 py-3 flex justify-center">
                                    {renderStatusBadge(product.availability)}
                                </td>

                                {/* Tipo */}
                                <td className="px-4 py-3 text-center">
                                    <span className="text-[9px] uppercase font-bold text-gray-500 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
                                        {product.type}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};