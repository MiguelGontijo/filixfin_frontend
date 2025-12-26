'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaMicrophone, FaPaperclip, FaTimes, FaExpandAlt } from 'react-icons/fa';
import { useFilixAI } from '../context/FilixAIContext';
import { AIMessage } from '../types/AITypes';

/**
 * @component ChatInterface
 * @description O painel expandido de interação com a IA.
 */
export const ChatInterface: React.FC = () => {
    const { contextScope, toggleVisibility } = useFilixAI();
    const [inputValue, setInputValue] = useState('');
    
    // Configuração Inicial de Mensagens
    const [messages, setMessages] = useState<AIMessage[]>([
        {
            id: '1',
            role: 'assistant',
            // ALTERAÇÃO: Saudação humanizada e limpa.
            // O contexto já está visível no Header, não precisamos repetir aqui.
            content: 'Olá! Sou a Filix IA. Como posso ajudar você hoje?', 
            
            // TODO: (Futuro) Tornar esta mensagem dinâmica baseada em horário e KPIs
            // Ex: "Bom dia, Miguel. Vejo que o estoque de Bebidas está crítico. Quer analisar?"
            createdAt: new Date()
        }
    ]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll para última mensagem
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        // Adiciona mensagem do usuário
        const newUserMsg: AIMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue,
            createdAt: new Date()
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInputValue('');

        // Mock de resposta (Placebo)
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Entendido. Estou processando sua solicitação...',
                createdAt: new Date()
            }]);
        }, 1000);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-[500px] w-[380px] bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden animate-fade-in-up">
            
            {/* --- Header --- */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700 handle-drag cursor-move">
                <div className="flex items-center gap-2">
                    {/* Indicador Visual do Contexto (A bolinha colorida fica aqui) */}
                    <div className={`w-2 h-2 rounded-full ${
                        contextScope === 'SUPPLY_CHAIN' ? 'bg-orange-500' :
                        contextScope === 'CRM' ? 'bg-blue-500' : 'bg-purple-500'
                    }`}></div>
                    
                    <span className="text-sm font-semibold text-gray-200">
                        Filix IA 
                        {/* O Contexto aparece sutilmente aqui no título */}
                        <span className="text-gray-500 text-xs font-normal ml-1">• {contextScope}</span>
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="text-gray-400 hover:text-white p-1" title="Expandir">
                        <FaExpandAlt className="w-3 h-3" />
                    </button>
                    <button onClick={toggleVisibility} className="text-gray-400 hover:text-white p-1" title="Fechar">
                        <FaTimes className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* --- Área de Mensagens --- */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-base-dark">
                {messages.map((msg) => {
                    const isUser = msg.role === 'user';
                    return (
                        <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                            <div className={`
                                max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed
                                ${isUser 
                                    ? 'bg-accent-primary text-white rounded-br-none' 
                                    : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-none'
                                }
                            `}>
                                {msg.content}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* --- Input Area --- */}
            <div className="p-3 bg-gray-800 border-t border-gray-700">
                <div className="relative flex items-end gap-2 bg-gray-900 p-2 rounded-xl border border-gray-700 focus-within:border-accent-primary transition-colors">
                    
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                        <FaPaperclip className="w-4 h-4" />
                    </button>

                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Pergunte algo ou dê um comando..."
                        className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none resize-none max-h-32 py-2 custom-scrollbar"
                        rows={1}
                        style={{ minHeight: '40px' }}
                    />

                    {inputValue.trim() ? (
                        <button 
                            onClick={handleSend}
                            className="p-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-all mb-0.5"
                        >
                            <FaPaperPlane className="w-3 h-3" />
                        </button>
                    ) : (
                        <button className="p-2 text-gray-400 hover:text-accent-primary transition-colors mb-0.5">
                            <FaMicrophone className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <div className="text-center mt-1">
                    <span className="text-[10px] text-gray-600">IA pode cometer erros. Verifique informações importantes.</span>
                </div>
            </div>
        </div>
    );
};