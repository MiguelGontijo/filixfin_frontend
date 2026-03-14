import React, { useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaExpandAlt, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

// --- COMPONENTES & UI ---
import { ChatMessageItem } from './ChatMessageItem';
import { AgentInput } from './agent-input/AgentInput';

// --- LÓGICA & SERVIÇOS (MOTOR V8) ---
import { useAIChatService } from '../hooks/useAIChatService';
import { useFilixAI } from '../context/FilixAIContext';

// --- TIPAGENS ISOLADAS (PADRÃO SRP) ---
import { AIMessage } from '../types/state/AIState';
import { AIActionProposal } from '../types/dtos/AIActionProposal.dto';
import { FeatureKeys } from '../types/enums/AIEnums';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface ChatInterfaceProps {
    /** Callback acionado ao clicar no 'X'. */
    onClose?: () => void;
    /** ID do Tenant atual para validação de permissões no Backend. */
    tenantId?: string;
    /** ID do Plano atual para verificação de cotas. */
    planId?: string;
    isExpanded?: boolean;
}

/**
 * @component ChatInterface
 * @description O Cockpit Principal da IA (Motor V8).
 * * RESPONSABILIDADES ATUALIZADAS (ARQUITETURA V3 - ReAct & HITL):
 * 1. Componente 100% Visual (Dumb Component).
 * 2. Lê a memória global (Contexto) e desenha na tela.
 * 3. Orquestra a Máquina de Estados das Propostas (PENDING -> APPROVED -> EXECUTED).
 */
export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
    onClose,
    tenantId = 'demo-tenant', 
    planId = 'demo-plan' 
}) => {
    
    // --- 1. HOOKS E CONTEXTO ---
    const { featureKey, messages, setMessages } = useFilixAI();
    const { sendMessage, confirmAction, isLoading, error } = useAIChatService();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // --- 2. EFEITOS VISUAIS ---
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    // --- 3. LÓGICA DE NEGÓCIO (Handlers de Interação) ---

    /**
     * @method handleSendMessage
     * @description Processa o envio de texto e arquivos (Multimodal) pelo usuário.
     */
    const handleSendMessage = async (text: string, attachments?: File[]) => {
        if (!text.trim() && (!attachments || attachments.length === 0)) return;

        const displayContent = text.trim() ? text : '📸 [Imagem anexada]';

        const userMsg: AIMessage = {
            id: Date.now().toString(),
            role: 'user',
            type: 'TEXT', 
            content: displayContent,
            timestamp: new Date()
        };
        
        setMessages(prev => [...prev, userMsg]);

        // Dispara a requisição real de conversação para o Motor ReAct
        const response = await sendMessage({
            message: text,
            attachments: attachments, 
            routineKey: featureKey,
            tenantId,
            planId
        });

        if (response) {
            setMessages(prev => [...prev, response]);
        }
    };

    /**
     * @method handleConfirmProposal
     * @description Máquina de Estados Corrigida (Human-in-the-Loop).
     */
    const handleConfirmProposal = async (proposal: AIActionProposal, messageId: string) => {
        // 1. APROVAÇÃO HUMANA: Bloqueia o botão e gira o spinner
        updateMessageStatus(messageId, 'APPROVED'); 

        // 2. Chama a rota de descongelamento do Backend (/execute-proposal)
        const response = await confirmAction(proposal, messageId);

        if (response) {
            // 3. SUCESSO: Ação executada no banco. Lacra o card e adiciona a resposta da IA.
            updateMessageStatus(messageId, 'EXECUTED');
            setMessages(prev => [...prev, response]);
        } else {
            // 4. FALHA: Volta para PENDENTE para permitir que o usuário tente novamente.
            updateMessageStatus(messageId, 'PENDING');
        }
    };

    /**
     * @method handleRejectProposal
     * @description Ação: Usuário clicou em [CANCELAR/REJEITAR].
     * Nota Arquitetural: Mantém a recusa apenas visual no Frontend. Como o Backend só 
     * executa mediante o trigger explícito, a proposta fica "morta" no banco naturalmente.
     */
    const handleRejectProposal = (messageId: string) => {
        updateMessageStatus(messageId, 'REJECTED');
        
        setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            role: 'system',
            type: 'SYSTEM_ACTION',
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
                            {featureKey === FeatureKeys.AI_CONCIERGE_MICRO ? 'Online' : `Contexto: ${featureKey}`}
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

            {/* === CORPO DO CHAT (BODY) - O ROTEADOR VISUAL === */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-5 custom-scrollbar bg-gray-900">
                {messages.map((msg) => {
                    switch (msg.type) {
                        
                        case 'SYSTEM_ACTION':
                            return (
                                <div key={msg.id} className="flex justify-center my-2 animate-fade-in">
                                    <span className="text-[11px] font-medium text-gray-400 bg-gray-800/80 px-4 py-1.5 rounded-full border border-gray-700/50 shadow-sm flex items-center gap-2">
                                        <FaInfoCircle className="opacity-70" />
                                        {msg.content}
                                    </span>
                                </div>
                            );

                        case 'ERROR':
                            return (
                                <div key={msg.id} className="flex justify-center my-2 animate-fade-in">
                                    <span className="text-xs text-red-300 bg-red-900/30 px-4 py-2 rounded-lg border border-red-800/50 shadow-sm flex items-center gap-2">
                                        <FaExclamationTriangle />
                                        {msg.content}
                                    </span>
                                </div>
                            );

                        case 'PROPOSAL':
                            return (
                                <ChatMessageItem 
                                    key={msg.id}
                                    message={msg}
                                    isExecuting={isLoading}
                                    onConfirmProposal={handleConfirmProposal}
                                    onRejectProposal={handleRejectProposal}
                                />
                            );

                        case 'TEXT':
                        default:
                            return (
                                <ChatMessageItem 
                                    key={msg.id}
                                    message={msg}
                                />
                            );
                    }
                })}
                
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
                
                {/* ERROR STATE DA SESSÃO ATUAL */}
                {error && (
                    <div className="flex justify-center animate-fade-in my-2">
                        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-2 rounded-lg text-xs flex items-center gap-2 shadow-lg">
                            <FaExclamationTriangle />
                            <span>{error}</span>
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            {/* === RODAPÉ (INPUT) === */}
            <div className="p-3 bg-gray-800 border-t border-gray-700 shrink-0">
                <AgentInput 
                    mode="chat" 
                    placeholder={`Pergunte ao Filix`}
                    onSend={handleSendMessage}
                    isLoading={isLoading}
                />
                
                <div className="mt-2 text-center select-none">
                    <p className="text-[10px] text-gray-500">
                        Filix AI V8.0 - Modo: {featureKey}
                    </p>
                </div>
            </div>
        </div>
    );
};