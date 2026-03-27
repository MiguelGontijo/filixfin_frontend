import React, { ReactNode } from 'react';

// --- Tipagens do Core ---
import { PresentationMode } from '../../../types';

/**
 * @interface CrudFormWrapperProps
 * @description Contrato rigoroso de dependências do Envelopador Polimórfico.
 */ 
export interface CrudFormWrapperProps {
    presentationMode: PresentationMode;
    /** 🛡️ VITAL: Passado para o Wrapper para preservar a transição CSS original do Drawer */
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
}

/**
 * ============================================================================
 * 📦 CRUD FORM: WRAPPER (O Envelopador Polimórfico)
 * @description Respeita rigorosamente a integridade visual do sistema legado,
 * aplicando o envelopamento correto conforme o 'presentationMode'.
 * ============================================================================
 */
export const CrudFormWrapper: React.FC<CrudFormWrapperProps> = ({
    presentationMode,
    isOpen,
    onClose,
    children
}) => {
    
    // ========================================================================
    // 1. MODO INLINE (Plano e Fluido para o Cockpit Central)
    // ========================================================================
    if (presentationMode === 'inline') {
        // No inline, podemos desmontar o DOM sem problemas se estiver fechado
        if (!isOpen) return null; 
        return (
            <div className="flex-1 w-full h-full bg-transparent flex flex-col relative z-0">
                {children}
            </div>
        );
    }

    // ========================================================================
    // 2. MODO MODAL (Caixa Centralizada)
    // ========================================================================
    if (presentationMode === 'modal') {
        if (!isOpen) return null;
        return (
            <div 
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-base-dark/70 backdrop-blur-sm animate-fade-in p-4 lg:p-12" 
                onClick={onClose}
            >
                <div 
                    className="w-full max-w-3xl bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-full animate-fade-in-up" 
                    onClick={(e) => e.stopPropagation()} 
                >
                    {children}
                </div>
            </div>
        );
    }

    // ========================================================================
    // 3. MODO DRAWER ORIGINAL (A sua estrutura exata, sem fundos pretos)
    // Nota: NÃO usamos 'return null' aqui para que as classes do Tailwind 
    // executem a transição de saída (ease-in-out / opacity-0) com perfeição.
    // ========================================================================
    return (
        <div 
            className={`
                absolute inset-0 z-20 bg-base-dark flex flex-col
                transform transition-all duration-300 ease-in-out
                ${isOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-12 opacity-0 pointer-events-none'}
            `}
        >
            {children}
        </div>
    );
};