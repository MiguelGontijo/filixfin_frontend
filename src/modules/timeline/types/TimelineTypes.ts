// ===== FILE: src/modules/timeline/types/TimelineTypes.ts =====

/**
 * Define os contextos possíveis onde a Timeline pode ser instanciada.
 * Deve estar sincronizado com o Backend (TimelineEntityType).
 */
export type TimelineEntityType = 
    | 'CLIENT' 
    | 'DEAL' 
    | 'PRODUCT' 
    | 'SUPPLIER' 
    | 'ORDER';

/**
 * Define o tipo de conteúdo de cada item da timeline.
 * Isso ditará qual ícone e qual layout o Card vai renderizar.
 */
export type TimelineEntryType = 
    | 'NOTE'          // Nota de texto simples
    | 'CALL'          // Registro de ligação
    | 'MEETING'       // Registro de reunião
    | 'EMAIL'         // Email enviado/recebido
    | 'WHATSAPP'      // Conversa de Zap
    | 'AUDIO'         // Áudio gravado (Voice Note)
    | 'FILE'          // Upload de arquivo genérico
    | 'AI_INSIGHT'    // Análise gerada pelo Robô V8
    | 'SYSTEM_ALERT'; // Log automático do sistema (ex: "Mudou de fase")

/**
 * Estrutura de um anexo (Arquivo/Mídia).
 * Armazenado dentro do JSONB no banco.
 */
export interface TimelineAttachment {
    id: string;           // UUID ou ID do Storage
    originalName: string; // Ex: "contrato_v1.pdf"
    mimeType: string;     // Ex: "application/pdf"
    url: string;          // URL pública/assinada para download
    sizeBytes: number;    // Para exibir "2.5 MB" na UI
}

/**
 * Representação mínima do usuário autor do evento.
 * Evita trafegar o objeto User inteiro com senhas/tokens.
 */
export interface TimelineAuthor {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string; // Futuro
}

/**
 * A Entidade Principal: Um evento na linha do tempo.
 * Reflete a tabela `timeline_events` do Backend.
 */
export interface TimelineEvent {
    id: string;
    tenantId: string;
    
    // Polimorfismo (A quem pertence isso?)
    entityId: string;
    entityType: TimelineEntityType;

    // Conteúdo
    type: TimelineEntryType;
    content: string | null; // Pode ser null se tiver apenas anexos
    
    // Metadados Flexíveis (JSONB)
    // Ex: { duration: 120, sentiment: 'positive', tags: ['urgente'] }
    metadata?: Record<string, any>;

    // Anexos (JSONB)
    attachments?: TimelineAttachment[];

    // Controles
    isPinned: boolean;      // Se true, aparece fixado no topo
    occurredAt: string;     // Data ISO (Quando aconteceu o fato)
    createdAt: string;      // Data ISO (Quando foi registrado no sistema)
    
    // Relacionamento (Quem fez?)
    createdById?: string;
    creator?: TimelineAuthor; // Opcional, pois pode ser evento de sistema
}

// --- DTOs para Comunicação com a API (Write Operations) ---

/**
 * Payload para criar um novo registro na Timeline.
 */
export interface CreateTimelineEntryPayload {
    entityId: string;
    entityType: TimelineEntityType;
    type: TimelineEntryType;
    content?: string;
    
    // Metadados opcionais para salvar contextos extras
    metadata?: Record<string, any>;
    
    // Anexos já processados (upload feito previamente)
    attachments?: TimelineAttachment[];
    
    // Se o usuário quiser fixar imediatamente ou registrar data retroativa
    isPinned?: boolean;
    occurredAt?: string; // Date ISO string
}

/**
 * Payload para atualizar um registro existente (PATCH).
 */
export interface UpdateTimelineEntryPayload {
    content?: string;
    isPinned?: boolean;
    metadata?: Record<string, any>;
}

/**
 * Resposta paginada da API.
 */
export interface TimelineResponse {
    data: TimelineEvent[];
    total: number;
}