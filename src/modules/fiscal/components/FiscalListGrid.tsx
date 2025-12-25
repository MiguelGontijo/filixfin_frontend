import Link from 'next/link';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { IFiscalGroup } from '../types';

/**
 * Interface de Props para o Grid Fiscal.
 * Segue o padrão Presentational Component (Burro):
 * - Recebe os dados prontos (fiscalGroups).
 * - Recebe os estados de UI (isLoading).
 * - Recebe as funções de ação (onDelete).
 */
interface FiscalListGridProps {
    fiscalGroups: IFiscalGroup[];
    isLoading: boolean;
    onDelete: (id: string) => void;
    tenantId: string;
}

/**
 * Componente de Grid para Listagem de Grupos Fiscais.
 * * Padrão Visual (Extraído de ProductListGrid):
 * - Container: bg-gray-800/50, border-gray-700.
 * - Tabela: HTML nativo + Tailwind.
 * - Ícones: react-icons/fa.
 */
export function FiscalListGrid({ 
    fiscalGroups, 
    isLoading, 
    onDelete, 
    tenantId 
}: FiscalListGridProps) {
    
    return (
        <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800/50 shadow-sm">
            <table className="w-full text-left text-sm text-gray-400">
                {/* Cabeçalho da Tabela */}
                <thead className="bg-gray-900/50 text-xs uppercase text-gray-400 font-semibold">
                    <tr>
                        <th className="px-6 py-4">Nome do Grupo</th>
                        <th className="px-6 py-4">NCM Padrão</th>
                        <th className="px-6 py-4 text-center">Tributação (ICMS/PIS/COFINS)</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                </thead>

                {/* Corpo da Tabela */}
                <tbody className="divide-y divide-gray-700/50">
                    {/* Estado de Carregamento */}
                    {isLoading && (
                        <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500 animate-pulse">
                                Carregando dados fiscais...
                            </td>
                        </tr>
                    )}

                    {/* Estado Vazio */}
                    {!isLoading && fiscalGroups.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500 italic">
                                Nenhum grupo fiscal cadastrado.
                            </td>
                        </tr>
                    )}

                    {/* Listagem de Dados */}
                    {!isLoading && fiscalGroups.map((group) => (
                        <tr 
                            key={group.id} 
                            className="hover:bg-gray-700/50 transition-colors duration-200"
                        >
                            <td className="px-6 py-4 font-medium text-gray-200">
                                {group.name}
                            </td>
                            <td className="px-6 py-4 font-mono text-xs text-accent-primary">
                                {group.ncmDefault}
                            </td>
                            <td className="px-6 py-4 text-center">
                                {/* Badge de Tributos */}
                                <span className="inline-flex items-center gap-2 text-xs bg-gray-900 rounded-full px-3 py-1 border border-gray-700">
                                    <span className="text-blue-400" title="ICMS">ICMS: {group.icms}%</span>
                                    <span className="text-gray-600">|</span>
                                    <span className="text-green-400" title="PIS">PIS: {group.pis}%</span>
                                    <span className="text-gray-600">|</span>
                                    <span className="text-yellow-400" title="COFINS">COFINS: {group.cofins}%</span>
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end items-center gap-3">
                                    {/* Botão Editar */}
                                    <Link 
                                        href={`/${tenantId}/dashboard/fiscal/${group.id}`}
                                        className="text-blue-400 hover:text-blue-300 transition-colors p-1"
                                        title="Editar Grupo"
                                    >
                                        <FaEdit className="w-4 h-4" />
                                    </Link>

                                    {/* Botão Excluir */}
                                    <button
                                        onClick={() => onDelete(group.id)}
                                        className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-red-900/20 rounded"
                                        title="Excluir Grupo"
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