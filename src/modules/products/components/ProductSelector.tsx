// src/modules/products/components/ProductSelector.tsx

import React, { useState, useRef, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useProducts } from '../hooks/useProducts';
import { Product } from '../types';

interface ProductSelectorProps {
    value: string; 
    onChange: (text: string) => void;
    onSelect: (product: Product) => void; 
    placeholder?: string;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({ 
    value, 
    onChange, 
    onSelect,
    placeholder = "Descreva o item ou busque..." 
}) => {
    
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    
    // Hook de produtos
    const { products, isLoading, setSearchTerm } = useProducts();

    // Fecha ao clicar fora
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        onChange(text); 
        setSearchTerm(text); 
        if (text.length > 1) setIsOpen(true); 
    };

    const handleSearchClick = () => {
        setSearchTerm(value);
        setIsOpen(!isOpen);
    };

    const handleSelectItem = (product: Product) => {
        onSelect(product);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <div className="flex relative">
                <input
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onFocus={() => { if(value) setIsOpen(true) }}
                    className="w-full bg-gray-900 border border-gray-600 rounded-l px-2 py-1 text-white text-xs focus:border-accent-primary focus:outline-none placeholder-gray-600"
                    placeholder={placeholder}
                />
                <button
                    type="button"
                    onClick={handleSearchClick}
                    className="bg-gray-700 hover:bg-accent-primary hover:text-base-dark text-gray-400 px-3 py-1 rounded-r border-y border-r border-gray-600 transition flex items-center justify-center"
                    title="Buscar no Catálogo"
                >
                    {isLoading ? <span className="animate-spin text-[10px]">⏳</span> : <FaSearch size={10} />}
                </button>
            </div>

            {/* Dropdown de Resultados */}
            {/* CORREÇÃO: z-[9999] para garantir que fique acima de tudo */}
            {isOpen && (
                <div className="absolute top-full left-0 w-full bg-gray-800 border border-gray-600 rounded-b shadow-xl z-[9999] max-h-60 overflow-y-auto custom-scrollbar mt-0.5">
                    {products.length === 0 && !isLoading ? (
                        <div className="p-3 text-[10px] text-gray-500 text-center">
                            Nenhum produto encontrado.
                            <br/>
                            <span className="italic">Continue digitando para modo manual.</span>
                        </div>
                    ) : (
                        <ul>
                            {products.map(product => (
                                <li 
                                    key={product.id}
                                    onClick={() => handleSelectItem(product)}
                                    className="p-2 hover:bg-gray-700 cursor-pointer border-b border-gray-700/50 last:border-0 flex justify-between items-center group"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-xs text-white font-bold group-hover:text-accent-primary transition-colors">
                                            {product.title}
                                        </span>
                                        <span className="text-[9px] text-gray-500 font-mono">
                                            SKU: {product.sku || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="text-xs font-bold text-green-400">
                                        R$ {product.price.toFixed(2)}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};