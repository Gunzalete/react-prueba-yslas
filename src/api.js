import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://0.0.0.0:8000'

const toQueryParams = (filters, page) => {
  const params = new URLSearchParams()

  if (filters.search?.trim()) params.set('search', filters.search.trim())
  if (filters.status) params.set('status', filters.status)
  if (filters.publishedFrom) params.set('published_from', filters.publishedFrom)
  if (filters.publishedTo) params.set('published_to', filters.publishedTo)
  if (filters.perPage) params.set('per_page', String(filters.perPage))
  if (filters.includeComments) params.set('include_comments', 'true')
  if (page) params.set('page', String(page))

  return params.toString()
}

async function fetchPosts(filters, page = 1) {
  const qs = toQueryParams(filters, page)
  const res = await fetch(`${API_BASE}/api/posts?${qs}`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new Error(payload?.message || 'No se pudo cargar la lista.')
  }
  return res.json()
}

async function createPost(payload) {
  const res = await fetch(`${API_BASE}/api/posts`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const err = new Error(data?.message || 'No se pudo crear el post.')
    err.status = res.status
    err.payload = data
    throw err
  }
  return data
}

export function usePosts(filters, page) {
  return useQuery(['posts', filters, page], () => fetchPosts(filters, page), {
    keepPreviousData: true,
  })
}

export function useCreatePost() {
  const qc = useQueryClient()
  return useMutation((payload) => createPost(payload), {
    onSuccess: () => qc.invalidateQueries(['posts']),
  })
}

export { API_BASE }
