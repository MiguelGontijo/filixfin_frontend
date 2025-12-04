// src/features/crm/components/AnalysisActionCard.tsx

import React, { useState, useEffect } from 'react';
import { 
    FaUser, FaEnvelope, FaPhone, FaBullseye, FaSave, FaLink, 
    FaCheckCircle, FaExclamationTriangle, FaPen, FaMapMarkerAlt 
} from 'react-icons/fa';
import { InteractionAnalysis } from '../types';
import { Client, AddressType } from '@/core/types/client';
import { useInteractionMutation, ClientActionType } from '../hooks/useInteractionMutation';

interface AnalysisActionCardProps {
    analysis: InteractionAnalysis;
    content: string;
    contextClient: Client | null;
    onSuccess: () => void;
}

export const AnalysisActionCard: React.FC<AnalysisActionCardProps> = ({
    analysis,
    content,
    contextClient,
    onSuccess
}) => {
    const { registerInteraction, isLoading, error, success } = useInteractionMutation();
    
    // Identidade extraída (atalho)
    const identity = analysis.extractedIdentity || {
        personName: '',
        companyName: '',
        email: '',
        phone: '',
        extractedAddresses: [],
        intentType: 'UNKNOWN'
    };

    // --- ESTADO DO FORMULÁRIO ---
    // Agora inclui dados de endereço aninhados
    const [formData, setFormData] = useState({
        name: '',
        document: '',
        email: '',
        phone: '',
        // Dados de Endereço (Focamos no endereço principal para este card rápido)
        address: {
            street: '',
            number: '',
            district: '',
            city: '',
            state: '',
            zipCode: ''
        }
    });

    // Sincroniza o form quando a análise muda
    useEffect(() => {
        // Tenta pegar o primeiro endereço extraído pela IA
        const detectedAddress = identity.extractedAddresses?.[0];

        setFormData({
            name: identity.personName || 'Novo Lead',
            document: '', 
            email: identity.email || '',
            phone: identity.phone || '',
            address: {
                street: detectedAddress?.street || '',
                number: detectedAddress?.number || '',
                district: detectedAddress?.district || '',
                city: detectedAddress?.city || '',
                state: detectedAddress?.state || '',
                zipCode: detectedAddress?.zipCode || ''
            }
        });
    }, [analysis]); 

    const [mode, setMode] = useState<'VIEW' | 'CREATE_EDIT'>('VIEW');

    // --- HANDLERS ---

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handler específico para campos de endereço aninhados
    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            address: {
                ...formData.address,
                [e.target.name]: e.target.value
            }
        });
    };

    const handleLinkExisting = async () => {
        if (!contextClient) return;
        await registerInteraction({
            action: ClientActionType.LINK_EXISTING,
            clientId: contextClient.id,
            type: 'NOTE', 
            content: content,
            aiAnalysis: analysis
        });
        if (!error) onSuccess();
    };

    const handleCreateNew = async () => {
        if (!formData.name.trim()) {
            alert("O Nome do cliente é obrigatório.");
            return;
        }

        // Monta o array de endereços apenas se houver dados mínimos (Rua)
        const addressesToSend = formData.address.street.trim() ? [{
            street: formData.address.street,
            number: formData.address.number || 'S/N', // Fallback seguro
            district: formData.address.district || 'Centro',
            city: formData.address.city || 'Indefinida',
            state: formData.address.state || 'UF',
            zipCode: formData.address.zipCode || '00000-000',
            type: AddressType.MAIN
        }] : undefined;

        await registerInteraction({
            action: ClientActionType.CREATE_NEW,
            type: 'NOTE',
            content: content,
            aiAnalysis: analysis,
            newClientData: {
                name: formData.name,
                document: formData.document.trim() || undefined, 
                email: formData.email.trim() || undefined,
                phone: formData.phone.trim() || undefined,
                addresses: addressesToSend
            }
        });

        if (!error) onSuccess();
    };

    if (success) {
        return (
            <div className="bg-green-900/20 border border-green-500/50 p-6 rounded-xl text-center animate-fade-in">
                <FaCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white">Registrado com Sucesso!</h3>
                <button onClick={onSuccess} className="mt-4 text-sm text-green-400 hover:underline">Continuar</button>
            </div>
        );
    }

    // Helper para exibir endereço formatado
    const formattedAddress = formData.address.street 
        ? `${formData.address.street}, ${formData.address.number || 'S/N'} - ${formData.address.city}/${formData.address.state}`
        : null;

    return (
        <div className="bg-gray-800 border border-gray-600 p-4 rounded-xl shadow-lg relative overflow-hidden transition-all">
            <div className="absolute top-0 left-0 w-1 h-full bg-accent-secondary"></div>
            
            {/* Header */}
            <div className="flex justify-between items-start mb-4 pl-2">
                <div>
                    <h3 className="text-sm font-bold text-white flex items-center">
                        <FaUser className="mr-2 text-accent-secondary" /> 
                        {mode === 'VIEW' ? 'Dados Detectados (IA)' : 'Revisão de Cadastro'}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                        {mode === 'VIEW' ? 'Verifique os dados encontrados.' : 'Edite os dados antes de salvar.'}
                    </p>
                </div>
                <div className="bg-gray-700 px-2 py-1 rounded text-[10px] text-accent-primary font-bold border border-gray-600 uppercase">
                    <FaBullseye className="mr-1 inline" /> {identity.intentType}
                </div>
            </div>

            {/* --- MODO VISUALIZAÇÃO (READ-ONLY) --- */}
            {mode === 'VIEW' && (
                <div className="grid grid-cols-2 gap-3 text-sm mb-4 pl-2">
                    <div className="bg-gray-900 p-2 rounded border border-gray-700 col-span-2">
                        <span className="text-[10px] text-gray-500 block uppercase font-bold">Nome</span>
                        <span className="text-white font-medium">{identity.personName || '-'}</span>
                    </div>
                    
                    <div className="bg-gray-900 p-2 rounded border border-gray-700">
                        <span className="text-[10px] text-gray-500 block uppercase font-bold">E-mail</span>
                        <div className="flex items-center text-white mt-1">
                            <FaEnvelope className="mr-2 text-gray-600" />
                            <span className="truncate text-xs">{identity.email || '-'}</span>
                        </div>
                    </div>
                    <div className="bg-gray-900 p-2 rounded border border-gray-700">
                        <span className="text-[10px] text-gray-500 block uppercase font-bold">Telefone</span>
                        <div className="flex items-center text-white mt-1">
                            <FaPhone className="mr-2 text-gray-600" />
                            <span className="truncate text-xs">{identity.phone || '-'}</span>
                        </div>
                    </div>

                    {/* Exibição de Endereço Detectado */}
                    {formattedAddress && (
                        <div className="bg-gray-900 p-2 rounded border border-gray-700 col-span-2">
                            <span className="text-[10px] text-gray-500 block uppercase font-bold">Endereço Sugerido</span>
                            <div className="flex items-center text-white mt-1">
                                <FaMapMarkerAlt className="mr-2 text-accent-secondary" />
                                <span className="truncate text-xs">{formattedAddress}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* --- MODO EDIÇÃO (FORMULÁRIO COMPLETO) --- */}
            {mode === 'CREATE_EDIT' && (
                <div className="space-y-3 mb-4 pl-2 animate-fade-in">
                    {/* Dados Básicos */}
                    <div>
                        <label className="text-[10px] text-accent-primary font-bold uppercase block mb-1">Nome *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange}
                            className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:border-accent-primary focus:outline-none" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">E-mail</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange}
                                className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:border-accent-primary focus:outline-none" />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Telefone</label>
                            <input type="text" name="phone" value={formData.phone} onChange={handleChange}
                                className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:border-accent-primary focus:outline-none" />
                        </div>
                    </div>

                    {/* Seção de Endereço */}
                    <div className="border-t border-gray-700 pt-3 mt-2">
                        <label className="text-[10px] text-gray-300 font-bold uppercase block mb-2 flex items-center">
                            <FaMapMarkerAlt className="mr-1" /> Endereço Principal
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            <div className="col-span-3">
                                <input type="text" name="street" placeholder="Rua / Logradouro" value={formData.address.street} onChange={handleAddressChange}
                                    className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-xs text-white focus:border-accent-primary focus:outline-none" />
                            </div>
                            <div className="col-span-1">
                                <input type="text" name="number" placeholder="Nº" value={formData.address.number} onChange={handleAddressChange}
                                    className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-xs text-white focus:border-accent-primary focus:outline-none" />
                            </div>
                            <div className="col-span-2">
                                <input type="text" name="district" placeholder="Bairro" value={formData.address.district} onChange={handleAddressChange}
                                    className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-xs text-white focus:border-accent-primary focus:outline-none" />
                            </div>
                            <div className="col-span-2">
                                <input type="text" name="city" placeholder="Cidade" value={formData.address.city} onChange={handleAddressChange}
                                    className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-xs text-white focus:border-accent-primary focus:outline-none" />
                            </div>
                            <div className="col-span-1">
                                <input type="text" name="state" placeholder="UF" maxLength={2} value={formData.address.state} onChange={handleAddressChange}
                                    className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-xs text-white focus:border-accent-primary focus:outline-none uppercase" />
                            </div>
                            <div className="col-span-3">
                                <input type="text" name="zipCode" placeholder="CEP" value={formData.address.zipCode} onChange={handleAddressChange}
                                    className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-xs text-white focus:border-accent-primary focus:outline-none" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">CPF / CNPJ (Opcional)</label>
                        <input type="text" name="document" value={formData.document} onChange={handleChange}
                            className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:border-accent-primary focus:outline-none" />
                    </div>
                </div>
            )}

            {/* Mensagem de Erro */}
            {error && (
                <div className="mb-4 p-3 bg-red-900/40 border border-red-500/50 rounded flex items-center text-xs text-red-200">
                    <FaExclamationTriangle className="mr-2 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Ações */}
            <div className="pl-2 pt-2 border-t border-gray-700">
                {mode === 'VIEW' ? (
                    <div className="flex gap-2">
                        {contextClient ? (
                            <button onClick={handleLinkExisting} disabled={isLoading} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-xs font-bold transition border border-gray-500">
                                {isLoading ? 'Vinculando...' : <><FaLink className="mr-2 inline" /> Vincular Existente</>}
                            </button>
                        ) : (
                            <div className="flex-1 text-[10px] text-gray-500 flex items-center justify-center bg-gray-900/50 rounded border border-dashed border-gray-700 select-none">
                                Selecione na lista p/ vincular
                            </div>
                        )}
                        <button onClick={() => setMode('CREATE_EDIT')} className="flex-1 bg-accent-secondary hover:bg-violet-600 text-white py-2 rounded-lg text-xs font-bold transition shadow-lg">
                            <FaPen className="mr-2 inline" /> Editar e Salvar
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={() => setMode('VIEW')} className="flex-1 bg-gray-700 text-gray-300 py-2 rounded text-xs font-bold hover:bg-gray-600">Cancelar</button>
                        <button onClick={handleCreateNew} disabled={isLoading} className="flex-1 bg-accent-primary hover:bg-orange-600 text-base-dark py-2 rounded text-xs font-bold shadow-lg">
                            {isLoading ? 'Salvando...' : 'Confirmar Lead'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};