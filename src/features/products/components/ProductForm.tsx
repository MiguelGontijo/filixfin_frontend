// src/features/products/components/ProductForm.tsx

import React, { useState, useEffect } from 'react';
import { 
    FaSave, FaTimes, FaImage, FaTrash, FaPlus, 
    FaTag, FaBarcode, FaCube, FaInfoCircle, FaListUl 
} from 'react-icons/fa';
import { 
    Product, ProductType, ProductCondition, ProductAvailability, ProductFormData 
} from '../types';
import { useProductMutation } from '../hooks/useProductMutation';

// Importação dos Sub-Formulários Específicos
import { ServiceFields } from './metadata-forms/ServiceFields';
import { VehicleFields } from './metadata-forms/VehicleFields';
import { DigitalFields } from './metadata-forms/DigitalFields';
import { PhysicalFields } from './metadata-forms/PhysicalFields';
import { RealEstateFields } from './metadata-forms/RealEstateFields';

interface ProductFormProps {
    product?: Product;
    onSuccess: () => void;
    onCancel: () => void;
}

type FormTab = 'BASIC' | 'SPECS';

/**
 * @component ProductForm
 * @description Formulário Mestre com sistema de Abas e Renderização Polimórfica.
 */
export const ProductForm: React.FC<ProductFormProps> = ({ 
    product, 
    onSuccess, 
    onCancel 
}) => {
    
    const { createProduct, updateProduct, isLoading, error } = useProductMutation();
    const isEditing = !!product;

    // --- ESTADOS ---
    const [activeTab, setActiveTab] = useState<FormTab>('BASIC');
    
    // Campos Comuns
    const [formData, setFormData] = useState<Partial<ProductFormData>>({
        title: '',
        shortDescription: '',
        longDescription: '',
        brand: '',
        sku: '',
        gtin: '',
        mpn: '',
        price: 0,
        promotionalPrice: 0,
        condition: ProductCondition.NEW,
        availability: ProductAvailability.IN_STOCK,
        type: ProductType.PHYSICAL,
        categoryPath: '',
        images: []
    });

    const [imageUrlInput, setImageUrlInput] = useState('');

    // Metadata (Campos Específicos)
    const [metadata, setMetadata] = useState<any>({});

    // --- HIDRATAÇÃO ---
    useEffect(() => {
        if (product) {
            setFormData({
                title: product.title,
                shortDescription: product.shortDescription || '',
                longDescription: product.longDescription || '',
                brand: product.brand || '',
                sku: product.sku || '',
                gtin: product.gtin || '',
                mpn: product.mpn || '',
                price: Number(product.price),
                promotionalPrice: product.promotionalPrice ? Number(product.promotionalPrice) : 0,
                condition: product.condition,
                availability: product.availability,
                type: product.type,
                categoryPath: product.categoryPath || '',
                images: product.images || []
            });
            setMetadata(product.metadata || {});
        }
    }, [product]);

    // --- HANDLERS ---

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    // Handler Especial para Tipo: Limpa o metadata ao trocar de tipo para evitar lixo
    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value as ProductType;
        setFormData(prev => ({ ...prev, type: newType }));
        if (!isEditing) {
            setMetadata({}); // Reseta metadata se estiver criando um novo
        }
    };

    const handleAddImage = () => {
        if (!imageUrlInput.trim()) return;
        setFormData(prev => ({
            ...prev,
            images: [...(prev.images || []), imageUrlInput.trim()]
        }));
        setImageUrlInput('');
    };

    const handleRemoveImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images?.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const payload: ProductFormData = {
            ...formData as ProductFormData,
            metadata: metadata
        };

        try {
            if (isEditing && product) {
                await updateProduct(product.id, payload);
            } else {
                await createProduct(payload);
            }
            onSuccess();
        } catch (err) {
            console.error(err);
        }
    };

    // --- RENDERIZAÇÃO DO FORMULÁRIO DINÂMICO ---
    const renderMetadataForm = () => {
        switch (formData.type) {
            case ProductType.SERVICE:
                return <ServiceFields metadata={metadata} onChange={setMetadata} />;
            case ProductType.VEHICLE:
                return <VehicleFields metadata={metadata} onChange={setMetadata} />;
            case ProductType.PHYSICAL:
                return <PhysicalFields metadata={metadata} onChange={setMetadata} />;
            case ProductType.DIGITAL:
                return <DigitalFields metadata={metadata} onChange={setMetadata} />;
            case ProductType.REAL_ESTATE:
                return <RealEstateFields metadata={metadata} onChange={setMetadata} />;
            default:
                return null;
        }
    };

    const tabClass = (tab: FormTab) => `
        flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center transition-colors border-b-2 
        ${activeTab === tab 
            ? 'border-accent-secondary text-white bg-gray-800/50' 
            : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800/30'}
    `;

    return (
        <form onSubmit={handleSubmit} className="h-full flex flex-col bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden animate-fade-in shadow-2xl">
            
            {/* HEADER */}
            <div className="p-4 border-b border-gray-700 bg-gray-900 flex justify-between items-center flex-shrink-0">
                <h3 className="text-lg font-bold text-white flex items-center">
                    {isEditing ? <><FaSave className="mr-2 text-accent-secondary" /> Editar Produto</> : <><FaPlus className="mr-2 text-accent-primary" /> Novo Cadastro</>}
                </h3>
                <div className="flex space-x-2">
                    <button type="button" onClick={onCancel} className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded border border-gray-600 transition">
                        Cancelar
                    </button>
                    <button type="submit" disabled={isLoading} className="px-4 py-1.5 text-xs font-bold text-base-dark bg-accent-primary hover:bg-orange-500 rounded shadow-lg transition transform active:scale-95 disabled:opacity-50">
                        {isLoading ? 'Salvando...' : 'Salvar Produto'}
                    </button>
                </div>
            </div>

            {/* ABAS */}
            <div className="flex border-b border-gray-700 bg-gray-900/50">
                <button type="button" onClick={() => setActiveTab('BASIC')} className={tabClass('BASIC')}>
                    <FaInfoCircle className="inline mr-2" /> Dados Básicos
                </button>
                <button type="button" onClick={() => setActiveTab('SPECS')} className={tabClass('SPECS')}>
                    <FaListUl className="inline mr-2" /> Especificações ({formData.type})
                </button>
            </div>

            {/* CORPO DO FORMULÁRIO */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                
                {error && (
                    <div className="p-3 bg-red-900/30 border border-red-800 text-red-300 rounded text-sm mb-4">
                        {error}
                    </div>
                )}

                {/* --- ABA 1: DADOS BÁSICOS --- */}
                {activeTab === 'BASIC' && (
                    <div className="space-y-6 animate-fade-in">
                        
                        {/* Identificação */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-8">
                                <label className="block text-[10px] uppercase font-bold text-accent-primary mb-1">Título *</label>
                                <input 
                                    type="text" name="title" required value={formData.title} onChange={handleChange}
                                    className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-accent-primary focus:outline-none"
                                    placeholder="Nome do produto ou serviço"
                                />
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Tipo *</label>
                                <select 
                                    name="type" value={formData.type} onChange={handleTypeChange} disabled={isEditing}
                                    className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-accent-secondary focus:outline-none disabled:opacity-50"
                                >
                                    {Object.values(ProductType).map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Descrições (Novo) */}
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Descrição Curta (SEO/Cards)</label>
                                <input 
                                    type="text" name="shortDescription" value={formData.shortDescription || ''} onChange={handleChange} maxLength={500}
                                    className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-accent-primary focus:outline-none"
                                    placeholder="Breve resumo para listagens..."
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Descrição Detalhada</label>
                                <textarea 
                                    name="longDescription" value={formData.longDescription || ''} onChange={handleChange} rows={4}
                                    className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-accent-primary focus:outline-none resize-y"
                                    placeholder="Detalhes completos, especificações técnicas, etc."
                                />
                            </div>
                        </div>

                        {/* Preços e Estoque */}
                        <div className="grid grid-cols-4 gap-4 bg-gray-900/30 p-4 rounded-lg border border-gray-700/50">
                            <div className="col-span-1">
                                <label className="block text-[10px] uppercase font-bold text-green-400 mb-1">Preço (R$)</label>
                                <input 
                                    type="number" name="price" min="0" step="0.01" required value={formData.price} onChange={handleChange}
                                    className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-green-500 focus:outline-none font-mono"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-[10px] uppercase font-bold text-yellow-400 mb-1">Promoção (R$)</label>
                                <input 
                                    type="number" name="promotionalPrice" min="0" step="0.01" value={formData.promotionalPrice} onChange={handleChange}
                                    className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-yellow-500 focus:outline-none font-mono"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Condição</label>
                                <select name="condition" value={formData.condition} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white text-xs">
                                    {Object.values(ProductCondition).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Disponibilidade</label>
                                <select name="availability" value={formData.availability} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white text-xs">
                                    {Object.values(ProductAvailability).map(a => <option key={a} value={a}>{a.replace('_', ' ')}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Imagens */}
                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-2 flex items-center">
                                <FaImage className="mr-1" /> Galeria de Imagens (URLs)
                            </label>
                            
                            <div className="flex gap-2 mb-3">
                                <input 
                                    type="text" 
                                    value={imageUrlInput} 
                                    onChange={(e) => setImageUrlInput(e.target.value)}
                                    placeholder="Cole a URL da imagem aqui..." 
                                    className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-1.5 text-xs text-white focus:border-accent-primary focus:outline-none"
                                />
                                <button onClick={handleAddImage} type="button" className="bg-gray-700 hover:bg-accent-primary text-white px-3 py-1.5 rounded transition text-xs font-bold">
                                    Adicionar
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {formData.images?.map((url, idx) => (
                                    <div key={idx} className="relative group w-20 h-20 rounded border border-gray-600 overflow-hidden bg-black">
                                        <img src={url} alt={`Img ${idx}`} className="w-full h-full object-cover" />
                                        <button 
                                            onClick={() => handleRemoveImage(idx)}
                                            className="absolute top-0 right-0 bg-red-600/80 text-white p-1 opacity-0 group-hover:opacity-100 transition"
                                        >
                                            <FaTrash size={10} />
                                        </button>
                                        {idx === 0 && <span className="absolute bottom-0 left-0 bg-accent-primary text-[8px] px-1 text-base-dark font-bold">CAPA</span>}
                                    </div>
                                ))}
                                {(!formData.images || formData.images.length === 0) && (
                                    <div className="text-xs text-gray-600 italic py-2">Nenhuma imagem adicionada.</div>
                                )}
                            </div>
                        </div>

                        {/* Códigos e Categoria */}
                        <div className="grid grid-cols-3 gap-4 border-t border-gray-700 pt-4">
                            <div className="col-span-3">
                                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Categoria (Google Taxonomy)</label>
                                <input 
                                    type="text" name="categoryPath" value={formData.categoryPath || ''} onChange={handleChange}
                                    className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white text-xs"
                                    placeholder="Ex: Vestuário > Roupas Masculinas > Camisetas"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 flex items-center"><FaBarcode className="mr-1"/> SKU</label>
                                <input type="text" name="sku" value={formData.sku || ''} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-white text-xs" />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">GTIN / EAN</label>
                                <input type="text" name="gtin" value={formData.gtin || ''} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-white text-xs" />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Marca</label>
                                <input type="text" name="brand" value={formData.brand || ''} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-white text-xs" />
                            </div>
                        </div>
                    </div>
                )}

                {/* --- ABA 2: ESPECIFICAÇÕES (METADATA) --- */}
                {activeTab === 'SPECS' && (
                    <div className="animate-fade-in">
                        <div className="flex items-center mb-4 text-accent-secondary">
                            <FaCube className="mr-2" />
                            <h4 className="text-sm font-bold uppercase">Detalhes Técnicos: {formData.type}</h4>
                        </div>
                        
                        {/* A "Mágica" da Renderização Condicional */}
                        <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-700/50 min-h-[300px]">
                            {renderMetadataForm()}
                        </div>
                    </div>
                )}

            </div>
        </form>
    );
};