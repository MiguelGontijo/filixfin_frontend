// --- Importação das Especialidades (Módulos de Nicho) ---
import { FoodMetadata } from './metadata/food.types';
import { VehicleMetadata } from './metadata/vehicle.types';
import { RealEstateMetadata } from './metadata/real-estate.types';
import { DigitalMetadata } from './metadata/digital.types';
import { ProductDomainModel } from './enums';

/**
 * @interface PhysicalMetadata
 * @description Metadados para bens de consumo físicos gerais.
 */
export interface PhysicalMetadata {
    weight_kg?: number;
    dimensions?: {
        height_cm: number;
        width_cm: number;
        depth_cm: number;
    };
    color?: string;
    material?: string;
    size?: string;
    model_code?: string;
    gender?: string;
    age_group?: string;

}

/**
 * ============================================================================
 * 🧠 TYPE ALIAS: ProductMetadata (O Unificador Polimórfico)
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
export type ProductMetadata = 
    | { domain: ProductDomainModel.PHYSICAL; data: PhysicalMetadata }
    | { domain: ProductDomainModel.VEHICLE; data: VehicleMetadata }
    | { domain: ProductDomainModel.REAL_ESTATE; data: RealEstateMetadata }
    | { domain: ProductDomainModel.DIGITAL; data: DigitalMetadata }
    | { domain: ProductDomainModel.FOOD; data: FoodMetadata }
    | { domain: ProductDomainModel.SERVICE; data: Record<string, any> }; // Flexível para serviços diversos

/**
 * @type GenericMetadata
 * @description Fallback para operações que não exigem a discriminação de domínio.
 */
export type GenericMetadata = Record<string, any>;