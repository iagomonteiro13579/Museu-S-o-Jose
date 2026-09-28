'use client';

import { T } from '@/components/Language';
import { useAdmin } from '@/contexts/AdminContext';
import { useEffect, useState } from 'react';
type Row = {
  entity: string;
  entityId: number;
  field: string;
  locale: string;
  source: string;
  text: string;
  status: string;
};
export default function Translations() {
  const { isAdmin, isLoading } = useAdmin();
  const [rows, setRows] = useState<Row[]>([]);
  const [selected, setSelected] = useState<Row | null>(null);
  const [message, setMessage] = useState('');
  const [term, setTerm] = useState('');
  const [terms, setTerms] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [locale, setLocale] = useState('en');
  async function load() {
    const r = await fetch('/api/admin/translations');
    if (r.ok) setRows(await r.json());
    else setMessage('Não foi possível carregar o conteúdo.');
    const g = await fetch('/api/admin/glossary');
    if (g.ok) setTerms(await g.json());
  }
  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);
  async function save(status: string) {
    if (!selected) return;
    const r = await fetch('/api/admin/translations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...selected, status }),
    });
    setMessage(r.ok ? 'Tradução salva.' : (await r.json()).error);
    if (r.ok) {
      setSelected(null);
      load();
    }
  }
  async function glossary(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch('/api/admin/glossary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ term }),
    });
    if (r.ok) {
      setTerm('');
      load();
    } else setMessage((await r.json()).error);
  }
  if (isLoading)
    return (
      <main className="admin-shell">
        <T text={'Carregando...'} />
      </main>
    );
  if (!isAdmin)
    return (
      <main className="admin-shell">
        <a href="/admin">
          <T text={'Entrar'} />
        </a>
      </main>
    );
  const filtered = rows.filter(
    (r) =>
      r.locale === locale &&
      `${r.source} ${r.entity} ${r.entityId} ${r.status}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <main className="admin-shell">
      <a href="/admin">
        <T text={'Voltar'} />
      </a>
      <h1>
        <T text={'Traduções e glossário'} />
      </h1>
      <p>
        <T
          text={
            'O português é preservado. Apenas traduções revisadas do conteúdo atual aparecem no site.'
          }
        />{' '}
      </p>
      {message && (
        <p role="status" className="admin-notice">
          {message}
        </p>
      )}
      <section className="admin-panel">
        <h2>
          <T text={'Nomes protegidos'} />
        </h2>
        <p translate="no">{terms.join(' · ')}</p>
        <form onSubmit={glossary}>
          <label>
            <T text={'Novo nome próprio'} />{' '}
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              required
              maxLength={200}
            />
          </label>
          <button type="submit">
            <T text={'Proteger termo'} />
          </button>
        </form>
      </section>
      <section className="admin-panel">
        <div className="admin-toolbar">
          <label>
            <T text={'Idioma'} />{' '}
            <select value={locale} onChange={(e) => setLocale(e.target.value)}>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </label>
          <label>
            <T text={'Buscar conteúdo'} />{' '}
            <input value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
        </div>
        {selected ? (
          <>
            <p>
              {selected.entity} #{selected.entityId} · {selected.field} ·{' '}
              {selected.locale}
            </p>
            <div className="translation-original" lang="pt-BR" translate="no">
              {selected.source}
            </div>
            <label>
              <T text={'Tradução'} />{' '}
              <textarea
                rows={10}
                lang={selected.locale}
                value={selected.text}
                onChange={(e) =>
                  setSelected({ ...selected, text: e.target.value })
                }
              />
            </label>
            <button type="button" onClick={() => save('draft')}>
              <T text={'Salvar rascunho'} />{' '}
            </button>
            <button type="button" onClick={() => save('reviewed')}>
              <T text={'Publicar revisão'} />{' '}
            </button>
            <button type="button" onClick={() => setSelected(null)}>
              <T text={'Cancelar'} />{' '}
            </button>
          </>
        ) : (
          <>
            <p>
              {filtered.length} <T text={'campos'} />
            </p>
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>
                      <T text={'Conteúdo'} />
                    </th>
                    <th>
                      <T text={'Estado'} />
                    </th>
                    <th>
                      <T text={'Ação'} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 100).map((row) => (
                    <tr
                      key={`${row.entity}-${row.entityId}-${row.field}-${row.locale}`}
                    >
                      <td>
                        <small>
                          {row.entity} #{row.entityId} · {row.field}
                        </small>
                        <p translate="no">{row.source.slice(0, 160)}</p>
                      </td>
                      <td>
                        {
                          (
                            {
                              pending: 'Pendente',
                              draft: 'Rascunho',
                              reviewed: 'Revisada',
                              outdated: 'Desatualizada',
                            } as Record<string, string>
                          )[row.status]
                        }
                      </td>
                      <td>
                        <button type="button" onClick={() => setSelected(row)}>
                          <T text={'Revisar'} />{' '}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length > 100 && (
              <p>
                <T text={'Use a busca para localizar outros campos.'} />
              </p>
            )}
          </>
        )}
      </section>
    </main>
  );
}
