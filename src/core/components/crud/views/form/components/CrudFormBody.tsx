import React, { useState } from 'react';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import { FaExclamationTriangle, FaChevronDown, FaChevronUp } from 'react-icons/fa';

// --- Tipagens e Componentes do Core ---
import { CrudConfig } from '../../../types';
import { CrudFieldFactory } from './CrudFieldFactory';

/**
 * @interface CrudFormBodyProps
 * @description Contrato estrito para o Corpo do Formulário.
 * Recebe apenas o que é necessário para mapear e instanciar os campos.
 */
export interface CrudFormBodyProps<T, FormData extends FieldValues> {
    /** Configuração estrutural do formulário (Schema, Campos, Layout) */
    config: CrudConfig<T, FormData>;
    /** Instância do React Hook Form gerenciada pelo Maestro */
    form: UseFormReturn<FormData>;
    /** Mensagem de erro global (Falhas de API ou regras de negócio) */
    error: string | null;
}

/**
 * ============================================================================
 * 🧩 CRUD FORM: BODY (A Área de Renderização dos Campos)
 * @description Componente isolado responsável por iterar sobre a configuração
 * e desenhar os campos através da Fábrica (CrudFieldFactory).
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Encapsulamento e SRP):
 * - O estado visual da "Gaveta de Auditoria" foi encapsulado aqui dentro,
 * liberando o componente Pai (Maestro) de gerenciar estados irrelevantes de UI.
 * ============================================================================
 */
export function CrudFormBody<T, FormData extends FieldValues>({
    config,
    form,
    error
}: CrudFormBodyProps<T, FormData>) {
    
    // Encapsulamento do estado visual (Abrir/Fechar Auditoria)
    // O Maestro (CrudForm) não precisa mais saber que isso existe.
    const [showSystemFields, setShowSystemFields] = useState(false);

    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative">
            
            {/* 🛑 Tarja de Erro Global (Feedback de Falhas de Negócio/API) */}
            {error && (
                <div className="p-4 bg-red-900/20 border border-red-900/50 text-red-400 rounded-xl text-sm flex items-center shadow-inner animate-fade-in">
                    <FaExclamationTriangle className="mr-3 flex-shrink-0 text-lg opacity-80" /> 
                    <span className="font-medium leading-relaxed">{error}</span>
                </div>
            )}

            {/* 🏭 Grid Principal: Mapeamento e Injeção na Fábrica de Campos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                {config.fields.map((field) => (
                    <CrudFieldFactory 
                        key={String(field.name)} 
                        field={field} 
                        form={form} 
                    />
                ))}
            </div>

            {/* 🗄️ Gaveta de Auditoria (Campos do Sistema: ID, Datas, etc) */}
            {config.systemFields && config.systemFields.length > 0 && (
                <div className="pt-6 mt-6 border-t border-gray-800/50">
                    <button
                        type="button"
                        onClick={() => setShowSystemFields(!showSystemFields)}
                        className="flex items-center text-xs font-bold text-gray-500 hover:text-gray-300 uppercase tracking-widest transition-colors w-full focus:outline-none"
                    >
                        {showSystemFields ? <FaChevronUp className="mr-2" /> : <FaChevronDown className="mr-2" />}
                        Informações do Sistema (Auditoria)
                    </button>
                    
                    {showSystemFields && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 p-5 bg-gray-900/30 border border-gray-700/30 rounded-xl shadow-inner animate-fade-in-up">
                            {config.systemFields.map((field) => (
                                <CrudFieldFactory 
                                    key={String(field.name)} 
                                    field={field} 
                                    form={form} 
                                    disabled={true} // Força o modo 'readonly' visual da fábrica
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}