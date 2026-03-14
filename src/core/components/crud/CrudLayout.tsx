'use client';

import React, { useState, useMemo } from 'react';
import { FaSearch, FaPlus, FaSync } from 'react-icons/fa';
import { CrudConfig, CrudHooks } from './types';
import { CrudTable } from './CrudTable';
import { CrudForm } from './CrudForm';
import { FieldValues } from 'react-hook-form';

interface CrudLayoutProps<TData extends FieldValues & { id: string }, TForm extends FieldValues> {
    config: CrudConfig<TData, TForm>;
    hooks: CrudHooks<TData, TForm>;
}

/**
 * @component CrudLayout (O Maestro)
 * @description O Layout Universal para Cadastros de Apoio e Master Data simples.
 * Acopla a Tabela, o Formulário e os Hooks de mutação em uma única interface padronizada.
 */
export function CrudLayout<TData extends FieldValues & { id: string }, TForm extends FieldValues>({
    config,
    hooks
}: CrudLayoutProps<TData, TForm>) {

    // =========================================================================
    // 🧠 ESTADOS DO ORQUESTRADOR
    // =========================================================================
    const [searchTerm, setSearchTerm] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<TData | null>(null);

    // =========================================================================
    // 🔍 MOTOR DE BUSCA UNIVERSAL (Client-side)
    // =========================================================================
    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return hooks.data;
        
        const lowerTerm = searchTerm.toLowerCase();
        return hooks.data.filter((item) => {
            // Percorre todos os valores do objeto procurando o termo digitado
            return Object.values(item).some(val => 
                String(val).toLowerCase().includes(lowerTerm)
            );
        });
    }, [hooks.data, searchTerm]);

    // =========================================================================
    // ⚙️ HANDLERS DE AÇÃO
    // =========================================================================
    const handleOpenCreate = () => {
        setEditingItem(null);
        setIsDrawerOpen(true);
    };

    const handleOpenEdit = (item: TData) => {
        setEditingItem(item);
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        setEditingItem(null);
    };

    const handleSubmit = async (formData: TForm) => {
        if (editingItem) {
            // Se tem item em edição, chama o PUT/PATCH
            await hooks.onUpdate(editingItem.id, formData);
        } else {
            // Se não tem, chama o POST
            await hooks.onCreate(formData);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm(`Tem certeza que deseja excluir este registro de ${config.title}?`)) {
            await hooks.onDelete(id);
        }
    };

    // =========================================================================
    // 🖼️ RENDERIZAÇÃO MONUMENTAL
    // =========================================================================
    return (
        <div className="space-y-6 animate-fade-in h-full flex flex-col min-h-0">
            
            {/* --- HEADER E TOOLBAR --- */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center flex-shrink-0">
                
                {/* Título e Botão de Refresh Opcional */}
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
                    {/* Barra de Busca Universal */}
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

                    {/* Botão Novo Registro */}
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center justify-center gap-2 bg-accent-primary hover:bg-accent-primary-hover text-base-dark px-5 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-accent-primary/20 active:scale-95 flex-shrink-0"
                    >
                        <FaPlus className="w-3 h-3" />
                        <span className="hidden sm:inline">Novo</span>
                    </button>

                    {/* Botão de Refresh Silencioso */}
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
                {/* Se der erro na API Global (ex: servidor caiu) */}
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

            {/* --- FÁBRICA (O Formulário Modal) --- */}
            <CrudForm<TData, TForm>
                isOpen={isDrawerOpen}
                onClose={handleCloseDrawer}
                config={config}
                initialData={editingItem}
                onSubmit={handleSubmit}
            />

        </div>
    );
}