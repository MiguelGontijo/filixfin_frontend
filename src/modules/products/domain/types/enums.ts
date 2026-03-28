/**
 * @enum ProductType
 * @description Espelho exato do Enum definido no Backend (Product.ts).
 * Dita o comportamento estrutural do produto: se possui estoque centralizado, 
 * se habilita grade de variantes ou se é um serviço agendável.
 */
export enum ProductType {
    SIMPLE = 'SIMPLE',     // Produto de venda direta (Ex: Mouse, Veículo único)
    VARIABLE = 'VARIABLE', // Produto pai com SKUs filhos (Ex: Camiseta P/M/G)
    SERVICE = 'SERVICE',   // Prestação de serviço (Ex: Consultoria, Mão de Obra)
    KIT = 'KIT'            // Agrupamento de itens vendidos em conjunto (Combo)
}
export type ProductTypeKey = keyof typeof ProductType;

/**
 * ============================================================================
 * 💠 ENUM: ProductDomainModel (A Identidade de Nicho)
 * @description Define a "Pele" ou "Template" de dados dinâmicos (JSONB) que 
 * o produto carrega. Utilizado pelo Motor CRUD V4 para injetar sub-formulários 
 * especializados e validar metadados específicos de mercado.
 * 🏆 PADRÃO CLASSE OURO: Separação de Preocupações (SoC) entre estrutura e domínio.
 * ============================================================================
 */
export enum ProductDomainModel {
    PHYSICAL = 'PHYSICAL',       // Bens de consumo gerais (Peso, Dimensões)
    VEHICLE = 'VEHICLE',         // Automotivo (Placa, KM, Chassi)
    REAL_ESTATE = 'REAL_ESTATE', // Imobiliário (Área, Quartos, IPTU)
    DIGITAL = 'DIGITAL',         // Software/Arquivos (Versão, Link, Download)
    SERVICE = 'SERVICE',         // Atributos de execução (Local, Recorrência)
    FOOD = 'FOOD'                // 🍕 NOVO: Alimentação (Ingredientes, Nutricional, Alérgenos)
}

export type ProductDomainModelKey = keyof typeof ProductDomainModel;

/**
 * @enum BaseUOM
 * @description Unidades de Medida Básicas (Unit of Measure).
 * Padroniza a saída do sistema para evitar inconsistências no banco de dados.
 */
export enum BaseUOM {
    UN = 'UN', // Unidade
    KG = 'KG', // Quilograma
    LT = 'LT', // Litro
    MT = 'MT', // Metro
    CX = 'CX', // Caixa
    HR = 'HR', // Hora (Comum em SERVICE)
    PR = 'PR'  // Par
}

export type BaseUOMKey = keyof typeof BaseUOM;