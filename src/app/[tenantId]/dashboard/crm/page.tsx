// src/app/[tenantId]/dashboard/crm/page.tsx

"use client";

import React, { useState } from 'react';
// MODIFICAÇÃO: Novos ícones importados
import { FaMagic, FaRobot, FaCheckCircle, FaTag, FaChartLine, FaBrain, FaUser, FaBuilding, FaEnvelope, FaBullseye, FaSave } from 'react-icons/fa';
import { useCRMIntelligence } from '@/features/crm/hooks/useCRMIntelligence';

/**
 * @component CRMPage
 * @description Página de "Laboratório de IA" para o CRM.
 * Porquê: Agora exibe a Identidade Extraída além da análise de sentimento.
 */
export default function CRMPage() {
    
    const { analyzeText, isAnalyzing, analysisResult, error } = useCRMIntelligence();
    const [inputText, setInputText] = useState('');

    const handleAnalyze = async () => {
        if (!inputText.trim()) return;
        await analyzeText(inputText);
    };

    // Helper para cor do Sentimento
    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'POSITIVE': return 'text-green-400 border-green-400 bg-green-900/20';
            case 'NEGATIVE': return 'text-red-400 border-red-400 bg-red-900/20';
            case 'TENSE': return 'text-orange-400 border-orange-400 bg-orange-900/20';
            default: return 'text-gray-400 border-gray-400 bg-gray-800';
        }
    };
    
    // Helper para traduzir intenção
    const translateIntent = (intent?: string) => {
        const map: Record<string, string> = {
            'NEW_BUSINESS': 'Novo Negócio / Venda',
            'SUPPORT': 'Suporte / Dúvida',
            'FOLLOW_UP': 'Acompanhamento',
            'UNKNOWN': 'Desconhecido'
        };
        return map[intent || ''] || intent || 'N/A';
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
            
            {/* Header */}
            <div className="flex items-center space-x-3 border-b border-gray-700 pb-4">
                <div className="p-3 bg-accent-primary/20 rounded-xl">
                    <FaBrain className="w-8 h-8 text-accent-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold text-white">
                        CRM Intelligence Lab
                    </h1>
                    <p className="text-gray-400">
                        Cole uma conversa, email ou anotação e deixe a IA extrair os insights.
                    </p>
                </div>
            </div>

            {/* Área de Input */}
            <div className="bg-base-metallic p-6 rounded-xl shadow-lg space-y-4">
                <label className="block text-sm font-bold text-gray-300 uppercase tracking-wider">
                    Entrada de Dados (Texto Bruto)
                </label>
                <textarea
                    className="w-full h-32 p-4 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-accent-primary focus:outline-none transition resize-none"
                    placeholder="Ex: O cliente João Silva da Acme Corp ligou pedindo um orçamento para 50 licenças..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                />
                
                <div className="flex justify-end">
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !inputText}
                        className="flex items-center space-x-2 px-6 py-3 bg-accent-primary text-base-dark font-bold rounded-lg hover:bg-orange-500 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform active:scale-95"
                    >
                        {isAnalyzing ? (
                            <>
                                <FaMagic className="animate-spin" />
                                <span>Processando IA...</span>
                            </>
                        ) : (
                            <>
                                <FaRobot />
                                <span>Analisar com IA</span>
                            </>
                        )}
                    </button>
                </div>
                
                {error && (
                    <div className="p-4 bg-red-900/30 border border-red-800 text-red-300 rounded-lg">
                        <strong>Erro:</strong> {error}
                    </div>
                )}
            </div>

            {/* Área de Resultados (Widget de IA) */}
            {analysisResult && (
                <div className="space-y-6 animate-fade-in">
                    
                    {/* --- NOVO: CARD DE IDENTIDADE (QUEM É O CLIENTE?) --- */}
                    {/* Mostra apenas se a IA detectou algo relevante */}
                    {analysisResult.extractedIdentity && (
                        <div className="bg-gray-800 border border-gray-600 p-6 rounded-xl shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-accent-secondary"></div>
                            
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-white flex items-center">
                                        <FaUser className="mr-2 text-accent-secondary" /> Identidade Detectada
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                        A IA identificou os seguintes dados cadastrais na conversa.
                                    </p>
                                </div>
                                
                                {/* Botões de Ação (Fase de Persistência) */}
                                <div className="mt-4 md:mt-0 flex space-x-3">
                                    <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition">
                                        Vincular a Existente
                                    </button>
                                    <button className="flex items-center px-4 py-2 bg-accent-secondary hover:bg-violet-600 text-white rounded-lg text-sm font-bold transition shadow-lg">
                                        <FaSave className="mr-2" /> Salvar Novo Cliente
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* Nome */}
                                <div className="p-3 bg-gray-900 rounded-lg border border-gray-700">
                                    <label className="text-xs text-gray-500 uppercase font-bold">Nome</label>
                                    <div className="text-white font-medium flex items-center mt-1">
                                        {analysisResult.extractedIdentity.personName || <span className="text-gray-600 italic">Não identificado</span>}
                                    </div>
                                </div>
                                {/* Empresa */}
                                <div className="p-3 bg-gray-900 rounded-lg border border-gray-700">
                                    <label className="text-xs text-gray-500 uppercase font-bold">Empresa</label>
                                    <div className="text-white font-medium flex items-center mt-1">
                                        <FaBuilding className="mr-2 text-gray-500" />
                                        {analysisResult.extractedIdentity.companyName || <span className="text-gray-600 italic">Não identificado</span>}
                                    </div>
                                </div>
                                {/* Contato */}
                                <div className="p-3 bg-gray-900 rounded-lg border border-gray-700">
                                    <label className="text-xs text-gray-500 uppercase font-bold">Contato</label>
                                    <div className="text-white font-medium flex items-center mt-1 truncate">
                                        <FaEnvelope className="mr-2 text-gray-500" />
                                        {analysisResult.extractedIdentity.contactInfo || <span className="text-gray-600 italic">Não identificado</span>}
                                    </div>
                                </div>
                                {/* Intenção */}
                                <div className="p-3 bg-gray-900 rounded-lg border border-gray-700">
                                    <label className="text-xs text-gray-500 uppercase font-bold">Intenção</label>
                                    <div className="text-accent-primary font-bold flex items-center mt-1">
                                        <FaBullseye className="mr-2" />
                                        {translateIntent(analysisResult.extractedIdentity.intentType)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- GRID DE ANÁLISE (Existente) --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        <div className="md:col-span-2 space-y-6">
                            {/* Resumo */}
                            <div className="bg-base-metallic p-6 rounded-xl shadow-lg border-l-4 border-accent-primary">
                                <h3 className="text-lg font-bold text-white mb-2 flex items-center">
                                    <FaMagic className="mr-2 text-accent-primary" /> Resumo Executivo
                                </h3>
                                <p className="text-gray-300 leading-relaxed">
                                    {analysisResult.summary}
                                </p>
                            </div>

                            {/* Ações */}
                            <div className="bg-base-metallic p-6 rounded-xl shadow-lg">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                                    <FaCheckCircle className="mr-2 text-success" /> Próximos Passos
                                </h3>
                                <ul className="space-y-3">
                                    {analysisResult.actionItems.map((item, idx) => (
                                        <li key={idx} className="flex items-start p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                                            <input type="checkbox" className="mt-1 mr-3 text-accent-primary rounded focus:ring-0" />
                                            <span className="text-gray-300">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Sentimento */}
                            <div className={`p-6 rounded-xl shadow-lg border-2 ${getSentimentColor(analysisResult.sentiment)}`}>
                                <h3 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-1">
                                    Sentimento
                                </h3>
                                <div className="text-3xl font-extrabold">
                                    {analysisResult.sentiment}
                                </div>
                            </div>

                            {/* Probabilidade */}
                            {analysisResult.dealProbability !== undefined && (
                                <div className="bg-base-metallic p-6 rounded-xl shadow-lg">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">
                                        Probabilidade de Negócio
                                    </h3>
                                    <div className="flex items-center space-x-3">
                                        <FaChartLine className="text-accent-primary w-6 h-6" />
                                        <div className="text-3xl font-bold text-white">
                                            {analysisResult.dealProbability}%
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-700 h-2 rounded-full mt-3">
                                        <div 
                                            className="bg-accent-primary h-2 rounded-full transition-all duration-1000" 
                                            style={{ width: `${analysisResult.dealProbability}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {/* Tags */}
                            <div className="bg-base-metallic p-6 rounded-xl shadow-lg">
                                <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 flex items-center">
                                    <FaTag className="mr-2" /> Tags
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {analysisResult.tags.map((tag, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full border border-gray-600">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}