// src/core/ui/auth/GoogleAuthButton.tsx

import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';

/**
 * @component GoogleAuthButton
 * @description Botão oficial de login do Google.
 * Gerencia o sucesso/erro e chama o AuthContext.
 */
export const GoogleAuthButton: React.FC = () => {
    
    const { loginWithGoogle } = useAuth();

    return (
        <div className="w-full flex justify-center">
            <GoogleLogin
                onSuccess={async (credentialResponse) => {
                    if (credentialResponse.credential) {
                        await loginWithGoogle(credentialResponse.credential);
                    }
                }}
                onError={() => {
                    console.error('Login Failed');
                    alert("Falha na conexão com o Google.");
                }}
                theme="filled_black" // Tema escuro para combinar com o app
                shape="pill"         // Formato arredondado moderno
                size="large"         // Botão grande e clicável
                text="continue_with" // "Continuar com o Google"
                locale="pt-BR"
            />
        </div>
    );
};