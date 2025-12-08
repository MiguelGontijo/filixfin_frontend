// src/app/[tenantId]/dashboard/settings/page.tsx

"use client";

import React from 'react';
import { SettingsContainer } from '@/modules/settings/presentation/SettingsContainer';

/**
 * @component SettingsPage
 * @description Rota para a área de configurações do Tenant e do Usuário.
 * @path /[tenantId]/dashboard/settings
 */
export default function SettingsPage() {
    return <SettingsContainer />;
}