// src/app/[tenantId]/dashboard/crm/page.tsx

"use client";

import React, { useState } from 'react';
import { FaWhatsapp, FaTelegram, FaPaperPlane, FaUserSlash } from 'react-icons/fa';

// --- HOOKS ---
import { useCRMIntelligence } from '@/features/crm/hooks/useCRMIntelligence';

// --- COMPONENTES (WIDGETS) ---
import { ClientListWidget } from '@/features/crm/components/client-widget/ClientListWidget';
import { AIInputWidget } from '@/features/crm/components/ai-widget/AIInputWidget';
import { AnalysisActionCard } from '@/features/crm/components/AnalysisActionCard';
import { ClientDashboard } from '@/features/crm/components/client-dashboard/ClientDashboard';

// --- TIPOS ---
import { Client } from '@/core/types/client';
import { ClientModal } from '@/core/components/client/ClientModal';

/**
 * @component CRMPage
 * @description Workstation CRM 2.0
 * Layout de 3 Colunas: Gestão/Input (Esq) | Inteligência/Dashboard (Centro) | Comunicação (Dir)
 */
export default function CRMPage() {
    
    // 1. ESTADOS DE INTELIGÊNCIA
    const { analyzeText, isAnalyzing, analysisResult, error: aiError, clearAnalysis } = useCRMIntelligence();
    
    // 2. ESTADOS DE CONTEXTO (CLIENTE)
    const [contextClient, setContextClient] = useState<Client | null>(null);
    const [refreshListTrigger, setRefreshListTrigger] = useState(0);

    // 3. ESTADOS DE UI (CHAT)
    const [activeChatTab, setActiveChatTab] = useState<'WA' | 'TG'>('WA');

    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [clientToEdit, setClientToEdit] = useState<Client | undefined>(undefined);
    
    // --- NOVOS HANDLERS DE MODAL ---
    
    const handleOpenNewClient = () => {
        setClientToEdit(undefined); // Modo Criação
        setIsClientModalOpen(true);
    };

    const handleOpenEditClient = (client: Client) => {
        setClientToEdit(client); // Modo Edição
        setIsClientModalOpen(true);
    };

    const handleModalSuccess = () => {
        // Atualiza a lista (Esquerda)
        setRefreshListTrigger(prev => prev + 1);
        
        // Se estávamos editando o cliente que estava em foco (Centro), atualizamos o contexto dele
        if (clientToEdit && contextClient && clientToEdit.id === contextClient.id) {
             // Hack sênior: Como não temos o objeto atualizado aqui (só o void do sucesso), 
             // confiamos que a lista vai recarregar, ou poderíamos buscar byId.
             // Por simplicidade visual imediata, mantemos assim.
        }
        
        setIsClientModalOpen(false);
        setClientToEdit(undefined);
    };

    // --- HANDLERS ---
    const handleDashboardUpdateSuccess = () => {
        setRefreshListTrigger(prev => prev + 1);
        // Opcional: Se quiser, recarregue também o contextClient buscando do backend pelo ID
        // Para MVP, a lista recarrega e se clicar de novo atualiza.
    };
    
    const handleClientSelect = (client: Client | null) => {
        setContextClient(client);
        // Se mudar o cliente, limpamos qualquer análise anterior pendente para evitar confusão
        if (analysisResult) clearAnalysis();
    };

    // Recebe o texto do AIInputWidget e dispara a análise
    const handleAnalyzeRequest = async (text: string) => {
        // FUTURO: Aqui injetaremos o 'contextClient' no prompt para o RAG
        await analyzeText(text);
    };

    const handleAnalysisSuccess = () => {
        setRefreshListTrigger(prev => prev + 1); // Atualiza a lista da esquerda
        clearAnalysis(); // Limpa o card de ação, voltando para o Dashboard
    };

    const handleEditRequest = (client: Client) => {
        // Este handler pode ser usado para abrir o Modal de Edição diretamente do Dashboard
        // Por enquanto, o ClientListWidget já gerencia isso, mas podemos conectar futuramente.
        console.log("Solicitação de edição via Dashboard:", client.name);
    };

    return (
        <div className="h-[calc(100vh-8rem)] min-h-[600px] w-full">
            
            <div className="grid grid-cols-12 gap-4 h-full">
                
                {/* ================================================================
                  COLUNA 1 (ESQUERDA): GESTÃO & INPUT
                  Span: 3
                  ================================================================
                */}
                <div className="col-span-3 flex flex-col gap-4 h-full">
                    
                    {/* 1.1 Lista de Clientes (Ocupa o espaço restante) */}
                    <div className="flex-1 min-h-0 overflow-hidden rounded-xl shadow-lg border border-gray-700 bg-base-metallic">
                        <ClientListWidget 
                            onSelectClient={handleClientSelect} 
                            refreshTrigger={refreshListTrigger}
                            onNewClient={handleOpenNewClient}
                            onEditClient={handleOpenEditClient}
                        />
                    </div>

                    {/* 1.2 Console de IA (Fixo na base) */}
                    <div className="h-64 flex-shrink-0 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
                        <AIInputWidget 
                            onAnalyze={handleAnalyzeRequest}
                            isAnalyzing={isAnalyzing}
                        />
                    </div>
                </div>


                {/* ================================================================
                  COLUNA 2 (CENTRO): O PALCO (DASHBOARD OU AÇÃO)
                  Span: 6
                  ================================================================
                */}
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
                        // MODO AÇÃO: A IA detectou algo e pede confirmação
                        <div className="flex-1 overflow-y-auto pr-1">
                            <AnalysisActionCard 
                                analysis={analysisResult}
                                content="Texto original processado..." // Futuro: Passar o texto real se necessário
                                contextClient={contextClient}
                                onSuccess={handleAnalysisSuccess}
                            />
                        </div>
                    ) : (
                        // MODO VISUALIZAÇÃO: Dashboard do Cliente Selecionado
                        <div className="flex-1 h-full">
                            <ClientDashboard 
                                client={contextClient} 
                                onUpdateSuccess={handleDashboardUpdateSuccess}
                            />
                        </div>
                    )}
                </div>


                {/* ================================================================
                  COLUNA 3 (DIREITA): COMUNICAÇÃO (OMNICHANNEL)
                  Span: 3
                  ================================================================
                */}
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

                    {/* Área de Chat (Placeholder) */}
                    <div className="flex-1 overflow-y-auto bg-gray-900/50 p-4">
                        {contextClient ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-60">
                                {activeChatTab === 'WA' ? <FaWhatsapp className="w-12 h-12 mb-3" /> : <FaTelegram className="w-12 h-12 mb-3" />}
                                <p className="text-xs text-center">
                                    Histórico de conversas com <strong>{contextClient.name}</strong> vazio.
                                    <br/>(Integração de API pendente)
                                </p>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-700 opacity-40">
                                <FaUserSlash className="w-10 h-10 mb-2" />
                                <p className="text-xs text-center">Selecione um cliente para ver o chat.</p>
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
            {/* Modal de Cliente (Criação/Edição) */}
            <ClientModal
                isOpen={isClientModalOpen}
                onClose={() => setIsClientModalOpen(false)}
                onSuccess={handleModalSuccess}
                currentClient={clientToEdit} 
            />
        </div>
    );
}