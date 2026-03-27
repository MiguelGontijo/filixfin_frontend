import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaUser, FaCalendar, FaBoxOpen, FaTrash, FaPlus, FaStream } from 'react-icons/fa';
import { CRMDeal, DealStatus, CRMDealItem } from '@/modules/crm/domain/types';
import { IPipelineStage } from '../../domain/types/pipeline.types';
import { useClients } from '@/core/client/hooks/useClients';
import { useDealMutation } from '../../application/hooks/useDealMutation';

interface DealEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    stages: IPipelineStage[];
    pipelineId: string;
    dealToEdit?: CRMDeal; 
    defaultStageId?: string;
}

export const DealEditor: React.FC<DealEditorProps> = ({ 
    isOpen, 
    onClose, 
    onSuccess,
    stages,
    pipelineId,
    dealToEdit,
    defaultStageId
}) => {
    
    // Hooks de Dados
    const { clients } = useClients(); 
    const { createDeal, updateDeal } = useDealMutation();

    // ============================================================================
    // 1. BLINDAGEM (DEFENSIVE PROGRAMMING)
    // ============================================================================
    if (isOpen && (!stages || stages.length === 0)) {
        return null;
    }

    // ============================================================================
    // 2. ESTADOS DO FORMULÁRIO (Dinâmicos)
    // ============================================================================
    const [title, setTitle] = useState('');
    const [clientId, setClientId] = useState('');
    const [closingDate, setClosingDate] = useState('');
    const [description, setDescription] = useState('');
    const [currentStageId, setCurrentStageId] = useState<string>('');
    const [items, setItems] = useState<CRMDealItem[]>([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    // ============================================================================
    // 3. EFEITOS (CARREGAMENTO)
    // ============================================================================
    useEffect(() => {
        if (isOpen) {
            if (dealToEdit) {
                // --- MODO EDIÇÃO ---
                setTitle(dealToEdit.title);
                setClientId(dealToEdit.clientId);
                setClosingDate(dealToEdit.expectedCloseDate ? new Date(dealToEdit.expectedCloseDate).toISOString().split('T')[0] : '');
                
                const activeStage = dealToEdit.currentStageId || stages.find(s => s.code === dealToEdit.status)?.id || stages[0].id;
                setCurrentStageId(activeStage);
                
                if (dealToEdit.items) {
                    setItems(dealToEdit.items.map(i => ({ ...i})));
                }
            } else {
                // --- MODO CRIAÇÃO ---
                resetForm();
                setCurrentStageId(defaultStageId || stages[0]?.id || '');
            }
        }
    }, [isOpen, dealToEdit, defaultStageId, stages]);

    // Calcula total
    useEffect(() => {
        const total = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
        setTotalAmount(total);
    }, [items]);

    const resetForm = () => {
        setTitle('');
        setClientId('');
        setClosingDate('');
        setDescription('');
        setItems([]);
        setTotalAmount(0);
    };

    // ============================================================================
    // 4. HANDLERS
    // ============================================================================
    const handleAddItem = () => {
        setItems([...items, { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0, type: 'SERVICE' } as CRMDealItem]);
    };

    const handleUpdateItem = (id: string, field: keyof CRMDealItem, value: any) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleRemoveItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleSave = async () => {
        if (!title || !clientId || !currentStageId) {
            alert("Preencha os campos obrigatórios (Título, Cliente e Fase).");
            return;
        }

        setIsSaving(true);
        try {
            const selectedStage = stages.find(s => s.id === currentStageId);
            const derivedStatus = (selectedStage?.code as DealStatus) || DealStatus.NEW;

            const payload = {
                title,
                clientId,
                pipelineId,
                currentStageId,
                status: derivedStatus,
                value: totalAmount,
                expectedCloseDate: closingDate ? new Date(closingDate).toISOString() : undefined,
                items: items.map(i => ({
                    description: i.description,
                    quantity: i.quantity,
                    unitPrice: i.unitPrice,
                    type: 'SERVICE'
                }))
            };

            if (dealToEdit) {
                await updateDeal(dealToEdit.id, payload);
            } else {
                await createDeal(payload);
            }
            
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar negócio.");
        } finally {
            setIsSaving(false);
        }
    };

    // ============================================================================
    // 5. RENDERIZAÇÃO (VISUAL SÓLIDO)
    // ============================================================================
    return (
        <div 
            className={`
                fixed inset-0 z-50 flex items-center justify-center
                transition-all duration-300
                ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
            `}
        >
            {/* Backdrop com Blur suave e fundo escuro */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            {/* Modal Principal (Superfície Sólida) */}
            <div 
                className={`
                    relative w-full max-w-5xl h-[90vh] 
                    bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl 
                    flex flex-col overflow-hidden
                    transform transition-all duration-300
                    ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}
                `}
            >
                
                {/* --- HEADER --- */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-accent-primary/10 rounded-xl border border-accent-primary/20 text-accent-primary">
                            <FaBoxOpen size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-100">
                                {dealToEdit ? 'Editar Oportunidade' : 'Nova Oportunidade'}
                            </h2>
                            <p className="text-sm text-gray-500 uppercase tracking-wide flex items-center gap-2 mt-1">
                                <FaStream size={10} /> 
                                {stages.find(s => s.id === currentStageId)?.name || 'Funil de Vendas'}
                            </p>
                        </div>
                    </div>
                    
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* --- BODY SCROLLÁVEL --- */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-gray-900">
                    
                    {/* Bloco 1: Dados Principais */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        
                        {/* Cliente */}
                        <div className="md:col-span-6 space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Cliente *</label>
                            <div className="relative group">
                                <FaUser className="absolute left-4 top-3.5 text-gray-500 group-hover:text-accent-primary transition-colors" />
                                <select 
                                    value={clientId} 
                                    onChange={(e) => setClientId(e.target.value)}
                                    className="w-full bg-gray-800 pl-11 pr-4 py-3 rounded-xl border border-gray-700 focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none appearance-none text-white transition-all cursor-pointer"
                                >
                                    <option value="">Selecione o cliente...</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Título */}
                        <div className="md:col-span-6 space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Título da Oportunidade *</label>
                            <input 
                                type="text" 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ex: Contrato de Consultoria"
                                className="w-full bg-gray-800 px-4 py-3 rounded-xl border border-gray-700 focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none text-white placeholder-gray-600 transition-all"
                            />
                        </div>

                        {/* Fase do Funil */}
                        <div className="md:col-span-4 space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Etapa Atual</label>
                            <div className="relative group">
                                <div 
                                    className="absolute left-4 top-4 w-3 h-3 rounded-full shadow-sm"
                                    style={{ backgroundColor: stages.find(s => s.id === currentStageId)?.color || '#555' }}
                                ></div>
                                <select 
                                    value={currentStageId} 
                                    onChange={(e) => setCurrentStageId(e.target.value)}
                                    className="w-full bg-gray-800 pl-11 pr-4 py-3 rounded-xl border border-gray-700 focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none appearance-none text-white transition-all cursor-pointer"
                                >
                                    {stages.map(stage => (
                                        <option key={stage.id} value={stage.id}>
                                            {stage.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Data */}
                        <div className="md:col-span-4 space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Previsão Fechamento</label>
                            <div className="relative group">
                                <FaCalendar className="absolute left-4 top-3.5 text-gray-500 group-hover:text-accent-primary transition-colors" />
                                <input 
                                    type="date" 
                                    value={closingDate} 
                                    onChange={(e) => setClosingDate(e.target.value)}
                                    className="w-full bg-gray-800 pl-11 pr-4 py-3 rounded-xl border border-gray-700 focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none text-white transition-all cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                                />
                            </div>
                        </div>

                        {/* Totalizador */}
                        <div className="md:col-span-4 flex flex-col justify-end pb-2 text-right">
                            <span className="text-xs text-gray-500 uppercase font-bold mb-1">Valor Total (Automático)</span>
                            <div className="text-3xl font-bold text-green-500 tracking-tight">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount)}
                            </div>
                        </div>
                    </div>

                    {/* Bloco 2: Itens (Tabela) */}
                    <div className="pt-8 border-t border-gray-800">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wide flex items-center gap-2">
                                <FaBoxOpen className="text-gray-500" /> Produtos e Serviços
                            </h3>
                        </div>

                        <div className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-800 text-gray-400 font-medium text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="p-4 w-1/2">Descrição</th>
                                        <th className="p-4 w-24 text-center">Qtd</th>
                                        <th className="p-4 w-32 text-right">Valor Unit.</th>
                                        <th className="p-4 w-32 text-right">Subtotal</th>
                                        <th className="p-4 w-12 text-center">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {items.map(item => (
                                        <tr key={item.id} className="group hover:bg-gray-800/30 transition-colors">
                                            <td className="p-2 pl-4">
                                                <input 
                                                    type="text" 
                                                    value={item.description} 
                                                    onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                                                    placeholder="Digite o nome do produto/serviço..."
                                                    className="w-full bg-transparent text-gray-200 placeholder-gray-600 focus:outline-none focus:bg-gray-800/80 rounded-lg px-3 py-2 transition-all border border-transparent focus:border-gray-700"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input 
                                                    type="number" min="1" 
                                                    value={item.quantity} 
                                                    onChange={(e) => handleUpdateItem(item.id, 'quantity', Number(e.target.value))}
                                                    className="w-full bg-transparent text-center text-gray-200 rounded-lg px-2 py-2 border border-transparent focus:bg-gray-800/80 focus:border-gray-700 focus:outline-none transition-all"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input 
                                                    type="number" min="0" step="0.01" 
                                                    value={item.unitPrice} 
                                                    onChange={(e) => handleUpdateItem(item.id, 'unitPrice', Number(e.target.value))}
                                                    className="w-full bg-transparent text-right text-gray-200 rounded-lg px-3 py-2 border border-transparent focus:bg-gray-800/80 focus:border-gray-700 focus:outline-none transition-all"
                                                />
                                            </td>
                                            <td className="p-4 text-right font-medium text-gray-300">
                                                R$ {(item.quantity * item.unitPrice).toFixed(2)}
                                            </td>
                                            <td className="p-2 text-center">
                                                <button 
                                                    onClick={() => handleRemoveItem(item.id)} 
                                                    className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Remover item"
                                                >
                                                    <FaTrash size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            {/* Botão Adicionar (Linha Pontilhada) */}
                            <button 
                                onClick={handleAddItem}
                                className="w-full p-4 flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-accent-primary bg-gray-900 hover:bg-gray-800/50 border-t border-dashed border-gray-700 transition-all cursor-pointer"
                            >
                                <FaPlus size={12} />
                                Adicionar nova linha
                            </button>
                        </div>
                    </div>

                </div>

                {/* --- FOOTER --- */}
                <div className="p-6 border-t border-gray-800 bg-gray-900 flex justify-end gap-4 flex-shrink-0">
                    <button 
                        onClick={onClose} 
                        className="px-6 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="px-8 py-3 rounded-xl text-sm font-bold text-white bg-accent-primary hover:bg-orange-600 shadow-lg shadow-orange-900/20 flex items-center gap-2 transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Salvando...' : <><FaSave /> Salvar Negócio</>}
                    </button>
                </div>

            </div>
        </div>
    );
};