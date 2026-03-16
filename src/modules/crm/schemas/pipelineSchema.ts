import { z } from 'zod';
import { VALID_HEX_COLORS, SYS_COLORS } from '@/core/constants/sysColors'; // 👈 O Shared Kernel entra em ação

/**
 * @file pipelineSchema.ts
 * @description SCHEMA DE VALIDAÇÃO DE FUNIS DE VENDAS (Zod)
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Enterprise Grade):
 * 1. Sanitização Automática: Usa `.transform()` para limpar 'temp-ids' 
 * gerados pelo Drag & Drop antes de enviar o payload para a API.
 * 2. Auto-Indexação: Recalcula matematicamente o campo `order` com base 
 * na posição real do array, ignorando falhas de ordenação do usuário.
 * 3. Validação Fechada (Enum): Utiliza o Shared Kernel de Cores para 
 * garantir que apenas as 20 cores homologadas do sistema cheguem ao BD.
 * 4. Amortecimento de UX (Resiliência): Utiliza `catch()` e `coerce` para 
 * perdoar pequenos erros de dados vindos da UI ou da API, evitando travas.
 */

// 1. Schema do Filho (Etapa/Stage)
const PipelineStageSchema = z.object({
    // Obrigatório na UI para o Drag & Drop funcionar (seja UUID ou temp-id)
    id: z.string(),
    
    name: z.string()
        .min(2, 'O nome da etapa deve ter no mínimo 2 caracteres.'),
    
    // 💡 FIX UX: O Amortecedor de Cores
    // Em vez de uma Regex que quebrava o form se a cor viesse vazia,
    // agora nós checamos contra a nossa lista de 20 hexadecimais.
    // O '.catch()' garante que, se vier algo bizarro do banco antigo,
    // o Zod perdoa e aplica a cor primária (Ardósia) silenciosamente.
    color: z.enum(VALID_HEX_COLORS)
        .catch(SYS_COLORS[0].hex as any),
    
    // 💡 FIX UX: O Amortecedor de Ordem
    // `coerce.number` tenta forçar strings ("1") a virarem números (1) automaticamente.
    // O '.catch(0)' impede que um 'undefined' quebre a edição da etapa.
    order: z.coerce.number().int().min(0).catch(0)
});

// 2. Schema do Pai (Funil/Pipeline)
export const PipelineFormSchema = z.object({
    id: z.string().optional(),
    
    name: z.string()
        .min(3, 'O nome do funil deve ter no mínimo 3 caracteres.')
        .max(50, 'O nome muito longo.'),
    
    isDefault: z.boolean().default(false),
    
    stages: z.array(PipelineStageSchema)
        .min(1, 'O funil precisa ter pelo menos uma etapa.'),

    // Campos de Auditoria (Apenas leitura no form)
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
}).transform((data) => {
    // 🪄 A MÁGICA DA TRANSFORMAÇÃO (Sanitização para o Backend)
    // O objeto que o React Hook Form enxerga é diferente do que a API recebe.
    return {
        ...data,
        stages: data.stages.map((stage, index) => ({
            name: stage.name,
            color: stage.color,
            order: index, // Força a ordem exata do array visual, garantindo integridade
            
            // 🧹 GHOST-BUSTER:
            // Se for um 'temp-id' gerado pelo botão "+ Adicionar Fase", 
            // enviamos undefined para que o banco de dados gere um UUID real.
            id: stage.id.startsWith('temp-') ? undefined : stage.id,
        }))
    };
});

/**
 * @type PipelineFormInput & PipelineFormOutput
 * Como usamos .transform(), o Input (Formulário) e Output (Payload API) são diferentes.
 * O CrudLayout e o RHF usam o Input. O axios (API) usa o Output.
 */
export type PipelineFormInput = z.input<typeof PipelineFormSchema>;
export type PipelineFormOutput = z.output<typeof PipelineFormSchema>;