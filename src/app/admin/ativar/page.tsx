'use client';

import { T } from '@/components/Language';
import { useEffect, useState } from 'react';
export default function Activate() {
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setToken(location.hash.slice(1));
    history.replaceState(null, '', location.pathname);
  }, []);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const data = new FormData(e.currentTarget);
    try {
      const r = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          nome: data.get('nome'),
          email: data.get('email'),
          senha: data.get('senha'),
        }),
      });
      setMessage(
        r.ok ? 'Conta ativada. Você já pode entrar.' : (await r.json()).error,
      );
      setDone(r.ok);
    } catch {
      setMessage('Falha de conexão. Tente novamente.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="admin-shell">
      <h1>
        <T text={'Ativar acesso'} />
      </h1>
      <div className="admin-panel">
        {message && <p role="status">{message}</p>}
        {done ? (
          <a href="/admin">
            <T text={'Entrar'} />
          </a>
        ) : (
          <form onSubmit={submit}>
            <p>
              <T text={'Use o e-mail para o qual o convite foi criado.'} />
            </p>
            <label>
              <T text={'Nome'} />{' '}
              <input name="nome" required maxLength={120} autoComplete="name" />
            </label>
            <label>
              <T text={'E-mail'} />{' '}
              <input name="email" type="email" required autoComplete="email" />
            </label>
            <label>
              <T text={'Senha'} />{' '}
              <input
                name="senha"
                type="password"
                required
                minLength={12}
                maxLength={72}
                autoComplete="new-password"
              />
            </label>
            <p>
              <T text={'Use pelo menos 12 caracteres.'} />
            </p>
            <button type="submit" disabled={busy || !token}>
              {busy ? 'Processando...' : 'Ativar conta'}
            </button>
            {!token && (
              <p>
                <T text={'Abra o link completo do convite.'} />
              </p>
            )}
          </form>
        )}
      </div>
    </main>
  );
}
