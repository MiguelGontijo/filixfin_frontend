import Link from 'next/link';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { ICategory } from '../types';

/**
 * Interface de Props do Componente.
 * Segue o padrão "Presentational Component": recebe dados e funções do pai.
 * Não faz chamadas de API diretamente.
 */
interface CategoryListGridProps {
    categories: ICategory[];
    isLoading: boolean;
    onDelete: (id: string) => void;
    tenantId: string;
}

/**
 * Componente de Grid de Listagem de Categorias.
 * * Padrão Visual:
 * - Tabela com background bg-gray-800/50
 * - Bordas sutis border-gray-700
 * - Hover nas linhas para feedback visual
 * - Ícones via react-icons/fa
 */
export function CategoryListGrid({ 
    categories, 
    isLoading, 
    onDelete, 
    tenantId 
}: CategoryListGridProps) {
    
    return (
        <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800/50 shadow-sm">
            <table className="w-full text-left text-sm text-gray-400">
                {/* Cabeçalho Padronizado */}
                <thead className="bg-gray-900/50 text-xs uppercase text-gray-400 font-semibold">
                    <tr>
                        <th className="px-6 py-4">Nome da Categoria</th>
                        <th className="px-6 py-4">Categoria Pai</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                </thead>

                {/* Corpo da Tabela */}
                <tbody className="divide-y divide-gray-700/50">
                    {/* Estado de Carregamento */}
                    {isLoading && (
                        <tr>
                            <td colSpan={3} className="px-6 py-8 text-center text-gray-500 animate-pulse">
                                Carregando dados...
                            </td>
                        </tr>
                    )}

                    {/* Estado Vazio */}
                    {!isLoading && categories.length === 0 && (
                        <tr>
                            <td colSpan={3} className="px-6 py-8 text-center text-gray-500 italic">
                                Nenhuma categoria encontrada.
                            </td>
                        </tr>
                    )}

                    {/* Listagem de Dados */}
                    {!isLoading && categories.map((category) => (
                        <tr 
                            key={category.id} 
                            className="hover:bg-gray-700/50 transition-colors duration-200"
                        >
                            <td className="px-6 py-4 font-medium text-gray-200">
                                {category.name}
                            </td>
                            <td className="px-6 py-4">
                                {category.parentId ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-blue-400 border border-blue-900/30">
                                        Subcategoria
                                    </span>
                                ) : (
                                    <span className="text-gray-600">-</span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end items-center gap-3">
                                    {/* Botão Editar: Navega para a rota de edição */}
                                    <Link 
                                        href={`/${tenantId}/dashboard/products/categories/${category.id}`}
                                        className="text-blue-400 hover:text-blue-300 transition-colors p-1"
                                        title="Editar Categoria"
                                    >
                                        <FaEdit className="w-4 h-4" />
                                    </Link>

                                    {/* Botão Excluir: Dispara a prop onDelete */}
                                    <button
                                        onClick={() => onDelete(category.id)}
                                        className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-red-900/20 rounded"
                                        title="Excluir Categoria"
                                    >
                                        <FaTrash className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}