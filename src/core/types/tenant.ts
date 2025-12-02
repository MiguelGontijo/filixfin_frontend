
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

// DTO para Atualização (Baseado em UpdateTenantAdmin.dto.ts do Backend)
export interface UpdateTenantAdminDto {
    razaoSocial?: string;
    nomeFantasia?: string;
    planoId?: string;
    isActive?: boolean;
}

// Tipagem completa do Tenant retornado
export interface TenantResponse extends Tenant {
    plan?: Plan; // O Backend retorna a relação Plan no find/update
}

// Propriedades do Modal
export interface TenantModalProps {
    isOpen: boolean;
    onClose: () => void;
    // Dados do Tenant a ser editado
    currentTenant: Tenant; 
    onSuccess: () => void; // Callback para recarregar a tabela
}

// DTO de Edição (Usado no formulário)
// Repetindo a tipagem para clareza, mas idealmente viria do types/tenant.ts
export interface UpdateTenantAdminDto {
    razaoSocial?: string;
    nomeFantasia?: string;
    planoId?: string;
    isActive?: boolean;
}

// Tipagem local para o componente (usa o tipo Tenant)
export interface TenantWithPlan extends Tenant {
    plan: Plan
}
