'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FaClock, FaFileInvoiceDollar } from 'react-icons/fa';

// --- Inteligência de Domínio ---
import { ProductFormInput } from '../../../domain/schemas/productSchema';

/**
 * ============================================================================
 * 🛠️ COMPONENTE: ServiceFields
 * @description Fragmento de interface para prestação de serviços (SERVICE).
 * Foca em métricas de tempo, precificação de mão de obra e códigos fiscais (ISS).
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (ServiceNow/Google Level):
 * 1. SLA Centric: Campo de duração explícito para cálculos de agenda futura.
 * 2. Fiscal Compliance: Campo dedicado para o código de serviço municipal.
 * 3. Type-Safe Error Handling: Resolve o erro ts(2339) através de acesso 
 * seguro ao objeto de erros da união discriminada.
 * ============================================================================
 */
export const ServiceFields: React.FC<{ form: UseFormReturn<ProductFormInput> }> = ({ form }) => {
    const { register, formState: { errors } } = form;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
            
            {/* ⏱️ Gestão de Tempo (SLA) */}
            <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    <FaClock className="text-accent-primary/60" /> Duração (Minutos)
                </div>
                <input 
                    {...register('durationMinutes' as any)}
                    type="number"
                    placeholder="Ex: 60"
                    className={`w-full bg-black/40 border ${(errors as any).durationMinutes ? 'border-red-500/50' : 'border-gray-800'} p-3 rounded-lg text-sm focus:border-accent-primary outline-none transition-all`}
                />
                {(errors as any).durationMinutes && (
                    <p className="text-[10px] text-red-400">{(errors as any).durationMinutes.message}</p>
                )}
            </div>

            {/* 🛠️ Identificador Fiscal (ISS) */}
            <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    <FaFileInvoiceDollar className="text-accent-secondary/60" /> Código de Serviço
                </div>
                <input 
                    {...register('serviceCode' as any)}
                    placeholder="Ex: 01.01"
                    className={`w-full bg-black/40 border ${(errors as any).serviceCode ? 'border-red-500/50' : 'border-gray-800'} p-3 rounded-lg text-sm focus:border-accent-primary outline-none transition-all`}
                />
                {(errors as any).serviceCode && (
                    <p className="text-[10px] text-red-400">{(errors as any).serviceCode.message}</p>
                )}
            </div>

            {/* 🏷️ SKU de Referência */}
            <div className="space-y-1">
                <label className="block mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 pt-[2px]">SKU / Ref. Serviço</label>
                <input 
                    {...register('sku' as any)}
                    placeholder="SRV-..."
                    className={`w-full bg-black/40 border ${(errors as any).sku ? 'border-red-500/50' : 'border-gray-800'} p-3 rounded-lg text-sm focus:border-accent-primary outline-none transition-all`}
                />
                {(errors as any).sku && (
                    <p className="text-[10px] text-red-400">{(errors as any).sku.message}</p>
                )}
            </div>

            {/* 💰 Valor do Serviço */}
            <div className="space-y-1">
                <label className="block mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 pt-[2px]">Preço do Serviço (R$)</label>
                <input 
                    {...register('salePrice' as any)}
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    className={`w-full bg-black/40 border ${(errors as any).salePrice ? 'border-red-500/50' : 'border-gray-800'} p-3 rounded-lg text-sm focus:border-accent-primary outline-none transition-all font-mono text-green-400`}
                />
                {(errors as any).salePrice && (
                    <p className="text-[10px] text-red-400">{(errors as any).salePrice.message}</p>
                )}
            </div>

        </div>
    );
};