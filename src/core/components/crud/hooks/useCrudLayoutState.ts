import { useState, useCallback } from 'react';

/**
 * @type ViewMode
 * @description Define qual painel está ativo no Palco do Layout.
 */
export type ViewMode = 'LIST' | 'FORM';

/**
 * ============================================================================
 * 🧠 HOOK: useCrudLayoutState (A Máquina de Estados)
 * @description Isola a lógica de transição visual e o controle da entidade 
 * em edição. Retira essa responsabilidade do componente de Layout (SRP).
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO:
 * - Uso extensivo de `useCallback` para evitar re-renderizações em cascata
 * quando essas funções forem repassadas aos Orquestradores.
 * - Preservação estrita da Coreografia CSS (300ms de tolerância).
 * ============================================================================
 */
export function useCrudLayoutState<TData>() {
    
    // 1. Estado da Visão (Quem está no palco)
    const [viewMode, setViewMode] = useState<ViewMode>('LIST');
    
    // 2. Estado da Entidade (O que estamos editando)
    const [editingItem, setEditingItem] = useState<TData | null>(null);

    /**
     * @method openCreate
     * @description Prepara o palco para um novo registro. Limpa a memória e aciona o Form.
     */
    const openCreate = useCallback(() => {
        setEditingItem(null);
        setViewMode('FORM');
    }, []);

    /**
     * @method openEdit
     * @description Prepara o palco para edição. Injeta os dados do item e aciona o Form.
     */
    const openEdit = useCallback((item: TData) => {
        setEditingItem(item);
        setViewMode('FORM');
    }, []);

    /**
     * @method closeForm
     * @description Recolhe o formulário devolvendo a Listagem/Tabela ao palco.
     * 🛡️ UX Protection: Aguarda 300ms (tempo exato da transição ease-in-out do CSS)
     * antes de limpar o `editingItem`. Se limparmos antes, o usuário verá o 
     * formulário "piscar" e ficar vazio enquanto ainda está deslizando para fora.
     */
    const closeForm = useCallback(() => {
        setViewMode('LIST');
        
        setTimeout(() => {
            setEditingItem(null);
        }, 300);
    }, []);

    return {
        viewMode,
        editingItem,
        openCreate,
        openEdit,
        closeForm
    };
}