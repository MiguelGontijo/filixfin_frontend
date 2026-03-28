'use client';

import React, { useMemo } from 'react';
import { FieldValues } from 'react-hook-form';

// --- Tipagens e Contratos ---
import { CrudLayoutProps, FormMode } from './types';

// --- Motores de Estado e Inteligência (Cérebro) ---
import { useCrudLayoutState } from './hooks/useCrudLayoutState';
import { useCrudSearch } from './hooks/useCrudSearch';

// --- Unidade de Inteligência de Dados (UID) ---
import { DataEngine } from './utils/DataEngine';

// --- Operários Visuais Isolados (A Trindade da Lista) ---
import { CrudListHeader } from './views/list/components/CrudListHeader';
import { CrudListFooter } from './views/list/components/CrudListFooter';

// --- Orquestradores (Maestros Burros) ---
import { CrudListOrchestrator } from './views/list/CrudListOrchestrator';
import { CrudFormOrchestrator } from './views/form/CrudFormOrchestrator';

/**
 * ============================================================================
 * 🏛️ COMPONENTE: CrudLayout (O Maestro Visual V4 - Versão Auto-Aware)
 * @description O Layout Universal para Cadastros de Apoio e Master Data.
 * Agora integrado com a DataEngine para processamento automático de Variants e Attributes.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Netflix/Shopify Level):
 * 1. Zero-Config Data Pipeline: Intercepta o fluxo de dados e aplica hidratação 
 * automática sem necessidade de mapeamento manual no Config.
 * 2. Variant & Attribute Intelligence: Promove automaticamente campos de variantes 
 * para a raiz da UI, mantendo a simetria com o backend.
 * 3. Atomic Consistency: Garante que o 'deflate' ocorra antes de qualquer mutação, 
 * preservando a integridade do DTO original.
 * ============================================================================
 */
export function CrudLayout<TData extends FieldValues & { id: string }, TForm extends FieldValues>({
    config,
    hooks,
    listMode = 'table', 
    formMode = FormMode.EDIT,  
    selectedItemId,     
    baseInjectData,
    onFormRequest,      
    onViewRequest       
}: CrudLayoutProps<TData, TForm>) {

    // =========================================================================
    // 🧠 MÁQUINA DE ESTADOS E PROCESSAMENTO AUTONÔMICO
    // =========================================================================
    
    /** 💧 AUTO-HYDRATION: Processamento de Dados de Entrada
     * @description Utiliza a DataEngine para inflar os objetos brutos da API.
     * Resolve o achatamento de Variants e a normalização do container 'attributes'.
     */
    const processedData = useMemo(() => {
        if (!hooks.data) return [];
        return hooks.data.map(item => DataEngine.inflate(item));
    }, [hooks.data]);

    const { viewMode, editingItem, openCreate, openEdit, closeForm } = useCrudLayoutState<TData>();
    
    /** 🔍 MOTOR DE BUSCA: Opera sobre a vitrine já hidratada pela DataEngine */
    const { searchTerm, setSearchTerm, filteredData } = useCrudSearch<TData>(processedData);

    // =========================================================================
    // 🚦 INTERCEPTADORES DE ROTEAMENTO
    // =========================================================================
    
    const handleOpenCreate = () => {
        if (onFormRequest) {
            onFormRequest(baseInjectData ? (baseInjectData as unknown as TData) : null);
        } else {
            openCreate();
        }
    };

    const handleOpenEdit = (item: TData) => {
        if (onFormRequest) {
            onFormRequest(item);
        } else {
            openEdit(item);
        }
    };

    // =========================================================================
    // ⚙️ HANDLERS DE AÇÃO (Transações com a API)
    // =========================================================================
    
    /** 🚀 SUBMISSÃO COM AUTO-DEFLATE
     * @description Antes de enviar para os hooks de mutação, o motor utiliza a 
     * DataEngine para re-empacotar os dados promovidos para a estrutura de 
     * variantes e atributos que o DTO do Backend exige.
     */
    const handleSubmit = async (formData: TForm) => {
        try {
            // 🧪 RE-EMPACOTAMENTO: Encontra o item original para preservar metadados de sistema
            const originalItem = hooks.data.find(i => i.id === (editingItem as any)?.id);
            const apiPayload = DataEngine.deflate(formData, originalItem);

            if (editingItem) {
                await hooks.onUpdate(editingItem.id, apiPayload);
            } else {
                await hooks.onCreate(apiPayload);
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
    // 🖼️ RENDERIZAÇÃO MONUMENTAL (O Palco Limpo e Inteligente)
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
                        onEdit={handleOpenEdit}
                        onDelete={handleDelete}
                        selectedItemId={selectedItemId} 
                        onViewRequest={onViewRequest} 
                    />
                </div>

                {/* 🦶 3. RODAPÉ (Metadados e Contadores) */}
                <CrudListFooter 
                    listMode={listMode}
                    totalItems={filteredData.length}
                />
            </div>

            {/* --- MODO FORMULÁRIO --- */}
            <CrudFormOrchestrator<TData, TForm>
                isOpen={viewMode === 'FORM'}
                onClose={closeForm}
                config={config}
                // O editingItem aqui já passou pelo DataEngine.inflate no processedData
                initialData={editingItem || undefined}
                formMode={formMode}
                onSubmit={handleSubmit}
            />

        </div>
    );
}