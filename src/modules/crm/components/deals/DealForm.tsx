// src/features/crm/components/deals/DealForm.tsx

import React, { useState, useEffect } from 'react';
import { FaSave, FaPlus, FaTrash, FaBox, FaWrench, FaExclamationTriangle } from 'react-icons/fa';
import { useClients } from '@/core/hooks/useClients';
import { useDeals } from '@/modules/crm/hooks/useDeals';
import { DealStatus, DealItemType, CRMDeal } from '@/modules/crm/types';

interface DealFormProps {
    deal?: CRMDeal; // <--- NOVO: Dados para edição
    initialStatus?: DealStatus;
    onSuccess: () => void;
    onCancel: () => void;
}

interface LocalItem {
    id: string; // ID local ou do banco
    description: string;
    quantity: number;
    unitPrice: number;
    type: DealItemType;
}

export const DealForm: React.FC<DealFormProps> = ({ deal, initialStatus, onSuccess, onCancel }) => {
    
    // Hooks
    const { clients } = useClients(); 
    const { createDeal, updateDeal, isLoading } = useDeals(); // <--- updateDeal importado

    const isEditing = !!deal;

    // Estados do Cabeçalho
    const [title, setTitle] = useState('');
    const [clientId, setClientId] = useState('');
    const [status, setStatus] = useState<DealStatus>(initialStatus || DealStatus.NEW);
    const [probability, setProbability] = useState(50);
    
    // Estados dos Itens (Grid)
    const [items, setItems] = useState<LocalItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Estado do "Novo Item" (Linha de input)
    const [newItem, setNewItem] = useState<Partial<LocalItem>>({
        description: '',
        quantity: 1,
        unitPrice: 0,
        type: DealItemType.SERVICE
    });

    // --- EFEITO: HIDRATAÇÃO (EDIT MODE) ---
    useEffect(() => {
        if (deal) {
            setTitle(deal.title);
            setClientId(deal.clientId);
            setStatus(deal.status);
            setProbability(deal.probability);
            
            // Mapeia itens vindos do backend para o formato local
            if (deal.items && deal.items.length > 0) {
                setItems(deal.items.map(i => ({
                    id: i.id,
                    description: i.description,
                    quantity: Number(i.quantity),
                    unitPrice: Number(i.unitPrice),
                    type: i.type
                })));
            } else {
                setItems([]);
            }
        } else {
            // Reset ou Default para Criação
            setStatus(initialStatus || DealStatus.NEW);
        }
    }, [deal, initialStatus]);

    // --- CÁLCULOS ---
    const totalValue = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

    // --- HANDLERS DE ITEM ---
    const handleAddItem = () => {
        if (!newItem.description || newItem.unitPrice === undefined) return;
        
        setItems(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9), // ID temporário
            description: newItem.description!,
            quantity: Number(newItem.quantity),
            unitPrice: Number(newItem.unitPrice),
            type: newItem.type || DealItemType.SERVICE
        }]);

        // Limpa input
        setNewItem({ description: '', quantity: 1, unitPrice: 0, type: DealItemType.SERVICE });
    };

    const handleRemoveItem = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    // --- SUBMIT ---
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
                // Não enviamos ID no create, e no update o backend pode decidir substituir tudo (strategy simples)
                // ou podemos aprimorar o DTO de update para aceitar IDs. 
                // Para o MVP, enviaremos os dados para recriação/atualização da lista.
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
            
            {/* --- ÁREA DE SCROLL --- */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-1 pr-2 space-y-6">
                
                {error && (
                    <div className="p-3 bg-red-900/30 border border-red-800 text-red-300 rounded-lg text-xs flex items-center">
                        <FaExclamationTriangle className="mr-2" /> {error}
                    </div>
                )}

                {/* 1. CABEÇALHO DO NEGÓCIO */}
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
                            value={clientId} onChange={e => setClientId(e.target.value)} required
                            // Desabilita troca de cliente na edição para simplificar regras de negócio por enquanto
                            disabled={isEditing} 
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:border-accent-secondary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="">Selecione...</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>{client.name}</option>
                            ))}
                        </select>
                        {clients.length === 0 && <div className="text-[10px] text-gray-500 mt-1">Carregando clientes...</div>}
                    </div>

                    <div className="col-span-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Fase do Funil</label>
                        <select 
                            value={status} onChange={e => setStatus(e.target.value as DealStatus)}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:border-accent-secondary focus:outline-none"
                        >
                            {Object.values(DealStatus).map(s => (
                                <option key={s} value={s}>{s.replace('_', ' ')}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="col-span-1">
                         <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Probabilidade (%)</label>
                         <input 
                            type="number" min="0" max="100" value={probability} onChange={e => setProbability(Number(e.target.value))}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:border-accent-secondary focus:outline-none"
                        />
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

                {/* 2. GRID DE ITENS (Mestre-Detalhe) */}
                <div className="border-t border-gray-700 pt-4">
                    <h4 className="text-xs font-bold text-white mb-3 flex items-center">
                        <span className="bg-accent-secondary/20 text-accent-secondary p-1 rounded mr-2"><FaBox size={10}/></span> 
                        Itens do Negócio (Produtos/Serviços)
                    </h4>

                    {/* Tabela */}
                    <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-900 text-gray-400 uppercase font-bold">
                                <tr>
                                    <th className="px-3 py-2">Tipo</th>
                                    <th className="px-3 py-2">Descrição</th>
                                    <th className="px-3 py-2 w-20">Qtd</th>
                                    <th className="px-3 py-2 w-28">Valor Unit.</th>
                                    <th className="px-3 py-2 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {/* Lista de Itens Adicionados */}
                                {items.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-700/50 transition">
                                        <td className="px-3 py-2">
                                            {item.type === DealItemType.SERVICE ? 
                                                <FaWrench className="text-blue-400" title="Serviço" /> : 
                                                <FaBox className="text-orange-400" title="Produto" />
                                            }
                                        </td>
                                        <td className="px-3 py-2 text-white">{item.description}</td>
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

                                {/* Linha de Input (Adicionar Novo) */}
                                <tr className="bg-gray-800/80">
                                    <td className="px-2 py-2">
                                        <select 
                                            value={newItem.type} 
                                            onChange={e => setNewItem({...newItem, type: e.target.value as DealItemType})}
                                            className="bg-gray-900 border border-gray-600 rounded px-1 py-1 text-white text-[10px] w-full focus:outline-none"
                                        >
                                            <option value={DealItemType.SERVICE}>Serv.</option>
                                            <option value={DealItemType.PRODUCT}>Prod.</option>
                                        </select>
                                    </td>
                                    <td className="px-2 py-2">
                                        <input 
                                            type="text" 
                                            placeholder="Descrição do item..."
                                            value={newItem.description}
                                            onChange={e => setNewItem({...newItem, description: e.target.value})}
                                            className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white w-full focus:border-accent-primary focus:outline-none"
                                        />
                                    </td>
                                    <td className="px-2 py-2">
                                        <input 
                                            type="number" min="1"
                                            value={newItem.quantity}
                                            onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})}
                                            className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white w-full focus:border-accent-primary focus:outline-none"
                                        />
                                    </td>
                                    <td className="px-2 py-2">
                                        <input 
                                            type="number" min="0" step="0.01"
                                            value={newItem.unitPrice}
                                            onChange={e => setNewItem({...newItem, unitPrice: Number(e.target.value)})}
                                            className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white w-full focus:border-accent-primary focus:outline-none"
                                        />
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                        <button 
                                            type="button" 
                                            onClick={handleAddItem}
                                            className="bg-accent-primary hover:bg-orange-600 text-base-dark p-1.5 rounded shadow transition"
                                            title="Adicionar Item"
                                        >
                                            <FaPlus size={10} />
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    {items.length === 0 && (
                        <p className="text-[10px] text-gray-500 mt-2 text-center italic">
                            Adicione itens para compor o valor do negócio.
                        </p>
                    )}
                </div>
            </div>

            {/* --- RODAPÉ (AÇÕES) --- */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700 mt-4">
                <button 
                    type="button" 
                    onClick={onCancel}
                    className="px-4 py-2 rounded-lg text-sm font-bold text-gray-400 hover:text-white hover:bg-gray-700 transition"
                >
                    Cancelar
                </button>
                <button 
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 rounded-lg text-sm font-bold text-base-dark bg-accent-secondary hover:bg-violet-500 shadow-lg transition transform active:scale-95 flex items-center"
                >
                    {isLoading ? 'Salvando...' : <><FaSave className="mr-2" /> {isEditing ? 'Salvar Alterações' : 'Criar Oportunidade'}</>}
                </button>
            </div>
        </form>
    );
};