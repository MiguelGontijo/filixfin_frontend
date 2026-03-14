'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AIMessage, AIMessageType, FilixAIContextData } from '../types/state/AIState'; // [ATUALIZADO] Importando o AIMessageType
import { AIWidgetMode, FeatureKey, FeatureKeys } from '../types/enums/AIEnums';
import { AIContextMetadata } from '../types/dtos/AIChatRequest.dto';
import { api } from '@/core/services/api'; 
import { fetchAIHistory } from '../hooks/AIHistoryService';

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
 * * [NOVO] Aplica a tipagem visual (Crachá) na remontagem do histórico.
 */
export const FilixAIProvider: React.FC<FilixAIProviderProps> = ({ children }) => {
    
    // --- 1. Estados Nucleares ---
    
    // Soberania do Usuário (Kill Switch do Header)
    const [isEnabled, setIsEnabled] = useState(true);
    
    // Estado Visual (Aberto ou Fechado/Minimizado)
    const [mode, setMode] = useState<AIWidgetMode>('MINIMIZED');
    
    // Contexto Semântico (A Pistola - Macro)
    const [featureKey, setInternalFeatureKey] = useState<FeatureKey>(FeatureKeys.AI_CONCIERGE_MICRO);

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
        let isMounted = true; 

        const loadHistory = async () => {
            // 1. Apagão Imediato
            setMessages([]);
            setHasLoadedHistory(false);

            if (!featureKey) return;

            try {
                // 2. O Contexto delega o trabalho sujo para o Serviço Puro!
                const historyData = await fetchAIHistory(featureKey);
                
                // Se o componente não morreu no meio do caminho, salva na memória RAM
                if (isMounted) {
                    setMessages(historyData);
                    setHasLoadedHistory(true);
                }

            } catch (error) {
                // O serviço falhou, garantimos a memória vazia
                if (isMounted) setMessages([]); 
            }
        };

        loadHistory();

        return () => { isMounted = false; };
    }, [featureKey]);

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
    const setContext = (scope: FeatureKey, metadata?: AIContextMetadata) => {
        setInternalFeatureKey(scope);
        // Se metadata for undefined, limpa o estado anterior
        setContextMetadata(metadata);
    };

    // --- 4. Exposição do Contexto ---

    return (
        <FilixAIContext.Provider value={{
            // Estado Visual
            mode,
            isEnabled,
            
            // Estado de Inteligência
            featureKey,
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