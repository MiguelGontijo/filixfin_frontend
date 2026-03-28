// --- Importação das Especialidades (Módulos de Nicho) ---
import { FoodAttributes } from './attributes/food.types';
import { VehicleAttributes } from './attributes/vehicle.types';
import { RealEstateAttributes } from './attributes/real-estate.types';
import { DigitalAttributes } from './attributes/digital.types';
import { ProductDomainModel } from './enums';
import { PhysicalAttributes } from './attributes/physical.types';



/**
 * ============================================================================
 * 🧠 TYPE ALIAS: ProductAttributes (O Unificador Polimórfico)
 * @description Centraliza todas as variações de JSONB do sistema.
 * Utiliza o padrão de União Discriminada para garantir integridade absoluta 
 * entre o modelo de domínio selecionado e os dados armazenados.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Enterprise Architecture):
 * 1. Type Safety: Impede a mistura de dados (ex: km de carro em imóvel).
 * 2. Developer Experience (DX): Provê IntelliSense preciso baseado no context.
 * 3. Scalability: Permite a adição de novos nichos (ex: Agro, Moda) sem 
 * impactar as interfaces base de Produto e Variante.
 * ============================================================================
 */
export type ProductAttributes = 
    | { domain: ProductDomainModel.PHYSICAL; data: PhysicalAttributes }
    | { domain: ProductDomainModel.VEHICLE; data: VehicleAttributes }
    | { domain: ProductDomainModel.REAL_ESTATE; data: RealEstateAttributes }
    | { domain: ProductDomainModel.DIGITAL; data: DigitalAttributes }
    | { domain: ProductDomainModel.FOOD; data: FoodAttributes }
    | { domain: ProductDomainModel.SERVICE; data: Record<string, any> }; // Flexível para serviços diversos

/**
 * @type GenericAttributes
 * @description Fallback para operações que não exigem a discriminação de domínio.
 */
export type GenericAttributes = Record<string, any>;