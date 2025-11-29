// src/components/layout/ClientSidebar.tsx

import React from 'react';
import Link from 'next/link';
import { FaUsers, FaHome, FaSignOutAlt } from 'react-icons/fa';

// Definição dos links da área de negócio do Cliente/Tenant
// PORQUÊ: Manteremos links estáticos por enquanto, mas esta lista será
// o ponto onde a lógica de ACL e Plans será aplicada no futuro (ACL Dinâmica).
const navItems = [
  { name: 'Dashboard Principal', href: '/dashboard', icon: FaHome },
  // Rotina de Negócio principal implementada
  { name: 'Gerenciar Clientes', href: '/clients', icon: FaUsers }, 
  // FUTURO: { name: 'Gerenciar Produtos', href: '/clients/products', icon: FaBox },
];

/**
 * @component ClientSidebar
 * @description Barra de navegação lateral para as rotinas de negócio do Tenant.
 * Porquê: Oferece navegação estruturada e coerente na área de trabalho do cliente (R3).
 */
export const ClientSidebar: React.FC = () => {
  return (
    <div className="flex flex-col w-64 min-h-screen bg-base-metallic p-4 space-y-6 border-r border-gray-700">
      
      {/* Título */}
      <div className="text-xl font-bold text-accent-secondary uppercase tracking-wider">
        FilixFin Workspace
      </div>

      {/* Navegação Principal */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Link 
            key={item.name} 
            href={item.href} 
            legacyBehavior
          >
            <a 
              className="flex items-center space-x-3 p-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition duration-150"
            >
              <item.icon className="w-4 h-4 text-accent-primary" />
              <span>{item.name}</span>
            </a>
          </Link>
        ))}
        
        {/* Link para área de Admin Global (Apenas se for Admin) */}
        {/* LÓGICA FUTURA: if (user.role === 'TENANT_ADMIN') ... */}
        <Link href="/admin/tenants" legacyBehavior>
            <a className="flex items-center space-x-3 p-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-700 hover:text-white transition duration-150">
                <FaSignOutAlt className="w-4 h-4 transform rotate-180 text-violet-400" />
                <span>Configurações Admin</span>
            </a>
        </Link>
        
      </nav>
      
      {/* Logout Simples */}
      <Link href="/logout" legacyBehavior>
        <a className="text-sm text-red-400 hover:text-red-500 transition border-t border-gray-700 pt-4 flex items-center space-x-2">
            <FaSignOutAlt className="w-4 h-4" />
            <span>Sair / Logout</span>
        </a>
      </Link>
    </div>
  );
};