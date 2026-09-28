'use client';

import AdminLogin from '@/components/AdminLogin';
import Footer from '@/components/Footer';
import { T } from '@/components/Language';
import { useAdmin } from '@/contexts/AdminContext';
import { useEffect, useState } from 'react';
export default function AdminPage() {
  const { isAdmin, adminUser, login, isLoading } = useAdmin();
  const [users, setUsers] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [manager, setManager] = useState(false);
  const [busy, setBusy] = useState(false);
  const load = () =>
    fetch('/api/admin/users')
      .then((r) => (r.ok ? r.json() : []))
      .then(setUsers);
  useEffect(() => {
    if (adminUser?.canManageUsers) load();
  }, [adminUser?.canManageUsers]);
  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, canManageUsers: manager }),
      });
      const data = await r.json();
      setMessage(
        r.ok
          ? `Convite válido por 24 horas. Entregue somente à pessoa indicada: ${data.url}`
          : data.error,
      );
    } catch {
      setMessage('Não foi possível criar o convite.');
    } finally {
      setBusy(false);
    }
  }
  async function toggle(id: number, ativo: boolean) {
    if (!confirm('Confirmar alteração de acesso?')) return;
    const r = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ativo }),
    });
    if (r.ok) load();
    else setMessage((await r.json()).error);
  }
  if (isLoading)
    return (
      <div className="admin-shell">
        <T text={'Carregando...'} />
      </div>
    );
  if (!isAdmin)
    return (
      <div className="admin-shell">
        <AdminLogin
          onClose={() => location.assign('/')}
          onLoginSuccess={login}
        />
      </div>
    );
  return (
    <>
      <main className="admin-shell">
        <h1>
          <T text={'Administração'} />
        </h1>
        <p>
          <T text={'Conteúdo, traduções e acesso ao museu.'} />
        </p>
        <nav className="admin-toolbar">
          <a href="/acervo/completo">
            <T text={'Acervo'} />
          </a>
          <a href="/artigos">
            <T text={'Artigos'} />
          </a>
          <a href="/videos">
            <T text={'Vídeos'} />
          </a>
          <a href="/admin/traducoes">
            <T text={'Traduções e glossário'} />
          </a>
        </nav>
        {message && (
          <p role="status" className="admin-notice" translate="no">
            {message}
          </p>
        )}
        {adminUser?.canManageUsers && (
          <>
            <section className="admin-panel">
              <h2>
                <T text={'Convidar administrador'} />
              </h2>
              <form onSubmit={invite}>
                <label>
                  <T text={'E-mail'} />{' '}
                  <input
                    type="email"
                    autoComplete="off"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={manager}
                    onChange={(e) => setManager(e.target.checked)}
                  />
                  <T text={'Permitir gerenciar outros administradores'} />{' '}
                </label>
                <button disabled={busy} type="submit">
                  {busy ? 'Processando...' : 'Gerar convite'}
                </button>
              </form>
              <p>
                <T
                  text={
                    'O convite é individual, expira em 24 horas e só pode ser utilizado uma vez.'
                  }
                />{' '}
              </p>
            </section>
            <section className="admin-panel">
              <h2>
                <T text={'Administradores'} />
              </h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>
                      <T text={'Nome'} />
                    </th>
                    <th>
                      <T text={'E-mail'} />
                    </th>
                    <th>
                      <T text={'Perfil'} />
                    </th>
                    <th>
                      <T text={'Acesso'} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td translate="no">{user.nome}</td>
                      <td translate="no">{user.email}</td>
                      <td>
                        {user.canManageUsers
                          ? 'Gestor de acesso'
                          : 'Administrador de conteúdo'}
                      </td>
                      <td>
                        {user.canManageUsers ? (
                          'Protegido'
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggle(user.id, !user.ativo)}
                          >
                            {user.ativo ? 'Desativar' : 'Reativar'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
