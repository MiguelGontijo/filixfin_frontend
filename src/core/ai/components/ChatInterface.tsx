import React, { useState, useRef, useEffect } from 'react';
// Ícones padrão do projeto (react-icons/fa)
import { FaRobot, FaTimes, FaExpandAlt } from 'react-icons/fa'; 

// Importa o componente unificado de input que criamos para evitar duplicação de código
import { AgentInput } from './AgentInput'; 

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface Message {
    id: string;
    role: 'user' | 'assistant'; // Quem mandou a mensagem?
    content: string;            // O texto da mensagem
    timestamp: Date;            // Hora do envio
}

interface ChatInterfaceProps {
    /**
     * Função opcional para fechar o chat (usada quando está em modo flutuante/modal)
     */
    onClose?: () => void;
    
    /**
     * Se true, aplica estilos de tela cheia (para futura expansão)
     */
    isExpanded?: boolean; 
}

/**
 * ChatInterface
 * O componente visual principal do Assistente de IA Global.
 * Diferente da Timeline do CRM (que é focada em registros), este chat é focado
 * em perguntas e respostas gerais sobre o sistema (RAG).
 */
export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onClose }) => {
    
    // --- ESTADOS ---

    // Lista de mensagens inicial (Boas-vindas)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Olá! Sou sua inteligência auxiliar. Como posso ajudar com seus dados hoje?',
            timestamp: new Date()
        }
    ]);
    
    // Estado de "Pensando" (Controla o loading e feedback visual)
    const [isLoading, setIsLoading] = useState(false);
    
    // Ref para garantir que o chat sempre role para baixo na nova mensagem
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // --- EFEITOS ---

    // Sempre que a lista de mensagens mudar, rola para o fim
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // --- LÓGICA DE ENVIO ---

    /**
     * Processa o envio da mensagem vinda do AgentInput.
     * @param text O texto digitado pelo usuário.
     */
    const handleSendMessage = async (text: string) => {
        if (!text.trim()) return;

        // 1. UI Optimistic: Adiciona a mensagem do usuário imediatamente
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            // ============================================================
            // TODO: CONEXÃO COM BACKEND
            // Aqui entra a chamada real para sua API (ex: api.post('/ai/chat'))
            // ============================================================
            
            // Simulação temporária de delay de rede/processamento (Remover na integração)
            setTimeout(() => {
                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: 'Entendi. Estou verificando essa informação na base de dados...',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiMsg]);
                setIsLoading(false);
            }, 1500);

        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            // Poderíamos adicionar uma mensagem de erro visual aqui
            setIsLoading(false);
        }
    };

    // --- RENDERIZAÇÃO ---

    return (
        <div className="flex flex-col h-full bg-base-dark border border-gray-700 rounded-xl shadow-2xl overflow-hidden font-sans">
            
            {/* ================================================================
               1. HEADER (Cabeçalho com Identidade e Ações)
               ================================================================
            */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/95 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    {/* Avatar do Robô */}
                    <div className="p-2 rounded-full bg-accent-primary text-base-dark shadow-lg shadow-accent-primary/20">
                        <FaRobot size={18} />
                    </div>
                    
                    {/* Info de Status */}
                    <div>
                        <h3 className="font-bold text-gray-100 text-sm tracking-wide">Assistente IA</h3>
                        <span className="flex items-center gap-1.5 text-[10px] text-green-400 font-medium uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                            Online
                        </span>
                    </div>
                </div>
                
                {/* Botões de Janela (Expandir / Fechar) */}
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
                            title="Fechar chat"
                        >
                            <FaTimes size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* ================================================================
               2. BODY (Área de Rolagem das Mensagens)
               ================================================================
            */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-base-metallic">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    >
                        <div
                            className={`
                                max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm relative
                                ${msg.role === 'user' 
                                    ? 'bg-accent-primary text-base-dark rounded-tr-none font-medium' // Estilo User
                                    : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-none'} // Estilo AI
                            `}
                        >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            
                            {/* Hora da mensagem */}
                            <span className={`text-[10px] block mt-1.5 opacity-60 font-mono ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
                
                {/* Indicador de Digitação (Loading State) */}
                {isLoading && (
                    <div className="flex justify-start animate-pulse">
                        <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-tl-none p-4 flex gap-1.5 items-center">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                )}
                
                {/* Elemento invisível para scroll automático */}
                <div ref={messagesEndRef} />
            </div>

            {/* ================================================================
               3. FOOTER (Input Unificado)
               ================================================================
            */}
            <div className="p-3 bg-gray-800/50 border-t border-gray-700 backdrop-blur-md">
                {/* Aqui usamos o AgentInput no modo 'chat'.
                    Isso mantém a consistência visual e lógica com o CRM.
                */}
                <AgentInput 
                    mode="chat" 
                    placeholder="Pergunte sobre vendas, estoque ou clientes..."
                    onSend={handleSendMessage}
                    isLoading={isLoading}
                />
                
                {/* Disclaimer Jurídico/Técnico */}
                <div className="mt-2 text-center select-none">
                    <p className="text-[10px] text-gray-600">
                        O Agente pode cometer erros. Verifique informações críticas.
                    </p>
                </div>
            </div>
        </div>
    );
};