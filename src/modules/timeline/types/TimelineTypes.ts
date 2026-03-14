import { AppModule } from "@/core/ai/types/enums/AIEnums";

/**
 * Define o tipo de conteúdo de cada item da timeline.
 * Isso ditará qual ícone e qual layout o Card vai renderizar.
 */
export enum TimelineEventType {
    
    // =========================================================================
    // 🗣️ CATEGORIA 1: INTERAÇÕES HUMANAS E COMUNICAÇÃO
    // Fatos manuais. A IA lê estes eventos para deduzir o tom da negociação.
    // =========================================================================
    NOTE = 'NOTE',                 // Anotação manual de um usuário
    CALL = 'CALL',                 // Registro de ligação (pode conter transcrição no content)
    MEETING = 'MEETING',           // Reunião (presencial ou vídeo)
    EMAIL = 'EMAIL',               // E-mail enviado/recebido
    WHATSAPP = 'WHATSAPP',         // Mensagem ou thread de WhatsApp
    AUDIO = 'AUDIO',               // Áudio enviado/recebido
    FILE = 'FILE',                 // Documento ou anexo genérico

    // =========================================================================
    // ⚙️ CATEGORIA 2: EVENTOS DE SISTEMA E MUTAÇÕES
    // O sistema narra sozinho o que mudou (Ex: Vendedor arrastou um card).
    // =========================================================================
    SYSTEM_ALERT = 'SYSTEM_ALERT',           // Alertas e bloqueios (Ex: "Cliente negativado")
    SYSTEM_CHANGE = 'SYSTEM_CHANGE',         // Mudança de status (Ex: "Deal movido para Ganho")
    DOCUMENT_GENERATED = 'DOCUMENT_GENERATED', // Ex: "Contrato em PDF gerado"

    // =========================================================================
    // 🧠 CATEGORIA 3: INTELIGÊNCIA CONTÍNUA (AI WORKERS)
    // Recibos de que os Operários de Background trabalharam.
    // =========================================================================
    AI_INSIGHT = 'AI_INSIGHT',                   // Dica rápida proativa (Ex: "Alerta de Churn detectado")
    
    // [Micro/Meso] Atualização de dossiês de Entidades ou Módulos (Ex: Cliente, Estoque)
    AI_ANALYSIS = 'AI_ANALYSIS',                 
    
    // [Macro] Relatório exclusivo do CEO Virtual cruzando dados de toda a empresa
    AI_STRATEGIC_REPORT = 'AI_STRATEGIC_REPORT'  
}

// A Mágica da Retrocompatibilidade e Single Source of Truth
export type TimelineEntryType = TimelineEventType;
// Exporta também o valor (runtime) para o DTO e o TypeORM usarem
export const TimelineEntryType = TimelineEventType;

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
    entityType: AppModule;

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
    entityType: AppModule;
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