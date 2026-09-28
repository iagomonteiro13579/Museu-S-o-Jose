'use client';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Language, { useLanguage } from './Language';
const links = [
  ['/', 'Início'],
  ['/about', 'Sobre'],
  ['/colecoes', 'Coleções Culturais'],
  ['/acervo', 'Acervo'],
  ['/artigos', 'Artigos'],
  ['/tour', 'Tour Virtual'],
  ['/videos', 'Nossos Videos'],
  ['/jogos', 'Nossos Jogos'],
];
export default function Header() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const { t } = useLanguage();
  useEffect(() => setOpen(false), [path]);
  return (
    <header
      className="museum-header"
      onKeyDown={(e) => {
        if (e.key === 'Escape') setOpen(false);
      }}
    >
      <div className="museum-masthead">
        <Link
          href="/"
          className="museum-brand"
          aria-label="Museu Histórico de São José"
        >
          <Image src="/imgs/logo.png" alt="" width={64} height={64} priority />
          <span translate="no">
            Museu Histórico
            <br />
            de São José
          </span>
        </Link>
        <div className="museum-header-actions">
          <Link href="/about" className="visit-link">
            {t('Agende sua visita')} <ArrowUpRight size={17} />
          </Link>
          <Language />
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="museum-navigation"
            aria-label={t(open ? 'Fechar menu' : 'Menu')}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      <nav
        id="museum-navigation"
        className={`museum-navigation ${open ? 'is-open' : ''}`}
        aria-label={t('Navegação principal')}
      >
        {links.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            aria-current={path === href ? 'page' : undefined}
            onClick={() => setOpen(false)}
          >
            {t(label)}
          </Link>
        ))}
      </nav>
    </header>
  );
}
