'use client';

import React, { ReactNode } from 'react';
import { FaSearch, FaPlus, FaSync } from 'react-icons/fa';

// --- Contratos ---
import { ListMode } from '../types';

/**
 * @interface CrudListHeaderProps
 * @description Contrato estrito de dependências do Cabeçalho.
 * Baseado no Princípio da Inversão de Controle (IoC), o cabeçalho não gerencia
 * seu próprio estado de busca, ele apenas emite eventos para o Maestro (CrudLayout).
 */
export interface CrudListHeaderProps {
    /** Nome do módulo (Ex: "Clientes", "Deals") */
    title: string;
    
    /** 🎨 ÍCONE DE IDENTIDADE (Classe Ouro)
     * @description Recebe o ícone semântico injetado pela configuração do módulo.
     * Substitui ícones estáticos para dar vida e contexto ao Master Data.
     */
    icon?: ReactNode;

    /** Descrição de apoio (Usado apenas no modo Master Data / Tabela) */
    description?: string;
    /** O Roteador Visual: Define se renderiza o modo Tabela (Largo) ou Cards (Estreito) */
    listMode: ListMode;
    
    /** Termo atual digitado no input de busca */
    searchTerm: string;
    /** Emissor de evento quando o usuário digita no input */
    onSearchChange: (value: string) => void;
    
    /** Ação de abertura da "Impressora 3D" (Formulário de Criação) */
    onOpenCreate: () => void;
    /** Ação de recarregamento manual dos dados */
    onRefresh: () => void;
    /** Estado de carregamento global para animar o ícone de sincronização */
    isLoading: boolean;
}

/**
 * ============================================================================
 * 🎩 OPERÁRIO VISUAL: CrudListHeader (O Cabeçalho Polimórfico)
 * @description Separação de Preocupações (SoC) aplicada à Interface de Usuário.
 * Este componente isola toda a complexidade do HTML/CSS do topo da listagem.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Identidade Dinâmica):
 * - Agnosticismo Visual: Remove ícones fixos (hardcoded) em favor da injeção 
 * via CrudConfig, permitindo que cada módulo tenha sua própria "alma".
 * - Fidelidade Visual: Mantém a diagramação aprovada, focando na scannability.
 * ============================================================================
 */
export function CrudListHeader({
    title,
    icon, // 💡 O novo protagonista dinâmico
    description,
    listMode,
    searchTerm,
    onSearchChange,
    onOpenCreate,
    onRefresh,
    isLoading
}: CrudListHeaderProps) {

    // ========================================================================
    // 🃏 ESTRATÉGIA 1: MODO COMPACTO (A Barra Lateral do CRM)
    // ========================================================================
    if (listMode === 'cards') {
        return (
            <div className="flex flex-col border-b border-gray-800 bg-gray-900/50 flex-shrink-0">
                
                {/* 1. Topo: Título e Botão Novo */}
                <div className="flex justify-between items-center p-4">
                    <h2 className="text-sm font-bold text-white flex items-center gap-2 tracking-wide">
                        {/* 🛡️ RENDERIZAÇÃO CLASSE OURO: Só exibe o ícone se ele existir na config */}
                        {icon && <span className="text-gray-400">{icon}</span>}
                        {title}
                    </h2>
                    
                    <button
                        onClick={onOpenCreate}
                        className="flex items-center justify-center gap-1.5 bg-accent-secondary hover:bg-accent-secondary-hover text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95"
                        title={`Cadastrar Novo(a) ${title}`}
                    >
                        <FaPlus className="w-3 h-3" />
                        <span>Novo</span>
                    </button>
                </div>

                {/* 2. Base: Input de Busca */}
                <div className="px-4 pb-4">
                    <div className="relative group w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-500 group-focus-within:text-accent-secondary transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="block w-full pl-9 pr-3 py-2 border border-gray-700 rounded-lg leading-5 bg-base-dark text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-secondary focus:border-accent-secondary text-xs transition-colors shadow-inner"
                        />
                    </div>
                </div>
            </div>
        );
    }

    // ========================================================================
    // 📊 ESTRATÉGIA 2: MODO MASTER DATA (Tabela em Tela Cheia)
    // ========================================================================
    return (
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center flex-shrink-0 mb-6">
            
            <div className="flex items-center gap-3">
                {/* 💡 Versão Master Data com ícone ampliado para impacto visual */}
                {icon && <div className="text-2xl text-accent-primary opacity-80">{icon}</div>}
                <div>
                    <h2 className="text-xl font-bold text-base-text tracking-tight">
                        {title}
                    </h2>
                    {description && (
                        <p className="text-sm text-gray-400 mt-0.5">{description}</p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative w-full md:w-72 group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-500 group-focus-within:text-accent-primary transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-700 rounded-lg leading-5 bg-gray-900 text-base-text placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-primary focus:border-accent-primary sm:text-sm transition-colors shadow-inner"
                    />
                </div>

                <button
                    onClick={onOpenCreate}
                    className="flex items-center justify-center gap-2 bg-accent-primary hover:bg-accent-primary-hover text-base-dark px-5 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-accent-primary/20 active:scale-95 flex-shrink-0"
                    title={`Criar Novo(a) ${title}`}
                >
                    <FaPlus className="w-3 h-3" />
                    <span className="hidden sm:inline">Novo</span>
                </button>

                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="p-2.5 text-gray-400 hover:text-white bg-gray-800 border border-gray-700 rounded-lg transition-colors disabled:opacity-50"
                    title="Sincronizar dados com o servidor"
                >
                    <FaSync className={isLoading ? 'animate-spin' : ''} />
                </button>
            </div>
        </div>
    );
}