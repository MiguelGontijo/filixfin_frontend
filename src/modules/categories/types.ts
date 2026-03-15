/**
 * @type AttributeType
 * @description Tipos suportados pelo nosso construtor de campos dinâmicos (JSONB).
 */
export type AttributeType = 'text' | 'number' | 'select' | 'boolean';

/**
 * @interface IAttributeSchema
 * @description Estrutura exata do JSONB 'attributesSchema' retornado/enviado para o backend.
 */

export enum CategoryTypeEnum {
     PRODUCT = 'PRODUCT',
     SERVICE = 'SERVICE'
}

export const CategoryType = CategoryTypeEnum;
export type  CategoryType = CategoryTypeEnum;

export interface IAttributeSchema {
    key: string;       // Identificador interno único (ex: "voltagem")
    label: string;     // Nome visível na UI (ex: "Voltagem (V)")
    type: AttributeType;
    required: boolean;
    options?: string[]; // Preenchido apenas quando type === 'select'
}

/**
 * @interface Category
 * @description Tipagem principal espelhada com o CategoryResponseDto do Backend.
 * Contém os campos operacionais e os campos de auditoria/sistema ocultos.
 */
export interface Category {
    // 🔑 Identificadores e Dados Principais
    id: string;
    name: string;
    slug: string;
    type: CategoryTypeEnum;
    isActive: boolean;

    // 🧬 Metadados (O JSONB)
    attributesSchema: IAttributeSchema[];

    // 🌳 Hierarquia
    parentId?: string | undefined;
    children?: Category[]; 

    // 🛡️ Auditoria e Sistema
    createdAt: string; // Datas trafegam como string ISO 8601 no JSON
    updatedAt: string;
}

/**
 * @interface CreateCategoryDto
 * @description Payload exato exigido pelo NestJS no POST /categories
 */
export interface CreateCategoryDto {
    name: string;
    type?: CategoryTypeEnum;
    parentId?: string | undefined;
    isActive?: boolean;
    attributesSchema?: IAttributeSchema[];
}

/**
 * @interface UpdateCategoryDto
 * @description Payload para atualização parcial no PATCH /categories/:id
 */
export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}