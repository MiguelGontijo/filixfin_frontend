/**
 * @enum ProductType
 * @description Espelho exato do Enum definido no Backend (CreateProductDto).
 * Dita o comportamento do produto no sistema (se tem estoque, se tem variações, etc).
 */
export enum ProductType {
    SIMPLE = 'SIMPLE',     // Produto de venda direta, sem variações (Ex: Mouse sem fio)
    VARIABLE = 'VARIABLE', // Produto pai com SKUs filhos (Ex: Camiseta nas cores Azul e Preta)
    SERVICE = 'SERVICE',   // Prestação de serviço, usa agendamento/horas (Ex: Formatação de PC)
    KIT = 'KIT'            // Agrupamento de produtos simples vendidos juntos (Combo)
}

/**
 * @enum BaseUOM
 * @description Unidades de Medida Básicas (Unit of Measure).
 * No backend é salvo como um texto livre (string), mas no frontend
 * nós "travamos" as opções em um Enum para gerar um Dropdown (Select)
 * padronizado e evitar que o usuário digite lixo no banco de dados.
 */
export enum BaseUOM {
    UN = 'UN', // Unidade (Padrão absoluto do sistema)
    KG = 'KG', // Quilograma
    LT = 'LT', // Litro
    MT = 'MT', // Metro
    CX = 'CX', // Caixa
    HR = 'HR', // Hora (Utilizado majoritariamente para o tipo SERVICE)
    PR = 'PR'  // Par (Calçados, luvas, etc)
}