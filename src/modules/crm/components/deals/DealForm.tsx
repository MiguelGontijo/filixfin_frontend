// src/modules/crm/components/deals/DealForm.tsx

import React, { useState, useEffect } from 'react';
import { FaSave, FaPlus, FaTrash, FaBox, FaWrench, FaExclamationTriangle, FaLink } from 'react-icons/fa';
import { useClients } from '@/core/hooks/useClients';
import { useDeals } from '@/modules/crm/hooks/useDeals'; // Path corrigido
import { DealStatus, DealItemType, CRMDeal } from '@/modules/crm/types'; // Path corrigido
import { Product } from '@/modules/products/types'; // Path corrigido
import { ProductSelector } from '@/modules/products/components/ProductSelector'; // Path corrigido

interface DealFormProps {
    deal?: CRMDeal;
    initialStatus?: DealStatus;
    onSuccess: () => void;
    onCancel: () => void;
}

interface LocalItem {
    id: string;
    productId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    type: DealItemType;
}

export const DealForm: React.FC<DealFormProps> = ({ deal, initialStatus, onSuccess, onCancel }) => {
    
    const { clients } = useClients();
    const { createDeal, updateDeal, isLoading } = useDeals();

    const isEditing = !!deal;

    // Estados
    const [title, setTitle] = useState('');
    const [clientId, setClientId] = useState('');
    const [status, setStatus] = useState<DealStatus>(initialStatus || DealStatus.NEW);
    const [probability, setProbability] = useState(50);
    const [items, setItems] = useState<LocalItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [newItem, setNewItem] = useState<Partial<LocalItem>>({
        description: '',
        quantity: 1,
        unitPrice: 0,
        type: DealItemType.SERVICE,
        productId: undefined
    });

    useEffect(() => {
        if (deal) {
            setTitle(deal.title);
            setClientId(deal.clientId);
            setStatus(deal.status);
            setProbability(deal.probability);
            
            if (deal.items && deal.items.length > 0) {
                setItems(deal.items.map(i => ({
                    id: i.id,
                    productId: i.productId || undefined,
                    description: i.description,
                    quantity: Number(i.quantity),
                    unitPrice: Number(i.unitPrice),
                    type: i.type
                })));
            } else {
                setItems([]);
            }
        } else {
            setStatus(initialStatus || DealStatus.NEW);
        }
    }, [deal, initialStatus]);

    const totalValue = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

    const handleProductSelect = (product: Product) => {
        setNewItem({
            ...newItem,
            productId: product.id,
            description: product.title,
            unitPrice: product.promotionalPrice || product.price,
            type: product.type === 'SERVICE' ? DealItemType.SERVICE : DealItemType.PRODUCT
        });
    };

    const handleDescriptionChange = (text: string) => {
        setNewItem({
            ...newItem,
            productId: undefined,
            description: text
        });
    };

    const handleAddItem = () => {
        if (!newItem.description || newItem.unitPrice === undefined) return;
        setItems(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            productId: newItem.productId,
            description: newItem.description!,
            quantity: Number(newItem.quantity),
            unitPrice: Number(newItem.unitPrice),
            type: newItem.type || DealItemType.SERVICE
        }]);
        setNewItem({ description: '', quantity: 1, unitPrice: 0, type: DealItemType.SERVICE, productId: undefined });
    };

    const handleRemoveItem = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!clientId) {
            setError("Selecione um cliente para prosseguir.");
            return;
        }

        const payload = {
            title,
            clientId,
            status,
            probability,
            items: items.map(i => ({
                productId: i.productId,
                description: i.description,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                type: i.type
            }))
        };

        try {
            if (isEditing && deal) {
                await updateDeal(deal.id, payload);
            } else {
                await createDeal(payload);
            }
            onSuccess();
        } catch (err: any) {
            console.error(err);
            setError("Erro ao salvar oportunidade. Verifique os dados.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-1 pr-2 space-y-6">
                
                {error && (
                    <div className="p-3 bg-red-900/30 border border-red-800 text-red-300 rounded-lg text-xs flex items-center">
                        <FaExclamationTriangle className="mr-2" /> {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                     <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-accent-primary uppercase mb-1">Título da Oportunidade *</label>
                        <input 
                            type="text" value={title} onChange={e => setTitle(e.target.value)} required
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:border-accent-secondary focus:outline-none"
                            placeholder="Ex: Projeto Site Institucional"
                        />
                    </div>
                     <div className="col-span-2 md:col-span-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Cliente *</label>
                        <select 
                            value={clientId} onChange={e => setClientId(e.target.value)} required disabled={isEditing} 
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:border-accent-secondary focus:outline-none disabled:opacity-50"
                        >
                            <option value="">Selecione...</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>{client.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-span-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Fase do Funil</label>
                        <select value={status} onChange={e => setStatus(e.target.value as DealStatus)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:border-accent-secondary focus:outline-none">
                            {Object.values(DealStatus).map(s => (<option key={s} value={s}>{s.replace('_', ' ')}</option>))}
                        </select>
                    </div>
                    <div className="col-span-1">
                         <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Probabilidade (%)</label>
                         <input type="number" min="0" max="100" value={probability} onChange={e => setProbability(Number(e.target.value))} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:border-accent-secondary focus:outline-none" />
                    </div>
                    <div className="col-span-1 flex flex-col justify-end pb-2">
                        <div className="text-right">
                            <span className="text-[10px] text-gray-500 uppercase font-bold">Valor Total Estimado</span>
                            <div className="text-xl font-bold text-green-400">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. GRID DE ITENS */}
                <div className="border-t border-gray-700 pt-4">
                    <h4 className="text-xs font-bold text-white mb-3 flex items-center">
                        <span className="bg-accent-secondary/20 text-accent-secondary p-1 rounded mr-2"><FaBox size={10}/></span> 
                        Itens do Negócio (Produtos/Serviços)
                    </h4>

                    {/* CORREÇÃO: Removemos overflow-hidden e adicionamos overflow-visible para o dropdown não ser cortado */}
                    <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-visible">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-900 text-gray-400 uppercase font-bold">
                                <tr>
                                    <th className="px-3 py-2">Tipo</th>
                                    <th className="px-3 py-2">Descrição / Produto</th>
                                    <th className="px-3 py-2 w-20">Qtd</th>
                                    <th className="px-3 py-2 w-28">Valor Unit.</th>
                                    <th className="px-3 py-2 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {items.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-700/50 transition">
                                        <td className="px-3 py-2">
                                            {item.type === DealItemType.SERVICE ? <FaWrench className="text-blue-400" /> : <FaBox className="text-orange-400" />}
                                        </td>
                                        <td className="px-3 py-2 text-white flex items-center">
                                            {item.productId && <FaLink className="mr-2 text-accent-primary" title="Vinculado ao Catálogo" />}
                                            {item.description}
                                        </td>
                                        <td className="px-3 py-2 text-gray-300">{item.quantity}</td>
                                        <td className="px-3 py-2 text-gray-300">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unitPrice)}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <button type="button" onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-400">
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {/* Linha de Input (NOVO COMPONENTE DE BUSCA) */}
                                <tr className="bg-gray-800/80">
                                    <td className="px-2 py-2 align-top">
                                        <select 
                                            value={newItem.type} 
                                            onChange={e => setNewItem({...newItem, type: e.target.value as DealItemType})}
                                            className="bg-gray-900 border border-gray-600 rounded px-1 py-1.5 text-white text-[10px] w-full focus:outline-none"
                                        >
                                            <option value={DealItemType.SERVICE}>Serv.</option>
                                            <option value={DealItemType.PRODUCT}>Prod.</option>
                                        </select>
                                    </td>
                                    {/* CORREÇÃO: Adicionado z-50 para garantir o contexto de empilhamento */}
                                    <td className="px-2 py-2 align-top relative z-50">
                                        <ProductSelector 
                                            value={newItem.description || ''}
                                            onChange={handleDescriptionChange}
                                            onSelect={handleProductSelect}
                                            placeholder="Digite ou clique na lupa..."
                                        />
                                    </td>
                                    <td className="px-2 py-2 align-top">
                                        <input 
                                            type="number" min="1"
                                            value={newItem.quantity}
                                            onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})}
                                            className="bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-white w-full focus:border-accent-primary focus:outline-none"
                                        />
                                    </td>
                                    <td className="px-2 py-2 align-top">
                                        <input 
                                            type="number" min="0" step="0.01"
                                            value={newItem.unitPrice}
                                            onChange={e => setNewItem({...newItem, unitPrice: Number(e.target.value)})}
                                            className="bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-white w-full focus:border-accent-primary focus:outline-none"
                                        />
                                    </td>
                                    <td className="px-2 py-2 text-center align-top">
                                        <button type="button" onClick={handleAddItem} className="bg-accent-primary hover:bg-orange-600 text-base-dark p-1.5 rounded shadow transition">
                                            <FaPlus size={10} />
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700 mt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-bold text-gray-400 hover:text-white hover:bg-gray-700 transition">Cancelar</button>
                <button type="submit" disabled={isLoading} className="px-6 py-2 rounded-lg text-sm font-bold text-base-dark bg-accent-secondary hover:bg-violet-500 shadow-lg transition transform active:scale-95 flex items-center">
                    {isLoading ? 'Salvando...' : <><FaSave className="mr-2" /> {isEditing ? 'Salvar Alterações' : 'Criar Oportunidade'}</>}
                </button>
            </div>
        </form>
    );
};