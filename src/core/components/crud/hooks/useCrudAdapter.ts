import { useCallback } from 'react';
import { FieldValues } from 'react-hook-form';

// --- Tipagens e Contratos do Core ---
import { UseCrudAdapterParams, CrudHooks } from '../types';

/**
 * ============================================================================
 * 🧽 MOTOR DE SANITIZAÇÃO (Data Scrubbing / Anti-Corruption Layer)
 * @description Pure Function que atua como uma barreira sanitária. 
 * Remove campos de auditoria (System Fields) e IDs redundantes antes que 
 * o payload seja enviado para a API em operações de UPDATE (PATCH/PUT).
 * * 🏆 PADRÃO CLASSE OURO:
 * Protege o Banco de Dados contra violações de escopo, evitando erros 
 * "400 Bad Request" causados pelo envio indevido de createdAt/updatedAt.
 * ============================================================================
 */
const SYSTEM_FIELDS = ['id', 'createdAt', 'updatedAt', 'deletedAt', 'tenantId'];

export function sanitizeUpdatePayload<FormData extends FieldValues>(
    payload: FormData,
    extraOmitKeys: string[] = []
): Partial<FormData> {
    // Clonamos o objeto para preservar a imutabilidade do React Hook Form
    const cleanPayload = { ...payload };
    const keysToRemove = [...SYSTEM_FIELDS, ...extraOmitKeys];

    // Varredura de precisão: deleta a chave apenas se ela existir no objeto
    keysToRemove.forEach((key) => {
        if (key in cleanPayload) {
            delete cleanPayload[key as keyof FormData];
        }
    });

    return cleanPayload;
}

/**
 * ============================================================================
 * 🔌 O ADAPTADOR UNIVERSAL DE DOMÍNIO (useCrudAdapter)
 * @description Conecta os Hooks do React Query/Axios ao CrudLayout.
 * Centraliza a sanitização de dados, tratamento de erros e lógica de alertas.
 * * 🏆 PADRÃO CLASSE OURO (DRY & Adapter Pattern):
 * - Elimina a repetição de lógica de exclusão e limpeza de payload nos Registries.
 * - Consolida os estados de Loading e Erro das camadas de Leitura e Escrita.
 * ============================================================================
 */
export function useCrudAdapter<T, FormData extends FieldValues>({
    query,
    mutation,
    options
}: UseCrudAdapterParams<T, FormData>): CrudHooks<T, FormData> {

    // ========================================================================
    // ⚙️ ROTEADORES DE MUTAÇÃO (Commands)
    // ========================================================================

    /**
     * @method handleCreate
     * @description Repassa a criação intacta para o hook de mutação.
     */
    const handleCreate = useCallback(async (data: FormData) => {
        return mutation.createFn(data);
    }, [mutation]);

    /**
     * @method handleUpdate
     * @description O Interceptador. Esfrega os dados na "peneira" antes de 
     * acionar a API, garantindo que o backend receba apenas contexto de negócio.
     */
    const handleUpdate = useCallback(async (id: string, data: FormData) => {
        const cleanData = sanitizeUpdatePayload(data, options.omitKeysOnUpdate);
        return mutation.updateFn(id, cleanData);
    }, [mutation, options.omitKeysOnUpdate]);

    /**
     * @method handleDelete
     * @description O Guardião. Avalia as permissões de negócio antes de 
     * solicitar confirmação humana e, por fim, disparar a deleção.
     */
    const handleDelete = useCallback(async (id: string) => {
        // 🛑 Bloqueio de Segurança: A regra de negócio proíbe exclusão física aqui
        if (!options.allowDelete || !mutation.deleteFn) {
            alert(`⚠️ Operação bloqueada: A exclusão direta de ${options.entityName} não é permitida por regras de negócio. Utilize a inativação ou alteração de status.`);
            return false;
        }

        // 🗑️ Confirmação Padronizada (Ponto de entrada para um Modal System no futuro)
        if (window.confirm(`Tem certeza que deseja excluir permanentemente este registro de ${options.entityName}?`)) {
            await mutation.deleteFn(id);
            return true;
        }
        
        return false;
    }, [mutation, options]);

    // ========================================================================
    // 🚥 DERIVAÇÃO DE ESTADOS GLOBAIS (Consolidação de Sinais)
    // ========================================================================
    
    // O sistema está processando se a API de leitura OU de escrita estiver rodando
    const isLoadingGlobal = query.isLoading || mutation.isLoading;
    
    // Prioridade de UX: Erros de ação (salvar/deletar) sobrescrevem erros de listagem
    const errorGlobal = mutation.error 
        ? String(mutation.error) 
        : query.error 
            ? String(query.error) 
            : null;

    // Retorna a assinatura estrita que o CrudLayout exige para orquestrar a tela
    return {
        data: query.data,
        isLoading: isLoadingGlobal,
        error: errorGlobal,
        onCreate: handleCreate,
        onUpdate: handleUpdate,
        onDelete: handleDelete,
        onRefresh: query.refetch
    };
}