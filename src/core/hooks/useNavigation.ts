
import { useRouter } from 'next/navigation';
import { UserRole } from '@/core/types/user'; // Importamos o tipo Role para a decisão

/**
 * @function useNavigation
 * @description Hook customizado para centralizar a lógica de roteamento e navegação da aplicação.
 * PORQUÊ: Abstrai o useRouter, fornecendo métodos semânticos e agora, centraliza a lógica de decisão pós-login.
 */
export function useNavigation() {
    
    // Obter o roteador do Next.js
    const router = useRouter();

    // --- LÓGICA DE DECISÃO DE DESTINO (TRANSFERIDA DO AUTHCONTEXT) ---

    /**
     * @private
     * @function getTargetRoute
     * @description Determina o destino final e correto baseado na Role do usuário.
     * PORQUÊ: Garante que o usuário vá DIRETAMENTE para sua área de trabalho,
     * eliminando o flash do Dashboard Mestre (instrução crítica).
     * @param role A role do usuário logado.
     * @returns A string da rota de destino final.
     */
    const getTargetRoute = (role: UserRole): string => {
        switch (role) {
            case UserRole.GLOBAL_ADMIN:
                // Destino FINAL para Admin Global
                return '/admin/tenants'; 
            case UserRole.TENANT_ADMIN:
            case UserRole.MEMBER:
                // MODIFICAÇÃO: Redireciona para o Hub Orquestrador /dashboard (G.1)
                return '/dashboard'; 
            default:
                return '/login';
        }
    };

    // --- Métodos de Navegação Pública ---

    /**
     * @method toLogin
     * @description Redireciona o usuário para a tela de login.
     * Usado no Logout e no AuthGuard (acesso negado).
     */
    const toLogin = () => {
        router.push('/login');
    };

    /**
     * @method toPostLoginDestination
     * @description Executa a navegação para o destino final determinado pela Role.
     * É o ponto de entrada chamado pelo AuthContext após login bem-sucedido.
     * @param role A role do usuário.
     */
    const toPostLoginDestination = (role: UserRole) => {
        const targetRoute = getTargetRoute(role);
        router.push(targetRoute);
    };

    /**
     * @method toDashboard
     * @description Redireciona o usuário para o hub central (usado para navegação interna).
     */
    const toDashboard = () => {
        router.push('/dashboard');
    };

    /**
     * @method toAdminPlans
     * @description Redireciona para a tela de Gerenciamento de Planos (Rota principal do Admin).
     */
    const toAdminPlans = () => {
        router.push('/admin/plans');
    };

    /**
     * @method toTenantClients
     * @description Redireciona para a tela de Clientes (Rota principal de negócio do Tenant).
     */
    const toTenantClients = () => {
        router.push('/clients');
    };
    
    const toRegister = () => {
        router.push('/register');
    };


    return {
        // Métodos de navegação semânticos
        toLogin,
        toDashboard,
        toAdminPlans,
        toTenantClients,
        toRegister,
        
        // NOVO: Método de execução da decisão pós-login
        toPostLoginDestination,
        
        // Expor o push cru (raw push) para casos específicos
        rawPush: router.push,
    };
}