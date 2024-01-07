import * as React from 'react'
import { render, screen, userEvent, waitForLoadingToFinish } from 'test/app-test-utils'
import { buildBook } from 'test/generate'
import * as booksDB from 'test/data/books'
import { formatDate } from 'utils/misc'
import { App } from 'app'

test('renders all the book information', async () => {
  const book = await booksDB.create(buildBook())
  const route = `/book/${book.id}`

  await render(<App />, { route })

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

test('create a ist item for the book', async () => {
  const book = await booksDB.create(buildBook())
  const route = `/book/${book.id}`

  await render(<App />, { route })

  const addToListButton = screen.getByRole('button', { name: /add to list/i })
  await userEvent.click(addToListButton)
  expect(addToListButton).toBeDisabled()

  await waitForLoadingToFinish()

  expect(screen.getByRole('button', { name: /remove from list/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /mark as read/i })).toBeInTheDocument()
  expect(screen.getByRole('textbox', { name: /notes/i })).toBeInTheDocument()

  const startDateElement = screen.getByLabelText(/start date/i)
  expect(startDateElement).toHaveTextContent(formatDate(Date.now()))

  expect(screen.queryByRole('radio', { name: /add to list/i })).not.toBeInTheDocument()
  expect(screen.queryByRole('radio', { name: /mark as unread/i })).not.toBeInTheDocument()
  expect(screen.queryByRole('radio', { name: /star/i })).not.toBeInTheDocument()
})

