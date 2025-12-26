import type { Config } from "tailwindcss";

const config: Config = {
  // Garante que o Tailwind escaneie todos os arquivos na pasta src/
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // --- CORES DO TEMA (Mantidas conforme sua definição) ---
      colors: {
        'base-dark': '#111827',     // Fundo principal (Cinza Metálico Escuro)
        'base-metallic': '#1F2937', // Fundo de cards ou painéis (Cinza Metálico)
        'base-text': '#F3F4F6',     // Texto principal
        
        // --- ACENTOS ---
        'accent-primary': '#F97316',   // Laranja Vibrante
        'accent-secondary': '#8B5CF6', // Roxo Vivo
        
        // Cores de Feedback
        'success': '#10B981',
        'danger': '#EF4444',
      },
      
      // --- FONTES ---
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },

      // --- ANIMAÇÕES (Adicionado agora) ---
      // Necessário para as classes 'animate-fade-in' e 'animate-fade-in-down' funcionarem
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-down': 'fadeInDown 0.5s ease-out',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
};
export default config;