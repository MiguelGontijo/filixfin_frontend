// src/features/crm/components/client-dashboard/ClientForm.tsx

import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaExclamationTriangle } from 'react-icons/fa';
import { useClientMutation } from '@/core/hooks/useClientMutation';
import { Client, AddressType } from '@/core/types/client';

interface ClientFormProps {
    client: Client;
    onSuccess: () => void;
}

/**
 * @component ClientForm
 * @description Formulário de Edição In-Place para o Dashboard do Cliente.
 * @note Este componente é controlado remotamente pelo botão "Salvar" do Header via ID do form.
 */
export const ClientForm: React.FC<ClientFormProps> = ({ client, onSuccess }) => {
    
    const { updateClient, isLoading, error } = useClientMutation();

    // --- ESTADO DO FORMULÁRIO ---
    // Inicializamos diretamente com os dados do cliente passado via prop
    const mainAddress = client.addresses?.find(a => a.type === AddressType.MAIN) || client.addresses?.[0];

    const [formData, setFormData] = useState({
        name: client.name,
        document: client.document || '',
        email: client.email || '',
        phone: client.phone || '',
        address: {
            street: mainAddress?.street || '',
            number: mainAddress?.number || '',
            district: mainAddress?.district || '',
            city: mainAddress?.city || '',
            state: mainAddress?.state || '',
            zipCode: mainAddress?.zipCode || ''
        }
    });

    // Handlers de Input
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

    // Lógica de Submissão
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Monta payload
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
            await updateClient(client.id, payload);
            onSuccess(); // Avisa o pai que terminou
        } catch (err) {
            console.error("Erro no form:", err);
            // O erro visual é tratado via variável 'error' do hook abaixo
        }
    };

    return (
        // ID é crucial para o botão do Header encontrar este form
        <form id="client-edit-form" onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
            
            {/* Feedback de Erro */}
            {error && (
                <div className="p-3 bg-red-900/30 border border-red-800 text-red-300 rounded-lg text-sm flex items-center">
                    <FaExclamationTriangle className="mr-2" />
                    {error}
                </div>
            )}

            {/* --- BLOCO 1: DADOS BÁSICOS --- */}
            <div className="space-y-4">
                {/* Nome */}
                <div>
                    <label className="block text-[10px] font-bold text-accent-primary uppercase mb-1 tracking-wider">
                        Nome Completo *
                    </label>
                    <input 
                        type="text" name="name" value={formData.name} onChange={handleChange} required
                        className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:ring-1 focus:ring-accent-secondary focus:border-accent-secondary focus:outline-none transition placeholder-gray-600" 
                    />
                </div>

                {/* Contato (Grid) */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">
                            E-mail
                        </label>
                        <input 
                            type="email" name="email" value={formData.email} onChange={handleChange}
                            className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-gray-400 transition" 
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

            {/* --- BLOCO 2: ENDEREÇO (CARD VISUAL) --- */}
            <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-700/50">
                <label className="text-[10px] font-bold text-gray-300 uppercase mb-3 flex items-center tracking-wider">
                    <FaMapMarkerAlt className="mr-1.5 text-accent-secondary" /> Endereço Principal
                </label>
                
                <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-3">
                        <input type="text" name="street" placeholder="Logradouro" value={formData.address.street} onChange={handleAddressChange}
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

            {/* --- BLOCO 3: DOCS --- */}
            <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-wider">
                    CPF / CNPJ
                </label>
                <input 
                    type="text" name="document" value={formData.document} onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-gray-400 transition font-mono" 
                />
            </div>

            {/* Loading State (Visual apenas, pois o botão está no header, mas podemos mostrar algo aqui se demorar muito) */}
            {isLoading && (
                <p className="text-xs text-center text-accent-secondary animate-pulse">Salvando alterações...</p>
            )}
        </form>
    );
};