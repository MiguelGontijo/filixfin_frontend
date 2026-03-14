import { useState, useEffect, useCallback } from 'react';
import { TimelineService } from '../services/TimelineService';
import { 
    TimelineEvent,
    TimelineEntryType,
    TimelineAttachment
} from '../types/TimelineTypes';
import { AppModule } from '@/core/ai/types/enums/AIEnums';

// Interface para feedback visual de operações
interface UseTimelineState {
    items: TimelineEvent[];
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;
}

/**
 * @hook useTimeline
 * @description Hook inteligente para gerenciamento completo da Timeline.
 * Abstrai o fetch de dados, atualizações otimistas e lógica de envio.
 * * @param module O contexto (ex: 'CLIENT')
 * @param entityId O ID da entidade (ex: UUID do Cliente)
 */
export const useTimeline = (entityType: AppModule, entityId?: string) => {
    
    // --- ESTADO LOCAL ---
    const [items, setItems] = useState<TimelineEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- AÇÕES DE BUSCA ---

    /**
     * Busca os dados atualizados do servidor.
     * Usamos useCallback para garantir estabilidade da função.
     */
    const refreshTimeline = useCallback(async () => {
        if (!entityId) return; // Não busca se não tiver ID (ex: cadastro novo)

        setIsLoading(true);
        setError(null);

        try {
            const response = await TimelineService.getTimeline(entityType, entityId);
            setItems(response.data);
        } catch (err: any) {
            console.error('❌ [useTimeline] Erro ao buscar dados:', err);
            setError('Não foi possível carregar o histórico.');
        } finally {
            setIsLoading(false);
        }
    }, [entityId, module]);

    // Efeito: Carrega automaticamente ao montar ou mudar o ID
    useEffect(() => {
        refreshTimeline();
    }, [refreshTimeline]);


    // --- AÇÕES DE ESCRITA ---

    /**
     * Adiciona uma nova nota ou registro.
     * @param content Texto da nota
     * @param type Tipo (NOTE, CALL, ETC)
     * @param attachments Lista de arquivos (opcional)
     * @param metadata Dados extras (opcional)
     */
    const addEntry = async (
        type: TimelineEntryType,
        content: string, 
        attachments?: TimelineAttachment[],
        metadata?: Record<string, any>
    ) => {
        if (!entityId) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const newEvent = await TimelineService.createEntry({
                entityId,
                entityType,
                type,
                content,
                attachments,
                metadata
            });

            // Atualiza a lista localmente adicionando ao topo (Lógica LIFO padrão)
            // Nota: Se houver itens pinados, a ordem real virá no próximo refresh,
            // mas visualmente é bom ver o que acabou de digitar.
            setItems(prev => [newEvent, ...prev]);
            
            return newEvent;
        } catch (err: any) {
            console.error('❌ [useTimeline] Erro ao criar registro:', err);
            setError('Erro ao salvar. Tente novamente.');
            throw err; // Repassa erro para o componente lidar (ex: manter modal aberto)
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Alterna o PIN (Fixar no topo).
     * Usa Optimistic Update para feedback instantâneo.
     */
    const togglePin = async (eventId: string) => {
        // 1. Snapshot do estado anterior (para rollback em caso de erro)
        const previousItems = [...items];

        // 2. Atualização Otimista (Visual)
        setItems(prev => prev.map(item => 
            item.id === eventId 
                ? { ...item, isPinned: !item.isPinned } 
                : item
        ));

        try {
            // 3. Chamada Real
            await TimelineService.togglePin(eventId);
            
            // 4. Sucesso Silencioso:
            // Idealmente faríamos um refreshTimeline() aqui para garantir a ordenação correta 
            // (pois itens pinados mudam de lugar), mas para evitar "pulo" visual brusco,
            // podemos deixar o usuário ver a mudança de cor do ícone primeiro.
            // Opcional: refreshTimeline(); 

        } catch (err) {
            // 5. Rollback em caso de erro (Desfaz a mudança visual)
            console.error('❌ [useTimeline] Erro ao fixar item:', err);
            setItems(previousItems);
            setError('Não foi possível fixar o item.');
        }
    };

    /**
     * Remove um item.
     * Usa Optimistic Update.
     */
    const removeEntry = async (eventId: string) => {
        const previousItems = [...items];

        // Remove visualmente na hora
        setItems(prev => prev.filter(item => item.id !== eventId));

        try {
            await TimelineService.deleteEntry(eventId);
        } catch (err) {
            console.error('❌ [useTimeline] Erro ao excluir:', err);
            setItems(previousItems); // Devolve o item se deu erro
            setError('Erro ao excluir item.');
        }
    };

    return {
        // Dados
        items,
        isLoading,
        isSubmitting,
        error,

        // Ações
        refreshTimeline,
        addEntry,
        togglePin,
        removeEntry
    };
};