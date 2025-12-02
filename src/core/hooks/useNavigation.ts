// src/core/hooks/useNavigation.ts

import { useRouter, useParams } from 'next/navigation';
import { UserRole } from '@/core/types/user';

/**
 * @function useNavigation
 * @description Hook customizado para centralizar a lógica de roteamento e navegação da aplicação.
 * PORQUÊ: Abstrai o useRouter e gerencia a construção de rotas dinâmicas por Tenant (/[tenantId]/...).
 */
export function useNavigation() {
    
    // Obter o roteador e os parâmetros da URL (para saber o contexto atual)
    const router = useRouter();
    const params = useParams();

    /**
     * @private
     * @function resolveTenantId
     * @description Resolve o ID do Tenant a ser usado na navegação.
     * Prioridade: 1. ID passado explicitamente (troca de contexto) -> 2. ID da URL atual.
     */
    const resolveTenantId = (overrideTenantId?: string): string | null => {
        if (overrideTenantId) return overrideTenantId;
        if (params?.tenantId) return params.tenantId as string;
        return null;
    };

    // --- LÓGICA DE DECISÃO DE DESTINO PÓS-LOGIN ---

    /**
     * @private
     * @function getTargetRoute
     * @description Determina o destino final baseado na Role e no Tenant do usuário.
     */
    const getTargetRoute = (role: UserRole, tenantId?: string | null): string => {
        switch (role) {
            case UserRole.GLOBAL_ADMIN:
                // Global Admin continua na rota raiz /admin (sem contexto de tenant por enquanto)
                return '/admin/tenants'; 
            
            case UserRole.TENANT_ADMIN:
            case UserRole.MEMBER:
                // MODIFICAÇÃO: Redireciona para a rota dinâmica do Tenant
                if (tenantId) {
                    return `/${tenantId}/dashboard`;
                }
                // Fallback de segurança se não houver tenantId (não deveria acontecer para estes roles)
                console.error("Erro Crítico: Usuário de Tenant sem tenantId tentando navegar.");
                return '/login'; 
            
            default:
                return '/login';
        }
    };

    // --- Métodos de Navegação Pública ---

    const toLogin = () => {
        router.push('/login');
    };

    const toRegister = () => {
        router.push('/register');
    };

    /**
     * @method toPostLoginDestination
     * @description Executa a navegação inicial pós-login.
     * @param role A role do usuário.
     * @param tenantId O ID do tenant do usuário (necessário para montar a URL).
     */
    const toPostLoginDestination = (role: UserRole, tenantId?: string | null) => {
        const targetRoute = getTargetRoute(role, tenantId);
        router.push(targetRoute);
    };

    /**
     * @method toDashboard
     * @description Vai para o Dashboard Principal do Tenant atual (ou especificado).
     */
    const toDashboard = (overrideTenantId?: string) => {
        const tenantId = resolveTenantId(overrideTenantId);
        if (tenantId) {
            router.push(`/${tenantId}/dashboard`);
        } else {
            // Se não temos contexto, voltamos para o login ou home
            router.push('/login');
        }
    };

    /**
     * @method toAdminPlans
     * @description Rotas de Admin Global permanecem estáticas/raiz.
     */
    const toAdminPlans = () => {
        router.push('/admin/plans');
    };

    /**
     * @method toTenantClients
     * @description Navega para o módulo de Clientes dentro do contexto do Tenant.
     */
    const toTenantClients = (overrideTenantId?: string) => {
        const tenantId = resolveTenantId(overrideTenantId);
        if (tenantId) {
            router.push(`/${tenantId}/dashboard/clients`);
        }
    };

    return {
        toLogin,
        toRegister,
        toDashboard,
        toAdminPlans,
        toTenantClients,
        toPostLoginDestination,
        rawPush: router.push,
    };
}