// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google"; 
import "./globals.css";
import { AppContainer } from "@/core/ui/layout/AppContainer";
import { AuthProvider } from "@/contexts/AuthContext";
import { GoogleProvider } from "@/core/providers/GoogleProvider"; // <--- NOVO IMPORT

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Inter({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "filix_control - Gestão e IA",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Envolvemos tudo com o GoogleProvider */}
        <GoogleProvider>
            <AuthProvider>
              <AppContainer>
                {children}
              </AppContainer>
            </AuthProvider>
        </GoogleProvider>
      </body>
    </html>
  );
}