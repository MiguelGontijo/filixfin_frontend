// src/app/[tenantId]/dashboard/crm/page.tsx

"use client";

import React, { useState } from 'react';
import { FaWhatsapp, FaTelegram, FaPaperPlane } from 'react-icons/fa';

// --- HOOKS ---
import { useCRMIntelligence } from '@/features/crm/hooks/useCRMIntelligence';
// --- COMPONENTES (WIDGETS) ---
import { ClientListWidget } from '@/features/crm/components/client-widget/ClientListWidget';
import { AIInputWidget } from '@/features/crm/components/ai-widget/AIInputWidget';
import { AnalysisActionCard } from '@/features/crm/components/AnalysisActionCard';
// Importamos o componente e o Tipo de modo
import { ClientDashboard, DashboardMode } from '@/features/crm/components/client-dashboard/ClientDashboard';
// --- TIPOS ---
import { Client } from '@/core/types/client';
import { WhatsAppWidget } from '@/features/crm/components/communication/WhatsAppWidget';

/**
 * @component CRMPage
 * @description Workstation CRM 2.0 - Hub Centralizado
 * @update Refatoração Completa: Eliminação de Modais e correção de fluxo de estado pai/filho.
 */
export default function CRMPage() {
    
    // 1. ESTADOS DE INTELIGÊNCIA
    const { analyzeText, isAnalyzing, analysisResult, error: aiError, clearAnalysis } = useCRMIntelligence();
    const [originalText, setOriginalText] = useState('');

    // 2. ESTADOS DE CONTEXTO E NAVEGAÇÃO
    const [contextClient, setContextClient] = useState<Client | null>(null);
    const [refreshListTrigger, setRefreshListTrigger] = useState(0);
    
    // --- NOVO: Controle de Modo do Painel Central ---
    // Substitui os estados de modal (isOpen) e flags internas (isEditing)
    const [dashboardMode, setDashboardMode] = useState<DashboardMode>('VIEW');

    // 3. ESTADOS DE UI (CHAT)
    const [activeChatTab, setActiveChatTab] = useState<'WA' | 'TG'>('WA');

    // --- HANDLERS DE AÇÃO (Orquestrador) ---
    
    // Ação: Botão "+ Novo" na lista lateral
    const handleOpenNewClient = () => {
        setContextClient(null); // Limpa a seleção visual
        setDashboardMode('CREATE'); // Força o painel central para modo de criação
    };

    // Ação: Botão "Editar" (Lápis) no item da lista
    const handleOpenEditClient = (client: Client) => {
        setContextClient(client); // Seleciona o cliente
        setDashboardMode('EDIT'); // Força o painel central para modo de edição
    };

    // Ação: Clique simples no card da lista
    const handleClientSelect = (client: Client | null) => {
        setContextClient(client);
        setDashboardMode('VIEW'); // Garante que voltemos para visualização ao trocar de cliente
        
        if (analysisResult) clearAnalysis(); // Limpa qualquer análise de IA pendente do cliente anterior
    };

    // Callback: Sucesso no salvamento (Formulário completou)
    const handleUpdateSuccess = () => {
        setRefreshListTrigger(prev => prev + 1); // Recarrega a lista lateral
        setDashboardMode('VIEW'); // Retorna o painel para modo de visualização
    };

    // --- HANDLERS DE IA ---

    const handleAnalyzeRequest = async (text: string) => {
        setOriginalText(text);
        await analyzeText(text, contextClient?.id);
    };

    const handleAnalysisSuccess = () => {
        setRefreshListTrigger(prev => prev + 1);
        clearAnalysis();
        setOriginalText('');
    };

    return (
        <div className="h-[calc(100vh-8rem)] min-h-[600px] w-full">
            
            <div className="grid grid-cols-12 gap-4 h-full">
                {/* ================================================================
                  COLUNA 1 (ESQUERDA): GESTÃO & INPUT
                  Span: 3
                  ================================================================*/}
                <div className="col-span-3 flex flex-col gap-4 h-full">
                    
                    {/* 1.1 Lista de Clientes */}
                    <div className="flex-1 min-h-0 overflow-hidden rounded-xl shadow-lg border border-gray-700 bg-base-metallic">
                        <ClientListWidget 
                            onSelectClient={handleClientSelect} 
                            refreshTrigger={refreshListTrigger}
                            onNewClient={handleOpenNewClient}
                            onEditClient={handleOpenEditClient}
                        />
                    </div>

                    {/* 1.2 Console de IA */}
                    <div className="h-64 flex-shrink-0 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
                        <AIInputWidget 
                            onAnalyze={handleAnalyzeRequest}
                            isAnalyzing={isAnalyzing}
                        />
                    </div>
                </div>

                {/* ================================================================
                  COLUNA 2 (CENTRO): O PALCO (DASHBOARD UNIFICADO)
                  Span: 6
                  ================================================================*/}
                <div className="col-span-6 h-full flex flex-col gap-4">
                    
                    {/* ÁREA DE ERRO (GLOBAL DA IA) */}
                    {aiError && (
                        <div className="bg-red-900/40 border border-red-500/50 p-3 rounded-lg text-sm text-red-200 flex items-center justify-between animate-fade-in">
                            <span><strong>Erro na IA:</strong> {aiError}</span>
                            <button onClick={clearAnalysis} className="text-xs underline hover:text-white">Fechar</button>
                        </div>
                    )}

                    {/* CONTEÚDO DINÂMICO */}
                    {analysisResult ? (
                        // MODO AÇÃO IA: Prioridade máxima (sobrepõe o dashboard)
                        <div className="flex-1 overflow-y-auto pr-1">
                            <AnalysisActionCard 
                                analysis={analysisResult}
                                content={originalText}
                                contextClient={contextClient}
                                onSuccess={handleAnalysisSuccess}
                            />
                        </div>
                    ) : (
                        // MODO DASHBOARD (View/Edit/Create)
                        <div className="flex-1 h-full">
                            <ClientDashboard 
                                client={contextClient}
                                mode={dashboardMode} // <--- AQUI ESTAVA O PROBLEMA: Agora passamos o estado correto
                                onModeChange={setDashboardMode} // <--- AQUI: Passamos a função para o filho
                                onUpdateSuccess={handleUpdateSuccess} // Callback de refresh
                            />
                        </div>
                    )}
                </div>

                {/* ================================================================
                  COLUNA 3 (DIREITA): COMUNICAÇÃO (OMNICHANNEL)
                  Span: 3
                  ================================================================*/}
                <div className="col-span-3 bg-base-metallic rounded-xl border border-gray-700 flex flex-col overflow-hidden shadow-lg h-full">
                    
                    {/* Header de Abas */}
                    <div className="flex border-b border-gray-700 bg-gray-800">
                        <button 
                            onClick={() => setActiveChatTab('WA')}
                            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center space-x-2 transition ${activeChatTab === 'WA' ? 'bg-green-900/20 text-green-400 border-b-2 border-green-400' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700'}`}
                        >
                            <FaWhatsapp className="w-4 h-4" /> <span>WhatsApp</span>
                        </button>
                        <button 
                            onClick={() => setActiveChatTab('TG')}
                            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center space-x-2 transition ${activeChatTab === 'TG' ? 'bg-blue-900/20 text-blue-400 border-b-2 border-blue-400' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700'}`}
                        >
                            <FaTelegram className="w-4 h-4" /> <span>Telegram</span>
                        </button>
                    </div>

                    {/* Área de Chat */}
                    <div className="flex-1 overflow-hidden relative bg-gray-900/50">
                        {activeChatTab === 'WA' ? (
                            <WhatsAppWidget />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-60 p-4">
                                <FaTelegram className="w-12 h-12 mb-3" />
                                <p className="text-xs text-center">Integração com Telegram em desenvolvimento.</p>
                            </div>
                        )}
                    </div>

                    {/* Input de Chat */}
                    <div className="p-3 border-t border-gray-700 bg-gray-800">
                        <div className="flex items-center space-x-2">
                            <input 
                                type="text" 
                                placeholder={contextClient ? `Mensagem para ${contextClient.name.split(' ')[0]}...` : "Selecione um cliente..."}
                                className="flex-1 bg-gray-900 text-xs text-white px-3 py-2.5 rounded-lg border border-gray-600 focus:outline-none focus:border-gray-500 disabled:opacity-50"
                                disabled={!contextClient}
                            />
                            <button className="p-2.5 bg-gray-700 text-gray-400 rounded-lg cursor-not-allowed hover:bg-gray-600 disabled:opacity-50">
                                <FaPaperPlane className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}