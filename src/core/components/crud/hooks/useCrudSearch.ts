import { useState, useMemo } from 'react';

/**
 * ============================================================================
 * 🔍 HOOK: useCrudSearch (Motor de Busca Universal)
 * @description Isola a lógica matemática de filtragem de dados (Client-side).
 * Permite que qualquer componente visual (Tabela, Card, Dashboard) consuma a 
 * mesma inteligência de busca sem duplicar código.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Performance e SRP):
 * - O(N * M) Otimizado: O `useMemo` garante que a matriz de dados só seja 
 * recalculada se a lista original ou o termo de busca sofrerem mutação.
 * - Varredura Agnóstica: O motor não precisa saber quais são as colunas; 
 * ele inspeciona todas as chaves do objeto dinamicamente.
 * ============================================================================
 */
export function useCrudSearch<T>(data: T[]) {
    
    // 1. Estado da Lupa (O que o usuário está procurando)
    const [searchTerm, setSearchTerm] = useState('');

    // 2. Motor de Filtragem Reativa
    const filteredData = useMemo(() => {
        // Se a lupa estiver vazia, devolvemos a referência original da memória (O(1))
        if (!searchTerm.trim()) return data;
        
        const lowerTerm = searchTerm.toLowerCase();
        
        // Varredura Profunda (Deep Scan)
        return data.filter((item) => {
            // Inspeciona iterativamente todos os valores do objeto da entidade
            return Object.values(item as Record<string, unknown>).some(val => {
                // 🛡️ Amortecedor de Tipagem: Ignora nulos para evitar quebras no cast para String
                if (val === null || val === undefined) return false;
                
                return String(val).toLowerCase().includes(lowerTerm);
            });
        });
    }, [data, searchTerm]);

    return {
        searchTerm,
        setSearchTerm,
        filteredData
    };
}