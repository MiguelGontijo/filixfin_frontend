// src/components/layout/AdminSidebar.tsx

import React from 'react';
import Link from 'next/link';
// Definição dos links da área de administração de ACL
const navItems = [
  // --- NOVO: Adicionar Gerenciamento de Tenants ---
  { name: 'Gerenciar Tenants', href: '/admin/tenants', icon: '🏢' }, // Novo link para a nova página
  // ------------------------------------------------
  { name: 'Gerenciar Planos', href: '/admin/plans', icon: '💎' },
  { name: 'Gerenciar Features', href: '/admin/features', icon: '🔑' },
  { name: 'Dashboard Mestre', href: '/dashboard', icon: '🏠' },
];
/**
 * @component AdminSidebar
 * @description Barra de navegação lateral para as rotinas administrativas.
 * Porquê: Oferece navegação estruturada e mantém a coerência visual na área de admin.
 */
export const AdminSidebar: React.FC = () => {
  return (
    <div className="flex flex-col w-64 min-h-screen bg-base-metallic p-4 space-y-6 border-r border-gray-700">
      
      {/* Título */}
      <div className="text-xl font-bold text-accent-primary uppercase tracking-wider">
        Configurações Admin
      </div>

      {/* Navegação */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Link 
            key={item.name} href={item.href} legacyBehavior>
            <a 
              className="flex items-center space-x-3 p-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition duration-150"
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </a>
          </Link>
        ))}
      </nav>
      
      {/* Logout Simples */}
      <Link href="/logout" legacyBehavior>
        <a className="text-sm text-red-400 hover:text-red-500 transition border-t border-gray-700 pt-4">
          Sair / Logout
        </a>
      </Link>
    </div>
  );
};