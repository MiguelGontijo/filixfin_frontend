'use client';

import React from 'react';
import { CadastrosContainer } from '@/core/components/crud/CadastrosContainer';

export default function CadastrosContainerPage() {
    return (
        <main className="h-full w-full overflow-hidden p-6">
            <CadastrosContainer />
        </main>
    );
}