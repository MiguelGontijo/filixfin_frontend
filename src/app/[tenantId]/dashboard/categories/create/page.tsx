import { CategoryForm } from '@/modules/categories/components/CategoryForm';

/**
 * Rota de Criação de Categoria.
 * Caminho: /[tenantId]/dashboard/categories/create
 */
export default function CategoryCreatePage() {
    return <CategoryForm />;
}