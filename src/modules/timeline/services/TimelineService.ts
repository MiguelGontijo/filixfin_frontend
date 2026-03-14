import { api } from '@/core/services/api'; // Ajuste conforme o path do seu Axios configurado
import { 
    TimelineEvent, 
    TimelineResponse, 
    CreateTimelineEntryPayload, 
} from '../types/TimelineTypes';
import { AppModule } from '@/core/ai/types/enums/AIEnums';

/**
 * @service TimelineService
 * @description Camada de comunicação com a API de Timeline Unificada (V8).
 * Responsável por conectar o Frontend ao endpoint polimórfico '/api/v1/timeline'.
 */
export const TimelineService = {

    /**
     * Busca o histórico completo de uma entidade.
     * @endpoint GET /api/v1/timeline/:entityType/:entityId
     * @param entityType O contexto (CLIENT, DEAL, PRODUCT...)
     * @param entityId O UUID da entidade dona do histórico
     * @param page Página atual (paginação)
     * @param limit Itens por página (default backend costuma ser 50)
     */
    getTimeline: async (
        entityType: AppModule, 
        entityId: string, 
        page: number = 1,
        limit: number = 50
    ): Promise<TimelineResponse> => {
        // A construção da URL segue o padrão REST definido no backend
        const url = `/timeline/${entityType}/${entityId}`;
        
        const { data } = await api.get<TimelineResponse>(url, {
            params: { page, limit }
        });

        return data;
    },

    /**
     * Cria um novo registro na timeline (Nota, Áudio, Anexo, etc).
     * @endpoint POST /api/v1/timeline
     * @param payload Objeto contendo o conteúdo e metadados
     */
    createEntry: async (payload: CreateTimelineEntryPayload): Promise<TimelineEvent> => {
        const { data } = await api.post<TimelineEvent>('/timeline', payload);
        return data;
    },

    /**
     * Alterna o status de fixação (Pin/Unpin) de um item.
     * Itens fixados aparecem no topo da lista.
     * @endpoint PATCH /api/v1/timeline/:id/pin
     * @param eventId ID do evento a ser fixado/desfixado
     */
    togglePin: async (eventId: string): Promise<TimelineEvent> => {
        const { data } = await api.patch<TimelineEvent>(`/timeline/${eventId}/pin`);
        return data;
    },

    /**
     * Remove um item da timeline (Soft Delete).
     * @endpoint DELETE /api/v1/timeline/:id
     * @param eventId ID do evento a ser removido
     */
    deleteEntry: async (eventId: string): Promise<void> => {
        await api.delete(`/timeline/${eventId}`);
    }
};