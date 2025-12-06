// src/features/crm/presentation/CRMContainer.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/core/services/api';
import { FaColumns, FaStream } from 'react-icons/fa';

// Hooks
import { useCRMIntelligence } from '@/features/crm/hooks/useCRMIntelligence';
import { useDeals } from '@/features/crm/hooks/useDeals'; // <--- NOVO

// Tipos e Componentes
import { Client } from '@/core/types/client';
import { DashboardMode } from '@/features/crm/components/client-dashboard/ClientDashboard';
import { CRMWorkstation } from './CRMWorkstation';
import { CRMKanbanView } from './CRMKanbanView'; // <--- NOVO

// Tipo para as abas principais
type CRMView = 'WORKSTATION' | 'KANBAN';

/**
 * @component CRMContainer
 * @description Container Lógico (Smart Component) do módulo CRM.
 * Gerencia estados, regras de negócio e orquestração de abas (Workstation vs Kanban).
 */
export const CRMContainer: React.FC = () => {
    
    // --- 0. NAVEGAÇÃO (ABAS) ---
    const [activeView, setActiveView] = useState<CRMView>('WORKSTATION');

    // --- 1. LÓGICA DE DEALS (KANBAN) ---
    const { 
        deals, 
        isLoading: loadingDeals, 
        error: dealsError, 
        updateDealStatus, 
        refreshDeals 
    } = useDeals();

    // --- 2. LÓGICA DE IA ---
    const { analyzeText, isAnalyzing, analysisResult, error: aiError, clearAnalysis } = useCRMIntelligence();
    const [aiInputText, setAiInputText] = useState('');
    const [originalText, setOriginalText] = useState('');

    // --- 3. LÓGICA DE CONTEXTO E CLIENTES ---
    const [contextClient, setContextClient] = useState<Client | null>(null);
    const [refreshListTrigger, setRefreshListTrigger] = useState(0);
    const [dashboardMode, setDashboardMode] = useState<DashboardMode>('VIEW');

    // --- 4. LÓGICA DE UI (CHAT) ---
    const [activeChatTab, setActiveChatTab] = useState<'WA' | 'TG'>('WA');

    // --- HANDLERS DE CLIENTE ---

    const handleOpenNewClient = () => {
        setContextClient(null);
        setDashboardMode('CREATE');
    };

    const handleOpenEditClient = (client: Client) => {
        setContextClient(client);
        setDashboardMode('EDIT');
    };

    const handleClientSelect = (client: Client | null) => {
        setContextClient(client);
        setDashboardMode('VIEW');
        if (analysisResult) clearAnalysis();
    };

    const handleUpdateSuccess = async () => {
        setRefreshListTrigger(prev => prev + 1);
        setDashboardMode('VIEW');
        if (contextClient?.id) {
            try {
                const res = await api.get<Client>(`/client/${contextClient.id}`);
                setContextClient(res.data);
            } catch (err) {
                console.error("Erro refresh client:", err);
            }
        }
    };

    // --- HANDLERS DE IA ---

    const handleAnalyzeRequest = async (text: string) => {
        setOriginalText(text);
        await analyzeText(text, contextClient?.id);
    };

    const handleAnalysisSuccess = async () => {
        setRefreshListTrigger(prev => prev + 1);
        clearAnalysis();
        setAiInputText('');
        setOriginalText('');
        if (contextClient?.id) {
            try {
                const res = await api.get<Client>(`/client/${contextClient.id}`);
                setContextClient(res.data);
            } catch (err) { console.error(err); }
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)]">
            
            {/* --- HEADER DE NAVEGAÇÃO (ABAS GLOBAIS) --- */}
            <div className="flex items-center space-x-1 bg-base-metallic/50 p-1 rounded-lg w-fit mb-2 border border-gray-700/50 self-start mx-0 mt-0">
                <button
                    onClick={() => setActiveView('WORKSTATION')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                        activeView === 'WORKSTATION' 
                        ? 'bg-accent-secondary text-white shadow-md' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                >
                    <FaStream /> <span>Workstation</span>
                </button>
                <button
                    onClick={() => setActiveView('KANBAN')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                        activeView === 'KANBAN' 
                        ? 'bg-accent-secondary text-white shadow-md' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                >
                    <FaColumns /> <span>Kanban (Deals)</span>
                </button>
            </div>

            {/* --- CONTEÚDO PRINCIPAL --- */}
            <div className="flex-1 min-h-0 px-0 pb-0">
                
                {activeView === 'WORKSTATION' ? (
                    <CRMWorkstation
                        // Dados
                        contextClient={contextClient}
                        dashboardMode={dashboardMode}
                        refreshListTrigger={refreshListTrigger}
                        aiInputText={aiInputText}
                        originalText={originalText}
                        isAnalyzing={isAnalyzing}
                        analysisResult={analysisResult}
                        aiError={aiError}
                        activeChatTab={activeChatTab}

                        // Ações
                        onAiInputChange={setAiInputText}
                        onAnalyzeRequest={handleAnalyzeRequest}
                        onClearAnalysis={clearAnalysis}
                        onAnalysisSuccess={handleAnalysisSuccess}
                        onSelectClient={handleClientSelect}
                        onOpenNewClient={handleOpenNewClient}
                        onOpenEditClient={handleOpenEditClient}
                        onModeChange={setDashboardMode}
                        onUpdateSuccess={handleUpdateSuccess}
                        onTabChange={setActiveChatTab}
                    />
                ) : (
                    <CRMKanbanView 
                        deals={deals}
                        isLoading={loadingDeals}
                        error={dealsError}
                        onDealMove={updateDealStatus}
                        onRefresh={refreshDeals}
                    />
                )}

            </div>
        </div>
    );
};