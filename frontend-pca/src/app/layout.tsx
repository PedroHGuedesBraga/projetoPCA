import type { Metadata } from "next";
import Header from "@/components/Header";
import PrimeReactWrapper from "@/components/PrimeReactWrapper";
import { NotificacaoProvider } from "@/context/NotificacaoContext";

import "./globals.css";
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

export const metadata: Metadata = {
  title: "PCA - Gestão de Contratos",
  description: "Sistema de gestão de contratos públicos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {/* 2. Coloque o componente Header antes de 'children' */}
        <PrimeReactWrapper>
          <NotificacaoProvider>
            <Header />
            {children}
          </NotificacaoProvider>
        </PrimeReactWrapper>
      </body>
    </html>
  );
}