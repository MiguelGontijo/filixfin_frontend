// src/core/components/client/ClientForm.tsx

import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaExclamationTriangle, FaSave, FaStickyNote } from 'react-icons/fa';
import { useClientMutation } from '@/core/hooks/useClientMutation';
import { Client, AddressType } from '@/core/types/client';

interface ClientFormProps {
    client?: Client;
    // MODIFICAÇÃO: onSuccess agora recebe o cliente salvo/atualizado
    onSuccess: (savedClient: Client) => void;
    showSubmitButton?: boolean;
}

/**
 * @component ClientForm
 * @description Formulário unificado.
 * @update Agora retorna o objeto Client no callback onSuccess para atualização imediata do estado pai.
 */
export const ClientForm: React.FC<ClientFormProps> = ({ 
    client, 
    onSuccess, 
    showSubmitButton = true 
}) => {
    
    const { createClient, updateClient, isLoading, error } = useClientMutation();
    const isEditing = !!client;

    const initialFormState = {
        name: '',
        document: '',
        email: '',
        phone: '',
        userNotes: '',
        address: {
            id: '',
            street: '',
            number: '',
            district: '',
            city: '',
            state: '',
            zipCode: ''
        }
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if (client) {
            const mainAddress = client.addresses?.find(a => a.type === AddressType.MAIN) || client.addresses?.[0];
            
            setFormData({
                name: client.name,
                document: client.document || '',
                email: client.email || '',
                phone: client.phone || '',
                userNotes: client.userNotes || '',
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
            setFormData(initialFormState);
        }
    }, [client]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            address: {
                ...prev.address,
                [e.target.name]: e.target.value
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const addressesToSend = formData.address.street.trim() ? [{
            id: formData.address.id || undefined,
            street: formData.address.street,
            number: formData.address.number || 'S/N',
            district: formData.address.district || 'Centro',
            city: formData.address.city || 'Indefinida',
            state: formData.address.state || 'UF',
            zipCode: formData.address.zipCode || '00000000',
            type: AddressType.MAIN
        }] : undefined;

        const payload = {
            name: formData.name,
            document: formData.document.trim() || undefined,
            email: formData.email.trim() || undefined,
            phone: formData.phone.trim() || undefined,
            userNotes: formData.userNotes || undefined,
            addresses: addressesToSend
        };

        try {
            let result: Client;
            if (isEditing && client) {
                result = await updateClient(client.id, payload);
            } else {
                result = await createClient(payload);
            }
            // Passa o resultado para o pai (atualiza a tela sem fetch extra)
            onSuccess(result);
        } catch (err) {
            console.error("Erro no formulário:", err);
        }
    };

    return (
        <form id="client-edit-form" onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
            
            {error && (
                <div className="p-3 bg-red-900/30 border border-red-800 text-red-300 rounded-lg text-sm flex items-center">
                    <FaExclamationTriangle className="mr-2" />
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-bold text-accent-primary uppercase mb-1 tracking-wider">
                        Nome Completo *
                    </label>
                    <input 
                        type="text" name="name" value={formData.name} onChange={handleChange} required
                        className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:ring-1 focus:ring-accent-secondary focus:border-accent-secondary focus:outline-none transition placeholder-gray-600" 
                        placeholder="Ex: João Silva ou Empresa Ltda"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">
                            E-mail
                        </label>
                        <input 
                            type="email" name="email" value={formData.email} onChange={handleChange}
                            className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-gray-400 transition" 
                            placeholder="contato@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">
                            Telefone
                        </label>
                        <input 
                            type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="(00) 00000-0000"
                            className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-gray-400 transition" 
                        />
                    </div>
                </div>
            </div>

            <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-700/50">
                <label className="text-[10px] font-bold text-gray-300 uppercase mb-3 flex items-center tracking-wider">
                    <FaMapMarkerAlt className="mr-1.5 text-accent-secondary" /> Endereço Principal
                </label>
                
                <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-3">
                        <input type="text" name="street" placeholder="Rua / Logradouro" value={formData.address.street} onChange={handleAddressChange}
                            className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-2 text-xs text-white focus:border-accent-secondary focus:outline-none" />
                    </div>
                    <div className="col-span-1">
                        <input type="text" name="number" placeholder="Nº" value={formData.address.number} onChange={handleAddressChange}
                            className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-2 text-xs text-white focus:border-accent-secondary focus:outline-none" />
                    </div>
                    
                    <div className="col-span-2">
                        <input type="text" name="district" placeholder="Bairro" value={formData.address.district} onChange={handleAddressChange}
                            className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-2 text-xs text-white focus:border-accent-secondary focus:outline-none" />
                    </div>
                    <div className="col-span-2">
                        <input type="text" name="city" placeholder="Cidade" value={formData.address.city} onChange={handleAddressChange}
                            className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-2 text-xs text-white focus:border-accent-secondary focus:outline-none" />
                    </div>
                    
                    <div className="col-span-1">
                        <input type="text" name="state" placeholder="UF" maxLength={2} value={formData.address.state} onChange={handleAddressChange}
                            className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-2 text-xs text-white uppercase focus:border-accent-secondary focus:outline-none" />
                    </div>
                    <div className="col-span-3">
                        <input type="text" name="zipCode" placeholder="CEP" value={formData.address.zipCode} onChange={handleAddressChange}
                            className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-2 text-xs text-white focus:border-accent-secondary focus:outline-none" />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-wider">
                    CPF / CNPJ
                </label>
                <input 
                    type="text" name="document" value={formData.document} onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-gray-400 transition font-mono" 
                    placeholder="000.000.000-00"
                />
            </div>

            <div className="pt-2 border-t border-gray-700/50">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-wider flex items-center">
                    <FaStickyNote className="mr-1.5 text-yellow-500/70" /> Notas Privadas (Não lidas pela IA)
                </label>
                <textarea
                    name="userNotes"
                    value={formData.userNotes}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500/50 transition placeholder-gray-600 resize-y"
                    placeholder="Digite observações internas sobre este cliente..."
                />
            </div>

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