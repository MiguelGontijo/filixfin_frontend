// tailwind.config.ts

import type { Config } from "tailwindcss";

const config: Config = {
  // Porquê: Garantir que o Tailwind escaneie todos os arquivos na pasta src/
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- BASE (Fundo e Textos) ---
        'base-dark': '#111827',     // Fundo principal (Cinza Metálico Escuro)
        'base-metallic': '#1F2937', // Fundo de cards ou painéis (Cinza Metálico)
        'base-text': '#F3F4F6',     // Texto principal
        
        // --- ACENTOS (Vivos e Vibrantes) ---
        // Laranja Vibrante (Primário: CTAs, Botões Principais)
        'accent-primary': '#F97316',   
        // Roxo Vivo (Secundário: Iconografia, Destaques Secundários)
        'accent-secondary': '#8B5CF6',
        
        // Cores de Feedback
        'success': '#10B981',
        'danger': '#EF4444',
      },
      // Configuração de Fontes
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  // Configuração para Dark Mode: Usaremos a estratégia 'class' (padrão de excelência)
  darkMode: 'class',
  plugins: [],
};
export default config;