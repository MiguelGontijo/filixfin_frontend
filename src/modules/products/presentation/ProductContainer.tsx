// src/features/products/presentation/ProductContainer.tsx

"use client";

import React, { useState } from 'react';
import { FaStream, FaMagic, FaFileImport } from 'react-icons/fa';
import { ProductCatalogue } from './ProductCatalogue';

// Definição das Visões Disponíveis
type ProductView = 'CATALOGUE' | 'INTELLIGENCE';

/**
 * @component ProductContainer
 * @description Container Lógico (Smart Component) do módulo de Produtos.
 * Gerencia a navegação por abas e o estado global da seção.
 */
export const ProductContainer: React.FC = () => {
    
    // Estado de Navegação
    const [activeView, setActiveView] = useState<ProductView>('CATALOGUE');

    return (
        <div className="flex flex-col h-full">
            
            {/* --- HEADER DE NAVEGAÇÃO (ABAS) --- */}
            <div className="flex items-center space-x-1 bg-base-metallic/50 p-1 rounded-lg w-fit mb-2 border border-gray-700/50 self-start mx-0 mt-0">
                
                {/* Aba 1: Catálogo (Default) */}
                <button
                    onClick={() => setActiveView('CATALOGUE')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                        activeView === 'CATALOGUE' 
                        ? 'bg-accent-secondary text-white shadow-md' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                >
                    <FaStream /> <span>Catálogo</span>
                </button>
                
                {/* Aba 2: Inteligência & Importação (Futuro) */}
                <button
                    onClick={() => setActiveView('INTELLIGENCE')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                        activeView === 'INTELLIGENCE' 
                        ? 'bg-accent-secondary text-white shadow-md' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                >
                    <FaMagic /> <span>IA & Importação</span>
                </button>
            </div>

            {/* --- CONTEÚDO PRINCIPAL --- */}
            <div className="flex-1 min-h-0 px-0 pb-0 bg-base-metallic rounded-xl border border-gray-700 shadow-xl overflow-hidden">
                
                {activeView === 'CATALOGUE' ? (
                    // Renderiza a tela Master-Detail que criamos
                    <div className="h-full p-4">
                        <ProductCatalogue />
                    </div>
                ) : (
                    // Placeholder para a próxima jornada
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4 bg-gray-900/50">
                        <div className="p-6 bg-gray-800 rounded-full border border-gray-700 shadow-inner">
                            <FaFileImport className="w-12 h-12 text-gray-600" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-gray-400">Central de Inteligência</h3>
                            <p className="text-sm mt-2 max-w-md">
                                Em breve: Importação em massa (CSV/XML) e enriquecimento de catálogo via Inteligência Artificial.
                            </p>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};