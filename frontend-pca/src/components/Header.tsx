'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { authService } from '@/services/authService';
import { getTheme, themes } from '@/config/themes';
import LogoPrefeitura from '@/components/logos/LogoPrefeitura';
import NotificacaoBell from '@/components/NotificacaoBell';

const LogoMap = {
  prefeitura: LogoPrefeitura,
};

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/";
  const [homeHref, setHomeHref] = useState('/home');
  const [isAdmin, setIsAdmin] = useState(false);
  // Inicia com prefeitura (match SSR), atualiza no cliente após mount
  const [theme, setTheme] = useState(themes.prefeitura);

  useEffect(() => {
    setTheme(getTheme());
  }, []);

  useEffect(() => {
    const admin = authService.isAdmin();
    setIsAdmin(admin);
    const sid = authService.getSecretariaId();
    setHomeHref(admin ? '/home' : sid ? `/mesesSecretaria/${sid}` : '/');
  }, [pathname]);

  const handleLogout = () => {
    authService.logout();
    router.push('/');
  };

  const Logo = LogoMap[theme.logoTipo];

  const startContent = (
    <div className="flex items-center gap-3">
      <Logo size={72} />
      <h1 className="text-lg font-bold text-white tracking-wide">{theme.nome.toUpperCase()}</h1>
    </div>
  );

  const endContent = isLoginPage ? null : (
    <nav className="flex items-center gap-2 font-semibold">
      <NotificacaoBell />
      <Link
        href={homeHref}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-white border border-white/30 hover:bg-white/20 hover:border-white/60 transition-all duration-200"
      >
        <i className="pi pi-home text-sm"></i>
        <span>HOME</span>
      </Link>

      {isAdmin && (
        <Link
          href="/historico"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-white border border-white/30 hover:bg-white/20 hover:border-white/60 transition-all duration-200"
        >
          <i className="pi pi-history text-sm"></i>
          <span>HISTÓRICO</span>
        </Link>
      )}

      {isAdmin && (
        <Link
          href="/planoAnual"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-white border border-white/30 hover:bg-white/20 hover:border-white/60 transition-all duration-200"
        >
          <i className="pi pi-file text-sm"></i>
          <span>PCA</span>
        </Link>
      )}

      {isAdmin && (
        <Link
          href="/adminPage"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-white border border-white/30 hover:bg-white/20 hover:border-white/60 transition-all duration-200"
        >
          <i className="pi pi-verified text-sm"></i>
          <span>APROVADOS</span>
        </Link>
      )}

      <span className="text-white opacity-40 mx-1">|</span>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-white border transition-all duration-200"
        style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#b91c1c')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#dc2626')}
      >
        <span>Sair</span>
        <i className="pi pi-sign-out text-sm"></i>
      </button>
    </nav>
  );

  const headerStyle = {
    ...(theme.headerBackground
      ? { background: theme.headerBackground }
      : { backgroundColor: theme.corPrimaria }),
    ...(theme.headerBorder ? { borderBottom: theme.headerBorder } : {}),
  };

  return (
    <div style={headerStyle} className="shadow-md w-full" suppressHydrationWarning>
      <div className="max-w-6xl mx-auto">
        <Toolbar
          start={startContent}
          end={endContent}
          className="bg-transparent border-none p-4"
        />
      </div>
    </div>
  );
};

export default Header;
