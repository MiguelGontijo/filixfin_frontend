/**
 * ============================================================================
 * 📦 BARREL EXPORTER: Módulo de Produtos
 * @description Ponto único de entrada para todas as tipagens, enums e contratos 
 * do ecossistema de Supply Chain e Gestão de Materiais.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Netflix/Shopify Architecture):
 * 1. Interface Unification: Centraliza as definições de Produto e Variante, 
 * facilitando o consumo pelo Motor CRUD V4 e Hooks de Domínio.
 * 2. Attributes Aggregation: Expõe o cérebro polimórfico (ProductAttributes), 
 * integrando os nichos de Veículos, Imóveis, Digital e Food.
 * 3. Enums Governance: Garante que os mapas de intenções (ProductType, 
 * ProductDomainModel) sejam exportados com suas respectivas chaves de tipagem.
 * ============================================================================
 */

// ⚙️ Estruturas e Mapas de Intenção
export * from './enums';

// 🧬 Inteligência Polimórfica (JSONB) e Nichos de Mercado
export * from './attributes.types';
export * from './attributes/food.types';
export * from './attributes/vehicle.types';
export * from './attributes/real-estate.types';
export * from './attributes/digital.types';
export * from './attributes/service.types';

// 📦 Entidades Core e Contratos de Escrita (DTOs)
export * from './product';
export * from './variant';

/**
 * Nota Arquitetural: A organização física dos arquivos em subdiretórios 
 * permite a escalabilidade do sistema (ex: adicionar nichos de 'Moda' ou 'Agro') 
 * sem que este exportador precise sofrer alterações estruturais profundas.
 */