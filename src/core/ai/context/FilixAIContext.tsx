// ===== FILE: src/core/ai/context/FilixAIContext.tsx =====

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AIMessage, FilixAIContextData } from '../types/state/AIState';
import { AIContextScope, AIWidgetMode } from '../types/enums/AIEnums';
import { AIContextMetadata } from '../types/dtos/AIChatRequest.dto';
import { api } from '@/core/services/api'; // [NOVO] Importação da API para o Contexto buscar os dados

// Chave para persistência local (Salva apenas se o usuário desligou a IA)
const STORAGE_KEY = '@filix-ai/preferences-v2'; // Mudamos a versão para evitar conflito com cache antigo

// Contexto Inicial Vazio
const FilixAIContext = createContext<FilixAIContextData | undefined>(undefined);

interface FilixAIProviderProps {
    children: ReactNode;
}

/**
 * @provider FilixAIProvider
 * @description Gerencia o estado global da Inteligência Artificial.
 * * ARQUITETURA ATUALIZADA:
 * Removida toda a carga de Drag & Drop e coordenadas (x,y).
 * Agora o Contexto gerencia puramente o Estado Lógico (Aberto/Fechado), Semântico (Vendas/Fiscal)
 * e atua como a Memória Central (Histórico de Mensagens).
 * * OPÇÃO B APLICADA: O Contexto é o único dono e buscador do Histórico.
 */
export const FilixAIProvider: React.FC<FilixAIProviderProps> = ({ children }) => {
    
    // --- 1. Estados Nucleares ---
    
    // Soberania do Usuário (Kill Switch do Header)
    const [isEnabled, setIsEnabled] = useState(true);
    
    // Estado Visual (Aberto ou Fechado/Minimizado)
    const [mode, setMode] = useState<AIWidgetMode>('MINIMIZED');
    
    // Contexto Semântico (A Pistola - Macro)
    const [contextScope, setInternalContextScope] = useState<AIContextScope>('AI_AGENT_CHAT');

    // Contexto de Metadados (A Sniper - Micro)
    const [contextMetadata, setContextMetadata] = useState<AIContextMetadata | undefined>(undefined);

    // Estado de Interação (O Rascunho)
    const [inputDraft, setInputDraft] = useState('');

    // =======================================================
    // 🧠 A MEMÓRIA DO CHAT (Histórico Global)
    // =======================================================
    // Movemos o histórico do componente visual para o Cérebro. 
    // Assim a conversa não se perde quando o chat é minimizado.
    const [messages, setMessages] = useState<AIMessage[]>([]);

    // Trava de segurança para não recarregar o histórico infinitamente
    const [hasLoadedHistory, setHasLoadedHistory] = useState<boolean>(false);

    // --- 2. Persistência e Inicialização ---

    useEffect(() => {
        const savedPrefs = localStorage.getItem(STORAGE_KEY);
        
        if (savedPrefs) {
            try {
                const parsed = JSON.parse(savedPrefs);
                // Restauramos apenas a decisão do usuário de manter a IA ligada/desligada
                setIsEnabled(parsed.isEnabled ?? true);
            } catch (error) {
                console.warn('Filix AI: Falha ao carregar preferências', error);
            }
        }
    }, []);

    // Salva preferências quando alteradas (Debounce para performance)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const prefsToSave = { isEnabled };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(prefsToSave));
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [isEnabled]);

    // =======================================================
    // 🧹 [ATUALIZADO] LÓGICA DE LIMPEZA E BUSCA CONTEXTUAL
    // =======================================================
    // Sempre que o Escopo (Módulo) mudar, O PRÓPRIO CONTEXTO limpa 
    // a memória velha e busca a memória nova (Single Source of Truth).
    useEffect(() => {
        // [SEGURANÇA] Flag para evitar Race Conditions se o usuário clicar rápido em 2 módulos
        let isMounted = true; 

        const fetchHistory = async () => {
            // 1. Apagão Imediato (Evita o Fantasma da tela anterior)
            setMessages([]);
            setHasLoadedHistory(false);

            if (!contextScope) return;

            try {
                // 2. Busca os dados reais do Backend
                const response = await api.get<any[]>(`/ai/history/${contextScope}`);
                
                // Se o componente desmontou (ou o scope mudou de novo) enquanto a rede processava, ignora a resposta.
                if (!isMounted) return;

                // 3. Formata os dados para a tela
                const formattedHistory: AIMessage[] = response.data.map((msg) => ({
                    id: msg.id,
                    role: msg.role as 'user' | 'assistant',
                    content: msg.content,
                    timestamp: new Date(msg.timestamp),
                    toolUsed: msg.toolUsed 
                }));

                // 4. Injeta a memória oficial no Cérebro
                setMessages(formattedHistory);
                setHasLoadedHistory(true);

            } catch (error) {
                console.error(`❌ [FilixAIContext] Erro ao carregar histórico da rotina ${contextScope}:`, error);
                if (isMounted) {
                    setMessages([]); // Fallback seguro
                }
            }
        };

        fetchHistory();

        // Cleanup da montagem
        return () => {
            isMounted = false; 
        };
    }, [contextScope]);

    // --- 3. Ações (Actions) ---

    const toggleEnabled = () => {
        setIsEnabled(prev => !prev);
        if (isEnabled) setMode('HIDDEN');
        else setMode('MINIMIZED');
    };

    const toggleVisibility = () => {
        setMode(prev => (prev === 'MINIMIZED' ? 'EXPANDED' : 'MINIMIZED'));
    };

    // =======================================================
    // 🚀 COMANDO DE ABERTURA DIRETA
    // =======================================================
    // Usado por botões no Dashboard para garantir que a janela abra,
    // em vez de usar o toggle (que poderia fechar se já estivesse aberto).
    const openChat = () => {
        setMode('EXPANDED');
    };

    /**
     * Define o contexto completo da IA (Macro + Micro).
     */
    const setContext = (scope: AIContextScope, metadata?: AIContextMetadata) => {
        setInternalContextScope(scope);
        // Se metadata for undefined, limpa o estado anterior
        setContextMetadata(metadata);
        
        // Debug em Dev
        // if (process.env.NODE_ENV === 'development') {
        //     console.debug(`🧠 [AI Context] Scope: ${scope}`);
        // }
    };

    // --- 4. Exposição do Contexto ---

    return (
        <FilixAIContext.Provider value={{
            // Estado Visual
            mode,
            isEnabled,
            
            // Estado de Inteligência
            contextScope,
            contextMetadata,
            
            // Estado de Interação
            inputDraft,
            setInputDraft,

            // Memória do Chat
            messages,
            setMessages,

            // Ações
            toggleVisibility,
            openChat, 
            setMode,
            toggleEnabled,
            setContext
        }}>
            {children}
        </FilixAIContext.Provider>
    );
};

/**
 * Hook para consumir o Cérebro da IA.
 */
export const useFilixAI = (): FilixAIContextData => {
    const context = useContext(FilixAIContext);
    
    if (!context) {
        throw new Error('useFilixAI deve ser usado dentro de um FilixAIProvider');
    }
    
    return context;
};