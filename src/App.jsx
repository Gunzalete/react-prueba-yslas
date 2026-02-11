import React from 'react'
import './App.css'
import { useMemo, useState } from 'react'
import { usePosts, useCreatePost, API_BASE } from './api'

const DEFAULT_FILTERS = {
  search: '',
  status: '',
  publishedFrom: '',
  publishedTo: '',
  perPage: 10,
  includeComments: false,
}

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'draft', label: 'Borrador' },
  { value: 'published', label: 'Publicado' },
]

const clampPerPage = (value) => {
  const parsed = Number(value)
  if (Number.isNaN(parsed)) return 10
  return Math.min(50, Math.max(1, parsed))
}

const buildPageItems = (current, last) => {
  if (!last || last <= 1) return []
  const items = new Set([1, last, current])
  for (let i = current - 2; i <= current + 2; i += 1) {
    if (i > 1 && i < last) items.add(i)
  }
  return Array.from(items).sort((a, b) => a - b)
}

function Filters({ filters, onChange, onReset }) {
  const update = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    onChange(key, key === 'perPage' ? clampPerPage(value) : value)
  }

  return (
    <form className="filters" onSubmit={(e) => e.preventDefault()}>
      <label>
        Buscar por titulo
        <input type="search" value={filters.search} onChange={update('search')} placeholder="Ej: Lanzamiento" />
      </label>
      <label>
        Estado
        <select value={filters.status} onChange={update('status')}>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Desde
        <input type="date" value={filters.publishedFrom} onChange={update('publishedFrom')} />
      </label>
      <label>
        Hasta
        <input type="date" value={filters.publishedTo} onChange={update('publishedTo')} />
      </label>
      <label>
        Por pagina
        <input type="number" min="1" max="50" value={filters.perPage} onChange={update('perPage')} />
      </label>
      <label className="toggle">
        <input type="checkbox" checked={filters.includeComments} onChange={update('includeComments')} />
        Incluir comentarios
      </label>
      <div style={{ marginTop: 8 }}>
        <button type="button" className="ghost" onClick={onReset}>
          Limpiar filtros
        </button>
      </div>
    </form>
  )
}

function PostList({ posts, meta, publishErrors, onPublish, isLoading, isError, onRetry }) {
  if (isLoading) {
    return (
      <div className="state-card">
        <span className="spinner" aria-hidden="true" />
        <p>Cargando posts...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="state-card error">
        <p>Error cargando posts.</p>
        <button type="button" onClick={onRetry}>
          Reintentar
        </button>
      </div>
    )
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="state-card empty">
        <p>No hay resultados con estos filtros.</p>
      </div>
    )
  }

  return (
    <ul className="post-list">
      {posts.map((post) => (
        <li key={post.id} className="post-card">
          <div>
            <div className="post-title">
              <h3>{post.title}</h3>
              <span className={`badge ${post.status}`}>{post.status === 'published' ? 'Publicado' : 'Borrador'}</span>
            </div>
            <p className="post-body">{post.body}</p>
          </div>
          <div className="post-meta">
            <span>{post.published_at ? `Publicado: ${new Date(post.published_at).toLocaleDateString()}` : 'Sin fecha de publicacion'}</span>
            <span>{post.comments_count ?? 0} comentarios</span>
          </div>
          <div className="post-actions">
            {post.status === 'draft' ? (
              <button type="button" onClick={() => onPublish(post.id)}>
                Publicar
              </button>
            ) : (
              <button type="button" disabled title="No se puede revertir un post publicado a borrador">
                Revertir a borrador
              </button>
            )}
          </div>
          {publishErrors[post.id] ? <div className="field-error" style={{ marginTop: '8px' }}>{publishErrors[post.id]}</div> : null}
        </li>
      ))}
    </ul>
  )
}

function CreatePostForm({ onCreate }) {
  const [values, setValues] = useState({ title: '', body: '', status: 'draft' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState({ submitting: false, error: '', success: '' })

  const validate = () => {
    const e = {}
    if (!values.title.trim()) e.title = 'El titulo es obligatorio.'
    else if (values.title.length > 255) e.title = 'El titulo no puede superar 255 caracteres.'
    if (!values.body.trim()) e.body = 'El contenido es obligatorio.'
    else if (values.body.trim().length < 10) e.body = 'El contenido debe tener al menos 10 caracteres.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    setStatus({ submitting: true, error: '', success: '' })
    if (!validate()) {
      setStatus({ submitting: false, error: '', success: '' })
      return
    }

    try {
      await onCreate({ title: values.title.trim(), body: values.body.trim(), status: values.status })
      setValues({ title: '', body: '', status: 'draft' })
      setErrors({})
      setStatus({ submitting: false, error: '', success: 'Post creado con exito.' })
    } catch (err) {
      setStatus({ submitting: false, error: err.message || 'Error', success: '' })
    }
  }

  return (
    <form className="create-form" onSubmit={submit}>
      <h3>Crear post</h3>
      <label>
        Titulo
        <input value={values.title} onChange={(e) => setValues((s) => ({ ...s, title: e.target.value }))} />
        {errors.title && <div className="field-error">{errors.title}</div>}
      </label>
      <label>
        Contenido
        <textarea value={values.body} onChange={(e) => setValues((s) => ({ ...s, body: e.target.value }))} />
        {errors.body && <div className="field-error">{errors.body}</div>}
      </label>
      <label>
        Estado
        <select value={values.status} onChange={(e) => setValues((s) => ({ ...s, status: e.target.value }))}>
          {STATUS_OPTIONS.filter((o) => o.value).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <div style={{ marginTop: 8 }}>
        <button type="submit" disabled={status.submitting}>{status.submitting ? 'Enviando...' : 'Crear'}</button>
        {status.error && <div className="field-error">{status.error}</div>}
        {status.success && <div className="field-success">{status.success}</div>}
      </div>
    </form>
  )
}

export default function App() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [publishErrors, setPublishErrors] = useState({})

  const { data, isLoading, isError, refetch } = usePosts(filters, page)

  const create = useCreatePost()

  const posts = data?.data ?? []
  const meta = data?.meta ?? null

  const pagination = useMemo(() => buildPageItems(meta?.current_page ?? 1, meta?.last_page ?? 1), [meta])

  const updateFilter = (key, value) => {
    setFilters((p) => ({ ...p, [key]: value }))
    setPage(1)
  }

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS)
    setPage(1)
  }

  const handleCreate = async (payload) => {
    await create.mutateAsync(payload)
  }

  const handlePublish = async (id) => {
    try {
      setPublishErrors((p) => ({ ...p, [id]: undefined }))
      const res = await fetch(`${API_BASE}/api/posts/${id}`, {
        method: 'PATCH',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published' }),
      })
      const payload = await res.json().catch(() => null)
      if (!res.ok) {
        const message = payload?.message || 'No se pudo cambiar el estado.'
        setPublishErrors((p) => ({ ...p, [id]: message }))
        return
      }
      // optimistic refetch
      refetch()
    } catch (err) {
      setPublishErrors((p) => ({ ...p, [id]: 'Error al comunicarse con la API.' }))
    }
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Panel editorial</p>
          <h1>Posts y comentarios</h1>
          <p className="hero-subtitle">Filtra, revisa y crea contenido. Conectado a la API de Laravel.</p>
        </div>
        <div className="hero-card">
          <div>
            <span className="hero-label">API</span>
            <strong>{API_BASE}</strong>
          </div>
          <p>
            Estado: <span className="status-pill">En linea</span>
          </p>
        </div>
      </header>

      <main className="grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Listado</h2>
              <p className="muted">{meta?.total ?? 0} resultados</p>
            </div>
          </div>

          <Filters filters={filters} onChange={updateFilter} onReset={resetFilters} />

          <div className="panel-body">
            <PostList posts={posts} meta={meta} publishErrors={publishErrors} onPublish={handlePublish} isLoading={isLoading} isError={isError} onRetry={() => refetch()} />

            {pagination && pagination.length > 0 && (
              <nav className="pagination" aria-label="Paginacion">
                {pagination.map((p) => (
                  <button key={p} type="button" onClick={() => setPage(p)} disabled={p === page}>
                    {p}
                  </button>
                ))}
              </nav>
            )}
          </div>
        </section>

        <aside className="panel">
          <CreatePostForm onCreate={handleCreate} />
        </aside>
      </main>
    </div>
  )

    }

