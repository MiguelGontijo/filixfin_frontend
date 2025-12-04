// src/app/[tenantId]/dashboard/crm/page.tsx

"use client";

import React, { useState } from 'react';
import { 
    FaMagic, FaRobot, FaCheckCircle, FaBrain, 
    FaUser, FaMicrophone, FaPaperPlane, FaWhatsapp, FaTelegram 
} from 'react-icons/fa';
import { useCRMIntelligence } from '@/features/crm/hooks/useCRMIntelligence';
import { ClientListWidget } from '@/features/crm/components/client-widget/ClientListWidget';
import { AnalysisActionCard } from '@/features/crm/components/AnalysisActionCard';
import { Client } from '@/core/types/client';

export default function CRMPage() {
    
    // Hooks e Estados de IA
    const { analyzeText, isAnalyzing, analysisResult, error, clearAnalysis } = useCRMIntelligence();
    const [inputText, setInputText] = useState('');
    const [activeChatTab, setActiveChatTab] = useState<'WA' | 'TG'>('WA');
    const [isRecording, setIsRecording] = useState(false);
    
    const [contextClient, setContextClient] = useState<Client | null>(null);

    // --- NOVO: Estado para forçar atualização da lista ---
    const [refreshListTrigger, setRefreshListTrigger] = useState(0);

    const handleAnalyze = async () => {
        if (!inputText.trim()) return;
        await analyzeText(inputText);
    };

    const handleMicClick = () => {
        setIsRecording(!isRecording);
        if (!isRecording) {
            alert("Microfone ativado (Simulação). Em breve: Transcrição em tempo real.");
        }
    };

    const handleClientSelect = (client: Client) => {
        setContextClient(client);
    };

    const handleAnalysisSuccess = () => {
        // 1. Incrementa o trigger para recarregar a lista da esquerda
        setRefreshListTrigger(prev => prev + 1);
        
        // 2. Limpa a análise
        clearAnalysis();
        setInputText('');
    };

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'POSITIVE': return 'text-green-400 border-green-400 bg-green-900/20';
            case 'NEGATIVE': return 'text-red-400 border-red-400 bg-red-900/20';
            case 'TENSE': return 'text-orange-400 border-orange-400 bg-orange-900/20';
            default: return 'text-gray-400 border-gray-400 bg-gray-800';
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] min-h-[600px] w-full">
            
            <div className="grid grid-cols-12 gap-6 h-full">
                
                {/* COLUNA 1: GESTÃO DE BASE 
                    Agora recebe o refreshTrigger. Sempre que ele mudar, a lista recarrega.
                */}
                <ClientListWidget 
                    onSelectClient={handleClientSelect} 
                    refreshTrigger={refreshListTrigger} 
                />

                {/* COLUNA 2: AI INTELLIGENCE LAB */}
                <div className="col-span-6 flex flex-col h-full overflow-hidden">
                    
                    <div className="flex-1 overflow-y-auto pr-2 space-y-6 pb-4">
                        
                        {/* Header Central */}
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-accent-primary/20 rounded-lg">
                                    <FaBrain className="w-6 h-6 text-accent-primary" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-extrabold text-white">CRM Intelligence</h1>
                                    <p className="text-xs text-gray-400">Análise contextual e extração de dados</p>
                                </div>
                            </div>
                            
                            {contextClient && (
                                <div className="bg-accent-secondary/20 border border-accent-secondary/50 px-3 py-1 rounded text-xs text-violet-300 flex items-center">
                                    <FaUser className="mr-2" />
                                    Contexto: <strong>{contextClient.name}</strong>
                                </div>
                            )}
                        </div>

                        {/* Input de IA */}
                        <div className="bg-base-metallic p-4 rounded-xl shadow-lg border border-gray-700 relative">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Input Multimodal
                            </label>
                            
                            <textarea
                                className="w-full h-24 p-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 focus:ring-1 focus:ring-accent-primary focus:outline-none transition resize-none text-sm"
                                placeholder="Digite uma nota, cole um e-mail ou use o microfone..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                            />

                            <div className="flex justify-between items-center mt-3">
                                <button 
                                    onClick={handleMicClick}
                                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                                >
                                    <FaMicrophone />
                                    <span>{isRecording ? 'Gravando...' : 'Gravar Áudio'}</span>
                                </button>

                                <button
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing || !inputText}
                                    className="flex items-center space-x-2 px-6 py-2 bg-accent-primary text-base-dark font-bold rounded-lg hover:bg-orange-500 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <FaMagic className="animate-spin" />
                                            <span>Analisando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaRobot />
                                            <span>Processar Inteligência</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-900/30 border border-red-800 text-red-300 rounded-lg text-sm">
                                <strong>Erro:</strong> {error}
                            </div>
                        )}

                        {/* RESULTADOS DA IA */}
                        {analysisResult && (
                            <div className="space-y-4 animate-fade-in">
                                
                                {/* CARD DE AÇÃO INTELIGENTE (Agora atualiza a lista ao salvar) */}
                                <AnalysisActionCard 
                                    analysis={analysisResult}
                                    content={inputText}
                                    contextClient={contextClient}
                                    onSuccess={handleAnalysisSuccess}
                                />

                                {/* Grid de Análise */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-base-metallic p-4 rounded-xl border border-gray-700">
                                        <h3 className="text-sm font-bold text-gray-400 mb-2 flex items-center">
                                            <FaMagic className="mr-2 text-accent-primary" /> Resumo
                                        </h3>
                                        <p className="text-sm text-gray-300 leading-relaxed">
                                            {analysisResult.summary}
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className={`p-4 rounded-xl border ${getSentimentColor(analysisResult.sentiment)}`}>
                                            <h3 className="text-xs font-bold uppercase opacity-80">Sentimento</h3>
                                            <div className="text-xl font-extrabold">{analysisResult.sentiment}</div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {analysisResult.tags.map((tag, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded border border-gray-600">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Ações Sugeridas */}
                                <div className="bg-base-metallic p-4 rounded-xl border border-gray-700">
                                    <h3 className="text-sm font-bold text-white mb-3 flex items-center">
                                        <FaCheckCircle className="mr-2 text-success" /> Próximos Passos
                                    </h3>
                                    <ul className="space-y-2">
                                        {analysisResult.actionItems.map((item, idx) => (
                                            <li key={idx} className="flex items-start text-sm text-gray-300">
                                                <span className="mr-2 text-accent-primary">•</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                            </div>
                        )}
                    </div>
                </div>

                {/* COLUNA 3: COMUNICAÇÃO (PLACEHOLDER) */}
                <div className="col-span-3 bg-base-metallic rounded-xl border border-gray-700 flex flex-col overflow-hidden shadow-lg">
                    <div className="flex border-b border-gray-700">
                        <button 
                            onClick={() => setActiveChatTab('WA')}
                            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center space-x-2 transition ${activeChatTab === 'WA' ? 'bg-green-900/20 text-green-400 border-b-2 border-green-400' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}
                        >
                            <FaWhatsapp className="w-4 h-4" /> <span>WhatsApp</span>
                        </button>
                        <button 
                            onClick={() => setActiveChatTab('TG')}
                            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center space-x-2 transition ${activeChatTab === 'TG' ? 'bg-blue-900/20 text-blue-400 border-b-2 border-blue-400' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}
                        >
                            <FaTelegram className="w-4 h-4" /> <span>Telegram</span>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto bg-gray-900 p-2">
                        <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-60">
                            {activeChatTab === 'WA' ? <FaWhatsapp className="w-12 h-12 mb-2" /> : <FaTelegram className="w-12 h-12 mb-2" />}
                            <p className="text-xs text-center px-4">
                                Nenhuma conversa ativa.<br/>
                                API não conectada.
                            </p>
                        </div>
                    </div>
                    <div className="p-3 border-t border-gray-700 bg-gray-800">
                        <div className="flex items-center space-x-2">
                            <input 
                                type="text" 
                                placeholder="Digite uma mensagem..." 
                                className="flex-1 bg-gray-900 text-sm text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-gray-500"
                                disabled
                            />
                            <button className="p-2 bg-gray-700 text-gray-400 rounded-lg cursor-not-allowed">
                                <FaPaperPlane />
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}