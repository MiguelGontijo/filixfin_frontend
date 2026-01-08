// Define a estrutura de uma Etapa (Stage) vinda da API
export interface IPipelineStage {
    id: string;
    pipelineId: string;
    name: string;
    color: string;
    orderIndex: number;
    code?: string; // Ex: WON, LOST
}

// Define a estrutura de um Funil (Pipeline) completo
export interface IPipeline {
    id: string;
    name: string;
    isDefault: boolean;
    tenantId: string;
    stages: IPipelineStage[];
}

// DTO para envio de dados na criação de um novo funil
export interface ICreatePipelineDTO {
    name: string;
    isDefault?: boolean;
    stages: {
        name: string;
        color: string;
        orderIndex: number;
    }[];
}

// DTO para atualização (Renomear, Reordenar)
export interface IUpdatePipelineDTO {
    id: string;
    name?: string;
    isDefault?: boolean;
    stages?: {
        id?: string; // Opcional se for novo
        name: string;
        color: string;
        orderIndex: number;
    }[];
}