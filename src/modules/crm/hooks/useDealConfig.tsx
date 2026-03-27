import React, { useMemo, useEffect } from 'react';
import { UseFormReturn, useFieldArray, useWatch } from 'react-hook-form'; 
// 💡 FIX: Importamos o FaHandshake para atuar como o Avatar do Card
import { FaUserTie, FaDollarSign, FaTrash, FaPlus, FaHandshake } from 'react-icons/fa';

// --- Motor CRUD V4 ---
import { CrudConfig } from '@/core/components/crud/types';

// --- Contratos e Tipos do Domínio ---
import { CRMDeal, DealStatus, DealSource } from '../types';
import { DealFormSchema, DealFormInput } from '../schemas/dealSchema';
import { IPipeline } from '../types/pipeline.types';
import { Client } from '@/core/client/types/client';

/**
 * ============================================================================
 * 🧩 MICRO-COMPONENTE 1: SELETOR EM CASCATA (Pipeline -> Stage)
 * @description Gerencia a interdependência entre Funil e Etapa. Se o funil 
 * for alterado, a etapa atual é resetada para evitar inconsistência de dados.
 * ============================================================================
 */
const PipelineStageSelector = ({ form, pipelines }: { form: UseFormReturn<any>, pipelines: IPipeline[] }) => {
    const selectedPipelineId = useWatch({ 
        control: form.control, 
        name: 'pipelineId' 
    });
    
    const activePipeline = useMemo(() => 
        pipelines.find(p => p.id === selectedPipelineId), 
    [pipelines, selectedPipelineId]);

    const { onChange: onPipelineChange, ...pipelineRegister } = form.register('pipelineId');

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl shadow-inner">
            <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Funil de Vendas</label>
                <select 
                    {...pipelineRegister}
                    onChange={(e) => {
                        onPipelineChange(e);
                        // Reseta a etapa sempre que o funil mudar
                        form.setValue('currentStageId', '', { shouldValidate: true, shouldDirty: true });
                    }}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none transition-all"
                >
                    <option value="">Selecione um funil...</option>
                    {pipelines.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Etapa Atual</label>
                <select 
                    {...form.register('currentStageId')}
                    disabled={!selectedPipelineId}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <option value="">Selecione uma etapa...</option>
                    {activePipeline?.stages?.sort((a, b) => a.order - b.order).map(stage => (
                        <option key={stage.id} value={stage.id}>{stage.name}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

/**
 * ============================================================================
 * 🧩 MICRO-COMPONENTE 2: EDITOR DE ITENS DINÂMICO (Produtos/Serviços)
 * @description Tabela reativa "In-Form". Gerencia adição/remoção de linhas e 
 * calcula o total em tempo real, refletindo no campo de valor global.
 * ============================================================================
 */
const DealItemsEditor = ({ form }: { form: UseFormReturn<any> }) => {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'items'
    });

    const watchedItems = useWatch({ control: form.control, name: 'items', defaultValue: [] });
    const watchedManualValue = useWatch({ control: form.control, name: 'value', defaultValue: 0 });

    // Motor de Cálculo: Multiplica Qtd x Preço de todos os itens
    const computedTotal = useMemo(() => {
        if (!watchedItems || watchedItems.length === 0) return watchedManualValue;
        return watchedItems.reduce((acc: number, item: any) => {
            const qty = Number(item?.quantity) || 0;
            const price = Number(item?.unitPrice) || 0;
            return acc + (qty * price);
        }, 0);
    }, [watchedItems, watchedManualValue]);

    // Sincroniza o total calculado com o registro formal do formulário
    useEffect(() => {
        if (watchedItems && watchedItems.length > 0) {
            const currentFormValue = Number(form.getValues('value')) || 0;
            if (currentFormValue !== computedTotal) {
                form.setValue('value', computedTotal, { shouldValidate: true, shouldDirty: true });
            }
        }
    }, [computedTotal, watchedItems, form]);

    return (
        <div className="mt-6 border border-gray-700/50 rounded-xl overflow-hidden bg-gray-800/20">
            <div className="bg-gray-800/80 px-4 py-3 flex justify-between items-center border-b border-gray-700/50">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <FaDollarSign className="text-accent-secondary" /> Escopo Comercial
                </h4>
                <div className="text-sm font-black text-green-400 drop-shadow-md transition-all duration-200">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(computedTotal)}
                </div>
            </div>

            <div className="p-2 space-y-2">
                {fields.length === 0 ? (
                    <div className="p-4 text-center">
                        <p className="text-xs text-gray-500 mb-1">Nenhum produto ou serviço detalhado.</p>
                        <p className="text-[10px] text-gray-600">O valor manual global da oportunidade será utilizado.</p>
                    </div>
                ) : (
                    fields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-2 bg-gray-900/50 p-2 rounded-lg border border-gray-700/30 group transition-all hover:border-gray-500">
                            <input type="hidden" {...form.register(`items.${index}.id` as const)} />
                            <input 
                                {...form.register(`items.${index}.description` as const)} 
                                placeholder="Descrição do Produto/Serviço..."
                                className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-600 px-2 py-1 focus:outline-none focus:bg-gray-800 rounded transition-colors"
                            />
                            <input 
                                type="number" 
                                step="0.01"
                                {...form.register(`items.${index}.quantity` as const, { valueAsNumber: true })} 
                                placeholder="Qtd"
                                className="w-20 bg-transparent text-sm text-center text-gray-200 placeholder-gray-600 px-2 py-1 focus:outline-none focus:bg-gray-800 rounded transition-colors border-l border-gray-700/50"
                            />
                            <input 
                                type="number" 
                                step="0.01"
                                {...form.register(`items.${index}.unitPrice` as const, { valueAsNumber: true })} 
                                placeholder="R$ Unitário"
                                className="w-28 bg-transparent text-sm text-right text-gray-200 placeholder-gray-600 px-2 py-1 focus:outline-none focus:bg-gray-800 rounded transition-colors border-l border-gray-700/50"
                            />
                            <button 
                                type="button" 
                                onClick={() => remove(index)}
                                className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                title="Remover item"
                            >
                                <FaTrash size={12} />
                            </button>
                        </div>
                    ))
                )}
                
                <button 
                    type="button"
                    onClick={() => append({ id: `temp-${Date.now()}`, description: '', quantity: 1, unitPrice: 0, type: 'SERVICE' })}
                    className="w-full py-2.5 mt-2 flex items-center justify-center gap-2 text-xs font-bold text-gray-500 hover:text-accent-secondary border border-dashed border-gray-700 hover:border-accent-secondary/50 rounded-lg hover:bg-gray-800/50 transition-all"
                >
                    <FaPlus size={10} /> Adicionar Produto / Serviço
                </button>
            </div>
        </div>
    );
};

/**
 * ============================================================================
 * 🧱 MICRO-COMPONENTE 3: INPUT DE VALOR REATIVO
 * @description Bloqueia a edição manual do valor total se existirem itens
 * detalhados na tabela acima, forçando a integridade matemática da venda.
 * ============================================================================
 */
const DealValueInput = ({ form }: { form: UseFormReturn<any> }) => {
    const watchedItems = useWatch({ control: form.control, name: 'items', defaultValue: [] });
    const hasItems = watchedItems && watchedItems.length > 0;

    return (
        <input
            type="number"
            step="0.01"
            {...form.register('value', { valueAsNumber: true })}
            // readOnly garante que o valor seja enviado no submit, diferente do disabled
            readOnly={hasItems} 
            placeholder={hasItems ? 'Calculado automaticamente' : '0.00'}
            className={`w-full bg-gray-900 border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all ${
                hasItems ? 'border-gray-700 bg-gray-800/50 pointer-events-none text-green-400 font-bold' : 'border-gray-600 focus:border-accent-primary focus:ring-1 focus:ring-accent-primary placeholder-gray-600'
            }`}
        />
    );
};

/**
 * ============================================================================
 * 🏭 HOOK PRINCIPAL: CONFIGURAÇÃO DE OPORTUNIDADES (Manual de Instruções)
 * @description Centraliza todas as regras visuais, mapeamento de colunas da 
 * tabela e inputs do formulário do módulo de Oportunidades.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Injeção de Dependência):
 * Recebe dados externos (clients, pipelines) via parâmetros para manter a
 * pureza e evitar acoplamento com o estado global de loading do Registry.
 * ============================================================================
 */
export function useDealConfig(
    clients: Client[], 
    pipelines: IPipeline[], 
    isCompact: boolean = false
): CrudConfig<CRMDeal, DealFormInput> {
    
    return useMemo(() => {
        
        // Construtores de Opções para os Selects
        const clientOptions = clients.map(c => ({ value: c.id, label: c.name }));
        const statusOptions = Object.values(DealStatus).map(s => ({ value: s, label: s }));
        const sourceOptions = Object.values(DealSource).map(s => ({ value: s, label: s }));

        return {
            // Roteamento visual baseado no polimorfismo do componente pai
            title: isCompact ? 'Oportunidades do Cliente' : 'Gestão de Oportunidades',
            description: isCompact ? '' : 'Auditoria central de todas as negociações da plataforma.',
            schema: DealFormSchema as any, 

            // --- 👁️ VISÃO MASTER (A Tabela) ---
            columns: [
                {
                    header: 'Oportunidade',
                    accessor: (item) => {
                        const clientInfo = item.client || clients.find(c => c.id === item.clientId);
                        return (
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-bold text-white leading-tight">{item.title}</span>
                                {!isCompact && (
                                    <span className="text-xs text-gray-500 flex items-center gap-1.5 truncate max-w-[250px]">
                                        <FaUserTie className="opacity-60" /> {clientInfo?.name || 'Cliente Não Encontrado'}
                                    </span>
                                )}
                            </div>
                        );
                    }
                },
                {
                    header: 'Posicionamento',
                    accessor: (item) => {
                        const pipe = pipelines.find(p => p.id === item.pipelineId);
                        const stage = pipe?.stages?.find(s => s.id === item.currentStageId);
                        return (
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{pipe?.name || 'Sem Funil'}</span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: stage?.color || '#555' }} />
                                    <span className="text-xs text-gray-300 truncate max-w-[150px]">{stage?.name || item.status}</span>
                                </div>
                            </div>
                        );
                    }
                },
                {
                    header: 'Previsão',
                    accessor: (item) => (
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-sm font-black text-green-400 drop-shadow-md">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.value))}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                item.probability >= 70 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                                item.probability >= 30 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                                'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                                {item.probability}%
                            </span>
                        </div>
                    )
                }
            ],

            // ========================================================================
            // 🃏 CONFIGURAÇÃO DE CARDS (Para a Barra Lateral Inferior)
            // @description Ensina ao CrudCardList como extrair e desenhar os dados visuais.
            // ========================================================================
            cardConfig: {
                title: (item) => item.title,
                subtitle: (item) => {
                    const pipe = pipelines.find(p => p.id === item.pipelineId);
                    const stage = pipe?.stages?.find(s => s.id === item.currentStageId);
                    const formattedValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.value));
                    
                    return (
                        <div className="flex flex-col gap-1 mt-0.5">
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_4px_rgba(255,255,255,0.1)]" style={{ backgroundColor: stage?.color || '#555' }} />
                                <span className="text-[10px] text-gray-500 truncate font-medium">
                                    {stage?.name || item.status}
                                </span>
                            </div>
                            <span className="text-xs font-bold text-green-400 drop-shadow-sm">
                                {formattedValue}
                            </span>
                        </div>
                    );
                },
                // 💡 FIX CLASSE OURO: Injetado o avatar para criar alinhamento e simetria com a lista superior.
                avatar: () => (
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-accent-primary/10 text-accent-primary flex-shrink-0 shadow-inner">
                        <FaHandshake className="w-3.5 h-3.5" />
                    </div>
                ),
                badge: (item) => {
                    // Badge estilizada com base na probabilidade de fechamento
                    const isHigh = item.probability >= 70;
                    const isMedium = item.probability >= 30;
                    return {
                        text: `${item.probability}%`,
                        variant: isHigh ? 'success' : isMedium ? 'warning' : 'danger'
                    };
                }
            },

            // --- 📝 VISÃO DETAIL (O Formulário de Auditoria) ---
            fields: [
                { name: 'title', label: 'Título da Oportunidade', type: 'text', placeholder: 'Ex: Consultoria Plena Anual' },
                { name: 'clientId', label: 'Cliente Vinculado', type: 'select', options: clientOptions },
                
                {
                    name: 'currentStageId',
                    label: 'Roteamento Comercial',
                    type: 'custom',
                    customRender: (form) => <PipelineStageSelector form={form} pipelines={pipelines} />
                },

                { name: 'probability', label: 'Probabilidade de Fechamento (%)', type: 'number', placeholder: '0 a 100' },
                { name: 'expectedCloseDate', label: 'Previsão de Fechamento', type: 'date' },
                
                { name: 'status', label: 'Status Lógico', type: 'select', options: statusOptions },
                { name: 'source', label: 'Origem do Lead', type: 'select', options: sourceOptions },
                
                {
                    name: 'items',
                    label: 'Precificação Detalhada',
                    type: 'custom',
                    customRender: (form) => <DealItemsEditor form={form} />
                },
                
                { 
                    name: 'value', 
                    label: 'Valor Manual Global (Apenas para vendas simples)', 
                    type: 'custom',
                    customRender: (form) => <DealValueInput form={form} />
                },
            ],

            // --- 🗄️ GAVETA DE AUDITORIA ---
            systemFields: [
                { name: 'id', label: 'UUID da Oportunidade', type: 'text' },
                { name: 'lossReason', label: 'Motivo de Perda', type: 'textarea' },
            ]

        };
    }, [clients, pipelines, isCompact]); 
}