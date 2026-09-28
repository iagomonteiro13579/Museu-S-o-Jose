import './globals.css';
import Header from '@/components/Header';
import { LanguageProvider, T } from '@/components/Language';
import { AdminProvider } from '@/contexts/AdminContext';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
export const metadata: Metadata = {
  title: { default: 'Museu de São José', template: '%s | Museu de São José' },
  description:
    'Museu Histórico de São José — acervo, artigos, vídeos, jogos e tour virtual.',
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <LanguageProvider>
          <AdminProvider>
            <a className="skip-link" href="#conteudo">
              <T text="Ir para o conteúdo" />
            </a>
            <Header />
            <div id="conteudo" tabIndex={-1}>
              {children}
            </div>
          </AdminProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
