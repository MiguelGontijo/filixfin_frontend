import { ProductList } from '@/modules/products/components/ProductList';

/**
 * Rota Principal de Produtos.
 * * URL: /[tenantId]/dashboard/products
 * * Padrão: Thin Page (A lógica está isolada em ProductList).
 */
export default function ProductsPage() {
    return <ProductList />;
}