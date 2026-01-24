// ===== FILE: src/core/ai/components/ChatInterface.tsx =====

import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaExpandAlt, FaExclamationTriangle } from 'react-icons/fa';

// --- COMPONENTES & UI ---
import { AgentInput } from './AgentInput';
import { SmartProposalCard } from './SmartProposalCard';

// --- LÓGICA & SERVIÇOS (MOTOR V8) ---
import { useAIChatService } from '../hooks/useAIChatService';
import { useFilixAI } from '../context/FilixAIContext';
import { AIMessage, AIActionProposal } from '../types/AITypes';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface ChatInterfaceProps {
    /**
     * Callback acionado ao clicar no 'X'.
     * Essencial para o modo Flutuante (FloatingWidget).
     */
    onClose?: () => void;

    /**
     * ID do Tenant atual.
     * Necessário para o Backend V8 validar permissões de uso das Tools.
     * @default 'demo-tenant' (Fallback para evitar crash em dev)
     */
    tenantId?: string;

    /**
     * ID do Plano atual.
     * Necessário para verificar cotas (ex: limite de produtos).
     * @default 'demo-plan'
     */
    planId?: string;
    
    /**
     * Controla se o chat está em modo tela cheia (futuro).
     */
    isExpanded?: boolean;
}

/**
 * @component ChatInterface
 * @description O Cockpit Principal da IA (Motor V8).
 * * RESPONSABILIDADES:
 * 1. Renderizar o histórico de mensagens.
 * 2. Gerenciar o input do usuário.
 * 3. Exibir Cards de Proposta (SmartProposalCard) quando a IA sugere ações.
 * 4. Garantir visual SÓLIDO (sem transparência) para leitura profissional.
 */
export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
    onClose,
    tenantId = 'demo-tenant', 
    planId = 'demo-plan' 
}) => {
    
    // --- 1. HOOKS E CONTEXTO ---
    
    // Pega o escopo semântico (Estou no CRM? Estou no Estoque?)
    const { contextScope } = useFilixAI();
    
    // Hook de Serviço: Conecta com a API Real (/api/v1/ai/chat)
    const { sendMessage, confirmAction, isLoading, error } = useAIChatService();

    // Ref para garantir que o chat role para baixo automaticamente
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // --- 2. ESTADO LOCAL ---

    // Estado inicial com mensagem de boas-vindas contextualizada
    const [messages, setMessages] = useState<AIMessage[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: `Olá! Sou seu Assistente Inteligente.\nEstou conectado ao módulo: **${contextScope}**.\nComo posso ajudar?`,
            timestamp: new Date()
        }
    ]);

    // --- 3. EFEITOS (Side Effects) ---

    // Monitora a lista de mensagens: Sempre que chegar uma nova, rola para o fim.
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    // --- 4. LÓGICA DE NEGÓCIO (Handlers) ---

    /**
     * Processa o envio de texto pelo usuário.
     * 1. Adiciona mensagem localmente (Optimistic UI).
     * 2. Chama o Backend.
     * 3. Adiciona resposta da IA.
     */
    const handleSendMessage = async (text: string) => {
        if (!text.trim()) return;

        // Cria a mensagem do usuário visualmente
        const userMsg: AIMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);

        // Dispara a requisição real
        const response = await sendMessage({
            message: text,
            scope: contextScope,
            tenantId,
            planId
        });

        // Se houve resposta válida, adiciona ao chat
        if (response) {
            setMessages(prev => [...prev, response]);
        }
    };

    /**
     * Ação: Usuário clicou em [CONFIRMAR] no Card de Proposta.
     * 1. Trava o card (status EXECUTED).
     * 2. Envia comando de confirmação ao Backend.
     * 3. Atualiza o card para APPROVED se der certo.
     */
    const handleConfirmProposal = async (proposal: AIActionProposal, messageId: string) => {
        // Feedback imediato: muda botão para "Processando..."
        updateMessageStatus(messageId, 'EXECUTED'); 

        // Chama o serviço de confirmação
        const response = await confirmAction(proposal, {
            scope: contextScope,
            tenantId,
            planId
        });

        if (response) {
            // Sucesso: Marca visualmente como Aprovado e mostra a resposta da IA
            updateMessageStatus(messageId, 'APPROVED');
            setMessages(prev => [...prev, response]);
        } else {
            // Falha: Reverte para Pendente para tentar de novo ou mostra erro
            updateMessageStatus(messageId, 'PENDING');
        }
    };

    /**
     * Ação: Usuário clicou em [CANCELAR/REJEITAR].
     * Apenas atualiza o visual localmente, não precisa ir ao backend.
     */
    const handleRejectProposal = (messageId: string) => {
        updateMessageStatus(messageId, 'REJECTED');
        
        // Adiciona uma nota de sistema discreta
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'system',
            content: 'Ação cancelada pelo usuário.',
            timestamp: new Date()
        }]);
    };

    /**
     * Helper para atualizar o status de uma mensagem específica sem recriar todo o array.
     */
    const updateMessageStatus = (msgId: string, newStatus: AIMessage['proposalStatus']) => {
        setMessages(prev => prev.map(msg => 
            msg.id === msgId 
                ? { ...msg, proposalStatus: newStatus }
                : msg
        ));
    };

    // ============================================================================
    // RENDERIZAÇÃO
    // ============================================================================

    return (
        // CONTAINER PRINCIPAL
        // FIX: Usando bg-gray-900 (Sólido Absoluto) para garantir opacidade total.
        // O border-gray-700 cria a delimitação da janela.
        <div className="flex flex-col h-full bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden font-sans">
            
            {/* === CABEÇALHO (HEADER) === 
              FIX: bg-gray-800 Sólido. 
              Classe 'handle-drag' permite arrastar o widget flutuante.
            */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800 handle-drag cursor-move select-none">
                <div className="flex items-center gap-3">
                    {/* Ícone do Robô */}
                    <div className="p-2 rounded-full bg-accent-primary text-base-dark shadow-lg shadow-accent-primary/20">
                        <FaRobot size={18} />
                    </div>
                    
                    {/* Título e Status */}
                    <div>
                        <h3 className="font-bold text-gray-100 text-sm tracking-wide">
                            Filix AI
                        </h3>
                        {/* Indicador de Contexto (CRM, Estoque, etc) */}
                        <span className="flex items-center gap-1.5 text-[10px] text-green-400 font-medium uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                            {contextScope === 'GLOBAL' ? 'Online' : `Contexto: ${contextScope}`}
                        </span>
                    </div>
                </div>
                
                {/* Ações da Janela */}
                <div className="flex items-center gap-1">
                    <button 
                        className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
                        title="Expandir (Em breve)"
                    >
                        <FaExpandAlt size={14} />
                    </button>
                    
                    {/* Botão Fechar (Renderiza apenas se a prop onClose existir) */}
                    {onClose && (
                        <button 
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-700 transition-colors"
                            title="Fechar Assistente"
                        >
                            <FaTimes size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* === CORPO DO CHAT (BODY) === 
              FIX: bg-gray-900 Sólido. Fundo escuro profundo.
            */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-900">
                {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}
                    >
                        
                        {/* BALÃO DE MENSAGEM 
                           Logica de Cores:
                           - User: Accent Primary (Verde Neon) + Texto Escuro
                           - Assistant: Gray-800 (Sólido) + Texto Claro
                           - System: Texto cinza discreto
                        */}
                        <div className={`
                            max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm relative
                            ${msg.role === 'user' 
                                ? 'bg-accent-primary text-base-dark rounded-tr-none font-bold' 
                                : msg.role === 'system'
                                    ? 'bg-transparent text-gray-500 text-xs italic border border-gray-800' // Mensagem de sistema discreta
                                    : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-none'} 
                        `}>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            
                            {/* Hora da mensagem */}
                            <span className={`text-[10px] block mt-1.5 opacity-60 font-mono ${msg.role === 'user' ? 'text-right text-black/60' : 'text-left'}`}>
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>

                        {/* SMART CARD (O CORAÇÃO DO V8)
                           Só renderiza se a mensagem tiver uma 'proposal'.
                           Fica sempre abaixo do balão de texto correspondente.
                        */}
                        {msg.proposal && (
                            <div className="w-[90%] mt-1 animate-slide-up">
                                <SmartProposalCard 
                                    proposal={msg.proposal}
                                    status={msg.proposalStatus}
                                    onConfirm={() => handleConfirmProposal(msg.proposal!, msg.id)}
                                    onReject={() => handleRejectProposal(msg.id)}
                                    // Mostra estado de "loading" no botão se estiver executando
                                    isExecuting={isLoading && msg.proposalStatus === 'EXECUTED'}
                                />
                            </div>
                        )}

                    </div>
                ))}
                
                {/* LOADING STATE (Bolinhas pulando) */}
                {isLoading && (
                    <div className="flex justify-start animate-pulse">
                        <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-tl-none p-4 flex gap-1.5 items-center">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                )}

                {/* ERROR STATE (Feedback visual) */}
                {error && (
                    <div className="flex justify-center animate-fade-in my-2">
                        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-2 rounded-lg text-xs flex items-center gap-2 shadow-lg">
                            <FaExclamationTriangle />
                            <span>{error}</span>
                        </div>
                    </div>
                )}
                
                {/* Elemento invisível para forçar scroll para o final */}
                <div ref={messagesEndRef} />
            </div>

            {/* === RODAPÉ (INPUT) === 
              FIX: bg-gray-800 Sólido.
            */}
            <div className="p-3 bg-gray-800 border-t border-gray-700">
                <AgentInput 
                    mode="chat" 
                    placeholder={`Pergunte ao ${contextScope === 'GLOBAL' ? 'Assistente' : contextScope}...`}
                    onSend={handleSendMessage}
                    isLoading={isLoading}
                />
                
                {/* Disclaimer Técnico */}
                <div className="mt-2 text-center select-none">
                    <p className="text-[10px] text-gray-500">
                        Filix AI V8.0 - Modo: {contextScope}
                    </p>
                </div>
            </div>
        </div>
    );
};