// src/types/tenant.ts

import { Plan } from "./acl"; // Importa o tipo Plan do novo módulo

/**
 * @interface Tenant
 * @description Tipagem para a Entidade Tenant.
 */
export interface Tenant {
    id: string;
    cnpjCpf: string;
    razaoSocial: string;
    nomeFantasia: string | null;
    emailContato: string;
    planoId: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    
    // Relação (opcional no FindBy/FindAll do Admin)
    plan?: Plan;
}