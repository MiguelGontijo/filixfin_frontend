// src/features/products/types.ts

// --- ENUMS (Espelho do Backend) ---

export enum ProductType {
    PHYSICAL = 'PHYSICAL',
    SERVICE = 'SERVICE',
    DIGITAL = 'DIGITAL',
    REAL_ESTATE = 'REAL_ESTATE',
    VEHICLE = 'VEHICLE'
}

export enum ProductCondition {
    NEW = 'new',
    REFURBISHED = 'refurbished',
    USED = 'used'
}

export enum ProductAvailability {
    IN_STOCK = 'in_stock',
    OUT_OF_STOCK = 'out_of_stock',
    PREORDER = 'preorder',
    BACKORDER = 'backorder'
}

// --- TIPOS DE METADATA (Especificidades do JSONB) ---

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
    gender?: 'male' | 'female' | 'unisex';
    age_group?: 'newborn' | 'infant' | 'toddler' | 'kids' | 'adult';
    model_code?: string;
}

export interface VehicleMetadata {
    year: number;
    mileage: number;
    fuel: 'GASOLINE' | 'ETHANOL' | 'DIESEL' | 'HYBRID' | 'ELECTRIC' | 'FLEX';
    transmission: 'MANUAL' | 'AUTOMATIC' | 'CVT' | 'DUAL_CLUTCH';
    plate_end?: string;
    color?: string;
    doors?: number;
    fipe_code?: string;
}

export interface RealEstateMetadata {
    property_type: 'HOUSE' | 'APARTMENT' | 'LAND' | 'COMMERCIAL' | 'FARM';
    area_total_m2: number;
    area_useful_m2?: number;
    bedrooms: number;
    bathrooms: number;
    suites?: number;
    parking_spaces: number;
    iptu_value?: number;
    condo_value?: number;
    features?: string[];
}

export interface ServiceMetadata {
    duration_minutes: number;
    is_remote: boolean;
    recurrence: 'NONE' | 'MONTHLY' | 'YEARLY';
    requirements?: string[];
}

export interface DigitalMetadata {
    file_size_mb?: number;
    file_format?: string;
    download_limit?: number;
    version?: string;
    requirements_os?: string;
}

// --- ENTIDADE PRINCIPAL ---

export interface Product {
    id: string;
    tenantId: string;
    
    // Identificação
    title: string;
    description: string | null;
    brand: string | null;
    
    // Mídia e Taxonomia
    images: string[] | null; // URLs
    categoryPath: string | null;

    // Códigos
    sku: string | null;
    gtin: string | null;
    mpn: string | null;

    // Valores e Estado
    price: number;
    promotionalPrice: number | null;
    condition: ProductCondition;
    availability: ProductAvailability;

    // Polimorfismo
    type: ProductType;
    
    // O campo flexível (Pode ser qualquer um dos tipos acima)
    metadata: 
        | PhysicalMetadata 
        | VehicleMetadata 
        | RealEstateMetadata 
        | ServiceMetadata 
        | DigitalMetadata 
        | null;

    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// --- INPUTS PARA FORMULÁRIOS (ATUALIZADO) ---

export interface ProductFormData {
    title: string;
    description: string;
    brand: string;
    
    // --- Novos Campos de Marketplace ---
    categoryPath?: string;
    gtin?: string;
    mpn?: string;
    
    sku: string;
    price: number;
    promotionalPrice?: number;
    condition: ProductCondition;
    availability: ProductAvailability;
    type: ProductType;
    images: string[]; 
    
    // O formulário vai preencher isso dinamicamente
    metadata: any; 
}