
import React, { useMemo } from 'react';
import { FaCheck, FaTimes, FaMicrophone, FaInfoCircle } from 'react-icons/fa';
import { AIActionProposal } from '../types/dtos/AIActionProposal.dto';
import { ProposalStatus } from '../types/enums/AIEnums';

interface SmartProposalCardProps {
    /**
     * O objeto de proposta vindo do Backend V8.
     * Contém os dados brutos (data) e a intenção (actionIntent).
     */
    proposal: AIActionProposal;

    /**
     * O estado atual desta proposta no histórico do chat.
     * PENDING: Mostra botões.
     * APPROVED/REJECTED: Mostra estado estático (readonly).
     */
    status?: ProposalStatus;

    /**
     * Callback de aprovação (clique no botão Confirmar).
     */
    onConfirm: () => void;

    /**
     * Callback de rejeição (clique no botão Cancelar).
     */
    onReject: () => void;
    
    /**
     * Estado de loading durante a execução da ação.
     */
    isExecuting?: boolean;
}

/**
 * @component SmartProposalCard
 * @description Um "Ticket de Revisão" polimórfico.
 * Renderiza dinamicamente qualquer objeto JSON de forma legível.
 * Projetado para ser discreto e fluído dentro do fluxo do chat.
 */
export const SmartProposalCard: React.FC<SmartProposalCardProps> = ({
    proposal,
    status = 'PENDING',
    onConfirm,
    onReject,
    isExecuting = false
}) => {
    
    // --- 1. Lógica de Formatação Inteligente (Helpers) ---

    /**
     * Transforma chaves técnicas (camelCase/snake_case) em Rótulos Humanos.
     * Ex: "clientName" -> "Client Name"
     */
    const formatLabel = (key: string): string => {
        // Remove underscores e separa camelCase
        const result = key
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1');
        
        // Capitaliza a primeira letra
        return result.charAt(0).toUpperCase() + result.slice(1).trim();
    };

    /**
     * Formata valores para exibição amigável.
     * Trata Booleanos, Arrays e Objetos aninhados simples.
     */
    const formatValue = (value: any): React.ReactNode => {
        if (value === null || value === undefined) return <span className="text-gray-600">-</span>;
        
        if (typeof value === 'boolean') {
            return value 
                ? <span className="text-green-400 flex items-center gap-1"><FaCheck size={10} /> Sim</span> 
                : <span className="text-red-400 flex items-center gap-1"><FaTimes size={10} /> Não</span>;
        }

        if (Array.isArray(value)) {
            return value.join(', ');
        }

        if (typeof value === 'object') {
            // Se for objeto complexo, tenta mostrar JSON simplificado ou nome
            return JSON.stringify(value).substring(0, 30) + '...';
        }

        // Detecção simples de valores monetários (heurística baseada em chaves comuns seria melhor, mas aqui é genérico)
        if (typeof value === 'number' && (value > 1000 || String(value).includes('.'))) {
            // Poderíamos formatar moeda aqui se tivéssemos certeza. Por enquanto, mantém number.
            return value.toLocaleString('pt-BR'); 
        }

        return String(value);
    };

    // Filtra chaves que não devem ser exibidas (ex: IDs internos, metadados)
    const displayData = useMemo(() => {
        if (!proposal.data) return [];
        return Object.entries(proposal.data).filter(([key]) => {
            // Esconde chaves que começam com underscore ou parecem IDs técnicos sem valor semântico
            return !key.startsWith('_') && key !== 'tenantId';
        });
    }, [proposal.data]);


    // --- 2. Renderização Visual ---

    const isInteractive = status === 'PENDING' && !isExecuting;

    return (
        <div className={`
            mt-3 mb-1 overflow-hidden rounded-xl border transition-all duration-300
            ${isInteractive 
                ? 'bg-gray-900/40 border-gray-700 hover:border-gray-600' // Estado Ativo
                : 'bg-gray-900/20 border-gray-800 opacity-80'            // Estado Passivo (Histórico)
            }
        `}>
            {/* CABEÇALHO DO TICKET */}
            <div className="flex items-center justify-between px-4 py-2 bg-black/20 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <FaInfoCircle className="text-accent-primary opacity-70" size={12} />
                    <span className="text-xs font-semibold text-gray-300 tracking-wide uppercase">
                        {proposal.label || 'Revisão Necessária'}
                    </span>
                </div>
                {/* Badge de Status (se não estiver pendente) */}
                {!isInteractive && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        status === 'EXECUTED' || status === 'APPROVED' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                        {status === 'EXECUTED' ? 'EXECUTADO' : status === 'APPROVED' ? 'APROVADO' : 'CANCELADO'}
                    </span>
                )}
            </div>

            {/* CORPO DE DADOS (LISTA DINÂMICA) */}
            <div className="p-4 space-y-2">
                {displayData.length > 0 ? (
                    displayData.map(([key, value]) => (
                        <div key={key} className="flex justify-between items-start text-sm group">
                            <span className="text-gray-500 font-medium whitespace-nowrap mr-4 group-hover:text-gray-400 transition-colors">
                                {formatLabel(key)}
                            </span>
                            <span className="text-gray-200 font-mono text-right break-all">
                                {formatValue(value)}
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="text-gray-500 text-xs italic text-center py-2">
                        Nenhum detalhe adicional para exibir.
                    </div>
                )}
            </div>

            {/* RODAPÉ DE AÇÕES (SÓ APARECE SE INTERATIVO) */}
            {isInteractive && (
                <div className="px-3 py-3 bg-white/5 border-t border-white/5 flex items-center justify-between gap-3">
                    
                    {/* Placeholder do Voice Listener */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 select-none group cursor-help" title="Fale 'Confirmar' para aprovar">
                        <div className="relative">
                            <FaMicrophone className="group-hover:text-accent-primary transition-colors" />
                            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-accent-primary rounded-full animate-ping opacity-0 group-hover:opacity-100"></span>
                        </div>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Escutando...
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Botão Rejeitar */}
                        <button 
                            onClick={onReject}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            Cancelar
                        </button>

                        {/* Botão Confirmar */}
                        <button 
                            onClick={onConfirm}
                            disabled={isExecuting}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-accent-primary text-base-dark hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-accent-primary/20 disabled:opacity-50 disabled:cursor-wait"
                        >
                            {isExecuting ? (
                                <>Processando...</>
                            ) : (
                                <>
                                    <FaCheck size={10} />
                                    Confirmar
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};