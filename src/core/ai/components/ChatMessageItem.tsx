import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AIMessage } from '../types/state/AIState';
import { SmartProposalCard } from './SmartProposalCard';
import { AIActionProposal } from '../types/dtos/AIActionProposal.dto';

interface ChatMessageItemProps {
    message: AIMessage;
    isExecuting?: boolean;
    onConfirmProposal?: (proposal: AIActionProposal, messageId: string) => void;
    onRejectProposal?: (messageId: string) => void;
}

/**
 * @component ChatMessageItem
 * @description Renderiza individualmente um balão de conversa.
 * Implementa o "Smart Chunking" (Fatiador Inteligente) e instancia os Cards de Proposta.
 */
export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
    message,
    isExecuting = false,
    onConfirmProposal,
    onRejectProposal
}) => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';

    // =========================================================================
    // 🧠 SMART CHUNKER (O Fatiador de Pensamentos)
    // =========================================================================
    const textChunks = useMemo(() => {
        if (!message.content) return [];
        if (isUser || isSystem) return [message.content];
        return message.content.split(/\n\s*\n/).filter(chunk => chunk.trim() !== '');
    }, [message.content, isUser, isSystem]);

    return (
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full space-y-2 mb-2`}>
            
            {/* Renderiza um balão individual para CADA pensamento (chunk) da IA */}
            {textChunks.map((chunk, index) => {
                
                const isFirst = index === 0;
                const isLast = index === textChunks.length - 1;
                
                let borderRadiusClass = '';
                if (!isUser && !isSystem) {
                    if (textChunks.length === 1) borderRadiusClass = 'rounded-tl-none'; 
                    else if (isFirst) borderRadiusClass = 'rounded-bl-none rounded-tl-2xl'; 
                    else if (isLast) borderRadiusClass = 'rounded-tl-none rounded-bl-2xl'; 
                    else borderRadiusClass = 'rounded-l-none'; 
                } else if (isUser) {
                    borderRadiusClass = 'rounded-tr-none';
                }

                return (
                    <div 
                        key={`${message.id}-chunk-${index}`}
                        className={`
                            max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm relative animate-fade-in
                            ${isUser 
                                ? `bg-accent-primary text-base-dark font-medium ${borderRadiusClass}` 
                                : isSystem
                                    ? 'bg-transparent text-gray-500 text-xs italic border border-gray-800' 
                                    : `bg-gray-800 text-gray-200 border border-gray-700 ${borderRadiusClass}`} 
                        `}
                    >
                        <div className={`overflow-y-auto custom-scrollbar pr-1 ${!isUser ? 'markdown-body' : ''}`}>
                            {isUser || isSystem ? (
                                <p className="whitespace-pre-wrap">{chunk}</p>
                            ) : (
                                <ReactMarkdown 
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
                                        ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
                                        strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                                        a: ({node, ...props}) => <a className="text-accent-primary hover:underline" {...props} />,
                                    }}
                                >
                                    {chunk}
                                </ReactMarkdown>
                            )}
                        </div>

                        {/* A Hora só aparece no último balão do agrupamento */}
                        {isLast && (
                            <span className={`text-[9px] block mt-1.5 opacity-40 font-mono ${isUser ? 'text-right' : 'text-left'}`}>
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                    </div>
                );
            })}

            {/* O CARD DE PROPOSTA (Anexado sempre abaixo do último balão) */}
            {message.proposal && onConfirmProposal && onRejectProposal && (
                <div className="w-[90%] mt-1 animate-slide-up">
                    <SmartProposalCard 
                        proposal={message.proposal}
                        status={message.proposalStatus}
                        onConfirm={() => onConfirmProposal(message.proposal!, message.id)}
                        onReject={() => onRejectProposal(message.id)}
                        // [CORREÇÃO]: O botão gira (isExecuting) se o chat estiver carregando E o status for APPROVED
                        isExecuting={isExecuting && message.proposalStatus === 'APPROVED'}
                    />
                </div>
            )}
        </div>
    );
};