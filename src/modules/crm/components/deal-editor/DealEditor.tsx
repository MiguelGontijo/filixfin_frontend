// src/modules/crm/components/deal-editor/DealEditor.tsx

import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaUser, FaCalendar, FaBoxOpen, FaTrash, FaPlus } from 'react-icons/fa';
import { CRMDeal, DealStatus } from '../../types';

// Tipagem dos Itens do Pedido (Produto/Serviço)
interface DealItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
}

interface DealEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; // Callback para recarregar o Kanban após salvar
    
    // Dados de Contexto
    pipelineId?: string;
    defaultStatus?: DealStatus; // Se clicou no "+" de uma coluna específica
    dealToEdit?: CRMDeal; // Se for edição, vem preenchido
}

export const DealEditor: React.FC<DealEditorProps> = ({
    isOpen,
    onClose,
    onSuccess,
    pipelineId,
    defaultStatus,
    dealToEdit
}) => {
    
    // ============================================================================
    // 1. ESTADOS DO FORMULÁRIO
    // ============================================================================
    const [title, setTitle] = useState('');
    const [clientId, setClientId] = useState('');
    const [closingDate, setClosingDate] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<DealStatus>('OPEN');
    
    // Lista de Itens (Produtos/Serviços)
    const [items, setItems] = useState<DealItem[]>([]);
    
    // Estado derivado: Valor Total (Soma dos itens)
    const [totalAmount, setTotalAmount] = useState(0);

    const [isSaving, setIsSaving] = useState(false);

    // Hook para buscar clientes (para o dropdown)
    const { clients } = useClients(); 

    // ============================================================================
    // 2. EFEITOS (CARREGAMENTO E CÁLCULOS)
    // ============================================================================

    // Efeito: Carregar dados quando abrir para EDIÇÃO
    useEffect(() => {
        if (isOpen) {
            if (dealToEdit) {
                // Modo Edição: Preenche tudo
                setTitle(dealToEdit.title);
                setClientId(dealToEdit.clientId);
                setClosingDate(dealToEdit.expectedClosingDate ? new Date(dealToEdit.expectedClosingDate).toISOString().split('T')[0] : '');
                setDescription(dealToEdit.description || '');
                setStatus(dealToEdit.status);
                // TODO: Se o backend retornar itens, preencher aqui: setItems(dealToEdit.items)
            } else {
                // Modo Criação: Reseta (mantendo status da coluna se houver)
                resetForm();
                if (defaultStatus) setStatus(defaultStatus);
            }
        }
    }, [isOpen, dealToEdit, defaultStatus]);

    // Efeito: Calcular Total automaticamente quando os itens mudam
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
        setStatus('OPEN');
    };

    // ============================================================================
    // 3. HANDLERS (LÓGICA DE ITENS E SALVAMENTO)
    // ============================================================================

    const handleAddItem = () => {
        const newItem: DealItem = {
            id: Date.now().toString(), // ID temporário
            description: '',
            quantity: 1,
            unitPrice: 0
        };
        setItems([...items, newItem]);
    };

    const handleUpdateItem = (id: string, field: keyof DealItem, value: any) => {
        const updatedItems = items.map(item => 
            item.id === id ? { ...item, [field]: value } : item
        );
        setItems(updatedItems);
    };

    const handleRemoveItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleSave = async () => {
        if (!title || !clientId || !pipelineId) return;

        setIsSaving(true);
        try {
            const dealData = {
                title,
                clientId,
                pipelineId,
                status, // Agora usamos o status do form
                value: totalAmount, // O valor é a soma dos itens
                expectedClosingDate: closingDate ? new Date(closingDate) : undefined,
                description,
                items // Enviamos os itens para o backend salvar
            };

            if (dealToEdit) {
                await dealService.update(dealToEdit.id, dealData);
            } else {
                await dealService.create(dealData);
            }
            
            onSuccess(); // Avisa o pai para atualizar o Kanban
            onClose();   // Fecha o editor
        } catch (error) {
            console.error("Erro ao salvar deal:", error);
            alert("Erro ao salvar negócio. Verifique os dados.");
        } finally {
            setIsSaving(false);
        }
    };

    // ============================================================================
    // 4. RENDERIZAÇÃO
    // ============================================================================

    return (
        <div 
            className={`
                absolute bottom-0 left-0 w-full z-40
                bg-base-metallic rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]
                flex flex-col border-t border-white/10
                transition-transform duration-300 ease-out
                ${isOpen ? 'translate-y-0' : 'translate-y-full pointer-events-none'}
            `}
            // Altura de 97% conforme solicitado (deixa ver o topo do Kanban)
            style={{ height: '97%' }} 
        >
            
            {/* --- HEADER (FIXO) --- */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-base-metallic rounded-t-2xl">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent-primary/10 rounded-xl border border-accent-primary/20 text-accent-primary">
                        <FaBoxOpen size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-100">
                            {dealToEdit ? 'Editar Negócio' : 'Novo Negócio'}
                        </h2>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                            {pipelineId ? 'Registrando oportunidade no funil' : 'Detalhes da Venda'}
                        </p>
                    </div>
                </div>
                
                <button 
                    onClick={onClose}
                    className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                >
                    <FaTimes size={20} />
                </button>
            </div>

            {/* --- BODY (SCROLLÁVEL) --- */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-base-metallic">
                
                {/* BLOCO 1: DADOS PRINCIPAIS (Grid Layout) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    
                    {/* Cliente (Ocupa metade) */}
                    <div className="md:col-span-6 space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <FaUser className="text-accent-secondary" /> Cliente
                        </label>
                        <select
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            className="w-full bg-base-dark text-gray-100 p-3 rounded-xl border border-white/10 focus:border-accent-primary focus:ring-1 focus:ring-accent-primary outline-none appearance-none cursor-pointer"
                        >
                            <option value="">Selecione um cliente...</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>{client.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Título do Deal (Ocupa metade) */}
                    <div className="md:col-span-6 space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                            Título da Oportunidade
                        </label>
                        <input 
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Contrato Anual - Empresa X"
                            className="w-full bg-base-dark text-gray-100 p-3 rounded-xl border border-white/10 focus:border-accent-primary outline-none placeholder-gray-600"
                        />
                    </div>

                    {/* Data de Fechamento */}
                    <div className="md:col-span-4 space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <FaCalendar className="text-accent-secondary" /> Previsão
                        </label>
                        <input 
                            type="date"
                            value={closingDate}
                            onChange={(e) => setClosingDate(e.target.value)}
                            className="w-full bg-base-dark text-gray-100 p-3 rounded-xl border border-white/10 focus:border-accent-primary outline-none"
                        />
                    </div>

                    {/* Status/Fase */}
                    <div className="md:col-span-4 space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                            Fase Inicial
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as DealStatus)}
                            className="w-full bg-base-dark text-gray-100 p-3 rounded-xl border border-white/10 focus:border-accent-primary outline-none"
                        >
                            <option value="OPEN">Em Aberto</option>
                            <option value="WON" className="text-green-400">Ganho (Won)</option>
                            <option value="LOST" className="text-red-400">Perdido (Lost)</option>
                        </select>
                    </div>

                </div>

                {/* BLOCO 2: ITENS E VALORES (A "Tabela Integrada") */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wide">
                            Itens e Produtos
                        </h3>
                        <button 
                            onClick={handleAddItem}
                            className="text-xs font-bold text-accent-primary hover:text-orange-400 flex items-center gap-1 bg-accent-primary/10 px-3 py-1.5 rounded-lg border border-accent-primary/20 transition-all hover:bg-accent-primary/20"
                        >
                            <FaPlus /> Adicionar Item
                        </button>
                    </div>

                    {/* Container da Tabela com visual 'Inset' */}
                    <div className="bg-base-dark rounded-xl border border-white/5 overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-gray-400 font-medium">
                                <tr>
                                    <th className="p-3 pl-4 w-1/2">Descrição / Produto</th>
                                    <th className="p-3 w-20 text-center">Qtd</th>
                                    <th className="p-3 w-32 text-right">Valor Unit.</th>
                                    <th className="p-3 w-32 text-right">Subtotal</th>
                                    <th className="p-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-600 italic">
                                            Nenhum item adicionado. O valor será zero.
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((item) => (
                                        <tr key={item.id} className="group hover:bg-white/5 transition-colors">
                                            <td className="p-2 pl-3">
                                                <input 
                                                    type="text"
                                                    value={item.description}
                                                    onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                                                    placeholder="Nome do produto ou serviço"
                                                    className="w-full bg-transparent text-gray-200 placeholder-gray-600 focus:outline-none"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input 
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleUpdateItem(item.id, 'quantity', Number(e.target.value))}
                                                    className="w-full bg-base-dark/50 text-center text-gray-200 rounded p-1 border border-transparent focus:border-accent-primary focus:outline-none"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input 
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.unitPrice}
                                                    onChange={(e) => handleUpdateItem(item.id, 'unitPrice', Number(e.target.value))}
                                                    className="w-full bg-base-dark/50 text-right text-gray-200 rounded p-1 border border-transparent focus:border-accent-primary focus:outline-none"
                                                />
                                            </td>
                                            <td className="p-3 text-right font-medium text-gray-300">
                                                R$ {(item.quantity * item.unitPrice).toFixed(2)}
                                            </td>
                                            <td className="p-2 text-center">
                                                <button 
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                                >
                                                    <FaTrash size={12} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            
                            {/* Rodapé da Tabela: Totalizador */}
                            <tfoot className="bg-white/5 border-t border-white/10">
                                <tr>
                                    <td colSpan={3} className="p-3 text-right text-gray-400 text-xs uppercase font-bold tracking-wider">
                                        Valor Total Estimado:
                                    </td>
                                    <td className="p-3 text-right font-bold text-xl text-accent-primary">
                                        R$ {totalAmount.toFixed(2)}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* BLOCO 3: OBSERVAÇÕES */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                        Observações / Descrição Detalhada
                    </label>
                    <textarea 
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Detalhes importantes sobre esta negociação..."
                        className="w-full bg-base-dark text-gray-100 p-3 rounded-xl border border-white/10 focus:border-accent-primary outline-none resize-none placeholder-gray-600"
                    />
                </div>

            </div>

            {/* --- FOOTER (AÇÕES FIXAS) --- */}
            <div className="p-6 border-t border-white/5 bg-base-metallic rounded-b-lg">
                <div className="flex gap-4 max-w-2xl ml-auto">
                    <button 
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                    >
                        Cancelar
                    </button>
                    
                    <button 
                        onClick={handleSave}
                        disabled={isSaving || !title || !clientId || items.length === 0}
                        className="flex-1 px-6 py-3 rounded-xl text-sm font-bold text-white bg-accent-primary hover:bg-orange-600 shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <span className="animate-pulse">Salvando...</span>
                        ) : (
                            <>
                                <FaSave />
                                <span>Salvar Negócio</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

        </div>
    );
};