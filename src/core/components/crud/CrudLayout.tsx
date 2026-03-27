'use client';

import React from 'react';
import { FieldValues } from 'react-hook-form';

// --- Tipagens e Contratos ---
import { CrudLayoutProps } from './types';

// --- Motores de Estado e Inteligência (Cérebro) ---
import { useCrudLayoutState } from './hooks/useCrudLayoutState';
import { useCrudSearch } from './hooks/useCrudSearch';

// --- Operários Visuais Isolados (A Trindade da Lista) ---
import { CrudListHeader } from './lists/CrudListHeader';
import { CrudListFooter } from './lists/CrudListFooter';

// --- Orquestradores (Maestros Burros) ---
import { CrudListOrchestrator } from './orchestrators/CrudListOrchestrator';
import { CrudFormOrchestrator } from './orchestrators/CrudFormOrchestrator';

/**
 * ============================================================================
 * 🏛️ COMPONENTE: CrudLayout (O Maestro Visual V4)
 * @description O Layout Universal para Cadastros de Apoio e Master Data.
 * Agora refatorado com DDD e SOLID (Single Responsibility Principle).
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO:
 * - HTML 100% Declarativo: Não há mais condicionais sujas de renderização. 
 * O Maestro apenas posiciona os blocos (Header, Orchestrator, Footer).
 * - Delegação de Formulário (IoC): Impede a sobreposição de telas ao delegar
 * a renderização do Form para o Palco Central quando instruído pelo pai.
 * ============================================================================
 */
export function CrudLayout<TData extends FieldValues & { id: string }, TForm extends FieldValues>({
    config,
    hooks,
    listMode = 'table', // Padrão: Tabela Master Data
    formMode = 'edit',  // Padrão: Formulário Editável
    selectedItemId,     // Fio de Estado Visual
    baseInjectData,
    onFormRequest,      // 💡 FIO DE DELEGAÇÃO: Se existir, o pai assume o form
    onViewRequest       // 💡 FIO DE VISUALIZAÇÃO: Extrai a intenção de Dossiê/Dashboard
}: CrudLayoutProps<TData, TForm>) { // 🛡️ FIX CLASSE OURO: Usando o contrato oficial direto do types.ts

    // =========================================================================
    // 🧠 MÁQUINA DE ESTADOS E CÉREBRO DE BUSCA
    // =========================================================================
    
    const { viewMode, editingItem, openCreate, openEdit, closeForm } = useCrudLayoutState<TData>();
    const { searchTerm, setSearchTerm, filteredData } = useCrudSearch<TData>(hooks.data);

    // =========================================================================
    // 🚦 INTERCEPTADORES DE ROTEAMENTO (O Conserto do Formulário Esmagado)
    // Avalia se o formulário deve abrir localmente ou se deve ser delegado ao Pai.
    // =========================================================================
    
    const handleOpenCreate = () => {
        if (onFormRequest) {
            onFormRequest(baseInjectData ? (baseInjectData as unknown as TData) : null);
        } else {
            openCreate(); // Ninguém reclamou controle, abre o form localmente
        }
    };

    const handleOpenEdit = (item: TData) => {
        if (onFormRequest) {
            onFormRequest(item); // Avisa o Maestro Central passando os dados do item
        } else {
            openEdit(item); // Abre localmente
        }
    };

    // =========================================================================
    // ⚙️ HANDLERS DE AÇÃO (Transações com a API)
    // =========================================================================
    
    const handleSubmit = async (formData: TForm) => {
        try {
            if (editingItem) {
                await hooks.onUpdate(editingItem.id, formData);
            } else {
                await hooks.onCreate(formData);
            }
            hooks.onRefresh();
            closeForm();
        } catch (error) {
            console.error('[CrudLayout] A transação falhou na API. Mantendo formulário aberto para correção.');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const deleted = await hooks.onDelete(id);
            if (deleted) {
                hooks.onRefresh();
            }
        } catch (error) {
            console.error("[CrudLayout] Erro na deleção:", error);
        }
    };

    // =========================================================================
    // 🖼️ RENDERIZAÇÃO MONUMENTAL (O Palco Limpo e Declarativo)
    // =========================================================================
    return (
        <div className="h-full flex flex-col min-h-0 relative overflow-hidden bg-transparent rounded-xl">
            
            <div 
                className={`
                    flex flex-col h-full transition-all duration-300 ease-in-out
                    ${viewMode === 'FORM' ? 'opacity-0 scale-95 pointer-events-none absolute inset-0' : 'opacity-100 scale-100 relative'}
                `}
            >
                {/* 🎩 1. TOPO (Header Polimórfico) */}
                <CrudListHeader 
                    title={config.title}
                    icon={config.icon}
                    description={config.description}
                    listMode={listMode}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onOpenCreate={handleOpenCreate}
                    onRefresh={() => hooks.onRefresh()}
                    isLoading={hooks.isLoading}
                />

                {/* 👁️ 2. VITRINE (Corpo com Lista/Tabela) */}
                <div className="flex-1 min-h-0 overflow-hidden pb-2">
                    {hooks.error && (
                        <div className="mb-4 mx-4 mt-4 p-3 bg-red-900/20 border border-red-500/30 text-red-400 rounded-lg text-sm text-center animate-fade-in">
                            {hooks.error}
                        </div>
                    )}
                    
                    <CrudListOrchestrator<TData>
                        listMode={listMode}
                        data={filteredData}
                        config={config}
                        isLoading={hooks.isLoading}
                        onEdit={handleOpenEdit} // Passamos o interceptador
                        onDelete={handleDelete}
                        selectedItemId={selectedItemId} 
                        
                        // 💡 A CONEXÃO: Repassamos o fio do Dossiê para a Vitrine
                        onViewRequest={onViewRequest} 
                    />
                </div>

                {/* 🦶 3. RODAPÉ (Metadados e Contadores) */}
                <CrudListFooter 
                    listMode={listMode}
                    totalItems={filteredData.length}
                />
            </div>

            {/* --- MODO FORMULÁRIO (A IMPRESSORA 3D LOCAL) --- */}
            {/* Só será renderizada e vista se onFormRequest NÃO existir e o usuário abrir localmente */}
            <CrudFormOrchestrator<TData, TForm>
                isOpen={viewMode === 'FORM'}
                onClose={closeForm}
                config={config}
                initialData={editingItem || undefined}
                formMode={formMode}
                onSubmit={handleSubmit}
            />

        </div>
    );
}