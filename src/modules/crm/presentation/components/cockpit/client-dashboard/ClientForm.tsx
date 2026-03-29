// ===== FILE: src/core/components/client/ClientForm.tsx =====

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FaMapMarkerAlt, FaExclamationTriangle, FaSave, FaStickyNote } from 'react-icons/fa';

import { useClientMutation } from '@/core/client/application/hooks/useClientMutation';
import { Client, AddressType } from '@/core/client/domain/types/client';
import { ClientFormSchema, ClientFormInput } from '@/core/client/domain/schemas/clientSchema';

interface ClientFormProps {
    client?: Client;
    onSuccess: (savedClient: Client) => void;
    showSubmitButton?: boolean;
}

/**
 * @component ClientForm
 * @description Formulário Headless (Puro) de Cliente.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO:
 * 1. Single Source of Truth: Consome o `ClientFormSchema` (Zod) garantindo que as regras
 * de validação do CRM sejam matematicamente idênticas às da tela de Master Data.
 * 2. UX de Resiliência (Tratamento 409): Intercepta erros de "Documento Duplicado" 
 * e acopla o erro diretamente no input do usuário, em vez de um alerta genérico.
 * 3. HTML5 Nativo: Permite submissão externa via `form="client-edit-form"`, viabilizando
 * layouts complexos como a Workstation do CRM.
 */
export const ClientForm: React.FC<ClientFormProps> = ({ 
    client, 
    onSuccess, 
    showSubmitButton = true 
}) => {
    
    const { createClient, updateClient, isLoading } = useClientMutation();
    const isEditing = !!client;
    
    // Estado para erros genéricos (ex: 500 do servidor)
    const [globalError, setGlobalError] = useState<string | null>(null);

    // =========================================================================
    // 🧠 MOTOR DO FORMULÁRIO (RHF + Zod)
    // =========================================================================
    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors }
    } = useForm<ClientFormInput & { address?: any }>({
        resolver: zodResolver(ClientFormSchema as any),
        mode: 'onChange'
    });

    // =========================================================================
    // 💧 HIDRATAÇÃO DOS DADOS
    // =========================================================================
    useEffect(() => {
        if (client) {
            // Busca o endereço principal (se houver) para popular os campos
            const mainAddress = client.addresses?.find(a => a.type === AddressType.MAIN) || client.addresses?.[0];
            
            reset({
                id: client.id,
                name: client.name,
                document: client.document || '',
                email: client.email || '',
                phone: client.phone || '',
                userNotes: client.userNotes || '',
                isActive: client.isActive,
                address: {
                    id: mainAddress?.id || '',
                    street: mainAddress?.street || '',
                    number: mainAddress?.number || '',
                    district: mainAddress?.district || '',
                    city: mainAddress?.city || '',
                    state: mainAddress?.state || '',
                    zipCode: mainAddress?.zipCode || ''
                }
            });
        } else {
            // Estado virgem para criação
            reset({
                name: '',
                document: '',
                email: '',
                phone: '',
                userNotes: '',
                isActive: true,
                address: { street: '', number: '', district: '', city: '', state: '', zipCode: '' }
            });
        }
    }, [client, reset]);

    // =========================================================================
    // ⚙️ HANDLER DE SUBMISSÃO E TRATAMENTO DE ERROS
    // =========================================================================
    const onSubmitForm = async (data: any) => {
        setGlobalError(null);

        // Montagem do Payload (Mapeia o form plano para o DTO complexo com array de endereços)
        const addressesToSend = data.address?.street?.trim() ? [{
            id: data.address.id || undefined,
            street: data.address.street,
            number: data.address.number || 'S/N',
            district: data.address.district || 'Centro',
            city: data.address.city || 'Indefinida',
            state: data.address.state || 'UF',
            zipCode: data.address.zipCode || '00000000',
            type: AddressType.MAIN
        }] : undefined;

        const payload = {
            name: data.name,
            document: data.document?.trim() || undefined,
            email: data.email?.trim() || undefined,
            phone: data.phone?.trim() || undefined,
            userNotes: data.userNotes?.trim() || undefined,
            isActive: data.isActive,
            addresses: addressesToSend
        };

        try {
            let result: Client;
            if (isEditing && client) {
                result = await updateClient(client.id, payload);
            } else {
                result = await createClient(payload);
            }
            onSuccess(result);
            
        } catch (err: any) {
            console.error("❌ [ClientForm] Erro ao salvar:", err);
            
            // 🎯 AQUI RESOLVEMOS A BOMBINHA (Erro 409 - Conflito de Documento/Email)
            if (err.response?.status === 409) {
                const apiMsg = err.response?.data?.message || '';
                
                if (apiMsg.toLowerCase().includes('documento') || apiMsg.toLowerCase().includes('cpf')) {
                    setError('document', { type: 'manual', message: 'Este documento já está cadastrado no sistema.' });
                } else if (apiMsg.toLowerCase().includes('email')) {
                    setError('email', { type: 'manual', message: 'Este e-mail já pertence a outro cliente.' });
                } else {
                    setGlobalError(apiMsg || 'Conflito de dados (registro duplicado).');
                }
            } else {
                setGlobalError(err.response?.data?.message || 'Ocorreu um erro interno ao salvar o cliente.');
            }
        }
    };

    // =========================================================================
    // 🎨 RENDERIZAÇÃO UX/UI
    // =========================================================================
    return (
        <form id="client-edit-form" onSubmit={handleSubmit(onSubmitForm)} className="space-y-5 animate-fade-in">
            
            {globalError && (
                <div className="p-3 bg-red-900/30 border border-red-800 text-red-300 rounded-lg text-sm flex items-center shadow-inner">
                    <FaExclamationTriangle className="mr-2 flex-shrink-0" />
                    <span>{globalError}</span>
                </div>
            )}

            <div className="space-y-4">
                {/* --- NOME --- */}
                <div>
                    <label className="block text-[10px] font-bold text-accent-primary uppercase mb-1 tracking-wider">
                        Nome Completo *
                    </label>
                    <input 
                        type="text" 
                        {...register('name')}
                        disabled={isLoading}
                        className={`w-full px-3 py-2.5 bg-gray-900 border rounded-lg text-white text-sm focus:outline-none transition placeholder-gray-600 ${errors.name ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-600 focus:ring-1 focus:ring-accent-secondary focus:border-accent-secondary'}`}
                        placeholder="Ex: João Silva ou Empresa Ltda"
                    />
                    {errors.name && <p className="text-[10px] text-red-400 mt-1">{errors.name.message as string}</p>}
                </div>

                {/* --- CONTATO (Grid) --- */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">
                            E-mail
                        </label>
                        <input 
                            type="email" 
                            {...register('email')}
                            disabled={isLoading}
                            className={`w-full px-3 py-2.5 bg-gray-900 border rounded-lg text-white text-sm focus:outline-none transition ${errors.email ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-600 focus:border-gray-400'}`}
                            placeholder="contato@email.com"
                        />
                        {errors.email && <p className="text-[10px] text-red-400 mt-1">{errors.email.message as string}</p>}
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">
                            Telefone
                        </label>
                        <input 
                            type="text" 
                            {...register('phone')}
                            disabled={isLoading}
                            placeholder="(00) 00000-0000"
                            className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-gray-400 transition" 
                        />
                    </div>
                </div>
            </div>

            {/* --- ENDEREÇO PRINCIPAL --- */}
            <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-700/50">
                <label className="text-[10px] font-bold text-gray-300 uppercase mb-3 flex items-center tracking-wider">
                    <FaMapMarkerAlt className="mr-1.5 text-accent-secondary" /> Endereço Principal
                </label>
                
                <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-3">
                        <input type="text" {...register('address.street')} placeholder="Rua / Logradouro" disabled={isLoading}
                            className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-2 text-xs text-white focus:border-accent-secondary focus:outline-none transition-colors" />
                    </div>
                    <div className="col-span-1">
                        <input type="text" {...register('address.number')} placeholder="Nº" disabled={isLoading}
                            className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-2 text-xs text-white focus:border-accent-secondary focus:outline-none transition-colors" />
                    </div>
                    
                    <div className="col-span-2">
                        <input type="text" {...register('address.district')} placeholder="Bairro" disabled={isLoading}
                            className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-2 text-xs text-white focus:border-accent-secondary focus:outline-none transition-colors" />
                    </div>
                    <div className="col-span-2">
                        <input type="text" {...register('address.city')} placeholder="Cidade" disabled={isLoading}
                            className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-2 text-xs text-white focus:border-accent-secondary focus:outline-none transition-colors" />
                    </div>
                    
                    <div className="col-span-1">
                        <input type="text" {...register('address.state')} placeholder="UF" maxLength={2} disabled={isLoading}
                            className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-2 text-xs text-white uppercase focus:border-accent-secondary focus:outline-none transition-colors" />
                    </div>
                    <div className="col-span-3">
                        <input type="text" {...register('address.zipCode')} placeholder="CEP" disabled={isLoading}
                            className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-2 text-xs text-white focus:border-accent-secondary focus:outline-none transition-colors" />
                    </div>
                </div>
            </div>

            {/* --- DOCUMENTO (CPF/CNPJ) --- */}
            <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-wider">
                    CPF / CNPJ
                </label>
                <input 
                    type="text" 
                    {...register('document')}
                    disabled={isLoading}
                    className={`w-full px-3 py-2.5 bg-gray-900 border rounded-lg text-white text-sm font-mono focus:outline-none transition placeholder-gray-600 ${errors.document ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-600 focus:border-gray-400'}`}
                    placeholder="000.000.000-00"
                />
                {errors.document && <p className="text-[10px] text-red-400 mt-1 font-bold animate-pulse">{errors.document.message as string}</p>}
            </div>

            {/* --- ANOTAÇÕES HUMANAS --- */}
            <div className="pt-2 border-t border-gray-700/50">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-wider flex items-center">
                    <FaStickyNote className="mr-1.5 text-yellow-500/70" /> Notas Privadas (Não lidas pela IA)
                </label>
                <textarea
                    {...register('userNotes')}
                    disabled={isLoading}
                    rows={4}
                    className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500/50 transition placeholder-gray-600 resize-y"
                    placeholder="Digite observações internas sobre este cliente..."
                />
            </div>

            {/* BOTÃO INTERNO (Usado apenas se o modal pai não usar form="client-edit-form") */}
            {showSubmitButton && (
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-accent-secondary hover:bg-violet-600 transition disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 mt-4"
                >
                    {isLoading ? (
                        <span className="animate-pulse">{isEditing ? 'Salvando...' : 'Cadastrando...'}</span>
                    ) : (
                        <>
                            <FaSave className="mr-2" />
                            {isEditing ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                        </>
                    )}
                </button>
            )}
        </form>
    );
};