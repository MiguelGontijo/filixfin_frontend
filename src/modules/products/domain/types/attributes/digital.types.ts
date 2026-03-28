/**
 * ============================================================================
 * 💾 Attributes TYPE: DigitalAttributes
 * @description Define a estrutura de dados dinâmicos (JSONB) para o setor 
 * de produtos digitais, software e infoprodutos.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Netflix/Shopify Level):
 * 1. Technical Specification: Detalha atributos de arquivo (tamanho, formato)
 * e versionamento, essenciais para o controle de ciclo de vida de software.
 * 2. Access Governance: Provê campos para limites de download, permitindo
 * que o sistema controle a escassez ou políticas de uso de arquivos.
 * 3. Environment Awareness: Mapeia requisitos de sistema (OS) para informar
 * proativamente a compatibilidade ao usuário antes da conversão/venda.
 * ============================================================================
 */

export interface DigitalAttributes {
    /** * 🧬 DNA: domain
     * @description Identificador de ativação do modelo de nicho. 
     * Essencial para o brilho automático e introspecção do Motor CRUD.
     */
    domain: string;
    
    /** 📦 Tamanho total do arquivo para download em Megabytes (MB) */
    file_size_mb?: number;

    /** 📄 Formato ou extensão do arquivo (ex: .pdf, .zip, .dmg, .apk) */
    file_format?: string;

    /** 📥 Quantidade máxima de vezes que o arquivo pode ser baixado pelo cliente */
    download_limit?: number;

    /** 🏷️ Identificador de versão ou build (ex: v1.2.4-stable) */
    version?: string;

    /** 🖥️ Requisitos mínimos de Sistema Operacional (ex: Windows 11, MacOS 14+) */
    requirements_os?: string;

    /** 🔑 Define se o produto exige uma chave de licença externa */
    requires_license_key: boolean;

    /** 🔗 URL opcional para demonstração ou visualização prévia (Preview) */
    preview_url?: string;
}