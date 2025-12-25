'use client';

import { useRouter, useParams } from 'next/navigation';
import { ProductForm } from '@/modules/products/components/ProductForm';

/**
 * Rota de Criação de Produto.
 * * URL: /[tenantId]/dashboard/products/create
 * * Responsabilidade:
 * - Renderizar o formulário em modo de CRIAÇÃO (sem prop 'product').
 * - Fornecer a lógica de navegação (voltar para lista) após sucesso ou cancelamento.
 */
export default function ProductCreatePage() {
    const router = useRouter();
    const params = useParams();
    const tenantId = params.tenantId as string;

    // Função de redirecionamento padrão para a listagem
    const handleNavigateBack = () => {
        router.push(`/${tenantId}/dashboard/products`);
    };

    return (
        <div className="h-[calc(100vh-6rem)]"> {/* Container para ocupar altura disponível */}
            <ProductForm 
                onSuccess={handleNavigateBack}
                onCancel={handleNavigateBack}
            />
        </div>
    );
}