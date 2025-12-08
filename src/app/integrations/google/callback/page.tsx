// src/app/integrations/google/callback/page.tsx

"use client";

import React, { Suspense } from 'react';
import { GoogleCallbackView } from '@/modules/settings/presentation/GoogleCallbackView';

/**
 * @page GoogleCallbackPage
 * @description Rota pública para callback do Google OAuth.
 * @fix Envolvido em Suspense para evitar erro de build "useSearchParams() should be wrapped in a suspense boundary".
 */
export default function GoogleCallbackPage() {
    return (
        <Suspense 
            fallback={
                <div className="min-h-screen bg-base-dark flex flex-col items-center justify-center text-gray-400">
                    <span className="loading loading-spinner loading-lg"></span>
                    <p className="mt-4 text-sm font-bold animate-pulse">Carregando integração...</p>
                </div>
            }
        >
            <GoogleCallbackView />
        </Suspense>
    );
}