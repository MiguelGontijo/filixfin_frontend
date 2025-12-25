import Link from 'next/link';
import { FaEdit, FaTrash, FaBox, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { Product, ProductAvailability } from '@/modules/products/types';

interface ProductListGridProps {
    products: Product[];
    isLoading: boolean;
    onDelete: (id: string) => void;
    tenantId: string;
    
    // --- NOVAS PROPRIEDADES (Correção do Erro de Interface) ---
    /** * Função opcional para selecionar um produto sem sair da tela (Master-Detail).
     * Se fornecida, substitui o Link de navegação pelo comportamento de seleção.
     */
    onSelect?: (product: Product) => void;
    
    /**
     * ID do produto atualmente selecionado (para destaque visual no grid).
     */
    selectedId?: string;
}

/**
 * Grid de Listagem de Produtos.
 * Suporta tanto navegação via rota quanto seleção local (Master-Detail).
 */
export function ProductListGrid({ 
    products, 
    isLoading, 
    onDelete, 
    tenantId,
    onSelect,      // Recebendo a nova prop
    selectedId     // Recebendo a nova prop
}: ProductListGridProps) {

    // Função auxiliar para formatar moeda
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    // Define cor e ícone baseados no nível de estoque
    const getStockStatus = (current: number, min: number) => {
        if (current <= 0) return { color: 'text-red-500', bg: 'bg-red-900/20', icon: FaExclamationTriangle };
        if (current <= min) return { color: 'text-yellow-500', bg: 'bg-yellow-900/20', icon: FaExclamationTriangle };
        return { color: 'text-green-500', bg: 'bg-green-900/20', icon: FaCheckCircle };
    };

    return (
        <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800/50 shadow-sm animate-fade-in">
            <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-gray-900/50 text-xs uppercase text-gray-400 font-semibold">
                    <tr>
                        <th className="px-6 py-4">Produto</th>
                        <th className="px-6 py-4">SKU / Ref</th>
                        <th className="px-6 py-4 text-center">Estoque</th>
                        <th className="px-6 py-4 text-right">Preço</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-gray-700/50">
                    {/* Estado de Carregamento */}
                    {isLoading && (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center animate-pulse">
                                Carregando inventário...
                            </td>
                        </tr>
                    )}

                    {/* Estado Vazio */}
                    {!isLoading && products.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center italic">
                                Nenhum produto encontrado.
                            </td>
                        </tr>
                    )}

                    {/* Listagem */}
                    {!isLoading && products.map((product) => {
                        const stockInfo = getStockStatus(product.currentStock || 0, product.minStock || 0);
                        
                        // Verifica se esta linha é a selecionada no Master-Detail
                        const isSelected = selectedId === product.id;

                        return (
                            <tr 
                                key={product.id} 
                                className={`transition-colors duration-200 group ${
                                    isSelected 
                                    ? 'bg-blue-900/20 border-l-4 border-l-blue-500' // Destaque para linha ativa
                                    : 'hover:bg-gray-700/50 border-l-4 border-l-transparent'
                                }`}
                            >
                                {/* Coluna Produto */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded bg-gray-900 border border-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {product.images && product.images.length > 0 ? (
                                                <img src={product.images[0]} alt={product.title} className="h-full w-full object-cover"/>
                                            ) : (
                                                <FaBox className="text-gray-600" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-200 line-clamp-1">{product.title}</div>
                                            <div className="text-xs text-gray-500">{product.type}</div>
                                        </div>
                                    </div>
                                </td>

                                {/* SKU */}
                                <td className="px-6 py-4 font-mono text-xs text-accent-secondary">{product.sku || '-'}</td>

                                {/* Estoque */}
                                <td className="px-6 py-4 text-center">
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-transparent ${stockInfo.bg} ${stockInfo.color}`}>
                                        <stockInfo.icon size={10} />
                                        <span>{product.currentStock || 0}</span>
                                    </div>
                                </td>

                                {/* Preço */}
                                <td className="px-6 py-4 text-right font-medium text-gray-200">{formatCurrency(product.price)}</td>

                                {/* Status */}
                                <td className="px-6 py-4 text-center">
                                    <span className={`text-xs px-2 py-1 rounded border ${
                                        product.availability === ProductAvailability.IN_STOCK 
                                            ? 'border-green-800 text-green-400 bg-green-900/10'
                                            : 'border-gray-700 text-gray-500'
                                    }`}>
                                        {product.availability === ProductAvailability.IN_STOCK ? 'Ativo' : 'Indisp.'}
                                    </span>
                                </td>

                                {/* Ações */}
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        
                                        {/* --- LÓGICA DE DECISÃO: NAVEGAÇÃO VS SELEÇÃO --- */}
                                        {onSelect ? (
                                            // Modo 1: Seleção Local (Master-Detail)
                                            // Usa botão normal para disparar o evento onSelect
                                            <button 
                                                onClick={() => onSelect(product)}
                                                className="text-blue-400 hover:text-blue-300 transition-colors p-1"
                                                title="Editar (Seleção Rápida)"
                                            >
                                                <FaEdit className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            // Modo 2: Navegação Padrão
                                            // Usa Link do Next.js para ir para outra rota
                                            <Link 
                                                href={`/${tenantId}/dashboard/products/${product.id}`}
                                                className="text-blue-400 hover:text-blue-300 transition-colors p-1"
                                                title="Ir para Página de Detalhes"
                                            >
                                                <FaEdit className="w-4 h-4" />
                                            </Link>
                                        )}

                                        <button
                                            onClick={() => onDelete(product.id)}
                                            className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-red-900/20 rounded"
                                            title="Excluir"
                                        >
                                            <FaTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}