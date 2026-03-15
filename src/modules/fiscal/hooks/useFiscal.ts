import { useState, useCallback, useEffect } from 'react';
import { api } from '@/core/services/api';
import { ITaxGroup } from '../types';

/**
 * @hook useFiscal
 * @description Hook de Leitura (GET) para os Perfis Tributários e suas Regras.
 * * PADRÃO CLASSE OURO (Enterprise Grade):
 * 1. Nomenclatura estrita alinhada com o Backend (TaxGroup).
 * 2. Fetcher memoizado com `useCallback` para evitar loops infinitos no useEffect.
 * 3. O estado `isLoading` inicia como `true` para garantir uma UX fluida no primeiro render.
 */
export function useFiscal() {
    // 1. Estados
    const [taxGroups, setTaxGroups] = useState<ITaxGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true); // Começa true para mostrar o Skeleton/Loading na UI de cara
    const [error, setError] = useState<string | null>(null);

    // 2. Motor de Busca (Memoizado)
    const fetchTaxGroups = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // A API agora devolve o Perfil Pai + O Array de Regras Filhas (Motor Bimodal)
            const response = await api.get<ITaxGroup[]>('/fiscal/tax-groups');
            setTaxGroups(response.data);
        } catch (err: any) {
            console.error('❌ Erro ao buscar perfis tributários:', err);
            // Captura amigável para o usuário final
            const msg = err.response?.data?.message || 'Falha de conexão ao carregar as regras fiscais.';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 3. Gatilho Inicial (On Mount)
    useEffect(() => {
        fetchTaxGroups();
    }, [fetchTaxGroups]);

    // 4. API Pública do Hook
    return {
        taxGroups, // Expondo a lista já com o nome correto
        isLoading,
        error,
        refreshTaxGroups: fetchTaxGroups // Útil para recarregar o Grid após uma deleção, por exemplo
    };
}