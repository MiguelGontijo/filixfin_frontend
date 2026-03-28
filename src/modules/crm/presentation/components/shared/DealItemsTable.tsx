import React, { useMemo, useEffect } from 'react';
import { UseFormReturn, useFieldArray, useWatch } from 'react-hook-form'; 
import { FaDollarSign, FaTrash, FaPlus } from 'react-icons/fa';

/**
 * @interface DealItemsTableProps
 * @description Contrato de propriedades para a tabela dinâmica de precificação da Oportunidade.
 */
interface DealItemsTableProps {
    /** Instância do formulário vinda do React Hook Form (Motor V4) */
    form: UseFormReturn<any>;
}

/**
 * ============================================================================
 * 🧩 MICRO-COMPONENTE: DealItemsTable
 * @description Tabela reativa "In-Form" para gestão de escopo comercial. 
 * Gerencia a adição, remoção e edição de itens (Produtos/Serviços) e realiza 
 * o cálculo matemático do VGV (Valor Geral de Vendas) em tempo real.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO:
 * 1. Reactive Engine: Utiliza 'useFieldArray' para manipulação performática 
 * de listas extensas sem perda de foco no input.
 * 2. Automated Pricing: Sincroniza automaticamente o campo 'value' global 
 * do formulário com a soma dos subtotais dos itens detalhados.
 * 3. UX de Feedback: Apresenta o totalizador destacado com formatação monetária 
 * brasileira (BRL) para precisão comercial.
 * ============================================================================
 */
export const DealItemsTable: React.FC<DealItemsTableProps> = ({ form }) => {
    // Gerenciador de Array Dinâmico do RHF
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'items' // Chave estrita definida no dealSchema
    });

    // Observadores de estado para o cálculo em tempo real
    const watchedItems = useWatch({ control: form.control, name: 'items', defaultValue: [] });
    const watchedManualValue = useWatch({ control: form.control, name: 'value', defaultValue: 0 });

    /**
     * @constant computedTotal
     * @description Motor de Cálculo: Soma recursiva de (Quantidade * Preço Unitário).
     * Se não houver itens, preserva o valor manual global.
     */
    const computedTotal = useMemo(() => {
        if (!watchedItems || watchedItems.length === 0) return watchedManualValue;
        return watchedItems.reduce((acc: number, item: any) => {
            const qty = Number(item?.quantity) || 0;
            const price = Number(item?.unitPrice) || 0;
            return acc + (qty * price);
        }, 0);
    }, [watchedItems, watchedManualValue]);

    /**
     * @effect SyncValue
     * @description Sincroniza o total calculado com o registro formal do formulário.
     * Impede divergências entre o detalhamento e o valor salvo no banco.
     */
    useEffect(() => {
        if (watchedItems && watchedItems.length > 0) {
            const currentFormValue = Number(form.getValues('value')) || 0;
            if (currentFormValue !== computedTotal) {
                form.setValue('value', computedTotal, { shouldValidate: true, shouldDirty: true });
            }
        }
    }, [computedTotal, watchedItems, form]);

    return (
        <div className="mt-6 border border-gray-700/50 rounded-xl overflow-hidden bg-gray-800/20 animate-fade-in">
            {/* --- HEADER DA TABELA COM TOTALIZADOR --- */}
            <div className="bg-gray-800/80 px-4 py-3 flex justify-between items-center border-b border-gray-700/50">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <FaDollarSign className="text-accent-secondary" /> Escopo Comercial
                </h4>
                <div className="text-sm font-black text-green-400 drop-shadow-md transition-all duration-200">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(computedTotal)}
                </div>
            </div>

            {/* --- LISTA DE ITENS --- */}
            <div className="p-2 space-y-2">
                {fields.length === 0 ? (
                    <div className="p-4 text-center">
                        <p className="text-xs text-gray-500 mb-1">Nenhum produto ou serviço detalhado.</p>
                        <p className="text-[10px] text-gray-600 italic">O valor manual global da oportunidade será utilizado.</p>
                    </div>
                ) : (
                    fields.map((field, index) => (
                        <div 
                            key={field.id} 
                            className="flex items-center gap-2 bg-gray-900/50 p-2 rounded-lg border border-gray-700/30 group transition-all hover:border-gray-500"
                        >
                            {/* Hidden ID para manter a referência da persistência no TypeORM */}
                            <input type="hidden" {...form.register(`items.${index}.id` as const)} />
                            
                            {/* Descrição do Item */}
                            <input 
                                {...form.register(`items.${index}.description` as const)} 
                                placeholder="Descrição do Produto/Serviço..."
                                className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-600 px-2 py-1 focus:outline-none focus:bg-gray-800 rounded transition-colors"
                            />

                            {/* Quantidade */}
                            <input 
                                type="number" 
                                step="0.01"
                                {...form.register(`items.${index}.quantity` as const, { valueAsNumber: true })} 
                                placeholder="Qtd"
                                className="w-20 bg-transparent text-sm text-center text-gray-200 placeholder-gray-600 px-2 py-1 focus:outline-none focus:bg-gray-800 rounded transition-colors border-l border-gray-700/50"
                            />

                            {/* Valor Unitário */}
                            <input 
                                type="number" 
                                step="0.01"
                                {...form.register(`items.${index}.unitPrice` as const, { valueAsNumber: true })} 
                                placeholder="R$ Unitário"
                                className="w-28 bg-transparent text-sm text-right text-gray-200 placeholder-gray-600 px-2 py-1 focus:outline-none focus:bg-gray-800 rounded transition-colors border-l border-gray-700/50"
                            />

                            {/* Ação de Remoção */}
                            <button 
                                type="button" 
                                onClick={() => remove(index)}
                                className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                title="Remover item do escopo"
                            >
                                <FaTrash size={12} />
                            </button>
                        </div>
                    ))
                )}
                
                {/* --- BOTÃO ADICIONAR ITEM --- */}
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