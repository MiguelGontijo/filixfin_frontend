import { CategoryList } from '@/modules/categories/components/CategoryList';

/**
 * Rota de Categorias.
 * * Apenas renderiza o Container do Módulo.
 * * O 'use client' não é necessário aqui se o CategoryList já tiver.
 * * Mas se o CategoryList for default export, ajuste o import.
 */
export default function CategoriesPage() {
    return <CategoryList />;
}