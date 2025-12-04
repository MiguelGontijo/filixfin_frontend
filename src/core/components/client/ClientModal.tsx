// src/core/components/client/ClientModal.tsx

import React, { useState, useEffect } from 'react';
import { FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import { useClientMutation } from '@/core/hooks/useClientMutation';
import { Client, AddressType } from '@/core/types/client';

interface ClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; 
    currentClient?: Client;
}

/**
 * @component ClientModal
 * @description Modal de Criação e Edição de Cliente.
 * @update Visual melhorado (Glassmorphism) para não "matar" o fundo com preto total.
 */
export const ClientModal: React.FC<ClientModalProps> = ({ 
    isOpen, 
    onClose, 
    onSuccess,
    currentClient 
}) => {
    
    const { createClient, updateClient, isLoading, error: mutationError } = useClientMutation();
    const isEditing = !!currentClient;

    const initialFormState = {
        name: '',
        document: '',
        email: '',
        phone: '',
        address: {
            street: '',
            number: '',
            district: '',
            city: '',
            state: '',
            zipCode: ''
        }
    };

    const [formData, setFormData] = useState(initialFormState);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (currentClient) {
                const mainAddress = currentClient.addresses?.find(a => a.type === AddressType.MAIN) || currentClient.addresses?.[0];
                setFormData({
                    name: currentClient.name,
                    document: currentClient.document || '',
                    email: currentClient.email || '',
                    phone: currentClient.phone || '',
                    address: {
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
            setSubmitError(null);
        }
    }, [isOpen, currentClient]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setSubmitError(null);

        const addressesToSend = formData.address.street.trim() ? [{
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
            addresses: addressesToSend
        };

        try {
            if (isEditing && currentClient) {
                await updateClient(currentClient.id, payload);
            } else {
                await createClient(payload);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setSubmitError(mutationError || err.response?.data?.message || 'Falha ao salvar cliente.');
        }
    };
    
    if (!isOpen) return null;

    return (
        // CORREÇÃO VISUAL: Fundo com transparência e desfoque (Backdrop Blur)
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center transition-all animate-fade-in">
            
            {/* Card do Modal centralizado */}
            <div 
                className="bg-base-metallic p-6 rounded-xl shadow-2xl w-full max-w-lg border border-gray-600 transform transition-all scale-100"
                onClick={(e) => e.stopPropagation()} // Evita fechar ao clicar dentro
            >
                
                {/* Header */}
                <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        {isEditing ? (
                            <>
                                <span className="mr-2 text-accent-secondary">✎</span> 
                                Editar: {currentClient?.name}
                            </>
                        ) : (
                            'Novo Cliente / Lead'
                        )}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white hover:bg-gray-700 rounded-full p-1 transition">
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                {submitError && (
                    <div className="p-3 mb-4 text-sm font-medium text-danger bg-red-900/50 rounded-md border border-red-800">
                        {submitError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Nome */}
                    <div>
                        <label className="block text-xs font-bold text-accent-primary uppercase mb-1">Nome Completo *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-1 focus:ring-accent-secondary focus:outline-none transition" />
                    </div>
                    
                    {/* Contato */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">E-mail</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange}
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-gray-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Telefone</label>
                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="(00) 00000-0000"
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-gray-500" />
                        </div>
                    </div>

                    {/* Endereço */}
                    <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                        <label className="text-xs font-bold text-gray-300 uppercase mb-2 flex items-center">
                            <FaMapMarkerAlt className="mr-1 text-accent-secondary" /> Endereço Principal
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            <div className="col-span-3">
                                <input type="text" name="street" placeholder="Logradouro" value={formData.address.street} onChange={handleAddressChange}
                                    className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-xs text-white focus:outline-none" />
                            </div>
                            <div className="col-span-1">
                                <input type="text" name="number" placeholder="Nº" value={formData.address.number} onChange={handleAddressChange}
                                    className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-xs text-white focus:outline-none" />
                            </div>
                            <div className="col-span-2">
                                <input type="text" name="district" placeholder="Bairro" value={formData.address.district} onChange={handleAddressChange}
                                    className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-xs text-white focus:outline-none" />
                            </div>
                            <div className="col-span-2">
                                <input type="text" name="city" placeholder="Cidade" value={formData.address.city} onChange={handleAddressChange}
                                    className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-xs text-white focus:outline-none" />
                            </div>
                            <div className="col-span-1">
                                <input type="text" name="state" placeholder="UF" maxLength={2} value={formData.address.state} onChange={handleAddressChange}
                                    className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-xs text-white uppercase focus:outline-none" />
                            </div>
                            <div className="col-span-3">
                                <input type="text" name="zipCode" placeholder="CEP" value={formData.address.zipCode} onChange={handleAddressChange}
                                    className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-xs text-white focus:outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Documento */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">CPF / CNPJ (Opcional)</label>
                        <input type="text" name="document" value={formData.document} onChange={handleChange}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-gray-500" />
                    </div>

                    {/* Botão Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-accent-secondary hover:bg-violet-600 transition disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 mt-4"
                    >
                        {isLoading 
                            ? (isEditing ? 'Salvando Alterações...' : 'Cadastrando...') 
                            : (isEditing ? 'Salvar Alterações' : 'Cadastrar Cliente')
                        }
                    </button>
                </form>
            </div>
        </div>
    );
};