// src/features/products/components/ProductForm.tsx

import React, { useState, useEffect } from 'react';
import { 
    FaSave, FaTimes, FaImage, FaTrash, FaPlus, 
    FaTag, FaBarcode, FaCube 
} from 'react-icons/fa';
import { 
    Product, ProductType, ProductCondition, ProductAvailability, ProductFormData 
} from '../types';
import { useProductMutation } from '../hooks/useProductMutation';

interface ProductFormProps {
    product?: Product; // Se undefined, é criação
    onSuccess: () => void;
    onCancel: () => void;
}

/**
 * @component ProductForm
 * @description Formulário Mestre para cadastro/edição de produtos.
 * Gerencia os dados relacionais (SQL) e o estado do Metadata (JSONB).
 */
export const ProductForm: React.FC<ProductFormProps> = ({ 
    product, 
    onSuccess, 
    onCancel 
}) => {
    
    const { createProduct, updateProduct, isLoading, error } = useProductMutation();
    const isEditing = !!product;

    // --- ESTADOS DO FORMULÁRIO ---
    
    // 1. Campos Comuns (Relacionais)
    const [formData, setFormData] = useState<Partial<ProductFormData>>({
        title: '',
        description: '',
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

    // 2. Estado de Imagem (Input temporário)
    const [imageUrlInput, setImageUrlInput] = useState('');

    // 3. Metadata (Campos Específicos)
    // Inicializamos vazio. Os sub-formulários irão popular isso.
    const [metadata, setMetadata] = useState<any>({});

    // --- EFEITO: HIDRATAÇÃO (EDIT MODE) ---
    useEffect(() => {
        if (product) {
            setFormData({
                title: product.title,
                description: product.description || '',
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

    // Handler de Imagens (Array de Strings)
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

    // Handler de Submissão
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Monta o payload final
        const payload: ProductFormData = {
            ...formData as ProductFormData,
            metadata: metadata // Injeta o JSONB específico
        };

        try {
            if (isEditing && product) {
                await updateProduct(product.id, payload);
            } else {
                await createProduct(payload);
            }
            onSuccess();
        } catch (err) {
            // Erro já tratado no hook (console.error)
        }
    };

    return (
        <form onSubmit={handleSubmit} className="h-full flex flex-col bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden animate-fade-in">
            
            {/* Header do Form */}
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

            {/* Corpo Scrollável */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                
                {error && (
                    <div className="p-3 bg-red-900/30 border border-red-800 text-red-300 rounded text-sm mb-4">
                        {error}
                    </div>
                )}

                {/* 1. SEÇÃO PRINCIPAL (Identificação) */}
                <div className="grid grid-cols-12 gap-4">
                    
                    {/* Título */}
                    <div className="col-span-8">
                        <label className="block text-[10px] uppercase font-bold text-accent-primary mb-1">Título do Produto *</label>
                        <input 
                            type="text" name="title" required value={formData.title} onChange={handleChange}
                            className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-accent-primary focus:outline-none"
                            placeholder="Ex: Tênis Esportivo Nike Air"
                        />
                    </div>

                    {/* Tipo (Polimorfismo) */}
                    <div className="col-span-4">
                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Tipo de Item</label>
                        <select 
                            name="type" value={formData.type} onChange={handleChange} disabled={isEditing}
                            className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-accent-secondary focus:outline-none disabled:opacity-50"
                        >
                            {Object.values(ProductType).map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    {/* Preços e Estoque */}
                    <div className="col-span-3">
                        <label className="block text-[10px] uppercase font-bold text-green-400 mb-1">Preço (R$)</label>
                        <input 
                            type="number" name="price" min="0" step="0.01" required value={formData.price} onChange={handleChange}
                            className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-green-500 focus:outline-none font-mono"
                        />
                    </div>
                    <div className="col-span-3">
                        <label className="block text-[10px] uppercase font-bold text-yellow-400 mb-1">Promoção (R$)</label>
                        <input 
                            type="number" name="promotionalPrice" min="0" step="0.01" value={formData.promotionalPrice} onChange={handleChange}
                            className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-yellow-500 focus:outline-none font-mono"
                        />
                    </div>
                    <div className="col-span-3">
                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Condição</label>
                        <select name="condition" value={formData.condition} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white text-sm">
                            {Object.values(ProductCondition).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="col-span-3">
                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Disponibilidade</label>
                        <select name="availability" value={formData.availability} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white text-sm">
                            {Object.values(ProductAvailability).map(a => <option key={a} value={a}>{a.replace('_', ' ')}</option>)}
                        </select>
                    </div>
                </div>

                {/* 2. SEÇÃO DE IMAGENS (Galeria Rápida) */}
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

                    {/* Grid de Thumbnails */}
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

                {/* 3. SEÇÃO DE METADATA (Campos Específicos) */}
                {/* Aqui entra a injeção do formulário específico baseado no TYPE */}
                <div className="border-t border-gray-700 pt-4 mt-2">
                    <h4 className="text-xs font-bold text-accent-secondary uppercase mb-3 flex items-center">
                        <FaCube className="mr-2" /> Especificações de {formData.type}
                    </h4>
                    
                    {/* Placeholder para os componentes específicos que criaremos a seguir */}
                    <div className="bg-gray-900 p-4 rounded border border-dashed border-gray-600">
                        <p className="text-sm text-gray-500 mb-2">
                            Campos específicos para <strong>{formData.type}</strong> serão renderizados aqui.
                        </p>
                        {/* TODO: Implementar Renderização Condicional
                            <VehicleFields metadata={metadata} onChange={setMetadata} />
                            <RealEstateFields metadata={metadata} onChange={setMetadata} />
                        */}
                        <textarea 
                            className="w-full bg-gray-800 text-xs text-green-400 font-mono p-2 rounded border border-gray-700 h-24"
                            value={JSON.stringify(metadata, null, 2)}
                            onChange={(e) => {
                                try { setMetadata(JSON.parse(e.target.value)) } catch {}
                            }}
                            placeholder="Editor JSON bruto temporário (enquanto não criamos os forms específicos)"
                        />
                    </div>
                </div>

                {/* 4. SEÇÃO DE CÓDIGOS E CATEGORIA */}
                <div className="grid grid-cols-3 gap-4">
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
        </form>
    );
};