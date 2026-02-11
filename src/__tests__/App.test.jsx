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
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ data: [], meta: { total: 0 } }) }),
    )

    renderWithProviders(<App />)

    expect(await screen.findByText(/Panel editorial/i)).toBeDefined()
    expect(await screen.findByText(/No hay resultados/)).toBeDefined()
  })
})
