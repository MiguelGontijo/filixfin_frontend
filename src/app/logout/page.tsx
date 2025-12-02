// src/app/logout/page.tsx

"use client";

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/core/hooks/useNavigation'; // MODIFICAÇÃO: Importa o hook centralizado (R1)

/**
 * @component LogoutPage
 * @description Rota dedicada para limpar a sessão do usuário.
 * Porquê: Garante que o estado global (AuthContext) e o localStorage sejam limpos,
 * e o usuário seja redirecionado para a tela de login.
 */
export default function LogoutPage() {
    // MODIFICAÇÃO: Usamos o hook useNavigation para redirecionamento
    const { toLogin } = useNavigation();
    
    // O router do AuthContext.tsx agora tem a lógica de toLogin
    const { logout } = useAuth();
    
    useEffect(() => {
        // Limpa o estado e o localStorage
        logout(); 
        
        // Redireciona para a tela de Login
        // MODIFICAÇÃO: Chamada explícita ao método centralizado toLogin
        toLogin(); 
    }, [logout, toLogin]); // MODIFICAÇÃO: Dependência atualizada (toLogin)

    // Retorna um placeholder simples durante o redirecionamento
    return (
        <div className="flex items-center justify-center min-h-screen bg-base-dark text-white">
            Encerrando sessão...
        </div>
    );
}