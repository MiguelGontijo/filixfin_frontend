// src/core/providers/GoogleProvider.tsx

"use client";

import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

interface GoogleProviderProps {
    children: React.ReactNode;
}

/**
 * @component GoogleProvider
 * @description Wrapper para fornecer o contexto de autenticação do Google para a aplicação.
 * Deve envolver a aplicação no nível mais alto possível (Layout).
 */
export const GoogleProvider: React.FC<GoogleProviderProps> = ({ children }) => {
    
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
        console.error("FATAL: NEXT_PUBLIC_GOOGLE_CLIENT_ID não definida no .env do Frontend.");
        // Não quebramos a app inteira, mas o login Google não funcionará
        return <>{children}</>;
    }

    return (
        <GoogleOAuthProvider clientId={clientId}>
            {children}
        </GoogleOAuthProvider>
    );
};