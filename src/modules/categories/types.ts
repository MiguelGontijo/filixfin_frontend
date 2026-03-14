export type AttributeType = 'text' | 'number' | 'select' | 'boolean';

export interface IAttributeSchema {
  key: string;       // Identificador único do campo (ex: "voltagem")
  label: string;     // Nome visível (ex: "Voltagem")
  type: AttributeType;
  required: boolean;
  options?: string[]; // Para selects (ex: ["110v", "220v"])
}

/**
 * Definição de Tipos para o Módulo de Categorias.
 * Espelha as entidades do Backend para garantir integridade na comunicação.
 */

export interface ICategory {
    id: string;
    name: string;
    parentId?: string | null;
    tenantId: string;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    // Opcional: Para visualização em árvore
    children?: ICategory[];
}

export interface ICreateCategoryDTO {
    name: string;
    parentId?: string;
}

export interface IUpdateCategoryDTO extends Partial<ICreateCategoryDTO> {}

/**
 * Definição de Tipos para o Módulo de Categorias.
 * * Espelha as entidades do Backend para garantir integridade na comunicação.
 */
export interface Category {
    id: string;
    tenantId: string;
    name: string;
    isActive: boolean;
    parentId?: string | null; // Categoria Pai
    createdAt: string;
    updatedAt: string;
}

/**
 * O DTO de Criação/Edição (Write Model)
 * É exatamente o que o Zod gera no TForm.
 */
export interface CreateCategoryDto {
    name: string;
    isActive: boolean;
    categoryId?: string | null;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}