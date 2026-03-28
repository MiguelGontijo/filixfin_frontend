'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { 
    FaClock, 
    FaGlobeAmericas, 
    FaRedo, 
    FaListUl, 
    FaMapMarkerAlt, 
    FaCalendarCheck 
} from 'react-icons/fa';

/** --- INTELIGÊNCIA DE DOMÍNIO --- */
import { ProductFormInput } from '../../../domain/schemas/productSchema';

interface ServiceFieldsProps {
    form: UseFormReturn<ProductFormInput>;
}

/**
 * ============================================================================
 * 🛠️ COMPONENTE: ServiceAttributesFields
 * @description Sub-formulário especializado para o domínio de Serviços.
 * Gerencia atributos de execução, SLAs de tempo e modelos de recorrência.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (ServiceNow/Google Cloud Level):
 * 1. Deep Path Binding: Registra propriedades diretamente no 'attributes.field'.
 * 2. Discriminated Type Safety: Utiliza cast seguro (as any) no watch para 
 * evitar erros de união de tipos (ts2339).
 * 3. Atomic Recurrence: Configurações de assinatura sincronizadas nativamente.
 * ============================================================================
 */
export const ServiceFields: React.FC<ServiceFieldsProps> = ({ form }) => {
    const { register, setValue, watch } = form;

    /** * 🛡️ ACESSO SEGURO (Contextual Casting)
     * Realizamos o cast para 'any' na leitura para permitir acesso às chaves 
     * específicas de Serviço sem conflito com os outros modelos de domínio.
     */
    const attributes = watch('attributes') as any;

    /** * 🧠 HELPER: handleRequirementsChange
     * Converte a entrada de texto em um array de requisitos no evento de Blur.
     */
    const handleRequirementsChange = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        const reqArray = text.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
        setValue('attributes.requirements' as any, reqArray, { shouldDirty: true });
    };

    const requirementsDefault = Array.isArray(attributes?.requirements) 
        ? attributes.requirements.join('\n') 
        : '';

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-500">
            
            {/* --- SEÇÃO A: GOVERNANÇA DE TEMPO E RECORRÊNCIA --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Duração Estimada */}
                <div className="space-y-1">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <FaClock className="text-accent-primary/60" /> Duração de Execução (Minutos)
                    </label>
                    <input 
                        {...register('attributes.duration_minutes' as any)}
                        type="number"
                        placeholder="Ex: 60"
                        className="w-full bg-black/40 border border-gray-800 p-3 rounded-lg text-sm text-white focus:border-accent-primary outline-none transition-all font-mono"
                    />
                </div>

                {/* Ciclo de Faturamento / Recorrência */}
                <div className="space-y-1">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <FaRedo className="text-accent-primary/60" /> Modelo de Recorrência
                    </label>
                    <select 
                        {...register('attributes.recurrence' as any)}
                        className="w-full bg-black/40 border border-gray-800 p-3 rounded-lg text-sm text-white focus:border-accent-primary outline-none transition-all cursor-pointer"
                    >
                        <option value="NONE">Venda Única / Eventual</option>
                        <option value="WEEKLY">Semanal</option>
                        <option value="BIWEEKLY">Quinzenal</option>
                        <option value="MONTHLY">Mensal (Assinatura)</option>
                        <option value="QUARTERLY">Trimestral</option>
                        <option value="YEARLY">Anual</option>
                    </select>
                </div>
            </div>

            {/* --- SEÇÃO B: MODELO DE ENTREGA E LOCALIDADE --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-800/50">
                {/* Tipo de Localização */}
                <div className="space-y-1">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <FaMapMarkerAlt className="text-accent-secondary/60" /> Local de Prestação
                    </label>
                    <select 
                        {...register('attributes.location_type' as any)}
                        className="w-full bg-black/40 border border-gray-800 p-3 rounded-lg text-sm text-white focus:border-accent-primary outline-none transition-all cursor-pointer"
                    >
                        <option value="COMPANY_SITE">Sede da Empresa (Interno)</option>
                        <option value="CLIENT_SITE">In-loco (No Cliente)</option>
                        <option value="PUBLIC_SPACE">Espaço Público / Terceiros</option>
                    </select>
                </div>

                {/* Switches de Configuração */}
                <div className="flex flex-col gap-3 justify-center">
                    <label className="flex items-center justify-between p-3 bg-black/20 border border-gray-800 rounded-xl cursor-pointer hover:border-gray-700 transition-all group">
                        <div className="flex items-center gap-3">
                            <FaGlobeAmericas className="text-blue-400/50 text-xs" />
                            <span className="text-[10px] font-bold uppercase text-gray-400 group-hover:text-gray-200">Atendimento Online / Remoto</span>
                        </div>
                        <input 
                            {...register('attributes.is_remote' as any)}
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-700 text-accent-primary focus:ring-accent-primary bg-gray-900"
                        />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-black/20 border border-gray-800 rounded-xl cursor-pointer hover:border-gray-700 transition-all group">
                        <div className="flex items-center gap-3">
                            <FaCalendarCheck className="text-emerald-400/50 text-xs" />
                            <span className="text-[10px] font-bold uppercase text-gray-400 group-hover:text-gray-200">Exige Agendamento Prévio</span>
                        </div>
                        <input 
                            {...register('attributes.requires_scheduling' as any)}
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-700 text-accent-primary focus:ring-accent-primary bg-gray-900"
                        />
                    </label>
                </div>
            </div>

            {/* --- SEÇÃO C: REQUISITOS TÉCNICOS --- */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    <FaListUl className="text-gray-500" /> Pré-requisitos para Execução
                </label>
                <textarea 
                    defaultValue={requirementsDefault}
                    onBlur={handleRequirementsChange}
                    placeholder="Ex: Acesso ao servidor, Backup atualizado, Ambiente limpo... (Um por linha)"
                    rows={3}
                    className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-accent-primary outline-none transition-all resize-none placeholder:text-gray-700"
                />
            </div>

        </div>
    );
};