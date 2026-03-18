'use client';

import React, { useState, useMemo } from 'react';
import { FaSearch, FaPlus, FaSync } from 'react-icons/fa';
import { CrudConfig, CrudHooks } from './types';
import { CrudTable } from './CrudTable';
import { CrudForm } from './forms/CrudForm';
import { FieldValues } from 'react-hook-form';

interface CrudLayoutProps<TData extends FieldValues & { id: string }, TForm extends FieldValues> {
    config: CrudConfig<TData, TForm>;
    hooks: CrudHooks<TData, TForm>;
}

/**
 * @component CrudLayout (O Maestro)
 * @description O Layout Universal para Cadastros de Apoio e Master Data.
 * Agora equipado com a Máquina de Estados 'View-Swap' (Lista <-> Formulário)
 * garantindo transições suaves (In-Place) sem uso de modais intrusivos.
 */
export function CrudLayout<TData extends FieldValues & { id: string }, TForm extends FieldValues>({
    config,
    hooks
}: CrudLayoutProps<TData, TForm>) {

    // =========================================================================
    // 🧠 MÁQUINA DE ESTADOS DO ORQUESTRADOR
    // =========================================================================
    const [searchTerm, setSearchTerm] = useState('');
    const [editingItem, setEditingItem] = useState<TData | null>(null);
    
    // O coração da transição suave: Define quem está no palco principal
    const [viewMode, setViewMode] = useState<'LIST' | 'FORM'>('LIST');

    // =========================================================================
    // 🔍 MOTOR DE BUSCA UNIVERSAL (Client-side)
    // =========================================================================
    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return hooks.data;
        
        const lowerTerm = searchTerm.toLowerCase();
        return hooks.data.filter((item) => {
            return Object.values(item).some(val => 
                String(val).toLowerCase().includes(lowerTerm)
            );
        });
    }, [hooks.data, searchTerm]);

    // =========================================================================
    // ⚙️ HANDLERS DE AÇÃO (Coreografia de Tela)
    // =========================================================================
    const handleOpenCreate = () => {
        setEditingItem(null);
        setViewMode('FORM'); // Aciona a transição para o formulário
    };

    const handleOpenEdit = (item: TData) => {
        setEditingItem(item);
        setViewMode('FORM'); // Aciona a transição para o formulário
    };

    const handleCloseForm = () => {
        setViewMode('LIST'); // Retorna a tabela suavemente para a tela
        // Aguardamos a animação terminar (300ms) antes de limpar o item para evitar "pulos" visuais
        setTimeout(() => setEditingItem(null), 300);
    };

    const handleSubmit = async (formData: TForm) => {
        if (editingItem) {
            await hooks.onUpdate(editingItem.id, formData);
        } else {
            await hooks.onCreate(formData);
        }
        hooks.onRefresh();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm(`Tem certeza que deseja excluir este registro de ${config.title}?`)) {
            try {
                await hooks.onDelete(id);
                hooks.onRefresh();
            } catch (error) {
                console.error("Erro ao deletar:", error);
            }
        }
    };

    // =========================================================================
    // 🖼️ RENDERIZAÇÃO MONUMENTAL (O Palco)
    // =========================================================================
    return (
        // O Palco: relative e overflow-hidden garantem que o form deslize apenas aqui dentro
        <div className="h-full flex flex-col min-h-0 relative overflow-hidden bg-base-dark rounded-xl">
            
            {/* --- MODO VISUALIZAÇÃO (A TABELA E A BUSCA) --- 
                Quando o form abre, esta div reduz 5% (scale-95) e fica transparente (opacity-0).
                Isso cria a ilusão de profundidade perfeitamente suave.
            */}
            <div 
                className={`
                    flex flex-col h-full space-y-6 transition-all duration-300 ease-in-out
                    ${viewMode === 'FORM' ? 'opacity-0 scale-95 pointer-events-none absolute inset-0' : 'opacity-100 scale-100 relative'}
                `}
            >
                {/* --- HEADER E TOOLBAR --- */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div>
                            <h2 className="text-xl font-bold text-base-text tracking-tight">
                                {config.title}
                            </h2>
                            {config.description && (
                                <p className="text-sm text-gray-400">{config.description}</p>
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
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-700 rounded-lg leading-5 bg-gray-900 text-base-text placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-primary focus:border-accent-primary sm:text-sm transition-colors shadow-inner"
                            />
                        </div>

                        <button
                            onClick={handleOpenCreate}
                            className="flex items-center justify-center gap-2 bg-accent-primary hover:bg-accent-primary-hover text-base-dark px-5 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-accent-primary/20 active:scale-95 flex-shrink-0"
                        >
                            <FaPlus className="w-3 h-3" />
                            <span className="hidden sm:inline">Novo</span>
                        </button>

                        <button
                            onClick={() => hooks.onRefresh()}
                            disabled={hooks.isLoading}
                            className="p-2.5 text-gray-400 hover:text-white bg-gray-800 border border-gray-700 rounded-lg transition-colors disabled:opacity-50"
                            title="Atualizar dados"
                        >
                            <FaSync className={hooks.isLoading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {/* --- VITRINE (A Tabela) --- */}
                <div className="flex-1 min-h-0 overflow-hidden pb-2">
                    {hooks.error && (
                        <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 text-red-400 rounded-lg text-sm text-center">
                            {hooks.error}
                        </div>
                    )}
                    
                    <CrudTable<TData>
                        data={filteredData}
                        columns={config.columns}
                        isLoading={hooks.isLoading}
                        onEdit={handleOpenEdit}
                        onDelete={handleDelete}
                    />
                </div>
            </div>

            {/* --- MODO FORMULÁRIO (A IMPRESSORA 3D) --- 
                Ele mora aqui o tempo todo. Quando viewMode === 'FORM', a prop isOpen vira true
                e ele desliza para dentro do palco cobrindo a tabela desbotada.
            */}
            <CrudForm<TData, TForm>
                isOpen={viewMode === 'FORM'}
                onClose={handleCloseForm}
                config={config}
                initialData={editingItem}
                onSubmit={handleSubmit}
            />

        </div>
    );
}