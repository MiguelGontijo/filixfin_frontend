'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
    FilixAIContextData, 
    AIContextScope, 
    AIWidgetMode, 
    AIPosition 
} from '../types/AITypes';

// Chave para persistência local (enquanto não migramos para o banco de dados do usuário)
const STORAGE_KEY = '@filix-ai/preferences-v1';

// Contexto Inicial Vazio
const FilixAIContext = createContext<FilixAIContextData | undefined>(undefined);

interface FilixAIProviderProps {
    children: ReactNode;
}

/**
 * @provider FilixAIProvider
 * @description Gerencia o estado global da Inteligência Artificial (Visibilidade, Contexto, Posição).
 * Atua como o "Cérebro" que mantém a continuidade da experiência através das rotas.
 */
export const FilixAIProvider: React.FC<FilixAIProviderProps> = ({ children }) => {
    
    // --- 1. Estados Nucleares ---
    
    // Soberania do Usuário (Kill Switch do Header)
    const [isEnabled, setIsEnabled] = useState(true);
    
    // Estado Visual (Minimizado, Expandido, Oculto)
    const [mode, setMode] = useState<AIWidgetMode>('MINIMIZED');
    
    // Posição na tela (Draggable)
    // Default: null inicial para evitar hydration mismatch, setado no useEffect
    const [position, setPosition] = useState<AIPosition>({ x: 0, y: 0 });

    // Contexto Semântico (Onde estou?)
    const [contextScope, setContextScope] = useState<AIContextScope>('GLOBAL');

    // --- 2. Persistência e Inicialização ---

    useEffect(() => {
        // Carrega preferências salvas no navegador
        // TODO: Futuro -> Substituir por chamada à API: await userSettingsService.getAIPreferences()
        const savedPrefs = localStorage.getItem(STORAGE_KEY);
        
        if (savedPrefs) {
            try {
                const parsed = JSON.parse(savedPrefs);
                setIsEnabled(parsed.isEnabled ?? true);
                
                // Só restaura posição se ela existir, senão usa padrão CSS (bottom-right)
                if (parsed.position) setPosition(parsed.position);
                
                // Nota: Não restauramos 'mode' ou 'contextScope' propositalmente.
                // A IA deve sempre iniciar 'fechada' e descobrir o contexto da rota atual.
            } catch (error) {
                console.warn('Filix AI: Falha ao carregar preferências', error);
            }
        }
    }, []);

    // Salva preferências quando alteradas
    useEffect(() => {
        // Debounce simples para não salvar a cada pixel arrastado
        const timeoutId = setTimeout(() => {
            const prefsToSave = {
                isEnabled,
                position
            };
            // TODO: Futuro -> Disparar patch para o Backend: userSettingsService.updateAIPreferences(prefsToSave)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(prefsToSave));
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [isEnabled, position]);

    // --- 3. Ações (Actions) ---

    const toggleEnabled = () => {
        setIsEnabled(prev => !prev);
        // Se desativar, força o modo para HIDDEN visualmente se necessário
        if (isEnabled) setMode('HIDDEN');
        else setMode('MINIMIZED');
    };

    const toggleVisibility = () => {
        setMode(prev => (prev === 'MINIMIZED' ? 'EXPANDED' : 'MINIMIZED'));
    };

    const updatePosition = (newPos: AIPosition) => {
        setPosition(newPos);
    };

    // --- 4. Exposição do Contexto ---

    return (
        <FilixAIContext.Provider value={{
            mode,
            position,
            contextScope,
            toggleVisibility,
            setMode,
            updatePosition,
            setContextScope,
            isEnabled,
            toggleEnabled
        }}>
            {children}
        </FilixAIContext.Provider>
    );
};

/**
 * Hook para consumir o Cérebro da IA.
 * Deve ser usado dentro de componentes que precisam interagir com a IA.
 */
export const useFilixAI = (): FilixAIContextData => {
    const context = useContext(FilixAIContext);
    
    if (!context) {
        throw new Error('useFilixAI deve ser usado dentro de um FilixAIProvider');
    }
    
    return context;
};