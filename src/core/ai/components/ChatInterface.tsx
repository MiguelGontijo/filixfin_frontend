// ===== FILE: src/core/ai/components/ChatInterface.tsx =====

import React, { useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaExpandAlt, FaExclamationTriangle } from 'react-icons/fa';

// --- COMPONENTES & UI ---
import { AgentInput } from './AgentInput';
import { SmartProposalCard } from './SmartProposalCard';

// --- LÓGICA & SERVIÇOS (MOTOR V8) ---
import { useAIChatService } from '../hooks/useAIChatService';
import { useFilixAI } from '../context/FilixAIContext';

// --- TIPAGENS ISOLADAS (PADRÃO SRP) ---
import { AIMessage } from '../types/state/AIState';
import { AIActionProposal } from '../types/dtos/AIActionProposal.dto';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface ChatInterfaceProps {
    /**
     * Callback acionado ao clicar no 'X'.
     */
    onClose?: () => void;

    /**
     * ID do Tenant atual para validação de permissões no Backend.
     * @default 'demo-tenant'
     */
    tenantId?: string;

    /**
     * ID do Plano atual para verificação de cotas.
     * @default 'demo-plan'
     */
    planId?: string;
    
    isExpanded?: boolean;
}

/**
 * @component ChatInterface
 * @description O Cockpit Principal da IA (Motor V8).
 * * RESPONSABILIDADES ATUALIZADAS (ARQUITETURA DE MÃO ÚNICA):
 * 1. Componente 100% Visual (Dumb Component).
 * 2. Lê a memória global (Contexto) e desenha na tela.
 * 3. Delega ações de envio/confirmação para os Services.
 */
export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
    onClose,
    tenantId = 'demo-tenant', 
    planId = 'demo-plan' 
}) => {
    
    // --- 1. HOOKS E CONTEXTO ---
    
    // O ChatInterface agora APENAS lê do Cérebro. Ele não decide mais quando buscar.
    const { contextScope, messages, setMessages } = useFilixAI();
    
    // Hook de Serviço de comunicação com o Backend (Para novas mensagens)
    const { sendMessage, confirmAction, isLoading, error } = useAIChatService();

    // Ref apenas para a rolagem automática (Lógica puramente visual)
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // --- 2. EFEITOS VISUAIS ---

    // Rola suavemente para o final sempre que uma nova mensagem ou loading entrar na tela
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    // =======================================================================
    // [REMOVIDO] Toda a lógica de useAIHistory, loadedScopeRef e travas de 
    // sincronização foi apagada. A responsabilidade agora é 100% do Contexto.
    // =======================================================================

    // --- 3. LÓGICA DE NEGÓCIO (Handlers de Interação) ---

    /**
     * Processa o envio de texto pelo usuário.
     */
    const handleSendMessage = async (text: string) => {
        if (!text.trim()) return;

        // Optimistic UI: Cria a mensagem do usuário visualmente antes da API responder
        const userMsg: AIMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);

        // Dispara a requisição real de conversação
        const response = await sendMessage({
            message: text,
            routineKey: contextScope,
            tenantId,
            planId
        });

        // Adiciona a resposta da IA ao histórico global
        if (response) {
            setMessages(prev => [...prev, response]);
        }
    };

    /**
     * Ação: Usuário clicou em [CONFIRMAR] no Card de Proposta.
     */
    const handleConfirmProposal = async (proposal: AIActionProposal, messageId: string) => {
        updateMessageStatus(messageId, 'EXECUTED'); 

        const response = await confirmAction(proposal, {
            routineKey: contextScope,
            tenantId,
            planId
        });

        if (response) {
            updateMessageStatus(messageId, 'APPROVED');
            setMessages(prev => [...prev, response]);
        } else {
            updateMessageStatus(messageId, 'PENDING');
        }
    };

    /**
     * Ação: Usuário clicou em [CANCELAR/REJEITAR].
     */
    const handleRejectProposal = (messageId: string) => {
        updateMessageStatus(messageId, 'REJECTED');
        
        setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            role: 'system',
            content: 'Ação cancelada pelo usuário.',
            timestamp: new Date()
        }]);
    };

    /**
     * Helper para atualizar o status de um card específico no Histórico Global.
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
        // CONTAINER PRINCIPAL (Mantém o layout clássico com cantos arredondados)
        <div className="flex flex-col h-full bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden font-sans">
            
            {/* === CABEÇALHO (HEADER) === */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800 handle-drag cursor-default select-none">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-accent-primary text-base-dark shadow-lg shadow-accent-primary/20">
                        <FaRobot size={18} />
                    </div>
                    
                    <div>
                        <h3 className="font-bold text-gray-100 text-sm tracking-wide">
                            Filix AI
                        </h3>
                        <span className="flex items-center gap-1.5 text-[10px] text-green-400 font-medium uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                            {contextScope === 'AI_AGENT_CHAT' ? 'Online' : `Contexto: ${contextScope}`}
                        </span>
                    </div>
                </div>
                
                <div className="flex items-center gap-1">
                    <button 
                        className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
                        title="Expandir (Em breve)"
                    >
                        <FaExpandAlt size={14} />
                    </button>
                    
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

            {/* === CORPO DO CHAT (BODY) === */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-900">
                {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}
                    >
                        
                        {/* BALÃO DE MENSAGEM */}
                        <div className={`
                            max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm relative
                            ${msg.role === 'user' 
                                ? 'bg-accent-primary text-base-dark rounded-tr-none font-bold' 
                                : msg.role === 'system'
                                    ? 'bg-transparent text-gray-500 text-xs italic border border-gray-800' 
                                    : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-none'} 
                        `}>
                            {/* UI DEFENSIVA: Limite de altura no texto da IA com scroll interno */}
                            <div className="max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                            
                            {/* Hora da mensagem */}
                            <span className={`text-[10px] block mt-1.5 opacity-60 font-mono ${msg.role === 'user' ? 'text-right text-black/60' : 'text-left'}`}>
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>

                        {/* SMART CARD (O CORAÇÃO DO V8) */}
                        {msg.proposal && (
                            <div className="w-[90%] mt-1 animate-slide-up">
                                <SmartProposalCard 
                                    proposal={msg.proposal}
                                    status={msg.proposalStatus}
                                    onConfirm={() => handleConfirmProposal(msg.proposal!, msg.id)}
                                    onReject={() => handleRejectProposal(msg.id)}
                                    isExecuting={isLoading && msg.proposalStatus === 'EXECUTED'}
                                />
                            </div>
                        )}

                    </div>
                ))}
                
                {/* LOADING STATE */}
                {isLoading && (
                    <div className="flex justify-start animate-pulse">
                        <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-tl-none p-4 flex gap-1.5 items-center">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                )}

                {/* ERROR STATE */}
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

            {/* === RODAPÉ (INPUT) === */}
            <div className="p-3 bg-gray-800 border-t border-gray-700 shrink-0">
                <AgentInput 
                    mode="chat" 
                    placeholder={`Pergunte ao ${contextScope === 'AI_AGENT_CHAT' ? 'Assistente' : contextScope}...`}
                    onSend={handleSendMessage}
                    isLoading={isLoading}
                />
                
                <div className="mt-2 text-center select-none">
                    <p className="text-[10px] text-gray-500">
                        Filix AI V8.0 - Modo: {contextScope}
                    </p>
                </div>
            </div>
        </div>
    );
};