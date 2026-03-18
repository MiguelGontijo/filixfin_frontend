import React, { useState } from 'react';
import { FaWhatsapp, FaTelegram, FaPaperPlane, FaCalendarAlt, FaTimes } from 'react-icons/fa';

// --- Tipagens e Contratos ---
import { Client } from '@/core/client/types/client';

// --- Motores Injetáveis (Widgets de Omnichannel) ---
import { WhatsAppWidget } from '../../components/communication/WhatsAppWidget';
import { SchedulerWidget } from '@/modules/scheduler/components/SchedulerWidget';

/**
 * @type OmnichannelTab
 * @description Define os módulos disponíveis no painel de comunicação.
 * null = Painel recolhido (colapsado).
 */
type OmnichannelTab = 'WA' | 'TG' | 'AGENDA' | null;

/**
 * @interface CockpitSidebarRightProps
 * @description Contrato estrito do Pilar de Comunicação.
 * Recebe exclusivamente o contexto do cliente do Maestro (CRMCockpitView)
 * para amarrar os chats e a agenda ao cliente focado no Palco Central.
 */
export interface CockpitSidebarRightProps {
    /** O cliente atualmente focado na visão central. */
    client: Client | null;
}

/**
 * ============================================================================
 * 💬 PILAR 3: COCKPIT SIDEBAR RIGHT (O Centro Omnichannel)
 * @description Gerencia a comunicação fluida com o cliente (WhatsApp, Telegram, Agenda).
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Colapsável e Reativo):
 * - Funciona de forma autônoma: Controla sua própria expansão (width) sem 
 * forçar re-renderizações no Maestro (CockpitView).
 * - Utiliza flexbox com larguras fixas durante a animação para evitar 
 * "esmagamento" (squishing) do conteúdo enquanto a barra desliza.
 * ============================================================================
 */
export const CockpitSidebarRight: React.FC<CockpitSidebarRightProps> = ({ client }) => {
    
    // Estado local para controle da gaveta (Retirado do Maestro e isolado aqui)
    const [activeTab, setActiveTab] = useState<OmnichannelTab>(null);

    // Derivação de estado para controle visual
    const isExpanded = activeTab !== null;

    /**
     * @method handleTabToggle
     * @description Alternador inteligente. Abre a aba solicitada, ou fecha a gaveta
     * se o usuário clicar no ícone que já está ativo.
     */
    const handleTabToggle = (tab: OmnichannelTab) => {
        setActiveTab(prev => prev === tab ? null : tab);
    };

    return (
        <aside 
            className={`
                flex-shrink-0 flex flex-row h-full bg-gray-900 border-l border-gray-800 z-20 
                shadow-[-4px_0_24px_rgba(0,0,0,0.2)] overflow-hidden
                transition-all duration-300 ease-in-out
                ${isExpanded ? 'w-[380px]' : 'w-16'}
            `}
        >
            {/* ================================================================
                A DOCK (Tira Vertical de Ícones Fixa)
            ================================================================ */}
            <div className="w-16 flex-shrink-0 h-full bg-gray-900 border-r border-gray-800 flex flex-col items-center pt-4 pb-4 gap-4 z-30">
                
                {/* Botão: WhatsApp */}
                <button 
                    onClick={() => handleTabToggle('WA')}
                    className={`
                        w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm
                        ${activeTab === 'WA' 
                            ? 'bg-green-900/40 text-green-400 border border-green-500/50 shadow-green-900/50 scale-110' 
                            : 'bg-gray-800 border border-gray-700 text-gray-500 hover:text-green-500 hover:border-green-500/50'
                        }
                    `}
                    title="WhatsApp"
                >
                    <FaWhatsapp size={20} />
                </button>

                {/* Botão: Telegram */}
                <button 
                    onClick={() => handleTabToggle('TG')}
                    className={`
                        w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm
                        ${activeTab === 'TG' 
                            ? 'bg-blue-900/40 text-blue-400 border border-blue-500/50 shadow-blue-900/50 scale-110' 
                            : 'bg-gray-800 border border-gray-700 text-gray-500 hover:text-blue-500 hover:border-blue-500/50'
                        }
                    `}
                    title="Telegram"
                >
                    <FaTelegram size={18} />
                </button>

                {/* Linha Divisória */}
                <div className="w-8 border-b border-gray-700/50 rounded-full my-1"></div>

                {/* Botão: Agenda */}
                <button 
                    onClick={() => handleTabToggle('AGENDA')}
                    className={`
                        w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm
                        ${activeTab === 'AGENDA' 
                            ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/50 shadow-orange-900/50 scale-110' 
                            : 'bg-gray-800 border border-gray-700 text-gray-500 hover:text-accent-primary hover:border-accent-primary/50'
                        }
                    `}
                    title="Agenda e Compromissos"
                >
                    <FaCalendarAlt size={16} />
                </button>
            </div>

            {/* ================================================================
                ÁREA DE CONTEÚDO (O Painel que Desliza)
                Mantemos a largura fixa (w-[316px] -> 380px total - 16px da dock)
                para evitar esmagamento do layout durante a transição do CSS.
            ================================================================ */}
            <div className="w-[316px] h-full flex flex-col bg-base-metallic relative">
                
                {/* --- HEADER DO PAINEL --- */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/80">
                    <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
                        {activeTab === 'WA' && <><FaWhatsapp className="text-green-400" /> WhatsApp</>}
                        {activeTab === 'TG' && <><FaTelegram className="text-blue-400" /> Telegram</>}
                        {activeTab === 'AGENDA' && <><FaCalendarAlt className="text-accent-primary" /> Agenda</>}
                    </h3>
                    <button 
                        onClick={() => setActiveTab(null)} 
                        className="text-gray-500 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-700"
                        title="Recolher Painel"
                    >
                        <FaTimes size={14} />
                    </button>
                </div>

                {/* --- CORPO DOS WIDGETS --- */}
                <div className="flex-1 overflow-hidden relative bg-gray-900/50">
                    
                    {/* Widget: WhatsApp */}
                    {activeTab === 'WA' && <WhatsAppWidget />}
                    
                    {/* Widget: Telegram (Em Breve) */}
                    {activeTab === 'TG' && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-60 p-4 animate-fade-in">
                            <FaTelegram className="w-12 h-12 mb-3" />
                            <p className="text-xs text-center font-medium">Integração com Telegram em desenvolvimento.</p>
                        </div>
                    )}

                    {/* Widget: Agenda Compacta */}
                    {activeTab === 'AGENDA' && (
                        <div className="h-full p-2 bg-gray-800 animate-fade-in">
                            <SchedulerWidget 
                                mode="MINI" 
                                clientId={client?.id} // Conecta a agenda ao cliente ativo no Palco Central
                            />
                        </div>
                    )}
                </div>

                {/* --- FOOTER: INPUT DE MENSAGEM (Oculto na Agenda) --- */}
                {activeTab !== 'AGENDA' && (
                    <div className="p-3 border-t border-gray-700 bg-gray-800">
                        <div className="flex items-center space-x-2">
                            <input 
                                type="text" 
                                placeholder={client ? `Mensagem para ${client.name.split(' ')[0]}...` : "Selecione um cliente..."}
                                className="flex-1 bg-gray-900 text-xs text-white px-3 py-2.5 rounded-lg border border-gray-600 focus:outline-none focus:border-gray-500 disabled:opacity-50 transition-colors"
                                disabled={!client}
                            />
                            <button className="p-2.5 bg-gray-700 text-gray-400 rounded-lg cursor-not-allowed hover:bg-gray-600 disabled:opacity-50 transition-colors">
                                <FaPaperPlane className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};