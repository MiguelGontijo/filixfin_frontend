'use client';

import React from 'react';
import { FieldValues } from 'react-hook-form';
import { FaEye, FaTimes, FaAlignLeft, FaCheck, FaBan, FaCube } from 'react-icons/fa';

// --- Tipagens e Contratos ---
import { CrudFormProps, CrudField } from '../../types';

// --- Utilitários e Wrappers ---
import { useDelayedUnmount } from '@/core/components/crud/hooks/useDelayedUnmount';
import { CrudFormWrapper } from '../layout/CrudFormWrapper';

/**
 * @helper formatFieldValue
 * @description Traduz valores brutos do banco de dados para formatos legíveis e 
 * amigáveis para o usuário, com base na tipagem do campo configurada no Manual.
 */
const formatFieldValue = (value: any, field: CrudField<any>): React.ReactNode => {
    if (value === null || value === undefined || value === '') {
        return <span className="text-gray-600 italic">Não informado</span>;
    }

    switch (field.type) {
        case 'boolean':
            return value ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <FaCheck /> {field.trueLabel || 'Sim'}
                </span>
            ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-gray-800 text-gray-400 border border-gray-700">
                    <FaBan /> {field.falseLabel || 'Não'}
                </span>
            );
        
        case 'select':
            // Busca a label amigável configurada nas options do campo
            const option = field.options?.find(opt => String(opt.value) === String(value));
            return <span className="font-medium text-gray-200">{option ? option.label : String(value)}</span>;
        
        case 'date':
            // Transforma ISO 8601 em formato BR seguro
            try {
                return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(value));
            } catch {
                return String(value);
            }
        
        case 'custom':
            return (
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded border border-gray-700/50">
                    <FaCube className="opacity-50" /> Componente Avançado
                </span>
            );

        default:
            return <span className="font-medium text-gray-200">{String(value)}</span>;
    }
};

/**
 * ============================================================================
 * 👁️ OPERÁRIO VISUAL: CrudFormView (Dossiê / Dashboard Read-Only)
 * @description O motor de renderização especializado em leitura.
 * Ele herda o comportamento espacial (Drawer/Inline) através do Wrapper genérico,
 * mas dispensa a inicialização de Zod ou React Hook Form.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO:
 * - Altíssima performance: Zero validações client-side em tempo de execução.
 * - Tratamento gracioso: Campos vazios ou `customRender` recebem fallbacks elegantes.
 * ============================================================================
 */
export function CrudFormView<T, FormData extends FieldValues = any>({
    isOpen,
    onClose,
    config,
    initialData,
    presentationMode = 'drawer'
}: Omit<CrudFormProps<T, FormData>, 'onSubmit'>) {

    // Sincroniza a desmontagem com a animação CSS (300ms)
    const shouldRender = useDelayedUnmount(isOpen, 300);

    if (!shouldRender) return null;

    return (
        <CrudFormWrapper 
            presentationMode={presentationMode} 
            isOpen={isOpen} 
            onClose={onClose}
        >
            <div className="flex flex-col h-full w-full bg-base-metallic">
                
                {/* --- HEADER ISOLADO DE VISUALIZAÇÃO --- */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-800/30 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-900/20 rounded-xl border border-blue-500/20 text-blue-400">
                            <FaEye size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">
                                Visualizar {config.title}
                            </h2>
                            <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">
                                Modo Dossiê (Apenas Leitura)
                            </p>
                        </div>
                    </div>
                    
                    {presentationMode !== 'inline' && (
                        <button 
                            type="button"
                            onClick={onClose} 
                            className="text-gray-500 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors focus:outline-none"
                            title="Fechar Painel"
                        >
                            <FaTimes size={18} />
                        </button>
                    )}
                </div>

                {/* --- BODY (O Dossiê) --- */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                    
                    {!initialData ? (
                        <div className="p-6 text-center text-gray-500 border border-dashed border-gray-700 rounded-xl bg-gray-800/20">
                            Nenhum dado fornecido para visualização.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                            
                            {/* Varredura Dinâmica dos Campos Regulares */}
                            {config.fields.map((field) => {
                                const rawValue = (initialData as any)[field.name];
                                const isTextarea = field.type === 'textarea';

                                return (
                                    <div 
                                        key={String(field.name)} 
                                        className={`flex flex-col space-y-2 ${isTextarea ? 'col-span-full' : 'col-span-1'}`}
                                    >
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                                            {isTextarea && <FaAlignLeft className="opacity-50" />} {field.label}
                                        </label>
                                        
                                        {isTextarea ? (
                                            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap shadow-inner min-h-[100px]">
                                                {rawValue ? String(rawValue) : <span className="text-gray-600 italic">Sem anotações registradas.</span>}
                                            </div>
                                        ) : (
                                            <div className="bg-gray-900/30 rounded-lg px-4 py-2.5 border border-gray-800 flex items-center min-h-[44px]">
                                                {formatFieldValue(rawValue, field)}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            
                            {/* Divisor para Campos de Sistema (Se existirem) */}
                            {config.systemFields && config.systemFields.length > 0 && (
                                <div className="col-span-full pt-6 mt-2 border-t border-gray-800/50">
                                    <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-4">
                                        Auditoria e Sistema
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {config.systemFields.map((field) => {
                                            const rawValue = (initialData as any)[field.name];
                                            return (
                                                <div key={String(field.name)} className="bg-gray-900/20 rounded border border-gray-800 p-3">
                                                    <span className="block text-[9px] font-bold text-gray-600 uppercase mb-1">
                                                        {field.label}
                                                    </span>
                                                    <div className="text-xs font-mono text-gray-400">
                                                        {formatFieldValue(rawValue, field)}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </div>

                {/* --- FOOTER DE AÇÕES (Voltar) --- */}
                {presentationMode !== 'inline' && (
                    <div className="p-5 border-t border-gray-800 bg-gray-900/80 flex justify-end flex-shrink-0">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-6 py-2.5 text-sm font-bold text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl transition-colors shadow-lg active:scale-95"
                        >
                            Voltar para Lista
                        </button>
                    </div>
                )}
            </div>
        </CrudFormWrapper>
    );
}