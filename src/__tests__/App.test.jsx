import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const qc = new QueryClient()

function renderWithProviders(ui) {
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>)
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('App', () => {
  it('renders list state and create form', async () => {
    const baseResponse = { data: [], meta: { total: 0 } }
    global.fetch = vi.fn((url) =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(baseResponse) }),
    )

    renderWithProviders(<App />)

    expect(await screen.findByText(/Panel editorial/i)).toBeDefined()
    expect(await screen.findByText(/No hay resultados/)).toBeDefined()
  // simulate toggling include comments
  const checkbox = screen.getByRole('checkbox', { name: /Incluir comentarios/i })
  await userEvent.click(checkbox)
  await waitFor(() => expect(global.fetch).toHaveBeenCalled())
  const calledWith = global.fetch.mock.calls[global.fetch.mock.calls.length - 1][0]
  expect(String(calledWith)).toContain('include_comments=true')
  })
})
