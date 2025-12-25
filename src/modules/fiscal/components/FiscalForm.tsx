'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FaSave, FaArrowLeft } from 'react-icons/fa';

// Importação dos Hooks e Tipos
import { useFiscalMutation } from '../hooks/useFiscalMutation';
import { ICreateFiscalGroupDTO } from '../types';

/**
 * Formulário de Criação de Grupo Fiscal.
 * * Responsabilidade:
 * - Coletar dados de NCM e Alíquotas.
 * - Converter inputs numéricos corretamente.
 * - Submeter via Mutation e redirecionar.
 */
export function FiscalForm() {
    // 1. Contexto e Navegação
    const router = useRouter();
    const params = useParams();
    const tenantId = params.tenantId as string;

    // 2. Hook de Mutação
    const { createFiscalGroup, isLoading, error } = useFiscalMutation();

    // 3. Estado Local
    // Iniciamos com valores zerados para os impostos
    const [formData, setFormData] = useState<ICreateFiscalGroupDTO>({
        name: '',
        ncmDefault: '',
        icms: 0,
        pis: 0,
        cofins: 0
    });

    // 4. Handlers
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Validação simples de campos obrigatórios
        if (!formData.name.trim() || !formData.ncmDefault.trim()) {
            alert('Por favor, preencha o Nome e o NCM Padrão.');
            return;
        }

        // Envio dos dados
        const result = await createFiscalGroup(formData);
        
        // Redirecionamento em caso de sucesso
        if (result) {
            router.push(`/${tenantId}/dashboard/fiscal`);
        }
    };

    /**
     * Gerencia a alteração dos inputs, tratando conversão numérica.
     */
    const handleChange = (field: keyof ICreateFiscalGroupDTO, value: string) => {
        // Lista de campos que são numéricos no DTO
        const numericFields = ['icms', 'pis', 'cofins'];

        if (numericFields.includes(field)) {
            // Converte para float, aceitando input vazio como 0 temporariamente
            const numValue = parseFloat(value);
            setFormData(prev => ({ 
                ...prev, 
                [field]: isNaN(numValue) ? 0 : numValue 
            }));
        } else {
            // Campos de texto normal
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-6 animate-fade-in">
            {/* Header com Navegação de Voltar */}
            <div className="flex items-center gap-4">
                <Link 
                    href={`/${tenantId}/dashboard/fiscal`}
                    className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                >
                    <FaArrowLeft />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white">Novo Grupo Fiscal</h1>
                    <p className="text-sm text-gray-400">Defina as alíquotas e classificação padrão</p>
                </div>
            </div>

            {/* Tratamento de Erro da API */}
            {error && (
                <div className="p-4 bg-red-900/20 border border-red-500/50 text-red-200 rounded-lg text-sm flex items-center gap-2">
                    <span>⚠️</span>
                    {error}
                </div>
            )}

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="bg-base-metallic p-6 rounded-lg border border-gray-700 shadow-lg space-y-6">
                
                {/* Seção 1: Identificação */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Campo Nome */}
                    <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-400">
                            Nome do Grupo <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="Ex: Revenda Mercadoria, Serviço..."
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-accent-primary focus:border-transparent outline-none transition-all placeholder-gray-600"
                            disabled={isLoading}
                            autoFocus
                        />
                    </div>

                    {/* Campo NCM */}
                    <div className="space-y-2">
                        <label htmlFor="ncm" className="block text-sm font-medium text-gray-400">
                            NCM Padrão <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="ncm"
                            type="text"
                            value={formData.ncmDefault}
                            onChange={(e) => handleChange('ncmDefault', e.target.value)}
                            placeholder="Ex: 8517.12.31"
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white font-mono focus:ring-2 focus:ring-accent-primary focus:border-transparent outline-none transition-all placeholder-gray-600"
                            disabled={isLoading}
                        />
                        <p className="text-xs text-gray-500">Código NCM usado por padrão nas notas fiscais.</p>
                    </div>
                </div>

                {/* Seção 2: Tributação */}
                <div className="border-t border-gray-700 pt-6">
                    <h3 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1 h-4 bg-accent-primary rounded-full"></span>
                        Alíquotas de Imposto (%)
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* ICMS */}
                        <div className="space-y-2">
                            <label htmlFor="icms" className="block text-xs font-medium text-blue-400">
                                ICMS %
                            </label>
                            <input
                                id="icms"
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={formData.icms}
                                onChange={(e) => handleChange('icms', e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                disabled={isLoading}
                            />
                        </div>

                        {/* PIS */}
                        <div className="space-y-2">
                            <label htmlFor="pis" className="block text-xs font-medium text-green-400">
                                PIS %
                            </label>
                            <input
                                id="pis"
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={formData.pis}
                                onChange={(e) => handleChange('pis', e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                disabled={isLoading}
                            />
                        </div>

                        {/* COFINS */}
                        <div className="space-y-2">
                            <label htmlFor="cofins" className="block text-xs font-medium text-yellow-400">
                                COFINS %
                            </label>
                            <input
                                id="cofins"
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={formData.cofins}
                                onChange={(e) => handleChange('cofins', e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer de Ações */}
                <div className="pt-6 border-t border-gray-700 flex justify-end gap-3">
                    <Link href={`/${tenantId}/dashboard/fiscal`}>
                        <button 
                            type="button" 
                            className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors font-medium"
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
                    </Link>
                    
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-accent-primary hover:bg-accent-primary/90 text-base-dark font-bold py-2 px-6 rounded-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <span className="animate-spin">⏳</span> Salvando...
                            </>
                        ) : (
                            <>
                                <FaSave /> Salvar Configuração
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}