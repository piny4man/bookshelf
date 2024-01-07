// 🐨 here are the things you're going to need for this test:
import * as React from 'react'
import { queryCache } from 'react-query'
import { buildUser, buildBook } from 'test/generate'
import * as auth from 'auth-provider'
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react'
import { AppProviders } from 'context'
import { App } from 'app'

afterEach(async () => {
  queryCache.clear()
  await auth.logout()
})

test('renders all the book information', async () => {
  window.localStorage.setItem(auth.localStorageKey, 'FAKE_TOKEN')
  const user = buildUser()
  const book = buildBook()
  const route = `/book/${book.id}`
  window.history.pushState({}, 'Test book page', route)

  const originalFetch = window.fetch
  window.fetch = async (url, config) => {
    if (url.endsWith('/bootstrap')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          user: { ...user, token: 'FAKE_TOKEN' },
          listItems: [],
        }),
      })
    } else if (url.endsWith(`/books/${book.id}`)) {
      return Promise.resolve({ ok: true, json: async () => ({ book }) })
    } else if (url.endsWith(`/list-items`)) {
      return Promise.resolve({ ok: true, json: async () => ({ listItems: [] }) })
    }
    return originalFetch(url, config)
  }

  render(<App />, { wrapper: AppProviders })

  await waitForElementToBeRemoved(() => [
    ...screen.queryAllByLabelText(/loading/i),
    ...screen.queryAllByText(/loading/i)
  ])


  expect(screen.getByRole('heading', { name: book.title })).toBeInTheDocument()
  expect(screen.getByText(book.author)).toBeInTheDocument()
  expect(screen.getByText(book.publisher)).toBeInTheDocument()
  expect(screen.getByText(book.synopsis)).toBeInTheDocument()
  expect(screen.getByRole('img', { name: /book cover/i })).toHaveAttribute('src', book.coverImageUrl)
  expect(screen.getByRole('button', { name: /add to list/i })).toBeInTheDocument()

  expect(screen.queryByRole('button', { name: /remove from list/i })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /mark as read/i })).not.toBeInTheDocument()
  expect(screen.queryByRole('textbox', { name: /notes/i })).not.toBeInTheDocument()
  expect(screen.queryByRole('radio', { name: /star/i })).not.toBeInTheDocument()
  expect(screen.queryByLabelText(/start date/i)).not.toBeInTheDocument()
})
