/**
 * Definição de Tipos para o Módulo Fiscal (Grupos de Tributação).
 * * Entidade crítica para emissão de notas e cálculo de custos.
 */

export interface IFiscalGroup {
    id: string;
    name: string;
    description?: string;
    // NCM Padrão (Nomenclatura Comum do Mercosul) - Obrigatório para NF-e
    ncmDefault: string;
    // Alíquotas de Imposto (Percentual 0-100)
    icms: number;
    pis: number;
    cofins: number;
    
    tenantId: string;
    createdAt: string;
    updatedAt: string;
}

export interface ICreateFiscalGroupDTO {
    name: string;
    ncmDefault: string;
    // O Frontend deve garantir que estes valores sejam números
    icms: number;
    pis: number;
    cofins: number;
}

export interface IUpdateFiscalGroupDTO extends Partial<ICreateFiscalGroupDTO> {}


export interface ITaxGroup {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateTaxGroupDTO {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface IUpdateTaxGroupDTO extends Partial<ICreateTaxGroupDTO> {
  id: string;
}