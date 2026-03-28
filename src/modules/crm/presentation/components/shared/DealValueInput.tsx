import React from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';

/**
 * @interface DealValueInputProps
 * @description Contrato de propriedades para o campo de valor monetário inteligente.
 */
interface DealValueInputProps {
    /** Instância do formulário vinda do React Hook Form (Motor V4) */
    form: UseFormReturn<any>;
}

/**
 * ============================================================================
 * 🧩 MICRO-COMPONENTE: DealValueInput
 * @description Input de valor monetário com lógica de bloqueio reativo.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO:
 * 1. Data Integrity: Monitora o array de itens. Se houver produtos/serviços 
 * detalhados, o input entra em modo 'readOnly' para forçar a verdade matemática.
 * 2. Visual Feedback: Altera a estética do campo (cor e brilho) para indicar 
 * ao usuário que o valor está sendo calculado automaticamente.
 * 3. HTML5 Compliance: Usa 'readOnly' em vez de 'disabled' para garantir que 
 * o valor continue sendo enviado no payload de submissão do formulário.
 * ============================================================================
 */
export const DealValueInput: React.FC<DealValueInputProps> = ({ form }) => {
    
    // Observa o array de itens para decidir o comportamento do input
    const watchedItems = useWatch({ 
        control: form.control, 
        name: 'items', 
        defaultValue: [] 
    });

    const hasItems = watchedItems && watchedItems.length > 0;

    return (
        <div className="relative animate-fade-in">
            <input
                type="number"
                step="0.01"
                {...form.register('value', { valueAsNumber: true })}
                
                /** * 🛡️ PROTEÇÃO DE DOMÍNIO: Se existem itens, o valor global não pode 
                 * ser editado arbitrariamente. Deve refletir a soma real.
                 */
                readOnly={hasItems} 
                
                placeholder={hasItems ? 'Calculado automaticamente...' : '0.00'}
                
                className={`
                    w-full bg-gray-900 border rounded-xl px-4 py-2.5 text-sm transition-all outline-none
                    ${hasItems 
                        ? 'border-gray-700 bg-gray-800/50 pointer-events-none text-green-400 font-bold shadow-inner' 
                        : 'border-gray-600 focus:border-accent-primary focus:ring-1 focus:ring-accent-primary text-white placeholder-gray-600'
                    }
                `}
            />
            
            {hasItems && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="text-[9px] font-black uppercase text-accent-secondary bg-accent-secondary/10 px-1.5 py-0.5 rounded border border-accent-secondary/20">
                        Auto
                    </span>
                </div>
            )}
        </div>
    );
};