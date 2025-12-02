// src/app/layout.tsx (VERSÃO FINAL E CORRIGIDA)

import type { Metadata } from "next";
// CORREÇÃO: Importar Geist e Geist_Mono diretamente do next/font/google
import { Inter } from "next/font/google"; 
import "./globals.css";
import { AppContainer } from "@/core/ui/layout/AppContainer"; // Importação via alias
import { AuthProvider } from "@/contexts/AuthContext";

// Usaremos Inter como fonte padrão para simplificar a correção
const geistSans = Inter({
  variable: "--font-geist-sans", // Manter a variável, mas usar Inter
  subsets: ["latin"],
});

// A fonte Mono pode ser simplificada para a mesma importação se Geist não estiver instalada
const geistMono = Inter({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FilixFin - Gestão e IA",
  description: "Plataforma de Gestão Full-Stack de Excelência.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        // Aplicamos as classes e as fontes (agora tipadas corretamente)
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider> {/* <-- O AuthProvider envolve o AppContainer */}
          <AppContainer>
            {children}
          </AppContainer>
        </AuthProvider>
      </body>
    </html>
  );
}